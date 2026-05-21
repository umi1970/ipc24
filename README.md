# IPC24 e.K. — ipc24.de Website

Marketing-Website für IPC24 e.K. — Webentwicklung & Digitale Lösungen.

## Stack

| Layer | Technologie | Version |
|---|---|---|
| Framework | [Astro](https://astro.build) | 4.x |
| Styling | [Tailwind CSS](https://tailwindcss.com) | 3.x |
| Content | MDX + Astro Content Collections | — |
| UI Islands | React | 18.x |
| Linter/Formatter | [Biome](https://biomejs.dev) | 1.9.4 |
| Sprache (Phase 1) | Deutsch (`de`) | — |
| Deploy | Netlify | — |

## Branch-Strategie

| Branch | Zweck |
|---|---|
| `main` | Produktion (alter React/Vite-Stack) — bleibt bis zum Cutover unverändert |
| `redesign-astro` | Neuer Astro-Stack — Preview-Deploy auf Netlify |

Der Cutover von `main` → `redesign-astro` erfolgt nach QA-Freigabe.

## Lokale Entwicklung

```sh
# 1. Abhängigkeiten installieren
npm install --legacy-peer-deps

# 2. Dev-Server starten
npm run dev

# 3. Produktions-Build testen
npm run build
npm run preview
```

## Verfügbare Skripte

| Befehl | Beschreibung |
|---|---|
| `npm run dev` | Dev-Server (localhost:4321) |
| `npm run build` | Produktions-Build → `dist/` |
| `npm run preview` | Produktions-Build lokal testen |
| `npm run lint` | Biome-Lint (Fehler prüfen) |
| `npm run format` | Biome-Format (automatisch korrigieren) |
| `npm run check` | TypeScript + Astro-Typen prüfen |

## Verzeichnisstruktur

```
src/
  components/      # Wiederverwendbare Astro/React-Komponenten
  layouts/         # Seiten-Layouts (BaseLayout, BlogLayout, …)
  pages/           # Alle Routen (index.astro, /blog, /freelance, …)
  content/
    blog/
      de/          # Deutsche Blog-Posts (MDX, Phase 1)
      en/          # Englische Blog-Posts (leer, Phase 2)
    services/      # Service-Datendateien (JSON/YAML)
  styles/          # Global CSS (Tailwind-Import + @layer utilities)
public/            # Statische Assets (favicon, robots.txt, og-images)
.github/workflows/ # GitHub Actions CI
```

## Informationsarchitektur (Phase 1)

| Route | Inhalt |
|---|---|
| `/` | Homepage mit Drei-Pfad-Hero |
| `/freelance` | Senior-Freelance-Profil |
| `/websites` | KMU-Website-Pakete (4 Subpages) |
| `/web-apps` | Web-Apps & KI-Integration |
| `/referenzen` | Referenzen & Case Studies |
| `/ueber` | Über IPC24 e.K. |
| `/kontakt` | Kontaktformular (→ Resend) |
| `/blog` | Blog-Übersicht |
| `/blog/[slug]` | Blog-Artikel (MDX) |
| `/impressum` | Impressum |
| `/datenschutz` | Datenschutz |

## Deploy-Flow

1. Feature-Branch → PR gegen `redesign-astro`
2. GitHub Actions: Build-Check + Biome-Check + Lighthouse CI + pa11y
3. Netlify Preview-Deploy: `redesign-astro--ipc24ek.netlify.app`
4. CTO-Review + Merge nach `redesign-astro`
5. Cutover zu `main` nach vollständiger QA-Freigabe

## Quality Gates (CI)

- Lighthouse Performance ≥ 90 (mobile)
- Lighthouse Accessibility ≥ 95
- Lighthouse Best Practices ≥ 95
- Lighthouse SEO ≥ 95
- pa11y WCAG 2.1 AA

## Secrets (via CTO / GitHub Actions)

| Secret | Zweck |
|---|---|
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI GitHub-App |
| `RESEND_API_KEY` | Kontaktformular E-Mail-Versand |
| `NETLIFY_AUTH_TOKEN` | Netlify Deploy |

> **Hinweis:** Secrets werden ausschließlich vom CTO verwaltet.
