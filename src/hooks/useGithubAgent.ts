import { useState, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { GraphData, LogEntry, AgentStatus, GraphNode, GraphEdge, GraphModule, AiUsageStats } from '../types';

type DrillFlag = -1 | 0 | 1;
type SourceType = 'github' | 'local';

type AgentSettings = {
  llmBaseUrl?: string;
  llmModel?: string;
  maxDrillDepth?: number;
  maxChildCallsPerFunction?: number;
};

type LlmCallNode = {
  name?: string;
  type?: string;
  importance?: string;
  description?: string;
  shouldDrill?: number;
  possibleFile?: string;
};

type LlmFunctionAnalysis = {
  functionName?: string;
  functionType?: string;
  description?: string;
  importance?: string;
  calls?: LlmCallNode[];
};

type DrillTask = {
  nodeId: string;
  functionName: string;
  parentNodeId?: string;
  parentFile?: string;
  parentFunctionName?: string;
  possibleFile?: string;
  depth: number;
  drillFlag: DrillFlag;
};

type CallChainRecord = {
  nodeId: string;
  functionName: string;
  file?: string;
  line?: number;
  depth: number;
  drillFlag: DrillFlag;
  parentNodeId?: string;
  status: 'queued' | 'analyzing' | 'done' | 'skipped' | 'failed';
  locateAttempts?: string[];
  error?: string;
};

type LocateResult = {
  file: string;
  content: string;
  line?: number;
  attempts: string[];
  isSystemOrLibraryFunction?: boolean;
  systemOrLibraryReason?: string;
};

type FrameworkBridgeChild = {
  name: string;
  type: 'method';
  description: string;
  importance: 'high' | 'medium' | 'low';
  shouldDrill: 1;
  possibleFile: string;
  httpMethod?: string;
  httpRoute?: string;
};

type FrameworkBridgeContext = {
  language: string;
  functionName: string;
  reason?: string;
  url: string;
  token?: string;
  codeFiles: string[];
  maxChildren: number;
};

type FrameworkBridgeStrategy = {
  id: string;
  name: string;
  match: (ctx: FrameworkBridgeContext) => boolean;
  discover: (ctx: FrameworkBridgeContext) => Promise<FrameworkBridgeChild[]>;
};

type PanoramaDocState = {
  metadata: {
    repoUrl: string;
    repoName: string;
    language: string;
    generatedAt: string;
  };
  summary: string;
  allFiles: string[];
  codeFiles: string[];
  callChain: {
    maxDepth: number;
    entryPoint?: string;
    records: CallChainRecord[];
    graph: {
      nodes: Array<{
        id: string;
        label: string;
        file: string;
        line?: number;
        depth?: number;
        description?: string;
        httpMethod?: string;
        httpRoute?: string;
      }>;
      edges: Array<{ source: string; target: string }>;
    };
  };
};

const CODE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.cc', '.cxx',
  '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.kts', '.scala',
  '.html', '.css', '.scss', '.less', '.vue', '.svelte', '.dart', '.lua',
  '.pl', '.sh', '.bash', '.zsh', '.sql', '.r', '.m', '.mm', '.f', '.f90',
  '.asm', '.s', '.v', '.vhdl', '.clj', '.cljs', '.ex', '.exs', '.erl'
];

const MODULE_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#84cc16'];

function getEnvInt(name: string, fallback: number, min: number, max: number, aliases: string[] = []) {
  const env = typeof process !== 'undefined' ? (process.env as any) : undefined;
  const keys = [name, ...aliases];
  let raw: unknown = undefined;

  for (const key of keys) {
    const value = env?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      raw = value;
      break;
    }
  }

  if (raw === undefined) return fallback;

  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

const DEFAULT_MAX_DRILL_DEPTH = 2
const MAX_CHILD_CALLS_PER_FUNCTION = 10

const INITIAL_GRAPH = (repoName: string): GraphData => ({
  repoName,
  repoUrl: '',
  project: {
    language: 'Unknown',
    techStack: [],
    summary: '分析进行中：正在逐步下钻构建函数调用链与项目全景信息。',
  },
  modules: [],
  nodes: [],
  edges: [],
  allFiles: [],
  callChainRecords: [],
});

function parseRepoName(url: string) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    return parts.slice(0, 2).join('/') || url;
  } catch {
    const clean = String(url || '').replace(/[\\\/]+$/, '');
    const segs = clean.split(/[\\/]/).filter(Boolean);
    return segs[segs.length - 1] || clean || 'local-project';
  }
}

