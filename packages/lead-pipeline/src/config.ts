export const config = {
  paperclip: {
    apiUrl: process.env.PAPERCLIP_API_URL ?? "",
    apiKey: process.env.PAPERCLIP_API_KEY ?? "",
    companyId: process.env.PAPERCLIP_COMPANY_ID ?? "",
    runId: process.env.PAPERCLIP_RUN_ID ?? "",
    projectId:
      process.env.PAPERCLIP_PROJECT_ID ??
      "5ce53bb8-6ddc-4fe5-becb-6f572795eabe",
  },
  region: {
    name: process.env.LEAD_REGION ?? "karlsruhe",
    bbox: {
      south: 48.92,
      west: 8.27,
      north: 49.08,
      east: 8.55,
    },
  },
  thresholds: {
    discoveryScore: 40,
    fullScore: 60,
  },
  http: {
    userAgent:
      process.env.LEAD_USER_AGENT ??
      "IPC24-LeadPipeline/0.1 (https://ipc24.de; contact=hi@ipc24.de)",
    timeoutMs: 12000,
    perDomainDelayMs: 2000,
  },
  output: {
    dir: process.env.LEAD_OUT_DIR ?? "out",
  },
  google: {
    placesApiKey: process.env.GOOGLE_PLACES_API_KEY ?? null,
  },
  features: {
    enableGelbeseiten: process.env.ENABLE_GELBESEITEN === "1",
    enableHandwerkskammer: process.env.ENABLE_HWK !== "0",
    enableOsmOverpass: process.env.ENABLE_OSM !== "0",
  },
  paperclipLabels: {
    lead: process.env.LABEL_LEAD ?? "lead",
    auditDone: process.env.LABEL_AUDIT_DONE ?? "audit_done",
  },
};
