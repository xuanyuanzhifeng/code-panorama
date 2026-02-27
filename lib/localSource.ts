import fs from "node:fs/promises";
import path from "node:path";

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
  ".idea",
  ".vscode",
  "coverage",
]);

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".ico", ".svg",
  ".pdf", ".zip", ".tar", ".gz", ".7z", ".rar", ".jar",
  ".mp3", ".wav", ".ogg", ".mp4", ".mov", ".avi", ".mkv",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".exe", ".dll", ".so", ".dylib", ".bin",
]);

const LANGUAGE_BY_EXT: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".py": "Python",
  ".java": "Java",
  ".go": "Go",
  ".rs": "Rust",
  ".c": "C",
  ".cc": "C++",
  ".cpp": "C++",
  ".cxx": "C++",
  ".h": "C/C++",
  ".hpp": "C++",
  ".cs": "C#",
  ".php": "PHP",
  ".rb": "Ruby",
  ".swift": "Swift",
  ".kt": "Kotlin",
  ".scala": "Scala",
};

function toPosixRelative(root: string, abs: string) {
  const rel = path.relative(root, abs);
  return rel.split(path.sep).join("/");
}

export async function resolveLocalRoot(inputPath: string) {
  const raw = String(inputPath || "").trim();
  if (!raw) throw new Error("本地目录路径不能为空");
  const resolved = path.resolve(raw);
  const stat = await fs.stat(resolved).catch(() => null);
  if (!stat || !stat.isDirectory()) {
    throw new Error("指定路径不存在或不是目录");
  }
  return resolved;
}

export function resolvePathInRoot(root: string, relativePath: string) {
  const clean = String(relativePath || "").replace(/^\.?\//, "");
  const abs = path.resolve(root, clean);
  const rootWithSep = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  if (!(abs === root || abs.startsWith(rootWithSep))) {
    throw new Error(`非法路径: ${relativePath}`);
  }
  return abs;
}

export async function collectProjectFiles(root: string, maxFiles = 10000) {
  const files: Array<{ path: string; type: "blob" }> = [];
  let truncated = false;

  const walk = async (dir: string) => {
    if (files.length >= maxFiles) {
      truncated = true;
      return;
    }
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (files.length >= maxFiles) {
        truncated = true;
        return;
      }
      const abs = path.join(dir, entry.name);
      const rel = toPosixRelative(root, abs);
      const nameLower = entry.name.toLowerCase();

      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(nameLower)) continue;
        await walk(abs);
        continue;
      }
      if (!entry.isFile()) continue;

      const ext = path.extname(nameLower);
      if (BINARY_EXTENSIONS.has(ext)) continue;
      files.push({ path: rel, type: "blob" });
    }
  };

  await walk(root);
  return { tree: files, truncated };
}

export function detectLanguageFromFileList(paths: string[]) {
  const score: Record<string, number> = {};
  for (const p of paths) {
    const ext = path.extname(p.toLowerCase());
    const lang = LANGUAGE_BY_EXT[ext];
    if (!lang) continue;
    score[lang] = (score[lang] || 0) + 1;
  }
  const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0]?.[0];
  return best || "Unknown";
}

export async function readTextContent(root: string, relativePath: string, maxBytes = 2_000_000) {
  const abs = resolvePathInRoot(root, relativePath);
  const stat = await fs.stat(abs).catch(() => null);
  if (!stat || !stat.isFile()) throw new Error("文件不存在");
  if (stat.size > maxBytes) throw new Error(`文件过大(${stat.size} bytes)`);
  return fs.readFile(abs, "utf-8");
}

