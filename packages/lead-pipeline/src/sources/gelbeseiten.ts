import { config } from "../config.ts";
import type { LeadCandidate } from "../types.ts";

/**
 * gelbeseiten.de is anti-bot protected (Akamai). We expose this module so the
 * pipeline contract is stable, but it is opt-in (ENABLE_GELBESEITEN=1) and a
 * no-op by default. A real implementation needs a headless-browser path
 * (Playwright) plus rate-limiting; left as a follow-up to keep the default
 * Mo-09:00 run cheap and legally clean.
 */
export async function fetchGelbeseitenLeads(): Promise<LeadCandidate[]> {
  if (!config.features.enableGelbeseiten) return [];
  console.warn(
    "[gelbeseiten] enabled but not yet implemented — anti-bot path required, see source comment",
  );
  return [];
}
