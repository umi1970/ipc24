import { config } from "../config.ts";
import type { Branche, LeadCandidate } from "../types.ts";
import { politeFetch, safeUrl } from "../utils/http.ts";

/**
 * Google Maps web scraping is against Google ToS. The legal path is the
 * Google Places (New) API, which requires GOOGLE_PLACES_API_KEY. If the key is
 * absent, this source is a no-op. If the key is present, we run a Text Search
 * over the configured region for handwerker keywords.
 */

const KEYWORDS: Array<{ q: string; branche: Branche }> = [
  { q: "Elektriker Karlsruhe", branche: "elektro" },
  { q: "Sanitaer Heizung Karlsruhe", branche: "sanitaer-heizung" },
  { q: "Maler Karlsruhe", branche: "maler" },
  { q: "Schreiner Karlsruhe", branche: "schreiner" },
  { q: "Dachdecker Karlsruhe", branche: "dachdecker" },
];

interface PlacesTextSearchResponse {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    internationalPhoneNumber?: string;
    websiteUri?: string;
  }>;
}

export async function fetchGoogleMapsLeads(): Promise<LeadCandidate[]> {
  const key = config.google.placesApiKey;
  if (!key) return [];
  const all: LeadCandidate[] = [];
  for (const { q, branche } of KEYWORDS) {
    try {
      const res = await politeFetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri",
        },
        body: JSON.stringify({ textQuery: q, languageCode: "de", regionCode: "DE" }),
        timeoutMs: 15000,
      });
      if (!res.ok) {
        console.warn(`[google-maps] ${q} status ${res.status}`);
        continue;
      }
      const json = (await res.json()) as PlacesTextSearchResponse;
      for (const p of json.places ?? []) {
        if (!p.displayName?.text) continue;
        all.push({
          source: "google-maps",
          externalId: `places:${p.id ?? p.displayName.text}`,
          name: p.displayName.text,
          url: safeUrl(p.websiteUri ?? null),
          branche,
          inhaberNameGuess: null,
          anschrift: p.formattedAddress ?? null,
          telefon: p.internationalPhoneNumber ?? null,
          xingUrl: null,
        });
      }
    } catch (err) {
      console.warn(`[google-maps] ${q} error`, err);
    }
  }
  return all;
}
