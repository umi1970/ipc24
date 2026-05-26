import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { ensureChromiumLdPath } from "../utils/chromium-env.ts";
ensureChromiumLdPath();
import { chromium, devices, type Browser } from "playwright";

export interface ScreenshotPair {
  desktopPath: string;
  mobilePath: string;
}

export async function captureScreenshots(
  url: string,
  desktopPath: string,
  mobilePath: string,
): Promise<ScreenshotPair> {
  mkdirSync(dirname(desktopPath), { recursive: true });
  mkdirSync(dirname(mobilePath), { recursive: true });

  const browser: Browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    {
      const ctx = await browser.newContext({
        viewport: { width: 1366, height: 900 },
        locale: "de-DE",
      });
      const page = await ctx.newPage();
      await safeGoto(page, url);
      await page.screenshot({ path: desktopPath, fullPage: false });
      await ctx.close();
    }
    {
      const ctx = await browser.newContext({
        ...devices["iPhone 13"],
        locale: "de-DE",
      });
      const page = await ctx.newPage();
      await safeGoto(page, url);
      await page.screenshot({ path: mobilePath, fullPage: false });
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
  return { desktopPath, mobilePath };
}

async function safeGoto(page: import("playwright").Page, url: string): Promise<void> {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
  } catch {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    } catch (err) {
      console.warn(`[screenshot] goto failed for ${url}`, err);
    }
  }
  await page.waitForTimeout(800);
}
