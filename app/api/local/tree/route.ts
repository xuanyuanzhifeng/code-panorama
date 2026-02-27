import { NextResponse } from "next/server";
import { collectProjectFiles, resolveLocalRoot } from "@/lib/localSource";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { path } = await request.json();
  try {
    const root = await resolveLocalRoot(path);
    const { tree, truncated } = await collectProjectFiles(root, 10000);
    return NextResponse.json({ tree, truncated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "读取本地目录树失败" },
      { status: 400 },
    );
  }
}

