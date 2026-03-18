import { NextResponse } from "next/server";
import { llmBaseUrl, llmModel } from "@/lib/openaiCompat";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
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
