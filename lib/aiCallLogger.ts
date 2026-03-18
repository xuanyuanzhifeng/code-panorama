import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const logFilePath = process.env.AI_CALL_LOG_FILE || path.join("/tmp", "code-panorama", "ai-calls.log");

function ensureLogDir() {
  mkdirSync(path.dirname(logFilePath), { recursive: true });
}

function writeLine(level: "INFO" | "ERROR", event: string, payload: Record<string, unknown>) {
  const record = {
    ts: new Date().toISOString(),
    level,
    event,
    ...payload,
  };

  const line = JSON.stringify(record);

  // if (level === "ERROR") {
  //   console.error("[AI_CALL]", line);
  // } else {
  //   console.log("[AI_CALL]", line);
  // }

  try {
    ensureLogDir();
    appendFileSync(logFilePath, `${line}\n`, "utf8");
  } catch {
    // Ignore file logging failures in read-only/serverless environments.
  }
}

export function createAiCallId() {
  return randomUUID();
}

export function logAiRequest(payload: Record<string, unknown>) {
  writeLine("INFO", "llm_request", payload);
}

export function logAiResponse(payload: Record<string, unknown>) {
  writeLine("INFO", "llm_response", payload);
}

export function logAiError(payload: Record<string, unknown>) {
  writeLine("ERROR", "llm_error", payload);
}
