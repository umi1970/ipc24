import { politeFetch } from "./http.ts";

export async function lastWaybackSnapshotMonthsAgo(url: string): Promise<number | null> {
  const api = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`;
  try {
    const res = await politeFetch(api, { timeoutMs: 8000 });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      archived_snapshots?: { closest?: { timestamp?: string } };
    };
    const ts = json?.archived_snapshots?.closest?.timestamp;
    if (!ts || ts.length < 8) return null;
    const year = Number(ts.slice(0, 4));
    const month = Number(ts.slice(4, 6)) - 1;
    const day = Number(ts.slice(6, 8));
    const snapshot = new Date(Date.UTC(year, month, day));
    const ms = Date.now() - snapshot.getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24 * 30));
  } catch {
    return null;
  }
}
