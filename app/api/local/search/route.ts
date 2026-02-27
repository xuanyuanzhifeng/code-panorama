import { NextResponse } from "next/server";
import { collectProjectFiles, readTextContent, resolveLocalRoot } from "@/lib/localSource";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { path, query } = await request.json();
  const q = String(query || "").trim().toLowerCase();
  if (!q) {
    return NextResponse.json({ error: "Invalid request", items: [] }, { status: 400 });
  }

  try {
    const root = await resolveLocalRoot(path);
    const { tree } = await collectProjectFiles(root, 6000);
    const items: Array<{ path: string }> = [];

    for (const entry of tree) {
      if (items.length >= 5) break;
      try {
        const content = await readTextContent(root, entry.path, 300_000);
        if (content.toLowerCase().includes(q)) {
          items.push({ path: entry.path });
        }
      } catch {
        // ignore unreadable/large files in search
      }
    }

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "本地搜索失败", items: [] },
      { status: 400 },
    );
  }
}

