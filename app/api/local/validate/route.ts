import { NextResponse } from "next/server";
import { collectProjectFiles, detectLanguageFromFileList, resolveLocalRoot } from "@/lib/localSource";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { path } = await request.json();
  try {
    const root = await resolveLocalRoot(path);
    const { tree } = await collectProjectFiles(root, 2000);
    const language = detectLanguageFromFileList(tree.map((f) => f.path));
    return NextResponse.json({
      valid: true,
      data: {
        full_name: root.split("/").filter(Boolean).pop() || root,
        language,
        rootPath: root,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: error?.message || "本地目录校验失败" },
      { status: 400 },
    );
  }
}

