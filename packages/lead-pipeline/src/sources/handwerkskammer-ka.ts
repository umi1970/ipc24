import { config } from "../config.ts";
import type { LeadCandidate } from "../types.ts";
import { politeFetch, safeUrl } from "../utils/http.ts";

/**
 * Best-effort scraper for the HwK-Karlsruhe public Betriebssuche.
 * The public directory is a SPA backed by a JSON endpoint; format may change
 * without notice. On failure we return [] and let other sources cover the gap.
 */

const SEARCH_URL =
  "https://www.hwk-karlsruhe.de/74,0,betriebsdatenbank.html?action=search&plz=&umkreis=50";

const URL_RE = /https?:\/\/[^\s"<>]+/gi;
const TEL_RE = /(\+49[\s\-/()0-9]{6,}|0[\s\-/()0-9]{6,})/g;

export async function fetchHandwerkskammerKaLeads(): Promise<LeadCandidate[]> {
  if (!config.features.enableHandwerkskammer) return [];
  try {
    const res = await politeFetch(SEARCH_URL, { timeoutMs: 20_000 });
    if (!res.ok) {
      console.warn("[hwk-ka] not available, status", res.status);
      return [];
    }
    const html = await res.text();
    return parseHwkHtml(html);
  } catch (err) {
    console.warn("[hwk-ka] fetch error", err);
    return [];
  }
}

export function parseHwkHtml(html: string): LeadCandidate[] {
  const candidates: LeadCandidate[] = [];
  // The public listing renders <div class="result-item"> ... blocks.
  // We accept either that markup or any block with a name + website.
  const blocks = html.split(/<div[^>]*class="[^"]*result-item[^"]*"[^>]*>/i);
  for (const block of blocks.slice(1)) {
    const name = extractFirst(block, /<h[23][^>]*>([^<]+)<\/h[23]>/i)?.trim();
    if (!name) continue;
    const urls = block.match(URL_RE)?.filter((u) => !u.includes("hwk-karlsruhe.de"));
    const url = urls ? safeUrl(urls[0]) : null;
    const tel = block.match(TEL_RE)?.[0] ?? null;
    const anschrift =
      extractFirst(block, /<p[^>]*class="[^"]*address[^"]*"[^>]*>([^<]+)</i)?.trim() ??
      null;
    candidates.push({
      source: "handwerkskammer-ka",
      externalId: `hwk-ka:${candidates.length}:${name}`,
      name,
      url,
      branche: "sonstiges",
      inhaberNameGuess: null,
      anschrift,
      telefon: tel,
      xingUrl: null,
    });
  }
  return candidates;
}

function extractFirst(haystack: string, re: RegExp): string | null {
  const m = haystack.match(re);
  return m?.[1] ?? null;
}
