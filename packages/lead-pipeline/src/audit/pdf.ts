import { mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { ensureChromiumLdPath } from "../utils/chromium-env.ts";
ensureChromiumLdPath();
import { chromium } from "playwright";
import type { AuditResult } from "../types.ts";

export async function renderAuditPdf(
  audit: AuditResult,
  pdfPath: string,
): Promise<string> {
  mkdirSync(dirname(pdfPath), { recursive: true });

  const html = renderAuditHtml(audit);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "10mm", bottom: "12mm", left: "10mm" },
    });
  } finally {
    await browser.close();
  }
  return pdfPath;
}

function imgDataUri(path: string | null): string {
  if (!path) return "";
  try {
    const buf = readFileSync(path);
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return "";
  }
}

function lhBadge(score: number | null): string {
  if (score == null) return `<span class="badge gray">—</span>`;
  const cls = score >= 90 ? "green" : score >= 50 ? "orange" : "red";
  return `<span class="badge ${cls}">${score}</span>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderAuditHtml(audit: AuditResult): string {
  const desktop = imgDataUri(audit.desktopScreenshotPath);
  const mobile = imgDataUri(audit.mobileScreenshotPath);
  const findingsHtml = audit.findings
    .map(
      (f) => `<li>
        <span class="finding-title">${escapeHtml(f.title)}</span>
        <span class="finding-detail">${escapeHtml(f.detail)}</span>
      </li>`,
    )
    .join("\n");
  const competitor = audit.competitor
    ? `<div class="competitor">
         <strong>Regional besser:</strong>
         <a href="${escapeHtml(audit.competitor.url)}">${escapeHtml(audit.competitor.name)}</a>
         — ${escapeHtml(audit.competitor.reason)}
       </div>`
    : `<div class="competitor competitor--empty">Kein passender regionaler Vergleich gefunden.</div>`;

  const host = audit.lead.url ? new URL(audit.lead.url).hostname.replace(/^www\./, "") : "";

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<title>Audit ${escapeHtml(audit.lead.name)}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; }
  body { padding: 18mm 16mm; font-size: 10.5pt; }
  header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px; }
  h1 { font-size: 17pt; margin: 0 0 2px; }
  .subtitle { font-size: 10pt; color: #475569; }
  .brand { font-weight: 700; color: #0f172a; font-size: 11pt; }
  .lh { margin: 8px 0 14px; display: flex; gap: 8px; flex-wrap: wrap; }
  .lh-card { background: #f1f5f9; padding: 6px 10px; border-radius: 6px; font-size: 9pt; display: flex; align-items: center; gap: 6px; }
  .badge { display: inline-block; min-width: 26px; text-align: center; padding: 2px 6px; border-radius: 4px; font-weight: 700; color: #fff; }
  .badge.green { background: #16a34a; }
  .badge.orange { background: #f59e0b; }
  .badge.red { background: #dc2626; }
  .badge.gray { background: #94a3b8; }
  .shots { display: grid; grid-template-columns: 2fr 1fr; gap: 8px; margin-bottom: 12px; }
  .shot { border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; background: #fff; }
  .shot img { width: 100%; height: auto; display: block; max-height: 75mm; object-fit: cover; object-position: top; }
  .shot .caption { padding: 4px 8px; font-size: 8.5pt; color: #475569; background: #f8fafc; }
  h2 { font-size: 11.5pt; margin: 0 0 6px; color: #0f172a; }
  ol.findings { margin: 0 0 12px; padding-left: 16px; }
  ol.findings li { margin-bottom: 6px; }
  .finding-title { font-weight: 700; display: block; }
  .finding-detail { font-size: 9.5pt; color: #334155; }
  .competitor { background: #ecfeff; border-left: 3px solid #0891b2; padding: 6px 10px; border-radius: 4px; margin-top: 8px; font-size: 9.5pt; }
  .competitor--empty { background: #f8fafc; border-color: #cbd5e1; color: #64748b; }
  footer { margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 6px; font-size: 8.5pt; color: #64748b; display: flex; justify-content: space-between; }
  a { color: #0369a1; text-decoration: none; }
</style>
</head>
<body>
  <header>
    <div>
      <h1>${escapeHtml(audit.lead.name)}</h1>
      <div class="subtitle">${escapeHtml(host)} · Branche: ${escapeHtml(audit.lead.branche)} · Score ${audit.score.total}</div>
    </div>
    <div class="brand">IPC24 · Website-Audit</div>
  </header>

  <div class="lh">
    <div class="lh-card">Performance ${lhBadge(audit.lighthouse.performance)}</div>
    <div class="lh-card">Accessibility ${lhBadge(audit.lighthouse.accessibility)}</div>
    <div class="lh-card">Best Practices ${lhBadge(audit.lighthouse.bestPractices)}</div>
    <div class="lh-card">SEO ${lhBadge(audit.lighthouse.seo)}</div>
  </div>

  <div class="shots">
    <div class="shot">
      ${desktop ? `<img src="${desktop}" alt="Desktop"/>` : ""}
      <div class="caption">Desktop · 1366 × 900</div>
    </div>
    <div class="shot">
      ${mobile ? `<img src="${mobile}" alt="Mobil"/>` : ""}
      <div class="caption">Mobil · iPhone 13</div>
    </div>
  </div>

  <h2>3 konkrete Findings</h2>
  <ol class="findings">
    ${findingsHtml}
  </ol>

  ${competitor}

  <footer>
    <span>Auto-Audit · IPC24 Lead-Pipeline</span>
    <span>${new Date().toISOString().slice(0, 10)}</span>
  </footer>
</body>
</html>`;
}
