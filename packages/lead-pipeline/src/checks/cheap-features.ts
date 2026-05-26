import type { CheapFeatures } from "../types.ts";
import { politeFetch } from "../utils/http.ts";
import { lastWaybackSnapshotMonthsAgo } from "../utils/wayback.ts";

const IMPRESSUM_RE = /impressum|impr\.?\s*ssum/i;
const INLINE_STYLE_RE = /\sstyle\s*=\s*"/gi;
const TABLE_LAYOUT_RE = /<table[^>]*(?:cellpadding|cellspacing|border\s*=\s*"[^"]*")/i;
const FLASH_RE = /<(?:object|embed)[^>]+application\/x-shockwave-flash/i;

export async function computeCheapFeatures(url: string): Promise<CheapFeatures> {
  const result: CheapFeatures = {
    noHttps: !url.startsWith("https://"),
    inlineStylesTable: false,
    missingImpressum: false,
    contentStaleMonths: null,
    fetched: false,
  };

  let html = "";
  try {
    const res = await politeFetch(url, { timeoutMs: 15_000 });
    if (!res.ok) {
      result.reason = `home http ${res.status}`;
      return await withWayback(url, result);
    }
    result.fetched = true;
    result.noHttps = !res.url.startsWith("https://");
    html = await res.text();
  } catch (err) {
    result.reason = `home fetch failed: ${(err as Error).message}`;
    return await withWayback(url, result);
  }

  const inlineCount = (html.match(INLINE_STYLE_RE) ?? []).length;
  result.inlineStylesTable =
    inlineCount >= 8 || TABLE_LAYOUT_RE.test(html) || FLASH_RE.test(html);

  if (!IMPRESSUM_RE.test(html)) {
    result.missingImpressum = !(await impressumLinkedFromHome(url, html));
  }

  return await withWayback(url, result);
}

async function impressumLinkedFromHome(baseUrl: string, html: string): Promise<boolean> {
  const linkRe = /href\s*=\s*"([^"]+)"/gi;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(html))) {
    if (IMPRESSUM_RE.test(m[1])) return true;
  }
  // common URL paths
  for (const path of ["impressum", "impressum.html", "impressum.php"]) {
    try {
      const u = new URL(path, baseUrl).toString();
      const res = await politeFetch(u, { timeoutMs: 8000 });
      if (res.ok) return true;
    } catch {
      // ignore
    }
  }
  return false;
}

async function withWayback(url: string, result: CheapFeatures): Promise<CheapFeatures> {
  const months = await lastWaybackSnapshotMonthsAgo(url);
  result.contentStaleMonths = months;
  return result;
}
