import { NextResponse } from "next/server";
import { buildGithubHeaders, githubApi, parseGithubUrl } from "@/lib/github";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { url, token } = await request.json();
  const repoInfo = parseGithubUrl(url);

  if (!repoInfo) {
    return NextResponse.json({ error: "Invalid GitHub URL format" }, { status: 400 });
  }

  try {
    const response = await githubApi.get(`/repos/${repoInfo.owner}/${repoInfo.repo}`, {
      headers: buildGithubHeaders(token),
    });
    return NextResponse.json({ valid: true, data: response.data });
  } catch (error: any) {
    console.error("GitHub Validation Error:", error.message);
    return NextResponse.json(
      {
        valid: false,
        error: error.response?.data?.message || "Failed to validate repository",
      },
      { status: error.response?.status || 500 },
    );
  }
}
