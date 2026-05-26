import type { CheapFeatures, LighthouseScores, ScoreBreakdown } from "./types.ts";

export function scoreCheapOnly(f: CheapFeatures): ScoreBreakdown {
  const components: ScoreBreakdown["components"] = {};
  const notes: string[] = [];
  let total = 0;

  if (f.noHttps) {
    components.noHttps = 20;
    total += 20;
    notes.push("Kein HTTPS / ungültiges Zertifikat (+20)");
  }
  if (f.contentStaleMonths != null && f.contentStaleMonths > 24) {
    components.contentStale = 20;
    total += 20;
    notes.push(`Letzte Content-Änderung vor ${f.contentStaleMonths} Monaten (+20)`);
  }
  if (f.inlineStylesTable) {
    components.inlineStylesTable = 20;
    total += 20;
    notes.push("Inline-Styles / Table-Layout / Flash-Reste (+20)");
  }
  if (f.missingImpressum) {
    components.missingImpressum = 10;
    total += 10;
    notes.push("Fehlende Impressum-/DSGVO-Standards (+10)");
  }

  return { total, components, notes };
}

export function scoreWithLighthouse(
  cheap: ScoreBreakdown,
  lighthouse: LighthouseScores,
): ScoreBreakdown {
  const components = { ...cheap.components };
  const notes = [...cheap.notes];
  let total = cheap.total;
  if (lighthouse.mobilePerformance != null && lighthouse.mobilePerformance < 60) {
    components.mobileLighthouseLow = 30;
    total += 30;
    notes.push(
      `Mobile Lighthouse Performance ${lighthouse.mobilePerformance} < 60 (+30)`,
    );
  }
  return { total, components, notes };
}
