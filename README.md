# IPC24 e.K. — Website Redesign (2026)

Astro 4.x + Tailwind 3.x + MDX redesign of [ipc24.de](https://ipc24.de), hosted on Netlify with Convex as content + form backend.

> **Branch posture (Phase 1):** This redesign lives on `redesign/phase-1`. `main` continues to host the legacy Lovable/Vite+React site until cutover (Phase 5).

## Stack

| Layer            | Choice                                  | Why                                        |
| ---------------- | --------------------------------------- | ------------------------------------------ |
| Framework        | Astro 4.x                               | Static-first, MDX-native, low JS payload   |
| Styling          | Tailwind 3.x                            | Plan-mandated; small, opinionated          |
| Content (blog)   | Convex `blogPosts` + MDX bodies         | Editable without redeploy; SSG snapshot    |
| Forms            | Netlify Function → Convex + Resend mail | Server-side validation + audit trail       |
| Hosting          | Netlify (project `ipc24ek`)             | Existing project; matches DNS plan         |
| Email            | Resend                                  | Already approved as transactional provider |
| Lint / Format    | Biome                                   | Single tool; fast                          |
| Accessibility CI | pa11y-ci                                | WCAG2AA gate                               |
| Performance CI   | Lighthouse CI                           | ≥0.9 perf / ≥0.95 a11y / ≥0.9 BP/SEO       |

## Local dev

```bash
nvm use 20
npm ci
npm run dev        # http://localhost:4321
npm run convex:dev # parallel; needs CONVEX_DEPLOY_KEY
```

## Required environment

```
CONVEX_URL=...
CONVEX_DEPLOY_KEY=...        # only for `convex deploy`
RESEND_API_KEY=...
PUBLIC_SITE_URL=https://preview-redesign.ipc24.de
```

Set these in Netlify → Site → Environment variables, scoped to the **redesign** branch deploy.

## Deploy flow

1. PR into `redesign/phase-1` → Netlify Deploy Preview at `deploy-preview-<n>--ipc24ek.netlify.app`.
2. Merge into `redesign/phase-1` → Netlify branch deploy at `redesign-phase-1--ipc24ek.netlify.app` (proposed canonical preview URL).
3. Cutover (Phase 5): PR `redesign/phase-1` → `main`, swap Netlify production branch, point `ipc24.de` DNS.

## CI gates

- `build-check`: Biome lint, `astro check`, `astro build`, unit tests.
- `a11y-lighthouse`: pa11y-ci sitemap crawl, Lighthouse CI assertions.

Both run on every PR and on push to `main` or `redesign/**`.

## Folder layout

```
src/
  pages/        Astro routes (incl. MDX)
  layouts/      Page layouts
  components/   Astro/UI components
  content/      Local MDX content collections
netlify/
  functions/    Netlify Functions (contact form, etc.)
convex/
  schema.ts     Convex tables (blogPosts, contactSubmissions)
  blog.ts       Public read queries
  contact.ts    Form mutation
.github/
  workflows/    CI definitions
```
