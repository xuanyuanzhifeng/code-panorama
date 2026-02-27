import { NextResponse } from "next/server";
import { readHistoryRecord } from "@/lib/historyStore";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = String(searchParams.get("id") || "").trim();
  if (!id) {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  }

  try {
    const item = await readHistoryRecord(id);
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to read history item" }, { status: 404 });
  }
}
