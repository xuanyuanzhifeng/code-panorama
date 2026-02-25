import axios from "axios";

export interface GithubRepoInfo {
  owner: string;
  repo: string;
}

export const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "CodePanorama-Agent",
  },
});

export function parseGithubUrl(url: string): GithubRepoInfo | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    if (pathParts.length < 2) return null;
    return { owner: pathParts[0], repo: pathParts[1] };
  } catch {
    return null;
  }
}

export function buildGithubHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `token ${token}`;
  return headers;
}
