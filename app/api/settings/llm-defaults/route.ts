import { NextResponse } from "next/server";
import { llmApiType, llmBaseUrl, llmModel } from "@/lib/openaiCompat";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      llmApiType: llmApiType || "chat",
      llmBaseUrl: llmBaseUrl || "",
      llmModel: llmModel || "",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
