import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type HistorySourceType = "github" | "local";

export type HistoryRecord = {
  id: string;
  name: string;
  sourceType: HistorySourceType;
  source: string;
  createdAt: string;
  language: string;
  techStack: string[];
  markdown: string;
  graphData: unknown;
  logs: unknown[];
  aiUsageStats: {
    inputTokens: number;
    outputTokens: number;
    callCount: number;
  };
};

export type HistoryListItem = Omit<HistoryRecord, "markdown" | "graphData" | "logs" | "aiUsageStats"> & {
  mdFile: string;
};

function expandHomeDir(input: string) {
  const raw = String(input || "").trim();
  if (!raw) return raw;
  if (raw === "~") return os.homedir();
  if (raw.startsWith("~/") || raw.startsWith("~\\")) {
    return path.join(os.homedir(), raw.slice(2));
  }
  return raw;
}

const envHistoryDirRaw = String(process.env.HISTORY_DIR || "").trim();
const envHistoryDir = expandHomeDir(envHistoryDirRaw);
const HISTORY_DIR = envHistoryDir
  ? (path.isAbsolute(envHistoryDir) ? envHistoryDir : path.resolve(process.cwd(), envHistoryDir))
  : path.join(os.homedir(), ".code-panorama-history");

export function isHistoryUnavailableError(error: unknown) {
  const code = typeof error === "object" && error !== null ? (error as { code?: string }).code : "";
  return code === "ENOENT" || code === "EACCES" || code === "EPERM" || code === "EROFS";
}

function safeFileName(input: string) {
  return String(input || "project")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "project";
}

async function ensureHistoryDir() {
  await fs.mkdir(HISTORY_DIR, { recursive: true });
}

function toRecordPath(id: string) {
  return path.join(HISTORY_DIR, `${id}.json`);
}

export async function saveHistoryRecord(input: Omit<HistoryRecord, "id" | "createdAt">) {
  await ensureHistoryDir();
  const id = `${Date.now()}_${safeFileName(input.name)}_${randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
  const mdFile = `${id}.md`;

  const record: HistoryRecord = {
    ...input,
    id,
    createdAt,
    language: String(input.language || "Unknown"),
    techStack: Array.isArray(input.techStack) ? input.techStack.map(String).slice(0, 20) : [],
    logs: Array.isArray(input.logs) ? input.logs : [],
    aiUsageStats: {
      inputTokens: Number(input.aiUsageStats?.inputTokens || 0) || 0,
      outputTokens: Number(input.aiUsageStats?.outputTokens || 0) || 0,
      callCount: Number(input.aiUsageStats?.callCount || 0) || 0,
    },
  };

  await fs.writeFile(path.join(HISTORY_DIR, mdFile), String(record.markdown || ""), "utf8");
  await fs.writeFile(toRecordPath(id), JSON.stringify({ ...record, mdFile }, null, 2), "utf8");

  return { id, createdAt, mdFile };
}

export async function listHistoryRecords(): Promise<HistoryListItem[]> {
  await ensureHistoryDir();
  const files = await fs.readdir(HISTORY_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  const items: HistoryListItem[] = [];

  for (const file of jsonFiles) {
    try {
      const raw = await fs.readFile(path.join(HISTORY_DIR, file), "utf8");
      const parsed = JSON.parse(raw);
      items.push({
        id: String(parsed?.id || "").trim(),
        name: String(parsed?.name || "Unknown Project"),
        sourceType: parsed?.sourceType === "local" ? "local" : "github",
        source: String(parsed?.source || ""),
        createdAt: String(parsed?.createdAt || ""),
        language: String(parsed?.language || "Unknown"),
        techStack: Array.isArray(parsed?.techStack) ? parsed.techStack.map(String).slice(0, 20) : [],
        mdFile: String(parsed?.mdFile || ""),
      });
    } catch {
      // ignore corrupted entries
    }
  }

  return items
    .filter((item) => item.id && item.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function readHistoryRecord(id: string) {
  await ensureHistoryDir();
  const file = toRecordPath(String(id || "").trim());
  const raw = await fs.readFile(file, "utf8");
  const parsed = JSON.parse(raw);
  return parsed as HistoryRecord & { mdFile?: string };
}

export async function deleteHistoryRecord(id: string) {
  await ensureHistoryDir();
  const cleanId = String(id || "").trim();
  if (!cleanId) {
    throw new Error("id is required");
  }
  const recordPath = toRecordPath(cleanId);
  const raw = await fs.readFile(recordPath, "utf8");
  const parsed = JSON.parse(raw) as { mdFile?: string };
  const mdFile = String(parsed?.mdFile || "").trim();

  if (mdFile) {
    try {
      await fs.unlink(path.join(HISTORY_DIR, mdFile));
    } catch (error: any) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
  }

  await fs.unlink(recordPath);
}
