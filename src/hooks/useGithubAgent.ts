import { useState, useCallback } from 'react';
import axios from 'axios';
import { GraphData, LogEntry, AgentStatus } from '../types';

export function useGithubAgent() {
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [repoUrl, setRepoUrl] = useState('');

  const requestJsonFromLlm = async (prompt: string) => {
    const res = await axios.post('/api/llm/json', { prompt });
    return res.data?.data ?? {};
  };

  const addLog = (message: string, type: LogEntry['type'] = 'info', details?: string[]) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      message,
      type,
      details
    }]);
  };

  const analyzeRepo = useCallback(async (url: string, token?: string) => {
    setRepoUrl(url);
    setStatus('validating');
    setLogs([]);
    setGraphData(null);
    
    addLog(`正在验证仓库地址: ${url}`, 'info');

    try {
      // 1. Validate
      const validateRes = await axios.post('/api/github/validate', { url, token });
      if (!validateRes.data.valid) {
        throw new Error(validateRes.data.error || '无效的 GitHub 仓库地址');
      }
      addLog('仓库验证成功', 'success');

      // 2. Fetch Tree
      setStatus('fetching_tree');
      addLog('正在获取文件结构...', 'info');
      const treeRes = await axios.post('/api/github/tree', { url, token });
      
      if (!treeRes.data || !Array.isArray(treeRes.data.tree)) {
        throw new Error('获取文件列表失败: 返回数据格式错误');
      }
      
      const allFiles = treeRes.data.tree.map((f: any) => f.path);
      addLog(`成功获取 ${allFiles.length} 个文件`, 'success', allFiles);

      // Filter for code files only
      const CODE_EXTENSIONS = [
        '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.cc', '.cxx',
        '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.kts', '.scala', 
        '.html', '.css', '.scss', '.less', '.vue', '.svelte', '.dart', '.lua', 
        '.pl', '.sh', '.bash', '.zsh', '.sql', '.r', '.m', '.mm', '.f', '.f90',
        '.asm', '.s', '.v', '.vhdl', '.clj', '.cljs', '.ex', '.exs', '.erl'
      ];
      
      const codeFiles = allFiles.filter((f: string) => {
          const lower = f.toLowerCase();
          return CODE_EXTENSIONS.some(ext => lower.endsWith(ext));
      });

      // 3. Analyze Structure (AI) - Step 1: Guess Entry Point
      setStatus('analyzing_structure');
      
      // Explicitly log the files being passed to AI
      addLog(`正在构建 AI 上下文，已过滤非代码文件，剩余 ${codeFiles.length} 个核心文件...`, 'info', codeFiles);
      
      addLog('AI Agent: 正在分析文件结构，寻找可能的入口文件...', 'thinking');
      
      // Find README from all files
      const readmeFile = allFiles.find((f: string) => f.toLowerCase().includes('readme.md')) || 'README.md';
      
      const entryGuessPrompt = `
        你是一位资深软件架构师。
        这是一个 GitHub 仓库的源代码文件列表：
        ${JSON.stringify(codeFiles.slice(0, 10000))}
        
        你的任务是识别主要的编程语言和可能的入口文件。
        
        1. 确定主要的编程语言。
        2. 根据命名规范列出最多 3 个最可能的入口文件，并按可能性由高到低排序（例如：main.go, src/index.ts, app.py, src/App.tsx）。
        
        返回一个 JSON 对象：
        { 
          "language": "string",
          "potentialEntryPoints": ["path/to/file1", "path/to/file2", "path/to/file3"]
        }
      `;

      const guessData = await requestJsonFromLlm(entryGuessPrompt);
      const language = guessData.language || 'Unknown';
      let potentialEntryPoints = guessData.potentialEntryPoints || [];
      
      addLog(`识别到主要语言: ${language}`, 'info');
      addLog(`初步推测入口文件: ${potentialEntryPoints.join(', ')}`, 'info');

      // Step 2: Verify Entry Point
      let entryPoint = null;
      let entryContent = '';

      if (potentialEntryPoints.length > 0) {
        addLog('正在验证入口文件...', 'thinking');
        const verifyRes = await axios.post('/api/github/content', { url, paths: potentialEntryPoints, token });
        const contents = verifyRes.data.contents;

        for (const candidate of potentialEntryPoints.slice(0, 3)) {
          const candidateContent = contents[candidate];
          if (!candidateContent || typeof candidateContent !== 'string') {
            continue;
          }

          addLog(`AI Agent: 正在逐个验证候选入口文件 ${candidate}`, 'thinking');

          const verifyPrompt = `
            你是一个代码分析器。
            语言：${language}

            请判断下面这个文件是否是项目的真正入口点（例如包含 main 函数、应用初始化、HTTP 服务启动、React 根节点挂载等）。
            如果是，请返回 isEntryPoint=true；如果不是，返回 false。

            文件路径：${candidate}
            文件内容（最多前 10000 个字符）：
            ${candidateContent.slice(0, 10000)}

            返回 JSON：
            {
              "isEntryPoint": true 或 false,
              "reason": "简短说明"
            }
          `;

          const verifyResult = await requestJsonFromLlm(verifyPrompt);
          if (verifyResult.isEntryPoint) {
            entryPoint = candidate;
            entryContent = candidateContent;
            addLog(`确认入口文件: ${entryPoint}`, 'success');
            break;
          }
        }
      }

      // Step 3: Fallback Search if no entry point found
      if (!entryPoint) {
        addLog('未找到明确入口，正在启用代码搜索功能...', 'thinking');
        
        let searchQuery = '';
        switch (language.toLowerCase()) {
          case 'go': searchQuery = 'func main'; break;
          case 'python': searchQuery = 'if __name__ == "__main__":'; break;
          case 'rust': searchQuery = 'fn main'; break;
          case 'c': case 'c++': case 'cpp': searchQuery = 'int main'; break;
          case 'java': searchQuery = 'public static void main'; break;
          case 'javascript': case 'typescript': searchQuery = 'ReactDOM.render createRoot app.listen'; break; // broad search
          default: searchQuery = 'main start init';
        }

        addLog(`搜索关键词: "${searchQuery}"`, 'info');
        const searchRes = await axios.post('/api/github/search', { url, query: searchQuery, token });
        console.log("searchRes: ", searchRes)
        
        const searchItems = searchRes.data.items || [];
        if (searchItems.length > 0) {
           const searchFiles = searchItems.map((item: any) => item.path);
           addLog(`搜索到相关文件: ${searchFiles.join(', ')}`, 'info');
           
           // Verify these search results
           const searchContentRes = await axios.post('/api/github/content', { url, paths: searchFiles, token });
           const searchContents = searchContentRes.data.contents;
           
           // Simple heuristic: take the first one that looks like an entry point or just the first one
           entryPoint = searchFiles[0]; 
           entryContent = searchContents[entryPoint];
           addLog(`根据搜索结果选定入口: ${entryPoint}`, 'success');
        }
      }

      if (!entryPoint) {
        throw new Error('无法找到项目的入口文件，分析终止。请检查仓库结构或手动指定。');
      }

      // Step 4: Trace and Analyze (Deep Analysis)
      addLog('正在从入口文件开始深度追踪调用链...', 'thinking');
      
      // We have entryPoint and entryContent. Now ask AI to identify imports/dependencies to fetch.
      const tracePrompt = `
        你是一个代码追踪器。
        文件：${entryPoint}
        内容：
        ${entryContent}
        
        识别此文件导入或调用的、对应用程序流程至关重要的本地源文件。
        忽略外部库（node_modules 等）。
        返回相对于项目根目录的文件路径列表。
        
        返回 JSON：{ "nextFiles": ["path/to/file1", "path/to/file2"] }
      `;
      
      const traceResult = await requestJsonFromLlm(tracePrompt);
      const nextFiles = traceResult.nextFiles || [];
      const allFilesToAnalyze = Array.from(new Set([entryPoint, readmeFile, ...nextFiles].filter(Boolean)));
      
      addLog(`追踪到 ${nextFiles.length} 个关键依赖文件，准备进行全量分析...`, 'info');

      // Fetch all content
      setStatus('fetching_content');
      const finalContentRes = await axios.post('/api/github/content', { url, paths: allFilesToAnalyze, token });
      const finalContents = finalContentRes.data.contents;

      console.log("finalContentRes: ", finalContentRes)

      // Step 5: Generate Final Graph
      setStatus('generating_graph');
      addLog('AI Agent: 正在生成最终全景图 (中文报告)...', 'thinking');

      const graphPrompt = `
        你是一位代码可视化专家。
        
        项目背景：
        语言：${language}
        入口点：${entryPoint}
        
        文件内容：
        ${JSON.stringify(finalContents)}

        任务：
        1. 分析 README（如果有）和代码，用中文编写“项目简介”并列出“技术栈”。
        2. 从入口点开始生成丰富的函数调用图。
        3. 定义逻辑“模块”（例如：API、UI、Utils）并为每个模块分配一种颜色（十六进制代码）。
        4. 为每个节点（函数/类）提供详细的中文“描述”，解释其作用。
        5. 将每个节点分配给一个“模块”。
        6. 确保图表至少包含 15 个节点，越多越好，以保证丰富和详细。
        
        返回符合此模式的 JSON：
        {
          "project": {
            "language": "${language}",
            "techStack": ["React", "TypeScript", ...],
            "summary": "项目简介..."
          },
          "modules": [
            { "id": "mod_1", "name": "Core", "color": "#3b82f6" }
          ],
          "nodes": [
            { 
              "id": "func_1", 
              "label": "main", 
              "type": "function", 
              "file": "src/main.ts", 
              "importance": "high", 
              "module": "mod_1",
              "description": "应用程序入口，初始化数据库连接..."
            }
          ],
          "edges": [
            { "id": "e1", "source": "func_1", "target": "func_2" }
          ]
        }
      `;

      const graph = await requestJsonFromLlm(graphPrompt);
      // Inject repo name
      graph.repoName = url.split('/').slice(-2).join('/');
      setGraphData(graph);
      addLog('全景图生成完成', 'success');
      setStatus('complete');

    } catch (error: any) {
      console.error(error);
      let errorMessage = error.message || '未知错误';
      
      if (error.response?.status === 403) {
        errorMessage = 'GitHub API 访问受限 (403)。可能是触发了调用频率限制 (Rate Limit)。请在上方输入 GitHub Token 以继续使用。';
      } else if (error.message.includes('403')) {
         errorMessage = 'GitHub API 访问受限 (403)。请提供 GitHub Token。';
      }

      addLog(`错误: ${errorMessage}`, 'error');
      setStatus('error');
    }
  }, []);

  return {
    status,
    logs,
    graphData,
    setGraphData,
    analyzeRepo
  };
}
