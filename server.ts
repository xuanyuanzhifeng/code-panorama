import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  const githubApi = axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "CodePanorama-Agent",
    },
  });

  // Helper to parse GitHub URL
  const parseGithubUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length < 2) return null;
      return { owner: pathParts[0], repo: pathParts[1] };
    } catch (e) {
      return null;
    }
  };

  app.post("/api/github/validate", async (req, res) => {
    const { url, token } = req.body;
    const repoInfo = parseGithubUrl(url);

    if (!repoInfo) {
      return res.status(400).json({ error: "Invalid GitHub URL format" });
    }

    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `token ${token}`;

      const response = await githubApi.get(`/repos/${repoInfo.owner}/${repoInfo.repo}`, { headers });
      res.json({ valid: true, data: response.data });
    } catch (error: any) {
      console.error("GitHub Validation Error:", error.message);
      res.status(error.response?.status || 500).json({ 
        valid: false, 
        error: error.response?.data?.message || "Failed to validate repository" 
      });
    }
  });

  app.post("/api/github/tree", async (req, res) => {
    const { url, token } = req.body;
    const repoInfo = parseGithubUrl(url);

    if (!repoInfo) return res.status(400).json({ error: "Invalid URL" });

    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `token ${token}`;

      // Get default branch first
      const repoRes = await githubApi.get(`/repos/${repoInfo.owner}/${repoInfo.repo}`, { headers });
      const defaultBranch = repoRes.data.default_branch;

      // Get tree recursively
      const treeRes = await githubApi.get(
        `/repos/${repoInfo.owner}/${repoInfo.repo}/git/trees/${defaultBranch}?recursive=1`,
        { headers }
      );

      if (!treeRes.data || !Array.isArray(treeRes.data.tree)) {
        throw new Error("Invalid tree response from GitHub");
      }

      // Filter to keep only relevant source files to reduce size
      // We want to avoid images, binaries, lock files, etc.
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
          !path.endsWith(".json") // We might want package.json, but generally code is better
        );
      });
      
      // Special case: always include package.json or similar manifest files
      const manifestFiles = treeRes.data.tree.filter((item: any) => 
        item.path.endsWith("package.json") || 
        item.path.endsWith("go.mod") || 
        item.path.endsWith("pom.xml") ||
        item.path.endsWith("requirements.txt")
      );

      // Combine and deduplicate
      const combined = [...manifestFiles, ...relevantFiles].filter((v, i, a) => a.findIndex(t => t.path === v.path) === i);

      // Limit to top 10000 files to avoid overwhelming the context window
      const limitedFiles = combined.slice(0, 10000);

      res.json({ tree: limitedFiles, truncated: combined.length > 10000 });
    } catch (error: any) {
      console.error("GitHub Tree Error:", error.message);
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      res.status(status).json({ error: message });
    }
  });

  app.post("/api/github/content", async (req, res) => {
    const { url, paths, token } = req.body; // paths is array of file paths
    const repoInfo = parseGithubUrl(url);

    if (!repoInfo || !Array.isArray(paths)) return res.status(400).json({ error: "Invalid request" });

    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `token ${token}`;

      const contents: Record<string, string> = {};

      // Fetch in parallel (limit concurrency if needed, but for 5-10 files it's fine)
      await Promise.all(paths.map(async (filePath) => {
        try {
          // Use raw content URL for better reliability with large files
          // Or use API. API returns base64.
          const response = await githubApi.get(
            `/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${filePath}`,
            { headers }
          );
          
          if (response.data.content && response.data.encoding === "base64") {
            contents[filePath] = Buffer.from(response.data.content, "base64").toString("utf-8");
          } else {
             // Fallback or skip
             contents[filePath] = "// Could not retrieve content or content is too large";
          }
        } catch (e) {
          console.error(`Failed to fetch ${filePath}`, e);
          contents[filePath] = "// Failed to fetch file";
        }
      }));

      res.json({ contents });
    } catch (error: any) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      res.status(status).json({ error: message });
    }
  });

  app.post("/api/github/search", async (req, res) => {
    const { url, query, token } = req.body;
    const repoInfo = parseGithubUrl(url);

    if (!repoInfo || !query) return res.status(400).json({ error: "Invalid request" });

    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `token ${token}`;

      // GitHub Code Search API
      // Query format: "repo:owner/name+query"
      const q = `repo:${repoInfo.owner}/${repoInfo.repo} ${query}`;
      
      const response = await githubApi.get(`/search/code`, {
        headers,
        params: { q, per_page: 5 }
      });

      res.json({ items: response.data.items || [] });
    } catch (error: any) {
      console.error("GitHub Search Error:", error.message);
      // Search API has strict rate limits, handle gracefully
      res.status(error.response?.status || 500).json({ 
        error: error.response?.data?.message || "Search failed",
        items: [] 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
