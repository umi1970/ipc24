import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { config } from "./config.ts";

interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, string | undefined>;
}

function url(path: string, query?: Record<string, string | undefined>): string {
  if (!config.paperclip.apiUrl) throw new Error("PAPERCLIP_API_URL not set");
  const u = new URL(path.startsWith("/") ? path : `/${path}`, config.paperclip.apiUrl);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v != null) u.searchParams.set(k, v);
    }
  }
  return u.toString();
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const res = await fetch(url(path, opts.query), {
    method: opts.method ?? "GET",
    headers: {
      Authorization: `Bearer ${config.paperclip.apiKey}`,
      "X-Paperclip-Run-Id": config.paperclip.runId,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: opts.body == null ? undefined : JSON.stringify(opts.body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paperclip ${res.status} ${path}: ${text.slice(0, 500)}`);
  }
  return (await res.json()) as T;
}

export interface PaperclipIssue {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  status: string;
  projectId: string | null;
  labels?: Array<{ id: string; name: string }>;
}

export interface PaperclipLabel {
  id: string;
  name: string;
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  projectId?: string;
  parentId?: string;
  priority?: "low" | "medium" | "high" | "critical";
  labelIds?: string[];
  assigneeAgentId?: string | null;
  assigneeUserId?: string | null;
  status?: string;
}

export async function createIssue(input: CreateIssueInput): Promise<PaperclipIssue> {
  return request<PaperclipIssue>(
    `/api/companies/${config.paperclip.companyId}/issues`,
    {
      method: "POST",
      body: { projectId: config.paperclip.projectId, ...input },
    },
  );
}

export async function listIssues(params: {
  projectId?: string;
  labelName?: string;
  status?: string;
  q?: string;
  limit?: number;
}): Promise<PaperclipIssue[]> {
  const res = await request<PaperclipIssue[] | { issues: PaperclipIssue[] }>(
    `/api/companies/${config.paperclip.companyId}/issues`,
    {
      query: {
        projectId: params.projectId ?? config.paperclip.projectId,
        status: params.status,
        q: params.q,
        limit: params.limit ? String(params.limit) : undefined,
      },
    },
  );
  const arr = Array.isArray(res) ? res : res.issues;
  if (!params.labelName) return arr;
  return arr.filter((i) => i.labels?.some((l) => l.name === params.labelName));
}

export async function updateIssue(
  issueId: string,
  patch: Record<string, unknown>,
): Promise<PaperclipIssue> {
  return request<PaperclipIssue>(`/api/issues/${issueId}`, {
    method: "PATCH",
    body: patch,
  });
}

export async function addComment(issueId: string, body: string): Promise<void> {
  await request(`/api/issues/${issueId}/comments`, {
    method: "POST",
    body: { body },
  });
}

export async function listLabels(): Promise<PaperclipLabel[]> {
  try {
    const res = await request<PaperclipLabel[] | { labels: PaperclipLabel[] }>(
      `/api/companies/${config.paperclip.companyId}/labels`,
    );
    return Array.isArray(res) ? res : res.labels;
  } catch {
    return [];
  }
}

const DEFAULT_LABEL_COLORS: Record<string, string> = {
  lead: "#94a3b8",
  audit_done: "#16a34a",
  mockups_done: "#8b5cf6",
  outreach_sent: "#0ea5e9",
  response_pending: "#f59e0b",
  angenommen: "#22c55e",
  abgelehnt: "#ef4444",
};

export async function ensureLabel(
  name: string,
  color?: string,
): Promise<PaperclipLabel | null> {
  const existing = await listLabels();
  const hit = existing.find((l) => l.name === name);
  if (hit) return hit;
  try {
    return await request<PaperclipLabel>(
      `/api/companies/${config.paperclip.companyId}/labels`,
      {
        method: "POST",
        body: { name, color: color ?? DEFAULT_LABEL_COLORS[name] ?? "#64748b" },
      },
    );
  } catch (err) {
    console.warn(`[paperclip] ensureLabel(${name}) failed:`, (err as Error).message);
    return null;
  }
}

export async function attachFile(
  issueId: string,
  filePath: string,
  contentType: string,
): Promise<void> {
  const file = readFileSync(filePath);
  const fileName = basename(filePath);
  const form = new FormData();
  const blob = new Blob([new Uint8Array(file)], { type: contentType });
  form.append("file", blob, fileName);
  const res = await fetch(
    url(
      `/api/companies/${config.paperclip.companyId}/issues/${issueId}/attachments`,
    ),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.paperclip.apiKey}`,
        "X-Paperclip-Run-Id": config.paperclip.runId,
      },
      body: form,
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `attach ${res.status} for ${fileName}: ${text.slice(0, 300)}`,
    );
  }
}

export async function getIssue(issueId: string): Promise<PaperclipIssue> {
  return request<PaperclipIssue>(`/api/issues/${issueId}`);
}
