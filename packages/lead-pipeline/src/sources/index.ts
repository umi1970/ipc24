import type { LeadCandidate } from "../types.ts";
import { fetchGelbeseitenLeads } from "./gelbeseiten.ts";
import { fetchGoogleMapsLeads } from "./google-maps.ts";
import { fetchHandwerkskammerKaLeads } from "./handwerkskammer-ka.ts";
import { fetchOsmOverpassLeads } from "./osm-overpass.ts";

export async function fetchAllLeadCandidates(): Promise<LeadCandidate[]> {
  const sources: Array<{ name: string; fn: () => Promise<LeadCandidate[]> }> = [
    { name: "osm-overpass", fn: fetchOsmOverpassLeads },
    { name: "handwerkskammer-ka", fn: fetchHandwerkskammerKaLeads },
    { name: "gelbeseiten", fn: fetchGelbeseitenLeads },
    { name: "google-maps", fn: fetchGoogleMapsLeads },
  ];

  const all: LeadCandidate[] = [];
  for (const { name, fn } of sources) {
    try {
      const start = Date.now();
      const list = await fn();
      console.log(
        `[sources] ${name}: ${list.length} candidates (${Date.now() - start}ms)`,
      );
      all.push(...list);
    } catch (err) {
      console.error(`[sources] ${name} failed`, err);
    }
  }
  return dedupe(all);
}

function dedupe(list: LeadCandidate[]): LeadCandidate[] {
  const seen = new Map<string, LeadCandidate>();
  for (const c of list) {
    const key = (c.url ?? `${c.name}|${c.anschrift ?? ""}`).toLowerCase();
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, c);
      continue;
    }
    seen.set(key, mergePreferringMostData(existing, c));
  }
  return [...seen.values()];
}

function mergePreferringMostData(a: LeadCandidate, b: LeadCandidate): LeadCandidate {
  const pick = <T>(x: T | null | undefined, y: T | null | undefined): T | null =>
    (x ?? y ?? null) as T | null;
  return {
    source: a.source,
    externalId: a.externalId,
    name: a.name.length >= b.name.length ? a.name : b.name,
    url: pick(a.url, b.url),
    branche: a.branche === "sonstiges" ? b.branche : a.branche,
    inhaberNameGuess: pick(a.inhaberNameGuess, b.inhaberNameGuess),
    anschrift: pick(a.anschrift, b.anschrift),
    telefon: pick(a.telefon, b.telefon),
    xingUrl: pick(a.xingUrl, b.xingUrl),
  };
}
