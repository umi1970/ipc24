import { execSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { LighthouseScores } from "../types.ts";
import { ensureChromiumLdPath } from "../utils/chromium-env.ts";

function findChromiumBinary(): string | null {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  // Try Playwright's installed Chromium first (preferred, version-matched).
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH
    ? process.env.PLAYWRIGHT_BROWSERS_PATH
    : join(process.env.HOME ?? "/root", ".cache", "ms-playwright");
  try {
    if (!existsSync(root)) throw new Error("playwright cache not found");
    const entries = readdirSync(root)
      .filter((d) => d.startsWith("chromium-"))
      .map((d) => join(root, d))
      .filter((p) => statSync(p).isDirectory())
      .sort()
      .reverse();
    for (const dir of entries) {
      for (const candidate of [
        join(dir, "chrome-linux", "chrome"),
        join(dir, "chrome-linux64", "chrome"),
      ]) {
        if (existsSync(candidate)) return candidate;
      }
    }
  } catch {
    // ignore
  }
  for (const bin of ["google-chrome", "chromium", "chromium-browser"]) {
    try {
      const p = execSync(`command -v ${bin} 2>/dev/null`, { encoding: "utf8" }).trim();
      if (p) return p;
    } catch {
      // ignore
    }
  }
  return null;
}

export interface LighthouseRunResult {
  mobile: LighthouseScores;
  rawCategoriesMobile: Record<string, number | null>;
  audits: Record<string, { id: string; title: string; score: number | null }>;
}

export async function runLighthouse(url: string): Promise<LighthouseRunResult> {
  const empty: LighthouseScores = {
    performance: null,
    accessibility: null,
    bestPractices: null,
    seo: null,
    mobilePerformance: null,
  };

  let chromeLauncher: typeof import("chrome-launcher");
  let lighthouseMod: { default: (...args: unknown[]) => Promise<unknown> } | { (...args: unknown[]): Promise<unknown> };
  try {
    chromeLauncher = await import("chrome-launcher");
    lighthouseMod = (await import("lighthouse")) as unknown as typeof lighthouseMod;
  } catch (err) {
    console.warn("[lighthouse] dependencies missing", err);
    return { mobile: empty, rawCategoriesMobile: {}, audits: {} };
  }

  ensureChromiumLdPath();
  let chrome: Awaited<ReturnType<typeof chromeLauncher.launch>> | null = null;
  try {
    const chromePath = findChromiumBinary();
    chrome = await chromeLauncher.launch({
      chromePath: chromePath ?? undefined,
      chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
    });
    const lh = (lighthouseMod as { default?: Function }).default ?? lighthouseMod;
    const runner = await (lh as Function)(
      url,
      {
        port: chrome.port,
        output: "json",
        logLevel: "error",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      },
      undefined,
    );

    const lhr = (runner as { lhr?: { categories?: Record<string, { score: number | null }>; audits?: Record<string, { id?: string; title?: string; score?: number | null }> } }).lhr;
    if (!lhr) return { mobile: empty, rawCategoriesMobile: {}, audits: {} };

    const score = (k: string): number | null => {
      const s = lhr.categories?.[k]?.score;
      return s == null ? null : Math.round(s * 100);
    };

    const mobile: LighthouseScores = {
      performance: score("performance"),
      accessibility: score("accessibility"),
      bestPractices: score("best-practices"),
      seo: score("seo"),
      mobilePerformance: score("performance"),
    };

    const audits: LighthouseRunResult["audits"] = {};
    for (const [id, a] of Object.entries(lhr.audits ?? {})) {
      audits[id] = { id: a.id ?? id, title: a.title ?? id, score: a.score ?? null };
    }
    return {
      mobile,
      rawCategoriesMobile: {
        performance: mobile.performance,
        accessibility: mobile.accessibility,
        bestPractices: mobile.bestPractices,
        seo: mobile.seo,
      },
      audits,
    };
  } catch (err) {
    console.warn("[lighthouse] run failed", err);
    return { mobile: empty, rawCategoriesMobile: {}, audits: {} };
  } finally {
    try {
      await chrome?.kill();
    } catch {
      // ignore
    }
  }
}
