import { NextResponse } from "next/server";
import { isHistoryUnavailableError, saveHistoryRecord } from "@/lib/historyStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const sourceType = body?.sourceType === "local" ? "local" : "github";
    const source = String(body?.source || "").trim();
    const language = String(body?.language || "Unknown");
    const techStack = Array.isArray(body?.techStack) ? body.techStack.map(String).slice(0, 20) : [];
    const markdown = String(body?.markdown || "");
    const graphData = body?.graphData || null;
    const logs = Array.isArray(body?.logs) ? body.logs : [];
    const aiUsageStats = body?.aiUsageStats || { inputTokens: 0, outputTokens: 0, callCount: 0 };

    if (!name || !source || !markdown || !graphData) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const saved = await saveHistoryRecord({
      name,
      sourceType,
      source,
      language,
      techStack,
      markdown,
      graphData,
      logs,
      aiUsageStats,
    });

    return NextResponse.json({ success: true, ...saved });
  } catch (error: any) {
    if (isHistoryUnavailableError(error)) {
      return NextResponse.json({ success: true, skipped: true, historyUnavailable: true });
    }
    return NextResponse.json({ success: false, error: error?.message || "Failed to save history" }, { status: 500 });
  }
}
