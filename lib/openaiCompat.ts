import OpenAI from "openai";

function normalizeBaseUrl(url: string): string {
  if (!url) return url;
  const normalized = url.replace(/\/+$/, "");
  return normalized.endsWith("/v1") ? normalized : `${normalized}/v1`;
}

export const llmBaseUrl = normalizeBaseUrl(process.env.LLM_BASE_URL || "https://api.openai.com/v1");
export const llmApiKey = process.env.LLM_API_KEY || "";
export const llmModel = process.env.LLM_MODEL || "gpt-4o-mini";

let client: OpenAI | null = null;

export function getLlmClient() {
  if (!llmApiKey) {
    throw new Error("LLM_API_KEY is not set.");
  }

  if (!client) {
    client = new OpenAI({
      baseURL: llmBaseUrl,
      apiKey: llmApiKey,
      timeout: 120000,
    });
  }

  return client;
}

export function extractJsonFromText(text: string) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Try fenced code block: ```json ... ```
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch?.[1]) {
      return JSON.parse(fenceMatch[1]);
    }

    // Fallback: find first JSON object block
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }

    throw new Error("Model did not return valid JSON.");
  }
}
