import { config } from "../config.ts";
import type { Branche, LeadCandidate } from "../types.ts";
import { politeFetch, safeUrl } from "../utils/http.ts";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const CRAFT_TO_BRANCHE: Record<string, Branche> = {
  electrician: "elektro",
  plumber: "sanitaer-heizung",
  hvac: "sanitaer-heizung",
  heating_engineer: "sanitaer-heizung",
  painter: "maler",
  plasterer: "maler",
  carpenter: "schreiner",
  cabinet_maker: "schreiner",
  joiner: "schreiner",
  roofer: "dachdecker",
  tiler: "fliesenleger",
  metal_construction: "metallbau",
  blacksmith: "metallbau",
  gardener: "garten-landschaftsbau",
  floorer: "boden",
  parquet_layer: "boden",
  builder: "bau-allgemein",
  stonemason: "bau-allgemein",
  car_repair: "kfz",
};

function brancheFor(tags: Record<string, string>): Branche {
  const craft = tags.craft;
  if (craft && CRAFT_TO_BRANCHE[craft]) return CRAFT_TO_BRANCHE[craft];
  if (tags.shop === "car_repair" || tags.amenity === "car_repair") return "kfz";
  return "sonstiges";
}

function joinAddress(tags: Record<string, string>): string | null {
  const street = [tags["addr:street"], tags["addr:housenumber"]]
    .filter(Boolean)
    .join(" ");
  const city = [tags["addr:postcode"], tags["addr:city"]]
    .filter(Boolean)
    .join(" ");
  const joined = [street, city].filter(Boolean).join(", ");
  return joined || null;
}

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  tags?: Record<string, string>;
  center?: { lat: number; lon: number };
  lat?: number;
  lon?: number;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

export async function fetchOsmOverpassLeads(): Promise<LeadCandidate[]> {
  if (!config.features.enableOsmOverpass) return [];
  const { south, west, north, east } = config.region.bbox;
  const bbox = `${south},${west},${north},${east}`;
  const ql = `
    [out:json][timeout:30];
    (
      node["craft"](${bbox});
      way["craft"](${bbox});
      node["shop"="car_repair"](${bbox});
      way["shop"="car_repair"](${bbox});
    );
    out center tags;
  `.trim();

  let json: OverpassResponse | null = null;
  let lastError: unknown = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await politeFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(ql)}`,
        timeoutMs: 45_000,
      });
      if (!res.ok) {
        lastError = new Error(`overpass ${res.status}`);
        continue;
      }
      json = (await res.json()) as OverpassResponse;
      break;
    } catch (err) {
      lastError = err;
    }
  }
  if (!json) {
    console.error("[osm-overpass] all endpoints failed", lastError);
    return [];
  }

  const candidates: LeadCandidate[] = [];
  for (const el of json.elements ?? []) {
    const tags = el.tags ?? {};
    const name = tags.name?.trim();
    if (!name) continue;
    const url =
      safeUrl(tags["contact:website"]) ??
      safeUrl(tags.website) ??
      safeUrl(tags["website:de"]);
    candidates.push({
      source: "osm-overpass",
      externalId: `${el.type}/${el.id}`,
      name,
      url,
      branche: brancheFor(tags),
      inhaberNameGuess: tags["operator"] ?? tags["contact:person"] ?? null,
      anschrift: joinAddress(tags),
      telefon: tags["contact:phone"] ?? tags["phone"] ?? null,
      xingUrl: null,
    });
  }
  return candidates;
}
