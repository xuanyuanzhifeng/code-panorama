import { NextResponse } from "next/server";
import { buildGithubHeaders, githubApi, parseGithubUrl } from "@/lib/github";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { url, query, token } = await request.json();
  const repoInfo = parseGithubUrl(url);

  if (!repoInfo || !query) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const q = `repo:${repoInfo.owner}/${repoInfo.repo} ${query}`;
    const response = await githubApi.get("/search/code", {
      headers: buildGithubHeaders(token),
      params: { q, per_page: 5 },
    });

    return NextResponse.json({ items: response.data.items || [] });
  } catch (error: any) {
    console.error("GitHub Search Error:", error.message);
    return NextResponse.json(
      {
        error: error.response?.data?.message || "Search failed",
        items: [],
      },
      { status: error.response?.status || 500 },
    );
  }
}
