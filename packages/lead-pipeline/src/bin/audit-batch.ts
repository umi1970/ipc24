#!/usr/bin/env tsx
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { computeCheapFeatures } from "../checks/cheap-features.ts";
import { config } from "../config.ts";
import {
  addComment,
  attachFile,
  ensureLabel,
  getIssue,
  listIssues,
  updateIssue,
} from "../paperclip.ts";
import { scoreCheapOnly, scoreWithLighthouse } from "../score.ts";
import { pickCompetitor } from "../audit/competitor.ts";
import { deriveFindings } from "../audit/findings.ts";
import { runLighthouse } from "../audit/lighthouse.ts";
import { renderAuditPdf } from "../audit/pdf.ts";
import { captureScreenshots } from "../audit/screenshot.ts";
import type { AuditResult, Branche, LeadCandidate } from "../types.ts";

interface Args {
  label: string;
  limit: number;
  dryRun: boolean;
  url: string | null;
  name: string | null;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    label: config.paperclipLabels.lead,
    limit: 5,
    dryRun: false,
    url: null,
    name: null,
  };
  for (const a of argv) {
    if (a.startsWith("--label=")) args.label = a.slice("--label=".length);
    else if (a.startsWith("--limit=")) args.limit = Number(a.slice("--limit=".length));
    else if (a === "--dry-run") args.dryRun = true;
    else if (a.startsWith("--url=")) args.url = a.slice("--url=".length);
    else if (a.startsWith("--name=")) args.name = a.slice("--name=".length);
  }
  return args;
}

interface LeadFromIssue {
  issueId: string;
  identifier: string;
  candidate: LeadCandidate;
}

function parseLeadJsonFromBody(body: string | null): Partial<LeadCandidate> & { url?: string | null } {
  if (!body) return {};
  const m = body.match(/```json\s*([\s\S]+?)```/);
  if (!m) return {};
  try {
    const obj = JSON.parse(m[1]);
    return {
      name: obj.name ?? undefined,
      url: obj.url ?? null,
      branche: (obj.branche as Branche) ?? "sonstiges",
      inhaberNameGuess: obj.inhaber_name_guess ?? null,
      anschrift: obj.anschrift ?? null,
      telefon: obj.telefon ?? null,
      xingUrl: obj.xing_url ?? null,
    };
  } catch {
    return {};
  }
}

