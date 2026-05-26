export type Branche =
  | "elektro"
  | "sanitaer-heizung"
  | "maler"
  | "schreiner"
  | "dachdecker"
  | "fliesenleger"
  | "metallbau"
  | "garten-landschaftsbau"
  | "boden"
  | "bau-allgemein"
  | "kfz"
  | "sonstiges";

export interface LeadCandidate {
  source: "osm-overpass" | "handwerkskammer-ka" | "gelbeseiten" | "google-maps";
  externalId: string;
  name: string;
  url: string | null;
  branche: Branche;
  inhaberNameGuess: string | null;
  anschrift: string | null;
  telefon: string | null;
  xingUrl: string | null;
}

export interface ScoreBreakdown {
  total: number;
  components: {
    mobileLighthouseLow?: number;
    noHttps?: number;
    contentStale?: number;
    inlineStylesTable?: number;
    missingImpressum?: number;
  };
  notes: string[];
}

export interface CheapFeatures {
  noHttps: boolean;
  inlineStylesTable: boolean;
  missingImpressum: boolean;
  contentStaleMonths: number | null;
  fetched: boolean;
  reason?: string;
}

export interface DiscoveredLead {
  candidate: LeadCandidate;
  features: CheapFeatures;
  score: ScoreBreakdown;
}

export interface LighthouseScores {
  performance: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  seo: number | null;
  mobilePerformance: number | null;
}

export interface AuditFinding {
  title: string;
  detail: string;
}

export interface CompetitorPick {
  name: string;
  url: string;
  reason: string;
}

export interface AuditResult {
  lead: LeadCandidate;
  features: CheapFeatures;
  lighthouse: LighthouseScores;
  findings: AuditFinding[];
  competitor: CompetitorPick | null;
  desktopScreenshotPath: string;
  mobileScreenshotPath: string;
  pdfPath: string;
  score: ScoreBreakdown;
}
