import { existsSync } from "node:fs";

/**
 * If the user pre-staged Ubuntu .debs to ~/.local/chrome-libs (e.g. when the
 * runner has no sudo), prepend the lib dir so Playwright / chrome-launcher
 * can resolve libnspr4 / libnss3 / etc. Idempotent and safe to call once on
 * module load.
 */
export function ensureChromiumLdPath(): void {
  const localLib = `${process.env.HOME ?? "/root"}/.local/chrome-libs/usr/lib/x86_64-linux-gnu`;
  try {
    if (!existsSync(localLib)) return;
    const current = process.env.LD_LIBRARY_PATH ?? "";
    if (current.split(":").includes(localLib)) return;
    process.env.LD_LIBRARY_PATH = current ? `${localLib}:${current}` : localLib;
  } catch {
    // ignore
  }
}
