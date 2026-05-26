# `@ipc24/lead-pipeline`

Phase 1 + 2 of the **Website-Makeover-Akquise** pipeline:

1. **Lead-Discovery** — crawl handwerker directories for the Karlsruhe region,
   apply a cheap scoring filter, and create one Paperclip issue per
   qualified lead (label `lead`).
2. **Site-Audit** — for each `lead`-issue, run Lighthouse + Playwright
   screenshots, derive 3 concrete findings + one regional competitor, render a
   1-page PDF, attach it to the issue, and flip the label to `audit_done`.

## Quick start

From repository root:

```sh
# install deps + chromium for lead-pipeline only
npm --prefix packages/lead-pipeline install
npx --prefix packages/lead-pipeline playwright install --with-deps chromium

# Phase 1 — Lead-Discovery, region=karlsruhe (default)
npm run lead-discovery -- --region=karlsruhe

# Dry-run (no Paperclip writes), e.g. for the first try
npm run lead-discovery -- --dry-run --limit=20

# Phase 2 — Audit the first 5 lead-issues end-to-end
npm run audit-batch -- --label=lead --limit=5

# Or audit a single ad-hoc URL (no Paperclip writes, file output only)
npm run audit-batch -- --dry-run --url=https://example-handwerker.de --name="Beispiel"
```

> **Note:** the project DoD references `pnpm lead-discovery`. The execution
> environment ships npm only, so the canonical commands above use npm. The
> behaviour is identical; `pnpm` works the same way if you have it installed.

## Required environment

Inherited automatically inside a Paperclip heartbeat. Outside a heartbeat,
export these manually before running with `--no-paperclip` / `--dry-run`
removed:

| Variable | Purpose |
| --- | --- |
| `PAPERCLIP_API_URL` | e.g. `http://paperclip.todayoff.de` |
| `PAPERCLIP_API_KEY` | run JWT |
| `PAPERCLIP_COMPANY_ID` | IPC24 company id |
| `PAPERCLIP_RUN_ID` | audit-trail header |
| `PAPERCLIP_PROJECT_ID` | defaults to the Website-Makeover-Akquise project |
| `LEAD_REGION` | label only, defaults to `karlsruhe` |
| `LEAD_OUT_DIR` | local file output, defaults to `out/` |
| `LEAD_USER_AGENT` | polite UA, contains a contact email |
| `GOOGLE_PLACES_API_KEY` | optional — enables the Google Places source |
| `ENABLE_HWK` | set to `0` to disable the HwK-Karlsruhe source |
| `ENABLE_OSM` | set to `0` to disable OSM-Overpass |
| `ENABLE_GELBESEITEN` | set to `1` to enable the gelbeseiten source (no-op today) |

## Sources

| Source | Status | Notes |
| --- | --- | --- |
| `osm-overpass` | working | Primary, free, no key. Karlsruhe bbox + craft tags. |
| `handwerkskammer-ka` | best-effort | Public Betriebssuche; selectors may drift, returns `[]` on parser miss. |
| `gelbeseiten` | opt-in (no-op) | Anti-bot protected (Akamai). Real implementation needs Playwright + rate limiting; gated by `ENABLE_GELBESEITEN=1`. |
| `google-maps` | opt-in (Places API) | Raw Maps scraping violates ToS. We use the Google Places (New) API when `GOOGLE_PLACES_API_KEY` is set; off otherwise. |

## Scoring

Split into two phases for cost reasons (Lighthouse is expensive):

| Phase | Triggers |
| --- | --- |
| **Discovery (cheap-only)** | No HTTPS +20, Wayback content > 24 Mon +20, inline-styles/table/flash +20, missing Impressum +10 — threshold `40` |
| **Audit (full)** | adds mobile Lighthouse < 60 +30 — original `60` threshold met after audit |

Score thresholds are tunable via `src/config.ts`.

## Output

- `out/discovery-summary.json` — qualified candidates of the last run.
- `out/audits/<slug>/desktop.png` + `mobile.png` — Playwright screenshots.
- `out/audits/<slug>/audit.pdf` — final 1-page PDF (also attached to the
  Paperclip issue).

## Cron / routine

To wire the Mo-09:00 / Di-09:00 schedule from the parent
[IPC-912 plan](/IPC/issues/IPC-912#document-plan), create a Paperclip
**routine** that runs `npm run lead-discovery` (Mon) and
`npm run audit-batch -- --limit=20` (Tue). The routine wraps the script as a
recurring issue assigned to the CTO; the audit-trail header (`X-Paperclip-Run-Id`)
is sent automatically because `PAPERCLIP_RUN_ID` is injected into each run.

## Legal / ToS guard rails

- We do **not** scrape Google Maps. Use the Google Places (New) API instead
  (`GOOGLE_PLACES_API_KEY`), which is the only legal Google source.
- `gelbeseiten` is gated behind an opt-in flag and ships as a no-op so the
  default Mo-09:00 routine stays in well-behaved territory.
- OSM data is ODbL — attribute "© OpenStreetMap contributors" in any
  redistributed list.
- HwK-Karlsruhe scrape is best-effort and respects a 2-second per-domain
  cooldown via `politeFetch`.
- All HTTP requests carry a `User-Agent` with a contact email
  (`LEAD_USER_AGENT`).

## File map

```
packages/lead-pipeline/
├── package.json          # @ipc24/lead-pipeline workspace
├── tsconfig.json
├── README.md             # this file
├── out/                  # screenshots / pdfs / summaries
└── src/
    ├── config.ts         # env-driven config + thresholds
    ├── types.ts          # shared types (LeadCandidate, AuditResult, …)
    ├── score.ts          # cheap-only + full scoring rules
    ├── paperclip.ts      # tiny Paperclip API client
    ├── utils/
    │   ├── http.ts       # polite fetch (per-domain cooldown, UA, timeout)
    │   └── wayback.ts    # archive.org last-snapshot helper
    ├── sources/
    │   ├── osm-overpass.ts
    │   ├── handwerkskammer-ka.ts
    │   ├── gelbeseiten.ts
    │   ├── google-maps.ts
    │   └── index.ts      # dedupe + orchestration
    ├── checks/
    │   └── cheap-features.ts  # HTTPS, inline-styles, Impressum, Wayback
    ├── audit/
    │   ├── screenshot.ts # Playwright desktop + mobile
    │   ├── lighthouse.ts # chrome-launcher + lighthouse npm
    │   ├── findings.ts   # 3 top concrete findings
    │   ├── competitor.ts # pick a clean regional reference
    │   └── pdf.ts        # 1-page HTML + Playwright print-to-PDF
    └── bin/
        ├── lead-discovery.ts # `npm run lead-discovery`
        └── audit-batch.ts    # `npm run audit-batch`
```
