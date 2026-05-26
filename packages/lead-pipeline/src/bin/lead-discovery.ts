#!/usr/bin/env tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { computeCheapFeatures } from "../checks/cheap-features.ts";
import { config } from "../config.ts";
import { ensureLabel, createIssue, listIssues } from "../paperclip.ts";
import { scoreCheapOnly } from "../score.ts";
import { fetchAllLeadCandidates } from "../sources/index.ts";
import type { DiscoveredLead, LeadCandidate } from "../types.ts";

interface Args {
  region: string;
  limit: number;
  dryRun: boolean;
  noPaperclip: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    region: config.region.name,
    limit: 200,
    dryRun: false,
    noPaperclip: false,
  };
  for (const a of argv) {
    if (a.startsWith("--region=")) args.region = a.slice("--region=".length);
    else if (a.startsWith("--limit=")) args.limit = Number(a.slice("--limit=".length));
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--no-paperclip") args.noPaperclip = true;
  }
  return args;
}

function leadBody(c: LeadCandidate, score: number, notes: string[]): string {
  const data = {
    name: c.name,
    url: c.url,
    branche: c.branche,
    score,
    inhaber_name_guess: c.inhaberNameGuess,
    anschrift: c.anschrift,
    telefon: c.telefon,
    xing_url: c.xingUrl,
  };
  return [
    "## Lead",
    "",
    "```json",
    JSON.stringify(data, null, 2),
    "```",
    "",
    "## Scoring",
    "",
    notes.length ? notes.map((n) => `- ${n}`).join("\n") : "_keine cheap-Features ausgelöst_",
    "",
    `**Source:** \`${c.source}\` (id: \`${c.externalId}\`)`,
    "",
    `_Erzeugt durch \`lead-discovery\` am ${new Date().toISOString()}._`,
  ].join("\n");
}

function leadTitle(c: LeadCandidate, score: number): string {
  const url = c.url ? new URL(c.url).hostname.replace(/^www\./, "") : "ohne URL";
  return `Lead: ${c.name} (${c.branche}, Score ${score}) — ${url}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log("[discover] region=%s limit=%d dryRun=%s", args.region, args.limit, args.dryRun);

  mkdirSync(config.output.dir, { recursive: true });

  const all = await fetchAllLeadCandidates();
  console.log("[discover] %d total candidates from all sources", all.length);

  const withUrl = all.filter((c) => c.url);
  console.log("[discover] %d candidates have a URL", withUrl.length);

  const slice = withUrl.slice(0, args.limit);

  const discovered: DiscoveredLead[] = [];
  for (const c of slice) {
    try {
      const features = await computeCheapFeatures(c.url!);
      const score = scoreCheapOnly(features);
      discovered.push({ candidate: c, features, score });
      console.log(
        "  - %s — score %d %s",
        c.name,
        score.total,
        features.fetched ? "" : `(no fetch: ${features.reason ?? "?"})`,
      );
    } catch (err) {
      console.warn("  ! %s — feature compute failed", c.name, err);
    }
  }

  const qualified = discovered.filter(
    (d) => d.score.total >= config.thresholds.discoveryScore,
  );
  console.log(
    "[discover] %d/%d qualified (>= %d cheap-score)",
    qualified.length,
    discovered.length,
    config.thresholds.discoveryScore,
  );

  const summary = qualified.map((d) => ({
    name: d.candidate.name,
    url: d.candidate.url,
    branche: d.candidate.branche,
    score: d.score.total,
    notes: d.score.notes,
  }));
  writeFileSync(
    join(config.output.dir, "discovery-summary.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), region: args.region, qualified: summary }, null, 2),
  );

  if (args.dryRun || args.noPaperclip) {
    console.log("[discover] dry-run / no-paperclip: skipping issue creation");
    return;
  }

  let leadLabelId: string | null = null;
  try {
    const lbl = await ensureLabel(config.paperclipLabels.lead);
    leadLabelId = lbl?.id ?? null;
  } catch (err) {
    console.warn("[discover] could not ensure lead label", err);
  }

  const existing = await listIssues({ q: "Lead:" }).catch(() => []);
  const existingByUrl = new Map(
    existing
      .map((i) => urlFromDescription(i.description))
      .filter((u): u is { url: string; id: string } => Boolean(u))
      .map((u) => [u.url.toLowerCase(), u.id] as const),
  );

  let created = 0;
  let skipped = 0;
  for (const d of qualified) {
    const u = d.candidate.url!.toLowerCase();
    if (existingByUrl.has(u)) {
      skipped++;
      continue;
    }
    try {
      const issue = await createIssue({
        title: leadTitle(d.candidate, d.score.total),
        description: leadBody(d.candidate, d.score.total, d.score.notes),
        priority: "medium",
        labelIds: leadLabelId ? [leadLabelId] : undefined,
        status: "todo",
      });
      console.log("  + created %s (%s)", issue.identifier, issue.id);
      created++;
    } catch (err) {
      console.error("  ! create issue failed for %s", d.candidate.name, err);
    }
  }
  console.log("[discover] created=%d skipped=%d", created, skipped);
}

function urlFromDescription(desc: string | null): { url: string; id: string } | null {
  if (!desc) return null;
  const m = desc.match(/"url"\s*:\s*"([^"]+)"/);
  if (!m) return null;
  return { url: m[1], id: "" };
}

main().catch((err) => {
  console.error("[discover] fatal", err);
  process.exit(1);
});
