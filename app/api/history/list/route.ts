import { NextResponse } from "next/server";
import { isHistoryUnavailableError, listHistoryRecords } from "@/lib/historyStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await listHistoryRecords();
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    if (isHistoryUnavailableError(error)) {
      return NextResponse.json({ success: true, items: [], historyUnavailable: true });
    }
    return NextResponse.json({ success: false, error: error?.message || "Failed to list history" }, { status: 500 });
  }
}
