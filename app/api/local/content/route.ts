import { NextResponse } from "next/server";
import { readTextContent, resolveLocalRoot } from "@/lib/localSource";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { path, paths } = await request.json();
  if (!Array.isArray(paths)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const root = await resolveLocalRoot(path);
    const contents: Record<string, string> = {};
    const errors: Record<string, string> = {};

    await Promise.all(
      paths.map(async (filePath: string) => {
        try {
          contents[filePath] = await readTextContent(root, filePath);
        } catch (error: any) {
          contents[filePath] = "";
          errors[filePath] = error?.message || "读取文件失败";
        }
      }),
    );

    return NextResponse.json({ contents, errors });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "读取本地文件失败" },
      { status: 400 },
    );
  }
}

