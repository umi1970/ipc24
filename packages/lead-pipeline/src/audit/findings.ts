import type { AuditFinding, CheapFeatures, LeadCandidate } from "../types.ts";
import type { LighthouseRunResult } from "./lighthouse.ts";

const PRIORITY_AUDITS = [
  "viewport",
  "font-size",
  "tap-targets",
  "color-contrast",
  "image-alt",
  "meta-description",
  "uses-text-compression",
  "render-blocking-resources",
  "largest-contentful-paint",
  "uses-responsive-images",
  "uses-optimized-images",
];

const AUDIT_LABELS: Record<string, { title: string; tip: string }> = {
  viewport: {
    title: "Mobil-Viewport fehlt",
    detail: "Die Seite skaliert auf dem Handy nicht — Buchungen über Smartphone scheitern oft schon hier.",
    tip: "",
  } as never,
  "font-size": {
    title: "Schrift auf dem Handy unleserlich",
    tip: "Mindestens 16 px für Fließtext, sonst springen Besucher direkt ab.",
  },
  "tap-targets": {
    title: "Buttons / Links auf dem Handy zu klein",
    tip: "Bedienelemente >= 48 × 48 px halten Daumen-Bedienung sauber.",
  },
  "color-contrast": {
    title: "Kontrast zu schwach",
    tip: "Schwacher Kontrast lässt Inhalte unprofessionell wirken und schliesst Sehbeeinträchtigte aus.",
  },
  "image-alt": {
    title: "Bilder ohne Alt-Text",
    tip: "Google sieht Bilder ohne Alt-Text praktisch nicht — verschenkt SEO-Punkte.",
  },
  "meta-description": {
    title: "Meta-Description fehlt",
    tip: "Ohne Meta-Description schreibt Google den Trefftext selbst — selten überzeugend.",
  },
  "uses-text-compression": {
    title: "Keine GZIP-/Brotli-Komprimierung",
    tip: "Komprimierung halbiert die mobile Ladezeit fast immer.",
  },
  "render-blocking-resources": {
    title: "Render-blockende Ressourcen",
    tip: "Externe Schriften / Scripts im <head> ohne defer machen die Seite spürbar langsamer.",
  },
  "largest-contentful-paint": {
    title: "Hero-Bild lädt zu spät (LCP > 2.5 s)",
    tip: "Hero-Bild als preload + WebP komprimieren bringt > 1 s Ladezeit zurück.",
  },
  "uses-responsive-images": {
    title: "Bilder nicht responsive",
    tip: "Desktop-Bilder werden auf dem Handy verkleinert geladen — verbrennt mobiles Datenvolumen.",
  },
  "uses-optimized-images": {
    title: "Bilder unoptimiert (JPEG/PNG ohne Komprimierung)",
    tip: "WebP/AVIF spart pro Bild gerne 60 %.",
  },
};

export function deriveFindings(
  lead: LeadCandidate,
  cheap: CheapFeatures,
  lh: LighthouseRunResult,
): AuditFinding[] {
  const findings: AuditFinding[] = [];

  if (cheap.noHttps) {
    findings.push({
      title: "Keine sichere HTTPS-Verbindung",
      detail:
        "Browser markieren die Seite als 'nicht sicher' und Google rankt sie hinter HTTPS-Konkurrenten — direkter Vertrauensverlust für Inhaber.",
    });
  }

  if (cheap.contentStaleMonths != null && cheap.contentStaleMonths > 24) {
    findings.push({
      title: `Letzte sichtbare Aktualisierung vor ${cheap.contentStaleMonths} Monaten`,
      detail:
        "Wer eine veraltete Website sieht, vermutet einen veralteten Betrieb. Eine moderne Optik signalisiert 'die arbeiten heute noch'.",
    });
  }

  if (cheap.missingImpressum) {
    findings.push({
      title: "Impressum / DSGVO-Hinweis nicht erkennbar",
      detail:
        "Pflichtangabe nach §5 TMG. Fehlt es, drohen Abmahnungen — und Besucher bekommen ein mulmiges Gefühl.",
    });
  }

  if (cheap.inlineStylesTable) {
    findings.push({
      title: "Layout mit Tabellen / Inline-Styles (alter Baukasten)",
      detail:
        "Diese Bauweise ist 15+ Jahre alt — Google rankt sie schlecht und sie wirkt auf Handys gebrochen.",
    });
  }

  for (const id of PRIORITY_AUDITS) {
    const a = lh.audits[id];
    if (!a) continue;
    if (a.score == null) continue;
    if (a.score >= 0.9) continue;
    const label = AUDIT_LABELS[id];
    if (!label) continue;
    findings.push({
      title: label.title,
      detail: label.tip,
    });
  }

  if (lh.mobile.mobilePerformance != null && lh.mobile.mobilePerformance < 60) {
    findings.unshift({
      title: `Mobile Performance ${lh.mobile.mobilePerformance} / 100`,
      detail:
        "Wer länger als 3 Sekunden wartet, klickt weg. Lighthouse misst die Seite als spürbar langsam auf Handynetz.",
    });
  }

  // Take top 3 unique findings as required by the issue spec
  const seen = new Set<string>();
  const unique: AuditFinding[] = [];
  for (const f of findings) {
    if (seen.has(f.title)) continue;
    seen.add(f.title);
    unique.push(f);
    if (unique.length >= 3) break;
  }

  const fallbacks: AuditFinding[] = [
    {
      title: "Kein klarer Lead-Call-to-Action im sichtbaren Bereich",
      detail:
        "Telefonnummer und Anfrage-Button gehören in die ersten 600 px der Mobilansicht — sonst geht jeder zweite Besucher verloren.",
    },
    {
      title: "Inhaber-Foto und Referenzgalerie fehlen / schwach",
      detail:
        "Handwerk lebt von Vertrauen. Ein echtes Gesicht plus 5–8 Projektfotos heben die Conversion-Rate spürbar.",
    },
    {
      title: "Lokale Verankerung (Stadt/Region) nicht auf den ersten Blick erkennbar",
      detail:
        "„Aus Karlsruhe für Karlsruhe“ gehört in den Hero. Lokal-SEO + emotionale Bindung in einem Satz.",
    },
  ];
  for (const fb of fallbacks) {
    if (unique.length >= 3) break;
    if (seen.has(fb.title)) continue;
    seen.add(fb.title);
    unique.push(fb);
  }

  return unique.slice(0, 3);
}