async function loadLeadsFromIssues(label: string, limit: number): Promise<LeadFromIssue[]> {
  const issues = await listIssues({ labelName: label, q: "Lead:", limit: 200 });
  const leads: LeadFromIssue[] = [];
  for (const issue of issues) {
    const parsed = parseLeadJsonFromBody(issue.description);
    if (!parsed.url) continue;
    leads.push({
      issueId: issue.id,
      identifier: issue.identifier,
      candidate: {
        source: "osm-overpass",
        externalId: issue.identifier,
        name: parsed.name ?? issue.title,
        url: parsed.url,
        branche: (parsed.branche as Branche) ?? "sonstiges",
        inhaberNameGuess: parsed.inhaberNameGuess ?? null,
        anschrift: parsed.anschrift ?? null,
        telefon: parsed.telefon ?? null,
        xingUrl: parsed.xingUrl ?? null,
      },
    });
    if (leads.length >= limit) break;
  }
  return leads;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function auditOne(lead: LeadCandidate): Promise<AuditResult> {
  if (!lead.url) throw new Error(`lead ${lead.name} has no URL`);
  const slug = slugify(lead.name);
  const dir = join(config.output.dir, "audits", slug);
  mkdirSync(dir, { recursive: true });

  const desktopPath = join(dir, "desktop.png");
  const mobilePath = join(dir, "mobile.png");
  const pdfPath = join(dir, "audit.pdf");

  console.log("[audit] %s — screenshots…", lead.name);
  await captureScreenshots(lead.url, desktopPath, mobilePath);

  console.log("[audit] %s — lighthouse…", lead.name);
  const lh = await runLighthouse(lead.url);

  console.log("[audit] %s — cheap features…", lead.name);
  const cheap = await computeCheapFeatures(lead.url);

  const findings = deriveFindings(lead, cheap, lh);

  console.log("[audit] %s — competitor pick…", lead.name);
  const competitor = await pickCompetitor(lead).catch(() => null);

  const baseScore = scoreCheapOnly(cheap);
  const fullScore = scoreWithLighthouse(baseScore, lh.mobile);

  const audit: AuditResult = {
    lead,
    features: cheap,
    lighthouse: lh.mobile,
    findings,
    competitor,
    desktopScreenshotPath: desktopPath,
    mobileScreenshotPath: mobilePath,
    pdfPath,
    score: fullScore,
  };

  console.log("[audit] %s — pdf…", lead.name);
  await renderAuditPdf(audit, pdfPath);

  return audit;
}

function auditCommentBody(audit: AuditResult): string {
  const lh = audit.lighthouse;
  const findings = audit.findings.map((f) => `- **${f.title}** — ${f.detail}`).join("\n");
  const comp = audit.competitor
    ? `**Regionaler Vergleich:** [${audit.competitor.name}](${audit.competitor.url}) — ${audit.competitor.reason}`
    : "_Kein passender regionaler Vergleich gefunden._";
  return [
    `## Audit abgeschlossen`,
    "",
    `**Score (mit Lighthouse):** ${audit.score.total}`,
    "",
    `**Lighthouse:** Performance ${lh.performance ?? "—"} · Accessibility ${lh.accessibility ?? "—"} · Best Practices ${lh.bestPractices ?? "—"} · SEO ${lh.seo ?? "—"}`,
    "",
    "### 3 Findings",
    findings,
    "",
    comp,
    "",
    "_PDF im Anhang an diesem Issue._",
  ].join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log("[audit-batch] label=%s limit=%d dryRun=%s", args.label, args.limit, args.dryRun);

  let leads: LeadFromIssue[];
  if (args.url) {
    leads = [
      {
        issueId: "",
        identifier: "ad-hoc",
        candidate: {
          source: "osm-overpass",
          externalId: "ad-hoc",
          name: args.name ?? args.url,
          url: args.url,
          branche: "sonstiges",
          inhaberNameGuess: null,
          anschrift: null,
          telefon: null,
          xingUrl: null,
        },
      },
    ];
  } else {
    leads = await loadLeadsFromIssues(args.label, args.limit);
  }
  console.log("[audit-batch] %d leads to audit", leads.length);

  if (leads.length === 0) {
    console.log("[audit-batch] nothing to do");
    return;
  }

  let auditDoneLabelId: string | null = null;
  try {
    const lbl = await ensureLabel(config.paperclipLabels.auditDone);
    auditDoneLabelId = lbl?.id ?? null;
  } catch (err) {
    console.warn("[audit-batch] could not ensure audit_done label", err);
  }

  let success = 0;
  let failure = 0;
  for (const lead of leads) {
    try {
      const audit = await auditOne(lead.candidate);
      console.log("[audit-batch] %s — done, pdf=%s", lead.candidate.name, audit.pdfPath);
      success++;

      if (args.dryRun || !lead.issueId) continue;
      try {
        await attachFile(lead.issueId, audit.pdfPath, "application/pdf");
        await attachFile(lead.issueId, audit.desktopScreenshotPath, "image/png");
        await attachFile(lead.issueId, audit.mobileScreenshotPath, "image/png");
      } catch (err) {
        console.warn("[audit-batch] attach failed", err);
      }
      try {
        await addComment(lead.issueId, auditCommentBody(audit));
      } catch (err) {
        console.warn("[audit-batch] comment failed", err);
      }
      try {
        const current = await getIssue(lead.issueId);
        const newLabelIds = (current.labels ?? [])
          .filter((l) => l.name !== config.paperclipLabels.lead)
          .map((l) => l.id);
        if (auditDoneLabelId && !newLabelIds.includes(auditDoneLabelId)) {
          newLabelIds.push(auditDoneLabelId);
        }
        await updateIssue(lead.issueId, { labelIds: newLabelIds });
      } catch (err) {
        console.warn("[audit-batch] label swap failed", err);
      }
    } catch (err) {
      console.error("[audit-batch] FAIL %s", lead.candidate.name, err);
      failure++;
    }
  }
  console.log("[audit-batch] success=%d failure=%d", success, failure);
}

main().catch((err) => {
  console.error("[audit-batch] fatal", err);
  process.exit(1);
});
