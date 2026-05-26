import { computeCheapFeatures } from "../checks/cheap-features.ts";
import { scoreCheapOnly } from "../score.ts";
import { fetchAllLeadCandidates } from "../sources/index.ts";
import type { CompetitorPick, LeadCandidate } from "../types.ts";

let cache: LeadCandidate[] | null = null;

async function pool(): Promise<LeadCandidate[]> {
  if (cache) return cache;
  cache = await fetchAllLeadCandidates();
  return cache;
}

/**
 * Pick a regional competitor whose homepage scores LOW on our cheap features
 * (= modern site, nothing obviously broken). We accept the first candidate
 * in the same Branche with a usable URL and a cheap-score of 0.
 */
export async function pickCompetitor(lead: LeadCandidate): Promise<CompetitorPick | null> {
  const candidates = await pool();
  const sameBranche = candidates.filter(
    (c) => c.branche === lead.branche && c.url && c.name !== lead.name,
  );
  const ordered = sameBranche.slice(0, 12); // cap to keep audit cheap
  for (const c of ordered) {
    try {
      const features = await computeCheapFeatures(c.url!);
      const score = scoreCheapOnly(features);
      if (features.fetched && score.total <= 10) {
        return {
          name: c.name,
          url: c.url!,
          reason:
            score.total === 0
              ? "Vergleichbarer Betrieb in der Region mit moderner, sauberer Website."
              : "Vergleichbarer Betrieb in der Region — sichtbar besser aufgestellt.",
        };
      }
    } catch {
      // try next
    }
  }
  return null;
}
