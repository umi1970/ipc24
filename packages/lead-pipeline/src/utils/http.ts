import { config } from "../config.ts";

const lastRequestAt = new Map<string, number>();

export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export async function politeFetch(url: string, opts: FetchOptions = {}): Promise<Response> {
  const u = new URL(url);
  const last = lastRequestAt.get(u.host) ?? 0;
  const now = Date.now();
  const wait = last + config.http.perDomainDelayMs - now;
  if (wait > 0) await sleep(wait);
  lastRequestAt.set(u.host, Date.now());

  const ctl = new AbortController();
  const timeout = setTimeout(() => ctl.abort(), opts.timeoutMs ?? config.http.timeoutMs);
  try {
    const res = await fetch(url, {
      method: opts.method ?? "GET",
      headers: {
        "User-Agent": config.http.userAgent,
        Accept: "text/html,application/json;q=0.9,*/*;q=0.5",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.5",
        ...(opts.headers ?? {}),
      },
      body: opts.body,
      signal: ctl.signal,
      redirect: "follow",
    });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function safeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = "http://" + s;
  try {
    const u = new URL(s);
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}