function sanitizeFilePath(path?: string) {
  if (!path || typeof path !== 'string') return '';
  return path.replace(/^\.\//, '').trim();
}

function normalizeHttpRoute(path?: string) {
  const p = String(path || '').trim().replace(/^["']|["']$/g, '');
  if (!p) return '';
  const withSlash = p.startsWith('/') ? p : `/${p}`;
  return withSlash.replace(/\/{2,}/g, '/');
}

function mergeHttpRoutes(prefix?: string, route?: string) {
  const a = normalizeHttpRoute(prefix);
  const b = normalizeHttpRoute(route);
  if (!a) return b;
  if (!b) return a;
  return `${a}/${b}`.replace(/\/{2,}/g, '/');
}

function extractRouteFromMappingArgs(args?: string) {
  const text = String(args || '');
  const named = text.match(/\b(?:path|value)\s*=\s*["']([^"']+)["']/);
  if (named?.[1]) return normalizeHttpRoute(named[1]);
  const firstArg = text.match(/\(\s*["']([^"']+)["']/);
  if (firstArg?.[1]) return normalizeHttpRoute(firstArg[1]);
  const rawFirstArg = text.match(/^\s*["']([^"']+)["']/);
  if (rawFirstArg?.[1]) return normalizeHttpRoute(rawFirstArg[1]);
  return '';
}

function detectHttpEndpointFromLocatedFunction(params: {
  language: string;
  fileContent: string;
  functionName: string;
}): { httpMethod?: string; httpRoute?: string } {
  const language = String(params.language || '').toLowerCase();
  const content = String(params.fileContent || '');
  const fn = String(params.functionName || '').trim();
  if (!content || !fn) return {};

  if (language.includes('java')) {
    const lines = content.split(/\r?\n/);
    const names = functionNameCandidates(fn);
    let lineIdx = -1;
    for (const name of names) {
      const regs = functionRegexes(name);
      const idx = lines.findIndex((line) => regs.some((re) => re.test(line)));
      if (idx >= 0) { lineIdx = idx; break; }
    }
    if (lineIdx < 0) return {};

    const annText = lines.slice(Math.max(0, lineIdx - 14), lineIdx + 1).join('\n');
    let httpMethod: string | undefined;
    let methodRoute = '';

    const getMatch = annText.match(/@GetMapping(?:\s*\(([\s\S]*?)\))?/);
    const postMatch = annText.match(/@PostMapping(?:\s*\(([\s\S]*?)\))?/);
    const putMatch = annText.match(/@PutMapping(?:\s*\(([\s\S]*?)\))?/);
    const deleteMatch = annText.match(/@DeleteMapping(?:\s*\(([\s\S]*?)\))?/);
    const patchMatch = annText.match(/@PatchMapping(?:\s*\(([\s\S]*?)\))?/);
    const reqMatch = annText.match(/@RequestMapping(?:\s*\(([\s\S]*?)\))?/);

    if (getMatch) { httpMethod = 'GET'; methodRoute = extractRouteFromMappingArgs(getMatch[1]); }
    else if (postMatch) { httpMethod = 'POST'; methodRoute = extractRouteFromMappingArgs(postMatch[1]); }
    else if (putMatch) { httpMethod = 'PUT'; methodRoute = extractRouteFromMappingArgs(putMatch[1]); }
    else if (deleteMatch) { httpMethod = 'DELETE'; methodRoute = extractRouteFromMappingArgs(deleteMatch[1]); }
    else if (patchMatch) { httpMethod = 'PATCH'; methodRoute = extractRouteFromMappingArgs(patchMatch[1]); }
    else if (reqMatch) {
      const reqArgs = String(reqMatch[1] || '');
      const methodMatch = reqArgs.match(/RequestMethod\.(GET|POST|PUT|DELETE|PATCH)/i);
      httpMethod = methodMatch?.[1]?.toUpperCase();
      methodRoute = extractRouteFromMappingArgs(reqArgs);
    }

    const classMappingMatch = content.match(/@RequestMapping\s*\(([\s\S]*?)\)\s*(?:public\s+)?class\b/);
    const classRoute = classMappingMatch?.[1] ? extractRouteFromMappingArgs(classMappingMatch[1]) : '';
    const finalRoute = mergeHttpRoutes(classRoute, methodRoute);

    if (!httpMethod && !finalRoute) return {};
    return { httpMethod, httpRoute: finalRoute || undefined };
  }

  if (language.includes('python')) {
    const lines = content.split(/\r?\n/);
    const names = functionNameCandidates(fn);
    let lineIdx = -1;
    let matchedName = '';
    for (const name of names) {
      const idx = lines.findIndex((line) => new RegExp(`^\\s*def\\s+${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`).test(line));
      if (idx >= 0) { lineIdx = idx; matchedName = name; break; }
    }
    if (lineIdx < 0 || !matchedName) return {};

    const decorators: string[] = [];
    for (let i = lineIdx - 1; i >= 0; i -= 1) {
      const line = lines[i].trim();
      if (!line) continue;
      if (!line.startsWith('@')) break;
      decorators.unshift(line);
    }
    const decoText = decorators.join('\n');
    const routeMatch = decoText.match(/@([A-Za-z_]\w*)?\.?route\s*\(([\s\S]*?)\)/m);
    if (!routeMatch) return {};

    const args = routeMatch[2] || '';
    const pathMatch = args.match(/["']([^"']+)["']/);
    const methodsMatch = args.match(/\bmethods\s*=\s*\[([^\]]+)\]/);
    const methods = methodsMatch?.[1]
      ? Array.from(methodsMatch[1].matchAll(/["']([A-Za-z]+)["']/g)).map((m) => m[1].toUpperCase())
      : [];
    return {
      httpMethod: methods.length ? methods.join(',') : 'GET',
      httpRoute: pathMatch?.[1] ? normalizeHttpRoute(pathMatch[1]) : undefined,
    };
  }

  return {};
}

function buildEntryVerifyContentByLines(content: string) {
  const lines = String(content || '').split(/\r?\n/);
  const total = lines.length;

  if (total <= 2000) {
    return lines.join('\n');
  }

  if (total <= 4000) {
    return lines.slice(0, 2000).join('\n');
  }

  const head = lines.slice(0, 2000).join('\n');
  const tail = lines.slice(-2000).join('\n');
  const omitted = Math.max(0, total - 4000);
  return `${head}\n\n// ... 中间省略 ${omitted} 行 ...\n\n${tail}`;
}

function normalizeDrillFlag(value: unknown): DrillFlag {
  if (value === -1 || value === 0 || value === 1) return value;
  if (typeof value === 'number') {
    if (value <= -1) return -1;
    if (value >= 1) return 1;
  }
  return 0;
}

function normalizeImportance(value: unknown): GraphNode['importance'] {
  const v = String(value || '').toLowerCase();
  if (v === 'high' || v === 'medium' || v === 'low') return v;
  if (v.includes('high') || v.includes('关键')) return 'high';
  if (v.includes('low') || v.includes('次要')) return 'low';
  return 'medium';
}

function normalizeNodeType(value: unknown): GraphNode['type'] {
  const v = String(value || '').toLowerCase();
  if (v.includes('class')) return 'class';
  if (v.includes('module')) return 'module';
  if (v.includes('file')) return 'file';
  return 'function';
}

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9_\-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'node';
}

function isPythonMainGuardName(input: string) {
  const v = String(input || '').toLowerCase().replace(/\s+/g, '');
  return v.includes('__name__') && v.includes('__main__');
}

function findPythonMainGuardLine(content: string) {
  const lines = String(content || '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].replace(/\s+/g, '');
    if (line.includes('if__name__==') && line.includes('__main__')) {
      return i + 1;
    }
  }
  return undefined;
}

function chooseEntryFunctionName(params: {
  language: string;
  candidates: string[];
  entryContent: string;
}) {
  const language = String(params.language || '').toLowerCase();
  const cleaned = Array.from(new Set((params.candidates || []).map((x) => String(x || '').trim()).filter(Boolean)));
  if (!language.includes('python')) {
    return cleaned[0] || 'main';
  }

  const nonGuard = cleaned.filter((name) => !isPythonMainGuardName(name));
  const entryContent = String(params.entryContent || '');
  const hasDefMain = /^\s*def\s+main\s*\(/m.test(entryContent);

  if (hasDefMain) return 'main';
  if (nonGuard.length > 0) return nonGuard[0];
  return '__module_entry__';
}

function functionNameCandidates(fn: string) {
  const normalized = String(fn || '').trim().replace(/\(\s*\)$/, '');
  if (!normalized) return [];
  const candidates = [normalized];
  const splitters = ['::', '->', '.'];
  for (const sep of splitters) {
    if (normalized.includes(sep)) {
      const tail = normalized.split(sep).filter(Boolean).pop();
      if (tail) candidates.push(tail.trim());
    }
  }
  return Array.from(new Set(candidates.filter(Boolean)));
}

function functionRegexes(fn: string) {
  const escaped = fn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [
    new RegExp(`\\bfunction\\s+${escaped}\\b`),
    new RegExp(`\\b(?:const|let|var)\\s+${escaped}\\s*=\\s*(?:async\\s*)?(?:function|\\()`),
    new RegExp(`\\b${escaped}\\s*:\\s*(?:async\\s*)?function\\b`),
    new RegExp(`\\b${escaped}\\s*:\\s*(?:async\\s*)?\\(`),
    new RegExp(`\\b${escaped}\\s*=\\s*(?:async\\s*)?\\(`),
    new RegExp(`\\b${escaped}\\s*\\([^)]*\\)\\s*\\{`),
    new RegExp(`\\bdef\\s+${escaped}\\b`),
    new RegExp(`\\bfunc\\s+${escaped}\\b`),
    new RegExp(`\\bfn\\s+${escaped}\\b`),
    new RegExp(`\\b${escaped}\\s*<-\\s*function\\b`),
  ];
}

function fileContainsFunctionDefinition(content: string, fn: string) {
  if (!content || !fn) return false;
  const names = functionNameCandidates(fn);
  return names.some((name) => functionRegexes(name).some((re) => re.test(content)));
}

function extractFunctionSnippet(content: string, fn: string, maxLen = 7000) {
  if (!content) return '';

  let idx = -1;
  if (fn) {
    const definitionIdxList = functionRegexes(fn)
      .map((re) => content.search(re))
      .filter((v) => typeof v === 'number' && v >= 0);
    if (definitionIdxList.length > 0) {
      idx = Math.min(...definitionIdxList);
    }
  }

  if (idx < 0 && fn) {
    const lower = content.toLowerCase();
    idx = lower.indexOf(fn.toLowerCase());
  }

  if (idx < 0) {
    return content.split('\n').slice(0, 2000).join('\n');
  }

  const start = Math.max(0, idx - 1200);
  const end = Math.min(content.length, idx + maxLen - 1200);
  return content.slice(start, end);
}

function findFunctionLineNumber(content: string, fn: string) {
  if (!content || !fn) return undefined;
  const lines = content.split('\n');
  const names = functionNameCandidates(fn);
  for (const name of names) {
    const regexes = functionRegexes(name);
    for (let i = 0; i < lines.length; i += 1) {
      if (regexes.some((re) => re.test(lines[i]))) {
        return i + 1;
      }
    }
  }
  return undefined;
}

function drillLog(message: string) {
  return `【下钻】${message}`;
}

function buildPanoramaMarkdown(doc: PanoramaDocState) {
  return [
    '# PROJECT_PANORAMA.md',
    '',
    '## 1. 项目元数据',
    `- 项目地址: ${doc.metadata.repoUrl}`,
    `- 项目名称: ${doc.metadata.repoName}`,
    `- 编程语言: ${doc.metadata.language || 'Unknown'}`,
    `- 生成时间: ${doc.metadata.generatedAt}`,
    '',
    '## 2. 项目概要信息',
    doc.summary || '待分析补充',
    '',
    '## 3. 项目所有文件列表',
    `- 全量文件数: ${doc.allFiles.length}`,
    `- 过滤后代码文件数: ${doc.codeFiles.length}`,
    '```text',
    ...doc.allFiles,
    '```',
    '',
    '## 4. 函数调用链（JSON）',
    '```json',
    JSON.stringify(doc.callChain, null, 2),
    '```',
    '',
  ].join('\n');
}

export function useGithubAgent(settings?: AgentSettings) {
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [projectPanoramaMarkdown, setProjectPanoramaMarkdown] = useState('');
  const [aiUsageStats, setAiUsageStats] = useState<AiUsageStats>({ inputTokens: 0, outputTokens: 0, callCount: 0 });
  const [moduleClassificationFailed, setModuleClassificationFailed] = useState(false);
  const [isReanalyzingModules, setIsReanalyzingModules] = useState(false);

  const contentCacheRef = useRef<Record<string, string>>({});
  const functionLocateCacheRef = useRef<Record<string, {
    file: string;
    attempts: string[];
    isSystemOrLibraryFunction?: boolean;
    systemOrLibraryReason?: string;
  }>>({});
  const functionDrillCacheRef = useRef<Record<string, { file: string; analysis: LlmFunctionAnalysis }>>({});
  const graphRef = useRef<GraphData | null>(null);
  const panoramaRef = useRef<PanoramaDocState | null>(null);
  const authTokenRef = useRef<string | undefined>(undefined);
  const sourceTypeRef = useRef<SourceType>('github');
  const nodeSeqRef = useRef(0);
  const stopRequestedRef = useRef(false);
  const activeRunIdRef = useRef(0);
  const llmBaseUrl = String(settings?.llmBaseUrl || '').trim();
  const llmModel = String(settings?.llmModel || '').trim();
  const maxDrillDepth = Math.max(1, Math.min(8, Math.floor(Number(settings?.maxDrillDepth || DEFAULT_MAX_DRILL_DEPTH))));
  const maxChildCallsPerFunction = Math.max(1, Math.min(30, Math.floor(Number(settings?.maxChildCallsPerFunction || MAX_CHILD_CALLS_PER_FUNCTION))));

  const byteLength = (text: string) => {
    try {
      return new TextEncoder().encode(text).length;
    } catch {
      return text.length;
    }
  };

  const truncateForLog = (text: string, max = 12000) => {
    if (!text) return '';
    if (text.length <= max) return text;
    return `${text.slice(0, max)}\n\n... [已截断，原始长度 ${text.length} 字符]`;
  };

  const truncateStringField = (value: string, maxBytes = 800) => {
    const totalBytes = byteLength(value);
    if (totalBytes <= maxBytes) return value;

    let end = Math.min(value.length, maxBytes);
    while (end > 0 && byteLength(value.slice(0, end)) > maxBytes) {
      end -= 1;
    }
    const shown = value.slice(0, end);
    const restBytes = Math.max(0, totalBytes - byteLength(shown));
    return `${shown} ...[还有 ${restBytes} 字节]`;
  };

  const jsonSafePreview = (input: unknown, options?: { maxFieldBytes?: number; maxArrayItems?: number; maxDepth?: number }) => {
    const maxFieldBytes = options?.maxFieldBytes ?? 800;
    const maxArrayItems = options?.maxArrayItems ?? 50;
    const maxDepth = options?.maxDepth ?? 8;

    const walk = (value: unknown, depth: number): unknown => {
      if (depth > maxDepth) return '[超出展示深度]';
      if (typeof value === 'string') return truncateStringField(value, maxFieldBytes);
      if (typeof value === 'number' || typeof value === 'boolean' || value == null) return value;

      if (Array.isArray(value)) {
        const sliced = value.slice(0, maxArrayItems).map((item) => walk(item, depth + 1));
        if (value.length > maxArrayItems) {
          sliced.push(`[还有 ${value.length - maxArrayItems} 项未展示]`);
        }
        return sliced;
      }

      if (typeof value === 'object') {
        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          result[k] = walk(v, depth + 1);
        }
        return result;
      }

      return String(value);
    };

    try {
      return JSON.stringify(walk(input, 0), null, 2);
    } catch {
      return truncateForLog(String(input), 10000);
    }
  };

  const requestJsonFromLlm = async (prompt: string, options?: { label?: string }) => {
    if (stopRequestedRef.current) {
      throw new Error('__ANALYSIS_STOPPED__');
    }
    setAiUsageStats((prev) => ({ ...prev, callCount: prev.callCount + 1 }));
    const toNonNegativeInt = (value: unknown) => {
      const n = Number(value);
      if (!Number.isFinite(n) || n <= 0) return 0;
      return Math.floor(n);
    };
    const extractUsageTokens = (usage: any) => {
      if (!usage || typeof usage !== 'object') return { input: 0, output: 0 };
      const promptTokens = toNonNegativeInt(usage.prompt_tokens);
      const inputTokens = toNonNegativeInt(usage.input_tokens);
      const completionTokens = toNonNegativeInt(usage.completion_tokens);
      const outputTokens = toNonNegativeInt(usage.output_tokens);
      const totalTokens = toNonNegativeInt(usage.total_tokens);

      // Different providers may expose either prompt/completion or input/output.
      let input = Math.max(promptTokens, inputTokens);
      let output = Math.max(completionTokens, outputTokens);

      // Fallback for providers that only return total_tokens.
      if (input === 0 && output === 0 && totalTokens > 0) {
        input = totalTokens;
      }

      return { input, output };
    };
    try {
      const res = await axios.post('/api/llm/json', {
        prompt,
        ...(llmModel ? { model: llmModel } : {}),
        ...(llmBaseUrl ? { baseUrl: llmBaseUrl } : {}),
      });
      if (stopRequestedRef.current) {
        throw new Error('__ANALYSIS_STOPPED__');
      }
      const data = res.data?.data ?? {};
      const usage = res.data?.usage ?? null;
      const { input, output } = extractUsageTokens(usage);
      if (input > 0 || output > 0) {
        setAiUsageStats((prev) => ({
          ...prev,
          inputTokens: prev.inputTokens + input,
          outputTokens: prev.outputTokens + output,
        }));
      }

      if (options?.label) {
        addLog(`AI 调用完成：${options.label}`, 'thinking', undefined, {
          label: options.label,
          request: jsonSafePreview({ prompt }),
          response: jsonSafePreview(data),
        });
      }

      return data;
    } catch (error: any) {
      const usage = error?.response?.data?.usage;
      const { input, output } = extractUsageTokens(usage);
      if (input > 0 || output > 0) {
        setAiUsageStats((prev) => ({
          ...prev,
          inputTokens: prev.inputTokens + input,
          outputTokens: prev.outputTokens + output,
        }));
      }
      if (options?.label) {
        addLog(`AI 调用失败：${options.label}`, 'error', undefined, {
          label: options.label,
          request: jsonSafePreview({ prompt }),
          response: jsonSafePreview({
            message: error?.message || 'LLM request failed',
            status: error?.response?.status || error?.status || null,
            data: error?.response?.data || null,
          }),
        });
      }
      throw error;
    }
  };

  const addLog = (
    message: string,
    type: LogEntry['type'] = 'info',
    details?: string[],
    aiTrace?: LogEntry['aiTrace']
  ) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      message,
      type,
      details,
      aiTrace
    }]);
  };

  const stopAnalysis = useCallback(() => {
    if (stopRequestedRef.current) return;
    stopRequestedRef.current = true;
    addLog('已请求停止分析，将在当前步骤结束后中止。', 'info');
  }, []);

  const apiBySource = useCallback((sourceType: SourceType) => {
    if (sourceType === 'local') {
      return {
        validate: '/api/local/validate',
        tree: '/api/local/tree',
        content: '/api/local/content',
        search: '/api/local/search',
      };
    }
    return {
      validate: '/api/github/validate',
      tree: '/api/github/tree',
      content: '/api/github/content',
      search: '/api/github/search',
    };
  }, []);

  const sourcePayload = useCallback((sourceType: SourceType, source: string, token?: string) => {
    if (sourceType === 'local') return { path: source };
    return { url: source, token };
  }, []);

  const updatePanorama = useCallback((updater: (prev: PanoramaDocState) => PanoramaDocState) => {
    if (!panoramaRef.current) return;
    panoramaRef.current = updater(panoramaRef.current);
    const markdown = buildPanoramaMarkdown(panoramaRef.current);
    setProjectPanoramaMarkdown(markdown);
    if (graphRef.current) {
      const nextGraph = {
        ...graphRef.current,
        allFiles: panoramaRef.current.allFiles,
        callChainRecords: panoramaRef.current.callChain.records,
        panoramaMarkdown: markdown,
      };
      graphRef.current = nextGraph;
      setGraphData(nextGraph);
    }
  }, []);

  const updateGraph = useCallback((updater: (prev: GraphData) => GraphData) => {
    const base = graphRef.current ?? INITIAL_GRAPH(parseRepoName(repoUrl));
    const next = updater(base);
    graphRef.current = next;
    setGraphData(next);
    if (panoramaRef.current) {
      panoramaRef.current.callChain.graph = {
        nodes: next.nodes.map(n => ({
          id: n.id,
          label: n.label,
          file: n.file,
          line: n.line,
          depth: n.depth,
          description: n.description,
          httpMethod: n.httpMethod,
          httpRoute: n.httpRoute,
        })),
        edges: next.edges.map(e => ({ source: e.source, target: e.target })),
      };
      const markdown = buildPanoramaMarkdown(panoramaRef.current);
      setProjectPanoramaMarkdown(markdown);
      graphRef.current = {
        ...next,
        allFiles: panoramaRef.current.allFiles,
        callChainRecords: panoramaRef.current.callChain.records,
        panoramaMarkdown: markdown,
      };
      setGraphData(graphRef.current);
    }
  }, [repoUrl]);

  const makeNodeId = useCallback((parentNodeId: string | undefined, name: string, depth: number) => {
    nodeSeqRef.current += 1;
    return `n_${depth}_${nodeSeqRef.current}_${slugify(parentNodeId || 'root')}_${slugify(name)}`;
  }, []);

  const upsertGraphNode = (payload: {
    id: string;
    label: string;
    file: string;
    line?: number;
    httpMethod?: string;
    httpRoute?: string;
    module?: string;
    type?: string;
    importance?: string;
    description?: string;
    depth?: number;
    drillFlag?: DrillFlag;
    callStatus?: string;
  }) => {
    updateGraph((prev) => {
      const file = payload.file || 'Unknown';
      const existingNode = prev.nodes.find(n => n.id === payload.id);
      const node: GraphNode = {
        id: payload.id,
        label: payload.label,
        type: normalizeNodeType(payload.type),
        file,
        line: payload.line,
        httpMethod: payload.httpMethod ?? existingNode?.httpMethod,
        httpRoute: payload.httpRoute ?? existingNode?.httpRoute,
        importance: normalizeImportance(payload.importance),
        description: payload.description || '分析进行中',
        module: payload.module || existingNode?.module || '',
        depth: payload.depth,
        drillFlag: payload.drillFlag,
        callStatus: payload.callStatus,
      };
      const idx = prev.nodes.findIndex(n => n.id === node.id);
      const nextNodes = [...prev.nodes];
      if (idx >= 0) {
        nextNodes[idx] = { ...nextNodes[idx], ...node };
      } else {
        nextNodes.push(node);
      }
      return { ...prev, nodes: nextNodes };
    });
  };

  const upsertGraphEdge = (source: string, target: string) => {
    // Edge IDs must not be truncated, otherwise deep call-chain siblings collide
    // and many edges get dropped as "duplicates", causing isolated nodes.
    const edgeId = `e:${source}->${target}`;
    updateGraph((prev) => {
      if (prev.edges.some(e => e.id === edgeId)) return prev;
      const edge: GraphEdge = { id: edgeId, source, target };
      return { ...prev, edges: [...prev.edges, edge] };
    });
  };

  const syncCallRecordToGraphNode = (record: CallChainRecord) => {
    updateGraph((prev) => {
      const idx = prev.nodes.findIndex(n => n.id === record.nodeId);
      if (idx < 0) return prev;
      const nextNodes = [...prev.nodes];
      nextNodes[idx] = {
        ...nextNodes[idx],
        file: record.file || nextNodes[idx].file,
        line: record.line,
        depth: record.depth,
        drillFlag: record.drillFlag,
        callStatus: record.status,
      };
      return { ...prev, nodes: nextNodes };
    });
  };

  const updateCallRecord = (nodeId: string, patch: Partial<CallChainRecord>) => {
    updatePanorama((prev) => ({
      ...prev,
      callChain: {
        ...prev.callChain,
        records: prev.callChain.records.map(r => {
          if (r.nodeId !== nodeId) return r;
          const next = { ...r, ...patch };
          setTimeout(() => syncCallRecordToGraphNode(next), 0);
          return next;
        }),
      },
    }));
  };

  const appendCallRecord = (record: CallChainRecord) => {
    updatePanorama((prev) => ({
      ...prev,
      callChain: {
        ...prev.callChain,
        records: prev.callChain.records.some(r => r.nodeId === record.nodeId)
          ? prev.callChain.records
          : [...prev.callChain.records, record],
      },
    }));
    syncCallRecordToGraphNode(record);
  };

  const buildFunctionChainByNodeId = (nodeId?: string) => {
    if (!nodeId || !panoramaRef.current) return '';
    const records = panoramaRef.current.callChain.records || [];
    const byId = new Map(records.map((r) => [r.nodeId, r] as const));
    const chain: string[] = [];
    const visited = new Set<string>();
    let cur = byId.get(nodeId);
    while (cur && !visited.has(cur.nodeId)) {
      visited.add(cur.nodeId);
      chain.push(`${cur.functionName}()`);
      cur = cur.parentNodeId ? byId.get(cur.parentNodeId) : undefined;
    }
    return chain.reverse().join(' -> ');
  };

  const fetchContents = async (url: string, paths: string[], token?: string) => {
    if (stopRequestedRef.current) {
      throw new Error('__ANALYSIS_STOPPED__');
    }
    const uniquePaths = Array.from(new Set(paths.map(sanitizeFilePath).filter(Boolean)));
    const missing = uniquePaths.filter((p) => !(p in contentCacheRef.current));
    if (missing.length > 0) {
      const sourceType = sourceTypeRef.current;
      const api = apiBySource(sourceType);
      const payload = sourcePayload(sourceType, url, token);
      const res = await axios.post(api.content, { ...payload, paths: missing });
      if (stopRequestedRef.current) {
        throw new Error('__ANALYSIS_STOPPED__');
      }
      const contents = res.data?.contents || {};
      const errors = res.data?.errors || {};
      for (const p of missing) {
        const text = typeof contents[p] === 'string' ? contents[p] : '';
        const hasFailurePlaceholder = text.startsWith('// Failed to fetch file')
          || text.startsWith('// Could not retrieve content or content is too large');

        // Do not cache failures to allow retry on next open.
        if (text && !hasFailurePlaceholder) {
          contentCacheRef.current[p] = text;
        } else {
          delete contentCacheRef.current[p];
        }

        if (errors[p]) {
          addLog(`源码拉取失败: ${p} (${String(errors[p])})`, 'info');
        }
      }
    }
    const result: Record<string, string> = {};
    for (const p of uniquePaths) result[p] = contentCacheRef.current[p] || '';
    return result;
  };

  const clearFileCache = useCallback(() => {
    contentCacheRef.current = {};
  }, []);

  const updateNodeDescription = useCallback((nodeId: string, description: string) => {
    const nextDescription = String(description ?? '').trim();
    updateGraph((prev) => {
      const idx = prev.nodes.findIndex((n) => n.id === nodeId);
      if (idx < 0) return prev;
      const nextNodes = [...prev.nodes];
      nextNodes[idx] = {
        ...nextNodes[idx],
        description: nextDescription,
      };
      return { ...prev, nodes: nextNodes };
    });
  }, [updateGraph]);

  const hydrateImportedContext = useCallback((importedData: GraphData, markdown?: string) => {
    const url = importedData.repoUrl || '';
    const repoName = importedData.repoName || parseRepoName(url || importedData.repoName || 'imported');
    const allFiles = Array.isArray(importedData.allFiles) ? importedData.allFiles : [];
    const codeFiles = allFiles.filter((f: string) => {
      const lower = String(f || '').toLowerCase();
      return CODE_EXTENSIONS.some(ext => lower.endsWith(ext));
    });
    const records = Array.isArray(importedData.callChainRecords) ? importedData.callChainRecords : [];
    sourceTypeRef.current = /^https?:\/\//i.test(url) ? 'github' : 'local';

    setRepoUrl(url);
    graphRef.current = {
      ...importedData,
      repoName,
      repoUrl: url,
      allFiles,
      callChainRecords: records,
    };
    setGraphData(graphRef.current);

    panoramaRef.current = {
      metadata: {
        repoUrl: url,
        repoName,
        language: importedData.project?.language || 'Unknown',
        generatedAt: new Date().toISOString(),
      },
      summary: importedData.project?.summary || '',
      allFiles,
      codeFiles,
      callChain: {
        maxDepth: maxDrillDepth,
        entryPoint: records.find((r) => r.depth === 0)?.file,
        records: records as CallChainRecord[],
        graph: {
          nodes: (importedData.nodes || []).map((n) => ({
            id: n.id,
            label: n.label,
            file: n.file,
            line: n.line,
            depth: n.depth,
            description: n.description,
            httpMethod: n.httpMethod,
            httpRoute: n.httpRoute,
          })),
          edges: (importedData.edges || []).map((e) => ({ source: e.source, target: e.target })),
        },
      },
    };

    setProjectPanoramaMarkdown(markdown || importedData.panoramaMarkdown || buildPanoramaMarkdown(panoramaRef.current));
    setStatus('complete');
    setModuleClassificationFailed(false);
    setIsReanalyzingModules(false);
  }, []);

  const setImportedAiUsageStats = useCallback((stats?: Partial<AiUsageStats>) => {
    setAiUsageStats({
      inputTokens: Number(stats?.inputTokens || 0) || 0,
      outputTokens: Number(stats?.outputTokens || 0) || 0,
      callCount: Number(stats?.callCount || 0) || 0,
    });
  }, []);

  const locateFunctionFile = async (
    params: {
      url: string;
      token?: string;
      codeFiles: string[];
      parentFile?: string;
      parentFunctionName?: string;
      functionName: string;
      guessedFile?: string;
      language: string;
    }
  ): Promise<LocateResult> => {
    const { url, token, codeFiles, parentFile, parentFunctionName, functionName, guessedFile, language } = params;
    const attempts: string[] = [];

    const aiLocateInCandidates = async (stepLabel: string, candidates: string[]) => {
      const sanitized = Array.from(new Set(candidates.map(sanitizeFilePath).filter(Boolean)));
      if (!sanitized.length) {
        attempts.push(`${stepLabel}-无候选文件可供AI兜底`);
        return null as null | { file: string; content: string; line?: number };
      }
      const contents = await fetchContents(url, sanitized, token);
      const payload = sanitized.map((file) => ({
        file,
        contentSnippet: extractFunctionSnippet(contents[file] || '', functionName, 8000),
      }));
      attempts.push(`${stepLabel}-提交AI兜底定位(候选${sanitized.length}个)`);

      const prompt = `
你是代码函数定位助手。请在候选文件中定位目标函数定义所在文件。
注意：目标函数名可能是限定名（如 TSharkAPI::init），但在 C++ 头文件 class 内只会出现未限定方法名（如 init）。

项目语言：${language}
调用者函数：${parentFunctionName || '未知'}
调用者文件：${parentFile || '未知'}
目标函数：${functionName}
候选文件内容（节选）：
${JSON.stringify(payload)}

严格返回 JSON：
{
  "found": true,
  "file": "候选文件中的一个路径",
  "methodNameHint": "可选，例如 init",
  "reason": "一句话说明"
}
`;
      const result = await requestJsonFromLlm(prompt, { label: `函数定位AI兜底: ${functionName}` });
      const file = sanitizeFilePath(result?.file || '');
      const methodNameHint = String(result?.methodNameHint || '').trim();
      const found = result?.found === true && sanitized.includes(file);
      if (!found || !file) {
        attempts.push(`${stepLabel}-AI兜底未命中: ${String(result?.reason || '未返回有效文件')}`);
        return null;
      }

      const content = contents[file] || '';
      const line = findFunctionLineNumber(content, functionName)
        ?? (methodNameHint ? findFunctionLineNumber(content, methodNameHint) : undefined);
      attempts.push(`${stepLabel}-AI兜底命中: ${file}${line ? `:L${line}` : ''}${result?.reason ? ` (${String(result.reason)})` : ''}`);
      return { file, content, line };
    };

    const tryFiles = async (stepLabel: string, candidates: string[]) => {
      const sanitized = Array.from(new Set(candidates.map(sanitizeFilePath).filter(Boolean)));
      if (!sanitized.length) {
        attempts.push(`${stepLabel}-无有效候选文件`);
        return null as null | { file: string; content: string; line?: number };
      }
      const preview = sanitized.slice(0, 6).join(', ');
      attempts.push(`${stepLabel}-候选(${sanitized.length}): ${preview}${sanitized.length > 6 ? ' ...' : ''}`);
      const contents = await fetchContents(url, sanitized, token);
      let scanned = 0;
      for (const file of sanitized) {
        scanned += 1;
        const content = contents[file] || '';
        if (!content) continue;
        if (fileContainsFunctionDefinition(content, functionName)) {
          const line = findFunctionLineNumber(content, functionName);
          attempts.push(`${stepLabel}-命中: ${file}${line ? `:L${line}` : ''}`);
          return { file, content, line };
        }
      }
      attempts.push(`${stepLabel}-未命中(已扫描${scanned}个文件)`);
      return null;
    };

    if (guessedFile) {
      const hit = await tryFiles('step1-猜测文件', [guessedFile]);
      if (hit) return { file: hit.file, content: hit.content, line: hit.line, attempts };
    }

    if (parentFile) {
      const sameFileHit = await tryFiles('step1b-同文件兜底', [parentFile]);
      if (sameFileHit) return { file: sameFileHit.file, content: sameFileHit.content, line: sameFileHit.line, attempts };
    }

    attempts.push('step2-AI基于文件列表猜测Top3');
    const guessPrompt = `
你是代码定位助手。请根据函数名、调用上下文与项目代码文件列表，猜测该函数定义最可能所在的 3 个文件（仅返回项目内相对路径）。
如果目标函数看起来是系统函数或编程语言标准库/第三方库函数（例如 C 标准库、C++ STL、Java SDK、Node/Python 内置库等），请不要猜测项目文件，直接输出系统库标记。

项目语言：${language}
调用者函数：${parentFunctionName || '未知'}
调用者文件：${parentFile || '未知'}
目标函数：${functionName}
代码文件列表（过滤后）：
${JSON.stringify(codeFiles.slice(0, 8000))}

返回 JSON：
{
  "isSystemOrLibraryFunction": false,
  "systemOrLibraryReason": "",
  "systemOrLibraryMarker": "",
  "candidateFiles": ["path1", "path2", "path3"],
  "reason": "一句话说明"
}

当判断为系统函数或库函数时，严格返回：
{
  "isSystemOrLibraryFunction": true,
  "systemOrLibraryReason": "原因",
  "systemOrLibraryMarker": "__SYSTEM_OR_LIBRARY_FUNCTION__",
  "candidateFiles": [],
  "reason": "系统或库函数"
}
`;
    const guess = await requestJsonFromLlm(guessPrompt, { label: `函数定位猜测Top3: ${functionName}` });
    const isSystemOrLibraryFunction =
      guess?.isSystemOrLibraryFunction === true
      || String(guess?.systemOrLibraryMarker || '').trim() === '__SYSTEM_OR_LIBRARY_FUNCTION__';
    if (isSystemOrLibraryFunction) {
      attempts.push(`step2-命中系统/库函数标记: ${String(guess?.systemOrLibraryReason || guess?.reason || '无说明')}`);
      return {
        file: '',
        content: '',
        line: undefined,
        attempts,
        isSystemOrLibraryFunction: true,
        systemOrLibraryReason: String(guess?.systemOrLibraryReason || guess?.reason || '识别为系统/库函数'),
      };
    }
    const top3 = Array.isArray(guess.candidateFiles) ? guess.candidateFiles.slice(0, 3) : [];
    attempts.push(`step2-AI返回候选: ${top3.length ? top3.join(', ') : '空'}${guess?.reason ? ` (原因: ${String(guess.reason)})` : ''}`);
    if (top3.length) {
      const hit = await tryFiles('step2-AI猜测Top3校验', top3);
      if (hit) return { file: hit.file, content: hit.content, line: hit.line, attempts };
      try {
        const aiFallbackHit = await aiLocateInCandidates('step2b-AI候选文件内容兜底定位', top3);
        if (aiFallbackHit) return { file: aiFallbackHit.file, content: aiFallbackHit.content, line: aiFallbackHit.line, attempts };
      } catch (e: any) {
        attempts.push(`step2b-AI兜底异常: ${e?.message || 'unknown error'}`);
      }
    } else {
      attempts.push('step2-AI未给出可校验候选文件');
    }

    attempts.push('step3-源码搜索函数定义');
    try {
      const sourceType = sourceTypeRef.current;
      const api = apiBySource(sourceType);
      const payload = sourcePayload(sourceType, url, token);
      const searchRes = await axios.post(api.search, { ...payload, query: functionName });
      const searchFiles = (searchRes.data?.items || []).map((item: any) => item.path).filter(Boolean);
      attempts.push(`step3-搜索返回候选(${searchFiles.length}): ${searchFiles.slice(0, 6).join(', ')}${searchFiles.length > 6 ? ' ...' : ''}`);
      if (searchFiles.length) {
        const hit = await tryFiles('step3-搜索结果校验', searchFiles);
        if (hit) return { file: hit.file, content: hit.content, line: hit.line, attempts };
      } else {
        attempts.push('step3-搜索无结果');
      }
    } catch (e: any) {
      attempts.push(`step3-搜索异常: ${e?.message || 'unknown error'}`);
    }

    attempts.push('final-定位失败: 所有步骤均未命中函数定义');
    return { file: '', content: '', line: undefined, attempts, isSystemOrLibraryFunction: false };
  };

  const analyzeFunctionStep = async (params: {
    language: string;
    filePath: string;
    fileContent: string;
    functionName: string;
    depth: number;
    isEntry?: boolean;
  }) => {
    const { language, filePath, fileContent, functionName, depth, isEntry } = params;
    const fileHead = fileContent.slice(0, 3000);
    const snippet = extractFunctionSnippet(fileContent, functionName, 7000);
    const prompt = `
你是一个“逐级下钻”的代码调用链分析器，输出必须是 JSON。
请分析下面文件中的目标函数（仅输出关键调用节点，忽略琐碎辅助函数）。

规则：
1. 只关注核心功能流程，输出最重要的关键函数/关键方法调用，最多输出 ${maxChildCallsPerFunction} 个子节点。
2. 每个子节点返回 shouldDrill：-1（叶子或不重要）、0（不确定）、1（值得继续下钻）。
3. 如果能根据 import/include 或命名推断出子函数定义文件，请填 possibleFile（项目相对路径）。
4. 描述要简短中文。
${isEntry ? '5. 这是入口分析步骤，请把当前函数视为主入口函数。' : ''}
6. 遇到框架启动/分发调用（如 SpringApplication.run、DispatcherServlet、Flask app.run）时，请将其视为“桥接节点”并设置 shouldDrill=1（不要直接作为终点）。

项目语言：${language}
当前层级：${depth}
当前文件：${filePath}
目标函数：${functionName}

文件头部（含 import/include）：
${fileHead}

目标函数附近代码片段：
${snippet}

返回 JSON：
{
  "functionName": "${functionName}",
  "functionType": "function",
  "description": "当前函数职责简述",
  "importance": "high|medium|low",
  "calls": [
    {
      "name": "被调用函数名",
      "type": "function|class|method",
      "description": "中文简述",
      "importance": "high|medium|low",
      "shouldDrill": -1,
      "possibleFile": "src/xxx.ts"
    }
  ]
}
`;
    return requestJsonFromLlm(prompt, { label: `函数下钻分析 L${depth}: ${functionName}` }) as Promise<LlmFunctionAnalysis>;
  };

  const resolveAndAnalyzeFunctionWithCache = useCallback(async (params: {
    url: string;
    token?: string;
    codeFiles: string[];
    parentFile?: string;
    parentFunctionName?: string;
    functionName: string;
    guessedFile?: string;
    language: string;
    depth: number;
    isEntry?: boolean;
  }) => {
    const {
      url, token, codeFiles, parentFile, parentFunctionName, functionName, guessedFile, language, depth, isEntry,
    } = params;

    const isPython = String(language || '').toLowerCase().includes('python');
    const shouldUsePythonEntryBypass = isPython
      && !!guessedFile
      && (
        isEntry === true
        || functionName === '__module_entry__'
        || isPythonMainGuardName(functionName)
      );

    const locateCacheKey = [
      language,
      functionName,
      guessedFile || '',
      parentFile || '',
      parentFunctionName || '',
    ].join('|');

    let locateHit = false;
    let located: LocateResult = {
      file: '',
      content: '',
      line: undefined,
      attempts: [],
      isSystemOrLibraryFunction: false,
    };

    if (shouldUsePythonEntryBypass) {
      const sanitizedFile = sanitizeFilePath(guessedFile);
      const contents = await fetchContents(url, [sanitizedFile], token);
      const content = contents[sanitizedFile] || '';
      located = {
        file: sanitizedFile,
        content,
        line: functionName === '__module_entry__'
          ? findPythonMainGuardLine(content)
          : (findFunctionLineNumber(content, functionName) ?? findPythonMainGuardLine(content)),
        attempts: ['step0-python-entry-bypass: 入口文件直读分析'],
        isSystemOrLibraryFunction: false,
      };
    } else {
      const cachedLocate = functionLocateCacheRef.current[locateCacheKey];
      if (cachedLocate) {
        locateHit = true;
        if (cachedLocate.file) {
          const contents = await fetchContents(url, [cachedLocate.file], token);
          located = {
            file: cachedLocate.file,
            content: contents[cachedLocate.file] || '',
            line: findFunctionLineNumber(contents[cachedLocate.file] || '', functionName),
            attempts: [...cachedLocate.attempts, 'cache-hit: locate'],
            isSystemOrLibraryFunction: cachedLocate.isSystemOrLibraryFunction === true,
            systemOrLibraryReason: cachedLocate.systemOrLibraryReason,
          };
        } else {
          located = {
            file: '',
            content: '',
            line: undefined,
            attempts: [...cachedLocate.attempts, 'cache-hit: locate-miss'],
            isSystemOrLibraryFunction: cachedLocate.isSystemOrLibraryFunction === true,
            systemOrLibraryReason: cachedLocate.systemOrLibraryReason,
          };
        }
      } else {
        located = await locateFunctionFile({
          url,
          token,
          codeFiles,
          parentFile,
          parentFunctionName,
          functionName,
          guessedFile,
          language,
        });
        functionLocateCacheRef.current[locateCacheKey] = {
          file: located.file || '',
          attempts: located.attempts || [],
          isSystemOrLibraryFunction: located.isSystemOrLibraryFunction === true,
          systemOrLibraryReason: located.systemOrLibraryReason,
        };
      }
    }

    if (located.isSystemOrLibraryFunction) {
      return { located, analyzed: null as LlmFunctionAnalysis | null, cache: { locateHit, drillHit: false } };
    }

    if (!located.file || !located.content) {
      return { located, analyzed: null as LlmFunctionAnalysis | null, cache: { locateHit, drillHit: false } };
    }

    const drillCacheKey = [language, located.file, functionName].join('|');
    const cachedDrill = functionDrillCacheRef.current[drillCacheKey];
    if (cachedDrill) {
      return {
        located: { ...located, file: cachedDrill.file },
        analyzed: cachedDrill.analysis,
        cache: { locateHit, drillHit: true },
      };
    }

    const analyzed = await analyzeFunctionStep({
      language,
      filePath: located.file,
      fileContent: located.content,
      functionName,
      depth,
      isEntry,
    });

    functionDrillCacheRef.current[drillCacheKey] = {
      file: located.file,
      analysis: analyzed,
    };

    return { located, analyzed, cache: { locateHit, drillHit: false } };
  }, [analyzeFunctionStep]);

  const discoverSpringBootBridgeChildren = useCallback(async (ctx: FrameworkBridgeContext): Promise<FrameworkBridgeChild[]> => {
    const maxChildren = Math.max(1, ctx.maxChildren || maxChildCallsPerFunction);
    const javaFiles = (ctx.codeFiles || []).filter((f) => String(f || '').toLowerCase().endsWith('.java'));
    if (!javaFiles.length) return [];

    const extractAnnoPath = (annoText: string) => {
      const pathNamed = annoText.match(/\b(?:path|value)\s*=\s*["']([^"']+)["']/);
      if (pathNamed?.[1]) return normalizeHttpRoute(pathNamed[1]);
      const firstArg = annoText.match(/\(\s*["']([^"']+)["']/);
      if (firstArg?.[1]) return normalizeHttpRoute(firstArg[1]);
      return '';
    };

    const extractRequestMappingMethod = (annoText: string) => {
      const map: Record<string, string> = {
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        DELETE: 'DELETE',
        PATCH: 'PATCH',
      };
      const byExplicit = annoText.match(/RequestMethod\.(GET|POST|PUT|DELETE|PATCH)/i);
      if (byExplicit?.[1]) return map[byExplicit[1].toUpperCase()] || undefined;
      return undefined;
    };

    const controllerFiles = javaFiles.filter((f) => /(^|\/)(controller|api)(\/|$)/i.test(f) || /Controller\.java$/i.test(f));
    const runnerFiles = javaFiles.filter((f) => /(Application|Runner|Startup)/i.test(f));
    const scanFiles = Array.from(new Set([...controllerFiles, ...runnerFiles, ...javaFiles])).slice(0, 120);
    const contentMap = await fetchContents(ctx.url, scanFiles, ctx.token);

    const results: FrameworkBridgeChild[] = [];
    const seen = new Set<string>();
    const mappingAnno = /@(RequestMapping|GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)\b/;
    const methodDef = /^\s*(?:public|protected|private)\s+(?:static\s+)?(?:[\w<>\[\],.?]+\s+)+([A-Za-z_]\w*)\s*\([^;]*\)\s*(?:throws\s+[^{]+)?\{/;

    for (const file of scanFiles) {
      if (results.length >= maxChildren) break;
      const content = contentMap[file] || '';
      if (!content) continue;

      const isController = /@(RestController|Controller)\b/.test(content) || /Controller\.java$/i.test(file);
      const classMatch = content.match(/\bclass\s+([A-Za-z_]\w*)\b/);
      const className = classMatch?.[1] || file.split('/').pop()?.replace(/\.java$/i, '') || 'UnknownClass';
      const classMappingMatch = content.match(/@RequestMapping\s*\(([\s\S]*?)\)\s*(?:public\s+)?class\b/);
      const classBasePath = classMappingMatch?.[1] ? extractAnnoPath(classMappingMatch[1]) : '';
      const lines = content.split(/\r?\n/);

      if (isController) {
        for (let i = 0; i < lines.length; i += 1) {
          const line = lines[i];
          const methodMatch = line.match(methodDef);
          if (!methodMatch) continue;

          const windowStart = Math.max(0, i - 10);
          const annText = lines.slice(windowStart, i + 1).join('\n');
          if (!mappingAnno.test(annText)) continue;

          const methodName = methodMatch[1];
          const signature = `${file}#${className}.${methodName}`;
          if (seen.has(signature)) continue;
          seen.add(signature);

          const getMatch = annText.match(/@GetMapping\s*\(([\s\S]*?)\)/);
          const postMatch = annText.match(/@PostMapping\s*\(([\s\S]*?)\)/);
          const putMatch = annText.match(/@PutMapping\s*\(([\s\S]*?)\)/);
          const deleteMatch = annText.match(/@DeleteMapping\s*\(([\s\S]*?)\)/);
          const patchMatch = annText.match(/@PatchMapping\s*\(([\s\S]*?)\)/);
          const reqMatch = annText.match(/@RequestMapping\s*\(([\s\S]*?)\)/);

          let method: string | undefined;
          let route = '';
          if (getMatch?.[1]) { method = 'GET'; route = extractAnnoPath(getMatch[1]); }
          else if (postMatch?.[1]) { method = 'POST'; route = extractAnnoPath(postMatch[1]); }
          else if (putMatch?.[1]) { method = 'PUT'; route = extractAnnoPath(putMatch[1]); }
          else if (deleteMatch?.[1]) { method = 'DELETE'; route = extractAnnoPath(deleteMatch[1]); }
          else if (patchMatch?.[1]) { method = 'PATCH'; route = extractAnnoPath(patchMatch[1]); }
          else if (reqMatch?.[1]) {
            method = extractRequestMappingMethod(reqMatch[1]);
            route = extractAnnoPath(reqMatch[1]);
          }

          const httpRoute = mergeHttpRoutes(classBasePath, route);
          results.push({
            name: `${className}.${methodName}`,
            type: 'method',
            description: 'Spring Web 业务入口（HTTP 请求处理）',
            importance: 'high',
            shouldDrill: 1,
            possibleFile: file,
            httpMethod: method,
            httpRoute: httpRoute || undefined,
          });
          if (results.length >= maxChildren) break;
        }
      }
    }

    if (results.length < maxChildren) {
      for (const file of scanFiles) {
        if (results.length >= maxChildren) break;
        const content = contentMap[file] || '';
        if (!content) continue;
        if (!/(implements\s+[^{;]*(CommandLineRunner|ApplicationRunner)|@EventListener\b|@Scheduled\b)/.test(content)) continue;

        const classMatch = content.match(/\bclass\s+([A-Za-z_]\w*)\b/);
        const className = classMatch?.[1] || file.split('/').pop()?.replace(/\.java$/i, '') || 'UnknownClass';
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          const methodMatch = line.match(methodDef);
          if (!methodMatch) continue;
          const methodName = methodMatch[1];
          if (methodName !== 'run') continue;

          const signature = `${file}#${className}.${methodName}`;
          if (seen.has(signature)) continue;
          seen.add(signature);
          results.push({
            name: `${className}.${methodName}`,
            type: 'method',
            description: 'Spring 启动后业务入口（Runner）',
            importance: 'high',
            shouldDrill: 1,
            possibleFile: file,
          });
          if (results.length >= maxChildren) break;
        }
      }
    }

    return results.slice(0, maxChildren);
  }, [fetchContents, maxChildCallsPerFunction]);

  const discoverFlaskBridgeChildren = useCallback(async (ctx: FrameworkBridgeContext): Promise<FrameworkBridgeChild[]> => {
    const maxChildren = Math.max(1, ctx.maxChildren || maxChildCallsPerFunction);
    const pyFiles = (ctx.codeFiles || []).filter((f) => String(f || '').toLowerCase().endsWith('.py'));
    if (!pyFiles.length) return [];

    const priorityFiles = pyFiles.filter((f) => /(app|main|server|routes|views)\.py$/i.test(f));
    const scanFiles = Array.from(new Set([...priorityFiles, ...pyFiles])).slice(0, 120);
    const contentMap = await fetchContents(ctx.url, scanFiles, ctx.token);

    const results: FrameworkBridgeChild[] = [];
    const seen = new Set<string>();
    const defRegex = /^\s*def\s+([A-Za-z_]\w*)\s*\(/;

    for (const file of scanFiles) {
      if (results.length >= maxChildren) break;
      const content = contentMap[file] || '';
      if (!content) continue;

      const lines = content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i += 1) {
        if (results.length >= maxChildren) break;
        const defMatch = lines[i].match(defRegex);
        if (!defMatch) continue;

        const fnName = defMatch[1];
        const windowStart = Math.max(0, i - 12);
        const decoratorText = lines.slice(windowStart, i).join('\n');
        const routeMatch = decoratorText.match(/@([A-Za-z_]\w*)?\.?route\s*\(([\s\S]*?)\)/m);
        if (!routeMatch) continue;

        const args = routeMatch[2] || '';
        const pathMatch = args.match(/["']([^"']+)["']/);
        const methodsMatch = args.match(/\bmethods\s*=\s*\[([^\]]+)\]/);
        const methods = methodsMatch?.[1]
          ? Array.from(methodsMatch[1].matchAll(/["']([A-Za-z]+)["']/g)).map((m) => m[1].toUpperCase())
          : [];

        const httpRoute = pathMatch?.[1] ? normalizeHttpRoute(pathMatch[1]) : undefined;
        const httpMethod = methods.length ? methods.join(',') : 'GET';
        const signature = `${file}#${fnName}`;
        if (seen.has(signature)) continue;
        seen.add(signature);

        results.push({
          name: fnName,
          type: 'method',
          description: 'Flask 业务入口（HTTP 请求处理）',
          importance: 'high',
          shouldDrill: 1,
          possibleFile: file,
          httpMethod,
          httpRoute,
        });
      }
    }

    return results.slice(0, maxChildren);
  }, [fetchContents, maxChildCallsPerFunction]);

  // Add new framework bridges here (e.g. Django, NestJS, ASP.NET) without touching drill pipeline logic.
  const frameworkBridgeStrategies = useMemo<FrameworkBridgeStrategy[]>(() => ([
    {
      id: 'java_spring_boot_runtime_bridge',
      name: 'Java Spring Boot 框架桥接',
      match: (ctx) => {
        const language = String(ctx.language || '').toLowerCase();
        if (!language.includes('java')) return false;
        const functionName = String(ctx.functionName || '').toLowerCase();
        const reason = String(ctx.reason || '').toLowerCase();
        if (functionName.includes('springapplication.run')) return true;
        if (functionName.includes('dispatcherservlet') || functionName.includes('dofilter')) {
          return reason.includes('spring') || reason.includes('framework');
        }
        return false;
      },
      discover: discoverSpringBootBridgeChildren,
    },
    {
      id: 'python_flask_runtime_bridge',
      name: 'Python Flask 框架桥接',
      match: (ctx) => {
        const language = String(ctx.language || '').toLowerCase();
        if (!language.includes('python')) return false;
        const functionName = String(ctx.functionName || '').toLowerCase();
        const reason = String(ctx.reason || '').toLowerCase();
        if (functionName.includes('app.run') || functionName.includes('flask.run')) return true;
        if (functionName.includes('dispatch_request') || functionName.includes('wsgi_app')) {
          return reason.includes('flask') || reason.includes('werkzeug') || reason.includes('framework');
        }
        return reason.includes('flask') && functionName.includes('run');
      },
      discover: discoverFlaskBridgeChildren,
    },
  ]), [discoverFlaskBridgeChildren, discoverSpringBootBridgeChildren]);

  const tryBridgeFrameworkCall = useCallback(async (params: {
    language: string;
    functionName: string;
    reason?: string;
    url: string;
    token?: string;
    codeFiles: string[];
    maxChildren?: number;
  }) => {
    const ctx: FrameworkBridgeContext = {
      language: params.language,
      functionName: params.functionName,
      reason: params.reason,
      url: params.url,
      token: params.token,
      codeFiles: params.codeFiles || [],
      maxChildren: Math.max(1, params.maxChildren ?? maxChildCallsPerFunction),
    };

    for (const strategy of frameworkBridgeStrategies) {
      if (!strategy.match(ctx)) continue;
      const children = await strategy.discover(ctx);
      if (children.length > 0) {
        return { strategyId: strategy.id, strategyName: strategy.name, children };
      }
    }

    return null as null | { strategyId: string; strategyName: string; children: FrameworkBridgeChild[] };
  }, [frameworkBridgeStrategies, maxChildCallsPerFunction]);

  const classifyModulesAfterAnalysis = useCallback(async () => {
    const panorama = panoramaRef.current;
    const graph = graphRef.current;
    if (!panorama || !graph || graph.nodes.length === 0) return;

    const prompt = `
你是代码架构模块划分专家。请根据项目概述、文件列表、完整函数调用链，对当前全景图节点进行模块划分。

要求：
1. 模块按“职责/领域”划分（不是按目录）。
2. 模块数量控制在 3~10 个。
3. 所有 nodeId 必须分配到一个模块。
4. 不要改动 nodeId。
5. 返回 JSON。

项目元数据：
${JSON.stringify(panorama.metadata)}

项目概要：
${panorama.summary || ''}

项目文件列表（过滤后代码文件）：
${JSON.stringify(panorama.codeFiles)}

完整函数调用链（JSON）：
${JSON.stringify(panorama.callChain)}

当前图节点（用于校验 nodeId）：
${JSON.stringify(graph.nodes.map(n => ({ id: n.id, label: n.label, file: n.file, description: n.description })))}

返回 JSON：
{
  "modules": [
    { "id": "module_core", "name": "核心流程" },
    { "id": "module_io", "name": "输入输出" }
  ],
  "nodeModuleMap": {
    "node_id_1": "module_core",
    "node_id_2": "module_io"
  }
}
`;

    const result = await requestJsonFromLlm(prompt, { label: '最终模块划分（基于完整调用链）' });
    const rawModules = Array.isArray(result.modules) ? result.modules : [];
    const nodeModuleMap = (result.nodeModuleMap && typeof result.nodeModuleMap === 'object')
      ? result.nodeModuleMap as Record<string, string>
      : {};

    updateGraph((prev) => {
      if (!prev.nodes.length) return prev;

      const validNodeIds = new Set(prev.nodes.map(n => n.id));
      const normalizedModules: GraphModule[] = rawModules
        .map((m: any, idx: number) => {
          const id = String(m?.id || `module_${idx + 1}`).trim() || `module_${idx + 1}`;
          const name = String(m?.name || `模块${idx + 1}`).trim() || `模块${idx + 1}`;
          return {
            id,
            name,
            color: MODULE_COLORS[idx % MODULE_COLORS.length],
          };
        })
        .slice(0, 8);

      const moduleIdSet = new Set(normalizedModules.map(m => m.id));
      const fallbackModuleId = normalizedModules[0]?.id || 'module_unassigned';
      const modules = normalizedModules.length > 0
        ? normalizedModules
        : [{ id: 'module_unassigned', name: '未分组', color: MODULE_COLORS[0] }];

      const nextNodes = prev.nodes.map((node) => {
        const assigned = validNodeIds.has(node.id) ? String(nodeModuleMap[node.id] || '') : '';
        const nextModule = moduleIdSet.has(assigned) ? assigned : fallbackModuleId;
        return { ...node, module: nextModule };
      });

      return { ...prev, modules, nodes: nextNodes };
    });

    setModuleClassificationFailed(false);
    addLog('模块划分完成（AI 基于完整调用链研判）', 'success');
  }, [updateGraph]);

  const reanalyzeModules = useCallback(async () => {
    const panorama = panoramaRef.current;
    const graph = graphRef.current;
    if (!panorama || !graph || graph.nodes.length === 0) {
      addLog('无法重新分析模块：当前没有可用的全景图节点数据', 'info');
      return;
    }
    if (isReanalyzingModules) return;

    setIsReanalyzingModules(true);
    try {
      addLog('手动触发模块重新分析中...', 'thinking');
      await classifyModulesAfterAnalysis();
      setModuleClassificationFailed(false);
    } catch (e: any) {
      setModuleClassificationFailed(true);
      addLog(`重新分析模块失败: ${e?.message || '未知错误'}`, 'info');
    } finally {
      setIsReanalyzingModules(false);
    }
  }, [classifyModulesAfterAnalysis, isReanalyzingModules]);

  const classifyManualDrillChildrenModules = useCallback(async (params: {
    parentNodeId: string;
    parentFunctionName: string;
    parentFile?: string;
    children: Array<{ name: string; possibleFile?: string }>;
  }) => {
    const graph = graphRef.current;
    if (!graph || !graph.modules?.length || !params.children.length) return {};

    const parentNode = graph.nodes.find((n) => n.id === params.parentNodeId);
    const prompt = `
你是代码架构模块划分助手。请基于“当前已有模块划分”，为一次手动下钻新增的函数节点分配模块。

规则：
1. 只能从已有模块中选择 moduleId，不要创建新模块。
2. 每个 childFunction 必须分配一个 moduleId。
3. 返回 JSON，不要返回额外文本。

当前已有模块：
${JSON.stringify(graph.modules.map((m) => ({ id: m.id, name: m.name })))}

父函数：
${JSON.stringify({
  nodeId: params.parentNodeId,
  functionName: params.parentFunctionName,
  file: params.parentFile || parentNode?.file || '',
  moduleId: parentNode?.module || '',
})}

新增子函数：
${JSON.stringify(params.children)}

返回 JSON：
{
  "assignments": [
    { "childFunction": "foo", "moduleId": "module_core", "reason": "简短说明" }
  ]
}
`;

    const result = await requestJsonFromLlm(prompt, { label: `手动下钻模块划分: ${params.parentFunctionName}` });
    const assignments = Array.isArray(result?.assignments) ? result.assignments : [];
    const validModules = new Set(graph.modules.map((m) => m.id));
    const mapped: Record<string, string> = {};
    assignments.forEach((item: any) => {
      const fn = String(item?.childFunction || '').trim();
      const moduleId = String(item?.moduleId || '').trim();
      if (!fn || !moduleId || !validModules.has(moduleId)) return;
      mapped[fn] = moduleId;
    });
    return mapped;
  }, []);

  const manualDrillNode = useCallback(async (nodeId: string) => {
    const currentPanorama = panoramaRef.current;
    const url = repoUrl;
    const token = authTokenRef.current;

    if (!currentPanorama || !url) {
      addLog('无法手动下钻：当前没有可用的分析上下文', 'error');
      return;
    }

    const record = currentPanorama.callChain.records.find((r) => r.nodeId === nodeId);
    if (!record) {
      addLog(`无法手动下钻：未找到节点记录 ${nodeId}`, 'error');
      return;
    }

    const hasChildren = (graphRef.current?.edges || []).some((e) => e.source === nodeId);
    if (hasChildren) {
      addLog(`节点 ${record.functionName} 已存在子节点，无需手动下钻`, 'info');
      return;
    }

    updateCallRecord(nodeId, { status: 'analyzing', error: undefined });
    upsertGraphNode({
      id: nodeId,
      label: record.functionName,
      file: record.file || 'Unknown',
      line: record.line,
      description: '手动下钻中...',
      depth: record.depth,
      drillFlag: 1,
      callStatus: 'analyzing',
    });
    const manualChain = buildFunctionChainByNodeId(record.nodeId) || `${record.functionName}()`;
    addLog(drillLog(`手动下钻：${manualChain}（L${record.depth} -> L${record.depth + 1}）`), 'thinking');

    let resolved: Awaited<ReturnType<typeof resolveAndAnalyzeFunctionWithCache>>;
    try {
      resolved = await resolveAndAnalyzeFunctionWithCache({
        url,
        token,
        codeFiles: currentPanorama.codeFiles || [],
        parentFile: currentPanorama.callChain.records.find((r) => r.nodeId === record.parentNodeId)?.file,
        parentFunctionName: currentPanorama.callChain.records.find((r) => r.nodeId === record.parentNodeId)?.functionName,
        functionName: record.functionName,
        guessedFile: record.file,
        language: currentPanorama.metadata.language || 'Unknown',
        depth: record.depth,
        isEntry: record.depth === 0,
      });
    } catch (e: any) {
      updateCallRecord(nodeId, { status: 'failed', error: e?.message || '手动下钻分析失败' });
      addLog(drillLog(`手动下钻失败（分析异常）: ${manualChain} (${e?.message || '未知错误'})`), 'error');
      return;
    }

    const located = resolved.located;
    updateCallRecord(nodeId, { locateAttempts: located.attempts || [] });

    if (resolved.cache.locateHit || resolved.cache.drillHit) {
      addLog(
        drillLog(`手动下钻缓存命中: ${manualChain}（定位缓存: ${resolved.cache.locateHit ? '是' : '否'}，分析缓存: ${resolved.cache.drillHit ? '是' : '否'}）`),
        'info'
      );
    }

    if (!located.file || !located.content || !resolved.analyzed) {
      if (located.isSystemOrLibraryFunction) {
        const bridgeResult = await tryBridgeFrameworkCall({
          language: currentPanorama.metadata.language || 'Unknown',
          functionName: record.functionName,
          reason: located.systemOrLibraryReason,
          url,
          token,
          codeFiles: currentPanorama.codeFiles || [],
          maxChildren: maxChildCallsPerFunction,
        });
        if (bridgeResult) {
          try {
            const bridgeChildren = bridgeResult.children;
            if (bridgeChildren.length > 0) {
              updateCallRecord(nodeId, { status: 'done' });
              upsertGraphNode({
                id: nodeId,
                label: record.functionName,
                file: record.file || 'FrameworkBridge',
                line: record.line,
                description: `框架桥接节点（${bridgeResult.strategyName}：${located.systemOrLibraryReason || '框架运行时调用'}），已转入项目业务入口继续下钻`,
                depth: record.depth,
                drillFlag: 1,
                callStatus: 'done',
              });
              addLog(
                drillLog(`命中框架桥接策略[${bridgeResult.strategyId}]: ${manualChain}，已发现 ${bridgeChildren.length} 个业务入口继续分析`),
                'info'
              );
              for (const child of bridgeChildren) {
                const childNodeId = makeNodeId(nodeId, child.name, record.depth + 1);
                upsertGraphNode({
                  id: childNodeId,
                  label: child.name,
                  file: child.possibleFile,
                  httpMethod: child.httpMethod,
                  httpRoute: child.httpRoute,
                  module: (graphRef.current?.nodes || []).find((n) => n.id === nodeId)?.module
                    || (graphRef.current?.modules || [])[0]?.id
                    || '',
                  type: child.type,
                  importance: child.importance,
                  description: child.description,
                  depth: record.depth + 1,
                  drillFlag: 1,
                  callStatus: 'queued',
                });
                upsertGraphEdge(nodeId, childNodeId);
                appendCallRecord({
                  nodeId: childNodeId,
                  functionName: child.name,
                  file: child.possibleFile,
                  depth: record.depth + 1,
                  drillFlag: 1,
                  parentNodeId: nodeId,
                  status: 'queued',
                });
              }
              return;
            }
          } catch (e: any) {
            addLog(drillLog(`框架桥接失败，回退为停止下钻: ${manualChain} (${e?.message || '未知错误'})`), 'info');
          }
        }
        updateCallRecord(nodeId, {
          status: 'skipped',
          error: `系统/库函数，停止下钻：${located.systemOrLibraryReason || '已标记'}`,
        });
        upsertGraphNode({
          id: nodeId,
          label: record.functionName,
          file: record.file || 'System/Library',
          line: record.line,
          description: `系统/库函数，停止下钻：${located.systemOrLibraryReason || '已标记'}`,
          depth: record.depth,
          drillFlag: -1,
          callStatus: 'skipped',
        });
        addLog(
          drillLog(`停止下钻（系统/库函数）: ${manualChain}，原因：${located.systemOrLibraryReason || 'AI 已标记'}`),
          'thinking'
        );
        return;
      }
      updateCallRecord(nodeId, { status: 'failed', error: '手动下钻失败：无法定位函数定义' });
      upsertGraphNode({
        id: nodeId,
        label: record.functionName,
        file: record.file || 'Unknown',
        line: record.line,
        description: '手动下钻失败：无法定位函数定义',
        depth: record.depth,
        drillFlag: record.drillFlag,
        callStatus: 'failed',
      });
      addLog(drillLog(`手动下钻失败（无法定位定义）: ${manualChain}`), 'error', located.attempts || []);
      return;
    }
    addLog(
      drillLog(`定位成功：${manualChain} -> ${located.file}${located.line ? `:L${located.line}` : ''}`),
      'thinking',
      located.attempts || []
    );

    const analyzed = resolved.analyzed;
    const endpointMeta = detectHttpEndpointFromLocatedFunction({
      language: currentPanorama.metadata.language || 'Unknown',
      fileContent: located.content,
      functionName: analyzed.functionName || record.functionName,
    });

    upsertGraphNode({
      id: nodeId,
      label: analyzed.functionName || record.functionName,
      file: located.file,
      line: located.line,
      httpMethod: endpointMeta.httpMethod,
      httpRoute: endpointMeta.httpRoute,
      type: analyzed.functionType,
      importance: analyzed.importance,
      description: analyzed.description || '手动下钻分析完成',
      depth: record.depth,
      drillFlag: 1,
      callStatus: 'done',
    });
    updateCallRecord(nodeId, { status: 'done', file: located.file, line: located.line });

    const children = Array.isArray(analyzed.calls) ? analyzed.calls.slice(0, maxChildCallsPerFunction) : [];
    addLog(drillLog(`手动下钻完成，新增候选子节点 ${children.length} 个: ${manualChain}`), 'success');

    const parentModuleId = (graphRef.current?.nodes || []).find((n) => n.id === nodeId)?.module
      || (graphRef.current?.modules || [])[0]?.id
      || '';
    let childModuleMap: Record<string, string> = {};
    if (children.length > 0 && graphRef.current?.modules?.length) {
      try {
        childModuleMap = await classifyManualDrillChildrenModules({
          parentNodeId: nodeId,
          parentFunctionName: record.functionName,
          parentFile: record.file,
          children: children.map((child) => ({
            name: String(child.name || '').trim(),
            possibleFile: sanitizeFilePath(child.possibleFile) || undefined,
          })).filter((c) => c.name),
        });
      } catch (e: any) {
        addLog(drillLog(`手动下钻模块划分失败，使用父模块兜底: ${manualChain} (${e?.message || '未知错误'})`), 'info');
      }
    }

    for (const child of children) {
      const childName = String(child.name || '').trim();
      if (!childName) continue;
      const childNodeId = makeNodeId(nodeId, childName, record.depth + 1);
      const drillFlag = normalizeDrillFlag(child.shouldDrill);
      const possibleFile = sanitizeFilePath(child.possibleFile) || undefined;
      const childFile = possibleFile || located.file;
      const childModuleId = childModuleMap[childName] || parentModuleId;

      upsertGraphNode({
        id: childNodeId,
        label: childName,
        file: childFile,
        module: childModuleId,
        type: child.type,
        importance: child.importance,
        description: child.description || (drillFlag === -1 ? '叶子节点或次要函数' : '待下钻分析'),
        depth: record.depth + 1,
        drillFlag,
        callStatus: drillFlag === -1 ? 'skipped' : 'queued',
      });
      upsertGraphEdge(nodeId, childNodeId);

      appendCallRecord({
        nodeId: childNodeId,
        functionName: childName,
        file: childFile,
        line: undefined,
        depth: record.depth + 1,
        drillFlag,
        parentNodeId: nodeId,
        status: drillFlag === -1 ? 'skipped' : 'queued',
      });
    }
  }, [makeNodeId, repoUrl, resolveAndAnalyzeFunctionWithCache, classifyManualDrillChildrenModules]);

  const loadFileContent = useCallback(async (path: string) => {
    const currentUrl = repoUrl || graphData?.repoUrl || '';
    if (!currentUrl || !path) return '';
    const token = authTokenRef.current;
    const map = await fetchContents(currentUrl, [path], token);
    return map[path] || '';
  }, [repoUrl, graphData?.repoUrl]);

  const analyzeRepo = useCallback(async (url: string, token?: string, sourceType: SourceType = 'github') => {
    const runId = activeRunIdRef.current + 1;
    activeRunIdRef.current = runId;
    stopRequestedRef.current = false;
    const ensureActive = () => {
      if (stopRequestedRef.current || runId !== activeRunIdRef.current) {
        throw new Error('__ANALYSIS_STOPPED__');
      }
    };

    setRepoUrl(url);
    sourceTypeRef.current = sourceType;
    setStatus('validating');
    setLogs([]);
    setGraphData(null);
    setProjectPanoramaMarkdown('');
    setAiUsageStats({ inputTokens: 0, outputTokens: 0, callCount: 0 });
    setModuleClassificationFailed(false);
    setIsReanalyzingModules(false);
    clearFileCache();
    functionLocateCacheRef.current = {};
    functionDrillCacheRef.current = {};
    authTokenRef.current = token;
    nodeSeqRef.current = 0;
    graphRef.current = INITIAL_GRAPH(parseRepoName(url));
    setGraphData(graphRef.current);

    addLog(sourceType === 'local' ? `正在验证本地目录: ${url}` : `正在验证仓库地址: ${url}`, 'info');

    try {
      ensureActive();
      const api = apiBySource(sourceType);
      const basePayload = sourcePayload(sourceType, url, token);
      const validateRes = await axios.post(api.validate, basePayload);
      ensureActive();
      if (!validateRes.data.valid) {
        throw new Error(validateRes.data.error || (sourceType === 'local' ? '无效的本地目录' : '无效的 GitHub 仓库地址'));
      }
      const repoMeta = validateRes.data.data || {};
      const repoName = repoMeta.full_name || parseRepoName(url);
      addLog(sourceType === 'local' ? '本地目录验证成功' : '仓库验证成功', 'success');

      setStatus('fetching_tree');
      addLog('正在获取文件结构...', 'info');
      const treeRes = await axios.post(api.tree, basePayload);
      ensureActive();

      if (!treeRes.data || !Array.isArray(treeRes.data.tree)) {
        throw new Error('获取文件列表失败: 返回数据格式错误');
      }

      const allFiles = treeRes.data.tree.map((f: any) => f.path);
      const codeFiles = allFiles.filter((f: string) => {
        const lower = f.toLowerCase();
        return CODE_EXTENSIONS.some(ext => lower.endsWith(ext));
      });

      addLog(`成功获取 ${allFiles.length} 个文件（代码文件 ${codeFiles.length}）`, 'success');

      panoramaRef.current = {
        metadata: {
          repoUrl: url,
          repoName,
          language: repoMeta.language || 'Unknown',
          generatedAt: new Date().toISOString(),
        },
        summary: '正在分析入口文件与项目结构...',
        allFiles,
        codeFiles,
        callChain: {
          maxDepth: maxDrillDepth,
          entryPoint: undefined,
          records: [],
          graph: { nodes: [], edges: [] },
        },
      };
      setProjectPanoramaMarkdown(buildPanoramaMarkdown(panoramaRef.current));

      graphRef.current = {
        ...(graphRef.current || INITIAL_GRAPH(repoName)),
        repoName,
        repoUrl: url,
        allFiles,
        callChainRecords: [],
        project: {
          ...(graphRef.current?.project || INITIAL_GRAPH(repoName).project),
          language: repoMeta.language || 'Unknown',
          summary: '分析进行中：等待入口识别与逐级下钻结果。',
        },
      };
      setGraphData(graphRef.current);

      setStatus('analyzing_structure');
      addLog('AI Agent: 正在识别主入口文件与入口函数（逐步下钻模式）...', 'thinking');

      const readmeFile = allFiles.find((f: string) => /^readme(\.|$)/i.test(f.split('/').pop() || '')) || allFiles.find((f: string) => f.toLowerCase().includes('readme'));
      const manifestFiles = allFiles.filter((f: string) => /(?:package\.json|go\.mod|pom\.xml|requirements\.txt|pyproject\.toml|Cargo\.toml)$/i.test(f)).slice(0, 5);

      const entryGuessPrompt = `
你是一位资深软件架构师。下面是项目代码文件列表，请识别主要语言、可能入口文件和主入口函数名称（如果能推断）。

代码文件列表：
${JSON.stringify(codeFiles.slice(0, 10000))}

返回 JSON：
{
  "language": "string",
  "potentialEntryPoints": ["path/to/file1", "path/to/file2", "path/to/file3"],
  "potentialEntryFunctionNames": ["main", "bootstrap", "App", "start"]
}
`;
      const guessData = await requestJsonFromLlm(entryGuessPrompt, { label: '入口识别：候选入口文件与主入口函数' });
      ensureActive();
      const language = guessData.language || repoMeta.language || 'Unknown';
      const potentialEntryPoints: string[] = Array.isArray(guessData.potentialEntryPoints) ? guessData.potentialEntryPoints.slice(0, 5) : [];
      const potentialEntryFunctionNames: string[] = Array.isArray(guessData.potentialEntryFunctionNames) ? guessData.potentialEntryFunctionNames.slice(0, 5) : ['main'];

      updatePanorama(prev => ({
        ...prev,
        metadata: { ...prev.metadata, language },
      }));
      updateGraph(prev => ({ ...prev, project: { ...prev.project, language } }));

      addLog(`识别语言: ${language}`, 'info');
      addLog(`候选入口文件: ${potentialEntryPoints.join(', ') || '无'}`, 'info');

      let entryPoint = '';
      let entryContent = '';
      if (potentialEntryPoints.length > 0) {
        const verifyMap = await fetchContents(url, potentialEntryPoints.slice(0, 3), token);
        ensureActive();
        for (const candidate of potentialEntryPoints.slice(0, 3)) {
          ensureActive();
          const content = verifyMap[candidate] || '';
          if (!content) continue;
          const verifyContent = buildEntryVerifyContentByLines(content);
          const lineCount = String(content).split(/\r?\n/).length;
          const verifyPrompt = `
你是代码入口识别器。请判断该文件是否是项目入口文件（main 启动、服务启动、React/Vue 挂载、CLI 启动等）。
返回 JSON。

语言：${language}
文件路径：${candidate}
文件总行数：${lineCount}
文件内容（按行数规则截取）：
- 如果文件少于 2000 行：发送全文
- 如果文件在 2001-4000 行：发送前 2000 行
- 如果文件超过 4000 行：发送前 2000 行和后 2000 行
以下是本次发送内容：
${verifyContent}

返回：
{
  "isEntryPoint": true,
  "entryFunctionName": "main",
  "reason": "简短说明"
}
`;
          const verify = await requestJsonFromLlm(verifyPrompt, { label: `入口校验: ${candidate}` });
          ensureActive();
          addLog(`验证候选入口文件: ${candidate}`, 'thinking');
          if (verify.isEntryPoint) {
            entryPoint = candidate;
            entryContent = content;
            if (verify.entryFunctionName) {
              potentialEntryFunctionNames.unshift(String(verify.entryFunctionName));
            }
            addLog(`确认入口文件: ${entryPoint}`, 'success');
            break;
          }
        }
      }

      if (!entryPoint) {
        addLog(sourceType === 'local' ? '入口文件未确认，启动本地搜索兜底...' : '入口文件未确认，启动 GitHub 搜索兜底...', 'thinking');
        let searchQuery = 'main start bootstrap app.listen createRoot';
        const lang = language.toLowerCase();
        if (lang.includes('go')) searchQuery = 'func main';
        else if (lang.includes('python')) searchQuery = 'if __name__ == "__main__"';
        else if (lang.includes('rust')) searchQuery = 'fn main';
        else if (lang.includes('java')) searchQuery = 'public static void main';
        const searchRes = await axios.post(api.search, { ...basePayload, query: searchQuery });
        ensureActive();
        const searchFiles = (searchRes.data?.items || []).map((i: any) => i.path).filter(Boolean);
        if (searchFiles.length) {
          const contentMap = await fetchContents(url, searchFiles.slice(0, 5), token);
          ensureActive();
          entryPoint = searchFiles[0];
          entryContent = contentMap[entryPoint] || '';
          addLog(`根据搜索结果选择入口文件: ${entryPoint}`, 'success');
        }
      }

      if (!entryPoint || !entryContent) {
        throw new Error('无法找到项目入口文件，分析终止。');
      }

      const entryFunctionName = chooseEntryFunctionName({
        language,
        entryContent,
        candidates: Array.from(new Set([
          ...potentialEntryFunctionNames,
          'main', 'bootstrap', 'start', 'init', 'App'
        ].map((x: unknown) => String(x || '').trim()).filter(Boolean))),
      });

      updatePanorama(prev => ({
        ...prev,
        callChain: { ...prev.callChain, entryPoint },
        summary: `入口文件已确认：${entryPoint}。正在按最大 ${maxDrillDepth} 层递归下钻调用链。`,
      }));
      updateGraph(prev => ({
        ...prev,
        project: {
          ...prev.project,
          summary: `入口文件 ${entryPoint} 已确认，正在递归下钻关键函数调用链（最多 ${maxDrillDepth} 层）。`,
        }
      }));

      const summaryPaths = [entryPoint, readmeFile, ...manifestFiles].filter(Boolean) as string[];
      try {
        const summaryContents = await fetchContents(url, summaryPaths.slice(0, 6), token);
        ensureActive();
        const summaryPrompt = `
你是项目概要分析器。请根据 README、入口文件和清单文件，输出项目中文简介与技术栈（简洁）。

仓库：${repoName}
语言：${language}
文件内容：${JSON.stringify(summaryContents).slice(0, 30000)}

返回 JSON：
{
  "summary": "中文项目概要",
  "techStack": ["React", "TypeScript"]
}
`;
        const summaryResult = await requestJsonFromLlm(summaryPrompt, { label: '项目概要与技术栈生成' });
        ensureActive();
        const summary = typeof summaryResult.summary === 'string' ? summaryResult.summary : '';
        const techStack = Array.isArray(summaryResult.techStack) ? summaryResult.techStack.map(String).slice(0, 12) : [];
        if (summary || techStack.length) {
          updateGraph(prev => ({ ...prev, project: { ...prev.project, summary: summary || prev.project.summary, techStack } }));
          updatePanorama(prev => ({ ...prev, summary: summary || prev.summary }));
        }
      } catch (e) {
        addLog('项目概要生成失败，继续调用链分析（不影响下钻）', 'info');
      }

      setStatus('recursive_drilling');
      addLog(drillLog('开始逐级下钻调用链（动态渲染）...'), 'thinking');

      const queue: DrillTask[] = [];
      const visited = new Set<string>();
      const rootNodeId = makeNodeId(undefined, entryFunctionName, 0);
      const entryLine = findFunctionLineNumber(entryContent, entryFunctionName);
      upsertGraphNode({
        id: rootNodeId,
        label: entryFunctionName,
        file: entryPoint,
        line: entryLine,
        type: 'function',
        importance: 'high',
        description: '入口函数（待展开）',
        depth: 0,
        drillFlag: 1,
        callStatus: 'queued',
      });
      appendCallRecord({
        nodeId: rootNodeId,
        functionName: entryFunctionName,
        file: entryPoint,
        line: entryLine,
        depth: 0,
        drillFlag: 1,
        status: 'queued',
      });

      queue.push({
        nodeId: rootNodeId,
        functionName: entryFunctionName,
        possibleFile: entryPoint,
        depth: 0,
        drillFlag: 1,
      });

      while (queue.length > 0) {
        ensureActive();
        const task = queue.shift()!;
        const visitKey = `${task.depth}:${task.functionName}:${task.possibleFile || task.parentFile || ''}`;
        if (visited.has(visitKey)) continue;
        visited.add(visitKey);

        if (task.drillFlag === -1) {
          updateCallRecord(task.nodeId, { status: 'skipped' });
          continue;
        }
        if (task.depth > maxDrillDepth) {
          updateCallRecord(task.nodeId, { status: 'skipped', error: `超过最大下钻层级 ${maxDrillDepth}` });
          continue;
        }

        updateCallRecord(task.nodeId, { status: 'analyzing' });
        const drillChain = buildFunctionChainByNodeId(task.nodeId) || `${task.functionName}()`;
        addLog(drillLog(`下钻 L${task.depth}: ${drillChain}`), 'thinking');

        let resolved: Awaited<ReturnType<typeof resolveAndAnalyzeFunctionWithCache>>;
        try {
          resolved = await resolveAndAnalyzeFunctionWithCache({
            url,
            token,
            codeFiles,
            parentFile: task.parentFile,
            parentFunctionName: task.parentFunctionName,
            functionName: task.functionName,
            guessedFile: task.possibleFile,
            language,
            depth: task.depth,
            isEntry: task.depth === 0,
          });
          ensureActive();
        } catch (e: any) {
          addLog(drillLog(`函数分析失败: ${drillChain} (${e?.message || '未知错误'})`), 'error');
          updateCallRecord(task.nodeId, { status: 'failed', error: e?.message || '函数分析失败' });
          continue;
        }
        const located = resolved.located;
        const locateAttempts = located.attempts || [];
        updateCallRecord(task.nodeId, { locateAttempts });

        if (resolved.cache.locateHit || resolved.cache.drillHit) {
          addLog(
            drillLog(`缓存命中: ${drillChain}（定位缓存: ${resolved.cache.locateHit ? '是' : '否'}，分析缓存: ${resolved.cache.drillHit ? '是' : '否'}）`),
            'info'
          );
        }

      if (!located.file || !located.content || !resolved.analyzed) {
          if (located.isSystemOrLibraryFunction) {
            const bridgeResult = await tryBridgeFrameworkCall({
              language,
              functionName: task.functionName,
              reason: located.systemOrLibraryReason,
              url,
              token,
              codeFiles,
              maxChildren: maxChildCallsPerFunction,
            });
            if (bridgeResult) {
              try {
                const bridgeChildren = bridgeResult.children;
                if (bridgeChildren.length > 0) {
                  addLog(
                    drillLog(`命中框架桥接策略[${bridgeResult.strategyId}]: ${drillChain}，转入 ${bridgeChildren.length} 个业务入口继续下钻`),
                    'info'
                  );
                  updateCallRecord(task.nodeId, {
                    status: 'done',
                    drillFlag: 1,
                  });
                  upsertGraphNode({
                    id: task.nodeId,
                    label: task.functionName,
                    file: task.possibleFile || task.parentFile || 'FrameworkBridge',
                    description: `框架桥接节点（${bridgeResult.strategyName}：${located.systemOrLibraryReason || '框架运行时调用'}），已切换到项目业务入口继续下钻`,
                    importance: 'medium',
                    depth: task.depth,
                    drillFlag: 1,
                    callStatus: 'done',
                  });

                  for (const child of bridgeChildren) {
                    const childNodeId = makeNodeId(task.nodeId, child.name, task.depth + 1);
                    upsertGraphNode({
                      id: childNodeId,
                      label: child.name,
                      file: child.possibleFile,
                      httpMethod: child.httpMethod,
                      httpRoute: child.httpRoute,
                      type: child.type,
                      importance: child.importance,
                      description: child.description,
                      depth: task.depth + 1,
                      drillFlag: 1,
                      callStatus: 'queued',
                    });
                    upsertGraphEdge(task.nodeId, childNodeId);
                    appendCallRecord({
                      nodeId: childNodeId,
                      functionName: child.name,
                      file: child.possibleFile,
                      line: undefined,
                      depth: task.depth + 1,
                      drillFlag: 1,
                      parentNodeId: task.nodeId,
                      status: 'queued',
                    });
                    if (task.depth + 1 <= maxDrillDepth) {
                      queue.push({
                        nodeId: childNodeId,
                        functionName: child.name,
                        parentNodeId: task.nodeId,
                        parentFile: child.possibleFile,
                        parentFunctionName: task.functionName,
                        possibleFile: child.possibleFile,
                        depth: task.depth + 1,
                        drillFlag: 1,
                      });
                    }
                  }
                  continue;
                }
              } catch (e: any) {
                addLog(drillLog(`框架桥接失败，回退为停止下钻: ${drillChain} (${e?.message || '未知错误'})`), 'info');
              }
            }
            addLog(
              drillLog(`停止下钻（系统/库函数）: ${drillChain}，原因：${located.systemOrLibraryReason || 'AI 已标记'}`),
              'thinking'
            );
            updateCallRecord(task.nodeId, {
              status: 'skipped',
              drillFlag: -1,
              error: `系统/库函数，停止下钻：${located.systemOrLibraryReason || '已标记'}`,
            });
            upsertGraphNode({
              id: task.nodeId,
              label: task.functionName,
              file: task.possibleFile || task.parentFile || 'System/Library',
              description: `系统/库函数，停止下钻：${located.systemOrLibraryReason || '已标记'}`,
              importance: 'low',
              depth: task.depth,
              drillFlag: -1,
              callStatus: 'skipped',
            });
            continue;
          }
          addLog(drillLog(`下钻失败（无法定位函数定义）: ${drillChain}`), 'error', locateAttempts);
          updateCallRecord(task.nodeId, { status: 'failed', error: '无法定位函数定义' });
          upsertGraphNode({
            id: task.nodeId,
            label: task.functionName,
            file: task.possibleFile || task.parentFile || 'Unknown',
            description: '下钻失败：无法定位函数定义',
            importance: 'low',
            depth: task.depth,
            drillFlag: task.drillFlag,
            callStatus: 'failed',
          });
          continue;
        }

        upsertGraphNode({
          id: task.nodeId,
          label: task.functionName,
          file: located.file,
          line: located.line,
          description: '正在分析函数体与关键调用...',
          importance: task.depth === 0 ? 'high' : 'medium',
          depth: task.depth,
          drillFlag: task.drillFlag,
          callStatus: 'analyzing',
        });

        const analyzed: LlmFunctionAnalysis = resolved.analyzed;
        addLog(
          drillLog(`定位成功：${drillChain} -> ${located.file}${located.line ? `:L${located.line}` : ''}`),
          'thinking',
          locateAttempts
        );

        const currentDesc = analyzed.description || (task.depth === 0 ? '项目入口函数' : '关键调用节点');
        const endpointMeta = detectHttpEndpointFromLocatedFunction({
          language,
          fileContent: located.content,
          functionName: analyzed.functionName || task.functionName,
        });
        upsertGraphNode({
          id: task.nodeId,
          label: analyzed.functionName || task.functionName,
          file: located.file,
          line: located.line,
          httpMethod: endpointMeta.httpMethod,
          httpRoute: endpointMeta.httpRoute,
          type: analyzed.functionType,
          importance: analyzed.importance || (task.depth === 0 ? 'high' : 'medium'),
          description: currentDesc,
          depth: task.depth,
          drillFlag: task.drillFlag,
          callStatus: 'done',
        });

        const children = Array.isArray(analyzed.calls) ? analyzed.calls.slice(0, maxChildCallsPerFunction) : [];
        addLog(drillLog(`发现 ${children.length} 个关键子调用节点: ${drillChain}`), 'info');

        for (const child of children) {
          const childName = String(child.name || '').trim();
          if (!childName) continue;
          const childNodeId = makeNodeId(task.nodeId, childName, task.depth + 1);
          const drillFlag = normalizeDrillFlag(child.shouldDrill);
          const possibleFile = sanitizeFilePath(child.possibleFile) || undefined;
          const childFile = possibleFile || located.file;

          upsertGraphNode({
            id: childNodeId,
            label: childName,
            file: childFile,
            type: child.type,
            importance: child.importance,
            description: child.description || (drillFlag === -1 ? '叶子节点或次要函数' : '待下钻分析'),
            depth: task.depth + 1,
            drillFlag,
            callStatus: drillFlag === -1 ? 'skipped' : 'queued',
          });
          upsertGraphEdge(task.nodeId, childNodeId);

          appendCallRecord({
            nodeId: childNodeId,
            functionName: childName,
            file: childFile,
            line: undefined,
            depth: task.depth + 1,
            drillFlag,
            parentNodeId: task.nodeId,
            status: drillFlag === -1 ? 'skipped' : 'queued',
          });

          if (task.depth + 1 <= maxDrillDepth && drillFlag !== -1) {
            queue.push({
              nodeId: childNodeId,
              functionName: childName,
              parentNodeId: task.nodeId,
              parentFile: located.file,
              parentFunctionName: analyzed.functionName || task.functionName,
              possibleFile,
              depth: task.depth + 1,
              drillFlag,
            });
          }
        }

        updateCallRecord(task.nodeId, { status: 'done', file: located.file, line: located.line });
      }

      addLog(drillLog('递归下钻完成，正在整理最终全景图信息...'), 'thinking');
      setStatus('generating_graph');

      updatePanorama(prev => ({
        ...prev,
        summary: graphRef.current?.project?.summary || prev.summary,
      }));

      if (!graphRef.current?.project.techStack?.length) {
        updateGraph(prev => ({
          ...prev,
          project: {
            ...prev.project,
            techStack: [language].filter(Boolean),
          }
        }));
      }

      try {
        addLog('AI Agent: 正在基于完整调用链进行模块划分...', 'thinking');
        await classifyModulesAfterAnalysis();
        ensureActive();
      } catch (e: any) {
        setModuleClassificationFailed(true);
        addLog(`模块划分失败，保留未分组状态: ${e?.message || '未知错误'}`, 'info');
      }

      setStatus('complete');
      addLog('全景图生成完成（逐步下钻模式）', 'success');
    } catch (error: any) {
      if (error?.message === '__ANALYSIS_STOPPED__') {
        addLog('分析已停止。', 'info');
        setStatus('idle');
        return;
      }
      console.error(error);
      let errorMessage = error.message || '未知错误';

      if (error.response?.status === 403) {
        errorMessage = 'GitHub API 访问受限 (403)。可能触发频率限制，请提供 GitHub Token。';
      } else if (String(error.message || '').includes('403')) {
        errorMessage = 'GitHub API 访问受限 (403)。请提供 GitHub Token。';
      }

      addLog(`错误: ${errorMessage}`, 'error');
      setStatus('error');
    }
  }, [updateGraph, updatePanorama, classifyModulesAfterAnalysis, clearFileCache, apiBySource, sourcePayload, maxDrillDepth, maxChildCallsPerFunction]);

  return {
    status,
    logs,
    graphData,
    setGraphData,
    repoUrl,
    projectPanoramaMarkdown,
    setProjectPanoramaMarkdown,
    aiUsageStats,
    maxDrillDepth,
    maxChildCallsPerFunction,
    moduleClassificationFailed,
    isReanalyzingModules,
    stopAnalysis,
    manualDrillNode,
    reanalyzeModules,
    loadFileContent,
    clearFileCache,
    updateNodeDescription,
    hydrateImportedContext,
    setImportedAiUsageStats,
    analyzeRepo,
  };
}
