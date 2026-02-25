import { NextResponse } from "next/server";
import { buildGithubHeaders, githubApi, parseGithubUrl } from "@/lib/github";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { url, token } = await request.json();
  const repoInfo = parseGithubUrl(url);

  if (!repoInfo) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const headers = buildGithubHeaders(token);
    const repoRes = await githubApi.get(`/repos/${repoInfo.owner}/${repoInfo.repo}`, { headers });
    const defaultBranch = repoRes.data.default_branch;

    const treeRes = await githubApi.get(
      `/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers },
    );

    if (!treeRes.data || !Array.isArray(treeRes.data.tree)) {
      throw new Error("Invalid tree response from GitHub");
    }

    const relevantFiles = treeRes.data.tree.filter((item: any) => {
      if (item.type !== "blob") return false;
      const path = item.path.toLowerCase();
      return (
        !path.includes("node_modules") &&
        !path.includes("dist") &&
        !path.includes(".git") &&
        !path.endsWith(".png") &&
        !path.endsWith(".jpg") &&
        !path.endsWith(".svg") &&
        !path.endsWith(".ico") &&
        !path.endsWith(".lock") &&
        !path.endsWith(".json")
      );
    });

    const manifestFiles = treeRes.data.tree.filter(
      (item: any) =>
        item.path.endsWith("package.json") ||
        item.path.endsWith("go.mod") ||
        item.path.endsWith("pom.xml") ||
        item.path.endsWith("requirements.txt"),
    );

    const combined = [...manifestFiles, ...relevantFiles].filter(
      (v, i, a) => a.findIndex((t) => t.path === v.path) === i,
    );
    const limitedFiles = combined.slice(0, 10000);

    return NextResponse.json({ tree: limitedFiles, truncated: combined.length > 10000 });
  } catch (error: any) {
    console.error("GitHub Tree Error:", error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message;
    return NextResponse.json({ error: message }, { status });
  }
}
