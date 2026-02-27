import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const runtime = "nodejs";

export async function POST() {
  if (process.platform !== "darwin") {
    return NextResponse.json(
      { error: "当前仅支持 macOS 目录选择器，请手动输入绝对路径" },
      { status: 400 },
    );
  }

  try {
    const script = 'POSIX path of (choose folder with prompt "请选择要分析的本地项目目录")';
    const { stdout } = await execFileAsync("osascript", ["-e", script]);
    const selectedPath = String(stdout || "").trim();
    if (!selectedPath) {
      return NextResponse.json({ error: "未选择目录" }, { status: 400 });
    }
    return NextResponse.json({ path: selectedPath });
  } catch (error: any) {
    const message = String(error?.message || "");
    if (message.includes("User canceled")) {
      return NextResponse.json({ error: "用户取消选择" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "目录选择失败，请手动输入绝对路径" },
      { status: 500 },
    );
  }
}

