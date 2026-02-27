"use client";

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { RepoInput } from './components/RepoInput';
import { LocalPathInput } from './components/LocalPathInput';
import { AgentLog } from './components/AgentLog';
import { GraphViewer, GraphViewerRef } from './components/GraphViewer';
import { useGithubAgent } from './hooks/useGithubAgent';
import { GraphData, GraphNode, LogEntry, AiUsageStats } from './types';
import {
  Code2,
  Network,
  Github,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ArrowLeft,
  Sun,
  Moon,
  Terminal,
  FolderTree,
  FileCode2,
  PanelRight,
  ListTree,
  Folder,
  FolderOpen,
  FileText,
  Target,
  Maximize2,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Group, Panel, Separator } from 'react-resizable-panels';
import Editor, { OnMount } from '@monaco-editor/react';

const IMPORT_MODULE_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#84cc16'];
const AGENT_LOG_SECTION_TITLE = '## 5. Agent 状态日志';
const VISUALIZATION_SECTION_TITLE = '## 6. 全景图展示数据';
const AI_USAGE_SECTION_TITLE = '## 7. AI 调用统计';

function toLineNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.floor(value);
  if (typeof value === 'string') {
    const n = Number(value.trim());
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
  }
  return undefined;
}

function parseProjectPanoramaMarkdown(content: string): GraphData | null {
  const jsonBlockMatch = content.match(/##\s*4\.\s*函数调用链（JSON）[\s\S]*?```json\s*([\s\S]*?)```/i)
    || content.match(/```json\s*([\s\S]*?)```/i);
  if (!jsonBlockMatch?.[1]) return null;

  let callChain: any;
  try {
    callChain = JSON.parse(jsonBlockMatch[1]);
  } catch {
    return null;
  }

  const repoName =
    content.match(/- 项目名称:\s*(.+)/)?.[1]?.trim()
    || 'Imported Project';
  const repoUrl =
    content.match(/- 项目地址:\s*(.+)/)?.[1]?.trim()
    || '';
  const language =
    content.match(/- 编程语言:\s*(.+)/)?.[1]?.trim()
    || 'Unknown';

  const summarySection = content.match(/##\s*2\.\s*项目概要信息\s*([\s\S]*?)\n##\s*3\./i);
  const summary = summarySection?.[1]?.trim() || '导入的工程文件';

  const filesBlock = content.match(/##\s*3\.\s*项目所有文件列表[\s\S]*?```text\s*([\s\S]*?)```/i);
  const allFiles = filesBlock?.[1]
    ?.split('\n')
    .map((line) => line.trim())
    .filter(Boolean) || [];

  const graphNodes = Array.isArray(callChain?.graph?.nodes) ? callChain.graph.nodes : [];
  const graphEdges = Array.isArray(callChain?.graph?.edges) ? callChain.graph.edges : [];
  const records = Array.isArray(callChain?.records) ? callChain.records : [];
  const visualization = parseVisualizationDataFromPanoramaMarkdown(content);

  const recordMap = new Map<string, any>();
  records.forEach((r: any) => {
    if (r?.nodeId) recordMap.set(String(r.nodeId), r);
  });

  let nodes = graphNodes.map((n: any) => {
    const record = recordMap.get(String(n.id));
    const file = n.file || record?.file || 'Unknown';
    const importedDescription = typeof n.description === 'string' ? n.description : '';
    return {
      id: String(n.id),
      label: String(n.label || record?.functionName || n.id),
      type: 'function' as const,
      file,
      line: toLineNumber(n.line) ?? toLineNumber(record?.line),
      importance: 'medium' as const,
      description: importedDescription || (record?.status ? `导入节点（状态: ${record.status}，层级: ${record.depth ?? '-'})` : '导入节点'),
      module: '',
      depth: typeof record?.depth === 'number' ? record.depth : undefined,
      drillFlag: typeof record?.drillFlag === 'number' ? record.drillFlag : undefined,
      callStatus: typeof record?.status === 'string' ? record.status : undefined,
    };
  });

  const edges = graphEdges.map((e: any, idx: number) => ({
    id: `e_import_${idx}`,
    source: String(e.source),
    target: String(e.target),
  }));

  let modules: Array<{ id: string; name: string; color: string }> = [];
  if (visualization.modules.length > 0) {
    const restored = visualization.modules.map((m, idx) => ({
      id: m.id,
      name: m.name,
      color: m.color || IMPORT_MODULE_COLORS[idx % IMPORT_MODULE_COLORS.length],
    }));
    const moduleIdSet = new Set(restored.map((m) => m.id));
    nodes = nodes.map((node) => ({
      ...node,
      module: moduleIdSet.has(visualization.nodeModuleMap[node.id]) ? visualization.nodeModuleMap[node.id] : node.module,
    }));
    modules = restored;
  }

  if (Object.keys(visualization.nodeDescriptions).length > 0) {
    nodes = nodes.map((node) => ({
      ...node,
      description: visualization.nodeDescriptions[node.id] || node.description,
    }));
  }

  return {
    repoName,
    repoUrl,
    project: {
      language,
      techStack: language && language !== 'Unknown' ? [language] : [],
      summary,
    },
    modules,
    nodes,
    edges,
    allFiles,
    callChainRecords: records,
    panoramaMarkdown: content,
  };
}

function parseVisualizationDataFromPanoramaMarkdown(content: string): {
  modules: Array<{ id: string; name: string; color?: string }>;
  nodeModuleMap: Record<string, string>;
  nodeDescriptions: Record<string, string>;
} {
  const sectionRegex = new RegExp(`${VISUALIZATION_SECTION_TITLE}[\\s\\S]*?\\\`\\\`\\\`json\\s*([\\s\\S]*?)\\\`\\\`\\\``, 'i');
  const match = content.match(sectionRegex);
  if (!match?.[1]) {
    return { modules: [], nodeModuleMap: {}, nodeDescriptions: {} };
  }

  try {
    const parsed = JSON.parse(match[1]);
    const modules = Array.isArray(parsed?.modules)
      ? parsed.modules
        .map((m: any) => ({
          id: String(m?.id || '').trim(),
          name: String(m?.name || '').trim(),
          color: m?.color ? String(m.color) : undefined,
        }))
        .filter((m: any) => m.id && m.name)
      : [];

    const nodeModuleMap = parsed?.nodeModuleMap && typeof parsed.nodeModuleMap === 'object'
      ? Object.fromEntries(
          Object.entries(parsed.nodeModuleMap).map(([k, v]) => [String(k), String(v || '')])
        )
      : {};

    const nodeDescriptions = parsed?.nodeDescriptions && typeof parsed.nodeDescriptions === 'object'
      ? Object.fromEntries(
          Object.entries(parsed.nodeDescriptions).map(([k, v]) => [String(k), String(v || '')])
        )
      : {};

    return { modules, nodeModuleMap, nodeDescriptions };
  } catch {
    return { modules: [], nodeModuleMap: {}, nodeDescriptions: {} };
  }
}

function parseAgentLogsFromPanoramaMarkdown(content: string): LogEntry[] {
  const sectionRegex = new RegExp(`${AGENT_LOG_SECTION_TITLE}[\\s\\S]*?\\\`\\\`\\\`json\\s*([\\s\\S]*?)\\\`\\\`\\\``, 'i');
  const match = content.match(sectionRegex) || content.match(/"agentLogs"\s*:\s*(\[[\s\S]*\])/i);
  if (!match?.[1]) return [];
  try {
    const parsed = JSON.parse(match[1]);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item: any) => ({
        id: String(item?.id || Math.random().toString(36).slice(2)),
        timestamp: Number(item?.timestamp || Date.now()),
        message: String(item?.message || ''),
        type: (['info', 'success', 'error', 'thinking'].includes(item?.type) ? item.type : 'info') as LogEntry['type'],
        details: Array.isArray(item?.details) ? item.details.map(String) : undefined,
        aiTrace: item?.aiTrace && typeof item.aiTrace === 'object'
          ? {
              request: String(item.aiTrace.request || ''),
              response: String(item.aiTrace.response || ''),
              label: item.aiTrace.label ? String(item.aiTrace.label) : undefined,
            }
          : undefined,
      }))
      .filter((entry) => entry.message);
  } catch {
    return [];
  }
}

function buildExportMarkdownWithAgentLogs(
  baseMarkdown: string,
  logs: LogEntry[],
  graphData: GraphData | null,
  aiUsageStats: AiUsageStats
) {
  const stripped = baseMarkdown.replace(new RegExp(`${AGENT_LOG_SECTION_TITLE}[\\s\\S]*$`, 'i'), '').trimEnd();
  const nodeModuleMap = Object.fromEntries(
    (graphData?.nodes || []).map((node) => [node.id, node.module || ''])
  );
  const nodeDescriptions = Object.fromEntries(
    (graphData?.nodes || []).map((node) => [node.id, node.description || ''])
  );
  const visualizationPayload = {
    modules: graphData?.modules || [],
    nodeModuleMap,
    nodeDescriptions,
  };
  return [
    stripped,
    '',
    AGENT_LOG_SECTION_TITLE,
    '```json',
    JSON.stringify(logs, null, 2),
    '```',
    '',
    VISUALIZATION_SECTION_TITLE,
    '```json',
    JSON.stringify(visualizationPayload, null, 2),
    '```',
    '',
    AI_USAGE_SECTION_TITLE,
    '```json',
    JSON.stringify({
      inputTokens: Number(aiUsageStats.inputTokens || 0),
      outputTokens: Number(aiUsageStats.outputTokens || 0),
      callCount: Number(aiUsageStats.callCount || 0),
    }, null, 2),
    '```',
    '',
  ].join('\n');
}

function parseAiUsageStatsFromPanoramaMarkdown(content: string): AiUsageStats {
  const sectionRegex = new RegExp(`${AI_USAGE_SECTION_TITLE}[\\s\\S]*?\\\`\\\`\\\`json\\s*([\\s\\S]*?)\\\`\\\`\\\``, 'i');
  const match = content.match(sectionRegex);
  if (!match?.[1]) {
    return { inputTokens: 0, outputTokens: 0, callCount: 0 };
  }
  try {
    const parsed = JSON.parse(match[1]);
    return {
      inputTokens: Number(parsed?.inputTokens || 0) || 0,
      outputTokens: Number(parsed?.outputTokens || 0) || 0,
      callCount: Number(parsed?.callCount || 0) || 0,
    };
  } catch {
    return { inputTokens: 0, outputTokens: 0, callCount: 0 };
  }
}

type TreeNode = {
  name: string;
  path: string;
  kind: 'dir' | 'file';
  children: TreeNode[];
};

type PanelKey = 'files' | 'source' | 'panorama';

const PANEL_MIN_WIDTH: Record<PanelKey, number> = {
  files: 8,
  source: 18,
  panorama: 18,
};

function buildFileTree(paths: string[]): TreeNode[] {
  type InternalNode = TreeNode & { childMap: Map<string, InternalNode> };
  const root: InternalNode = { name: '', path: '', kind: 'dir', children: [], childMap: new Map() };

  for (const rawPath of paths) {
    const cleanPath = rawPath.trim();
    if (!cleanPath) continue;
    const parts = cleanPath.split('/').filter(Boolean);
    let current = root;
    let currentPath = '';

    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLeaf = i === parts.length - 1;
      let next = current.childMap.get(part);
      if (!next) {
        next = {
          name: part,
          path: currentPath,
          kind: isLeaf ? 'file' : 'dir',
          children: [],
          childMap: new Map(),
        };
        current.childMap.set(part, next);
        current.children.push(next);
      }
      current = next;
    }
  }

  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((node) => sortTree(node.children));
  };

  sortTree(root.children);
  return root.children;
}

function expandParentFolders(path: string, prev: Set<string>) {
  const next = new Set(prev);
  const parts = path.split('/').filter(Boolean);
  let cur = '';
  for (let i = 0; i < parts.length - 1; i += 1) {
    cur = cur ? `${cur}/${parts[i]}` : parts[i];
    next.add(cur);
  }
  return next;
}

function detectMonacoLanguageFromPath(path: string) {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', java: 'java', go: 'go', rs: 'rust', php: 'php',
    rb: 'ruby', swift: 'swift', kt: 'kotlin', scala: 'scala',
    c: 'c', cc: 'cpp', cpp: 'cpp', cxx: 'cpp', h: 'cpp', hpp: 'cpp', m: 'objective-c', mm: 'objective-cpp',
    cs: 'csharp', html: 'markup', css: 'css', scss: 'scss', less: 'less',
    json: 'json', yml: 'yaml', yaml: 'yaml', md: 'markdown',
    sh: 'shell', bash: 'shell', zsh: 'shell', sql: 'sql', vue: 'html',
  };
  return map[ext] || 'plaintext';
}

function App() {
  const THEME_STORAGE_KEY = 'code-panorama-theme';
  const {
    status,
    logs,
    graphData,
    setGraphData,
    analyzeRepo,
    projectPanoramaMarkdown,
    setProjectPanoramaMarkdown,
    repoUrl,
    aiUsageStats,
    manualDrillNode,
    maxDrillDepth,
    moduleClassificationFailed,
    isReanalyzingModules,
    reanalyzeModules,
    stopAnalysis,
    loadFileContent,
    clearFileCache,
    updateNodeDescription,
    hydrateImportedContext,
    setImportedAiUsageStats,
  } = useGithubAgent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const graphViewerRef = useRef<GraphViewerRef>(null);
  const sourceEditorRef = useRef<any>(null);
  const sourceMonacoRef = useRef<any>(null);
  const sourceDecorationIdsRef = useRef<string[]>([]);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isRepoUrlExpanded, setIsRepoUrlExpanded] = useState(false);
  const [homeSourceType, setHomeSourceType] = useState<'github' | 'local'>('github');
  const [view, setView] = useState<'home' | 'result'>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState<Record<PanelKey, boolean>>({
    files: true,
    source: true,
    panorama: true,
  });
  const [panelWidths, setPanelWidths] = useState<Record<PanelKey, number>>({
    files: 16,
    source: 31,
    panorama: 53,
  });
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [targetLine, setTargetLine] = useState<number | undefined>(undefined);
  const [sourceCode, setSourceCode] = useState('');
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState('');
  const [isAgentFullscreenOpen, setIsAgentFullscreenOpen] = useState(false);
  const [isProjectFilesFullscreenOpen, setIsProjectFilesFullscreenOpen] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [lastExportFingerprint, setLastExportFingerprint] = useState<string | null>(null);
  const [importedLogs, setImportedLogs] = useState<LogEntry[] | null>(null);
  const [importedAiUsageStats, setImportedAiUsage] = useState<AiUsageStats | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const isAnalyzing = !['idle', 'complete', 'error'].includes(status);
  const displayRepoUrl = graphData?.repoUrl || repoUrl || '';
  const panelLogs = useMemo(() => {
    if (!importedLogs) return logs;
    return [...importedLogs, ...logs];
  }, [importedLogs, logs]);
  const mergedAiUsageStats = useMemo<AiUsageStats>(() => ({
    inputTokens: (importedAiUsageStats?.inputTokens || 0) + (aiUsageStats.inputTokens || 0),
    outputTokens: (importedAiUsageStats?.outputTokens || 0) + (aiUsageStats.outputTokens || 0),
    callCount: (importedAiUsageStats?.callCount || 0) + (aiUsageStats.callCount || 0),
  }), [importedAiUsageStats, aiUsageStats]);
  const shouldShowReanalyzeModulesButton = moduleClassificationFailed
    || (((graphData?.nodes?.length || 0) > 0) && ((graphData?.modules?.length || 0) === 0));
  const isDisplayRepoUrlHttp = /^https?:\/\//i.test(displayRepoUrl);

  const panelButtons = [
    { key: 'files' as PanelKey, label: '文件', icon: ListTree },
    { key: 'source' as PanelKey, label: '源码', icon: FileCode2 },
    { key: 'panorama' as PanelKey, label: '全景图', icon: PanelRight },
  ];

  const visiblePanelKeys = useMemo(
    () => panelButtons.map((btn) => btn.key).filter((key) => isPanelVisible[key]),
    [isPanelVisible]
  );

  const normalizedPanelWidths = useMemo(() => {
    const total = visiblePanelKeys.reduce((acc, key) => acc + Math.max(1, panelWidths[key]), 0);
    const result = { ...panelWidths } as Record<PanelKey, number>;
    if (!total) return result;
    visiblePanelKeys.forEach((key) => {
      result[key] = (Math.max(1, panelWidths[key]) / total) * 100;
    });
    return result;
  }, [panelWidths, visiblePanelKeys]);

  const homeSourceTabs = (
    <div className={clsx(
      'relative z-10 -mx-8 -mt-8 mb-6 border-b px-8 pt-4',
      theme === 'dark' ? 'border-slate-800 bg-slate-950/35' : 'border-gray-200 bg-gray-50/85'
    )}>
      <div className="flex items-end gap-6">
        <button
          type="button"
          onClick={() => setHomeSourceType('github')}
          className={clsx(
            'relative inline-flex items-center gap-2 pb-3 text-sm font-semibold transition-colors',
            homeSourceType === 'github'
              ? (theme === 'dark' ? 'text-blue-300' : 'text-blue-700')
              : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
          )}
        >
          <Github size={15} />
          GitHub 仓库
          <span className={clsx(
            'pointer-events-none absolute -bottom-px left-0 h-0.5 w-full rounded-full transition-opacity',
            theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600',
            homeSourceType === 'github' ? 'opacity-100' : 'opacity-0'
          )} />
        </button>
        <button
          type="button"
          onClick={() => setHomeSourceType('local')}
          className={clsx(
            'relative inline-flex items-center gap-2 pb-3 text-sm font-semibold transition-colors',
            homeSourceType === 'local'
              ? (theme === 'dark' ? 'text-blue-300' : 'text-blue-700')
              : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
          )}
        >
          <FolderOpen size={15} />
          本地目录
          <span className={clsx(
            'pointer-events-none absolute -bottom-px left-0 h-0.5 w-full rounded-full transition-opacity',
            theme === 'dark' ? 'bg-blue-400' : 'bg-blue-600',
            homeSourceType === 'local' ? 'opacity-100' : 'opacity-0'
          )} />
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    if (status === 'complete' && graphData) {
      setView('result');
    }
  }, [status, graphData]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === 'f' && view === 'result' && isPanelVisible.source) {
        event.preventDefault();
        sourceEditorRef.current?.focus();
        sourceEditorRef.current?.getAction('actions.find')?.run();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [view, isPanelVisible.source]);

  const handleAnalyze = (url: string, sourceType: 'github' | 'local' = 'github') => {
    clearFileCache();
    setImportedLogs(null);
    setImportedAiUsage(null);
    setImportedAiUsageStats({ inputTokens: 0, outputTokens: 0, callCount: 0 });
    setView('result');
    setSelectedFile('');
    setSelectedNode(null);
    setTargetLine(undefined);
    setSourceCode('');
    setSourceError('');
    setLastExportFingerprint(null);
    analyzeRepo(url, undefined, sourceType);
  };

  const getCurrentExportFingerprint = useCallback(() => {
    if (!projectPanoramaMarkdown) return '';
    return buildExportMarkdownWithAgentLogs(
      projectPanoramaMarkdown,
      panelLogs,
      graphData,
      mergedAiUsageStats
    );
  }, [projectPanoramaMarkdown, panelLogs, graphData, mergedAiUsageStats]);

  const handleExportPanoramaMd = () => {
    if (!projectPanoramaMarkdown) return;
    const repoNameSource = graphData?.repoName || displayRepoUrl || 'project';
    const repoShortName = repoNameSource.split('/').filter(Boolean).pop() || 'project';
    const safeRepoName = repoShortName.replace(/[^a-zA-Z0-9._-]+/g, '_');
    const markdownWithAgentLogs = getCurrentExportFingerprint();
    const blob = new Blob([markdownWithAgentLogs], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PROJECT_PANORAMA_${safeRepoName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setLastExportFingerprint(markdownWithAgentLogs);
  };

  const handleExportImage = async () => {
    if (!graphViewerRef.current || isExportingImage) return;
    setIsExportingImage(true);
    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      await graphViewerRef.current.exportImage();
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let importedData: GraphData | any = null;
        let parsedLogs: LogEntry[] = [];
        let parsedAiUsage: AiUsageStats = { inputTokens: 0, outputTokens: 0, callCount: 0 };

        if (!importedData && /PROJECT_PANORAMA|函数调用链（JSON）|##\s*4\./i.test(content)) {
          importedData = parseProjectPanoramaMarkdown(content);
          parsedLogs = parseAgentLogsFromPanoramaMarkdown(content);
          parsedAiUsage = parseAiUsageStatsFromPanoramaMarkdown(content);
          if (importedData) {
            importedData.panoramaMarkdown = content;
          }
        }

        if (!importedData) {
            try {
                importedData = JSON.parse(content);
            } catch {
                // Not a JSON file
            }
        }

        if (importedData && importedData.nodes && importedData.edges) {
          clearFileCache();
          const importedRecordMap = new Map<string, any>();
          const importedRecords = Array.isArray(importedData.callChainRecords)
            ? importedData.callChainRecords
            : Array.isArray(importedData.records)
              ? importedData.records
              : Array.isArray(importedData.callChain?.records)
                ? importedData.callChain.records
                : [];
          importedData.callChainRecords = importedRecords;
          importedRecords.forEach((r: any) => {
            if (r?.nodeId) importedRecordMap.set(String(r.nodeId), r);
          });
          if (importedRecordMap.size > 0) {
            importedData.nodes = importedData.nodes.map((node: any) => {
              const record = importedRecordMap.get(String(node.id));
              if (!record) return node;
              return {
                ...node,
                depth: typeof node.depth === 'number' ? node.depth : (typeof record.depth === 'number' ? record.depth : undefined),
                drillFlag: typeof node.drillFlag === 'number' ? node.drillFlag : (typeof record.drillFlag === 'number' ? record.drillFlag : undefined),
                callStatus: typeof node.callStatus === 'string' ? node.callStatus : (typeof record.status === 'string' ? record.status : undefined),
              };
            });
          }
          if (!importedData.repoUrl && importedData.metadata?.repoUrl) {
            importedData.repoUrl = String(importedData.metadata.repoUrl);
          }
          if (Array.isArray(importedData.agentLogs)) {
            parsedLogs = importedData.agentLogs as LogEntry[];
          }
          if (importedData.aiUsageStats && typeof importedData.aiUsageStats === 'object') {
            parsedAiUsage = {
              inputTokens: Number(importedData.aiUsageStats.inputTokens || 0) || 0,
              outputTokens: Number(importedData.aiUsageStats.outputTokens || 0) || 0,
              callCount: Number(importedData.aiUsageStats.callCount || 0) || 0,
            };
          }
          setImportedLogs(parsedLogs);
          setImportedAiUsage(parsedAiUsage);
          setImportedAiUsageStats({ inputTokens: 0, outputTokens: 0, callCount: 0 });
          setLastExportFingerprint(null);
          hydrateImportedContext(
            importedData,
            importedData.panoramaMarkdown || (typeof content === 'string' && content.includes('PROJECT_PANORAMA') ? content : '')
          );
          setView('result');
        } else {
          if (importedData) {
              alert('无效的数据格式: 缺少 nodes 或 edges');
          } else {
              alert('无法识别的文件格式。请导入工程文件（PROJECT_PANORAMA_*.md）或兼容 JSON 文件。');
          }
        }
      } catch (error: any) {
        console.error('Import failed', error);
        alert('导入失败: ' + error.message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleBackToHome = useCallback(() => {
    const hasAnalysisData = Boolean(projectPanoramaMarkdown || graphData?.nodes?.length || graphData?.edges?.length);
    if (!hasAnalysisData) {
      setView('home');
      return;
    }

    const currentFingerprint = getCurrentExportFingerprint();
    const needWarn = Boolean(currentFingerprint) && (
      !lastExportFingerprint || lastExportFingerprint !== currentFingerprint
    );

    if (needWarn) {
      const ok = window.confirm('你还没有导出最新工程文件，返回首页可能导致本次修改丢失。是否继续返回？');
      if (!ok) return;
    }

    setView('home');
  }, [projectPanoramaMarkdown, graphData, getCurrentExportFingerprint, lastExportFingerprint]);

  const allFiles = useMemo(() => graphData?.allFiles || [], [graphData?.allFiles]);
  const fileTree = useMemo(() => buildFileTree(allFiles), [allFiles]);

  const locateSourceLine = useCallback((line?: unknown) => {
    const lineNumber = toLineNumber(line);
    if (!lineNumber || !sourceEditorRef.current) return;
    requestAnimationFrame(() => {
      if (!sourceEditorRef.current) return;
      sourceEditorRef.current.revealLineInCenter(lineNumber);
      sourceEditorRef.current.setPosition({ lineNumber, column: 1 });
    });
  }, []);

  const openFileInSource = useCallback(async (filePath: string, line?: unknown) => {
    if (!filePath) return;
    const lineNumber = toLineNumber(line);
    setSelectedFile(filePath);
    setTargetLine(lineNumber);
    setExpandedFolders((prev) => expandParentFolders(filePath, prev));
    setSourceLoading(true);
    setSourceError('');
    try {
      const content = await loadFileContent(filePath);
      setSourceCode(content || '');
      locateSourceLine(lineNumber);
      if (!content) {
        setSourceError('当前来源不支持读取源码内容，或该文件内容为空。');
      }
    } catch (error: any) {
      setSourceCode('');
      setSourceError(error?.message || '读取源码失败');
    } finally {
      setSourceLoading(false);
    }
  }, [loadFileContent, locateSourceLine]);

  const handleGraphNodeSelect = useCallback((node: GraphNode) => {
    const normalizedLine = toLineNumber((node as any)?.line);
    setSelectedNode({ ...node, line: normalizedLine });
    if (!node.file) return;
    openFileInSource(node.file, normalizedLine);
  }, [openFileInSource]);

  const handleUpdateNodeDescription = useCallback((nodeId: string, description: string) => {
    updateNodeDescription(nodeId, description);
    setSelectedNode((prev) => {
      if (!prev || prev.id !== nodeId) return prev;
      return { ...prev, description };
    });
  }, [updateNodeDescription]);

  useEffect(() => {
    if (!sourceCode) return;
    locateSourceLine(targetLine);
  }, [targetLine, sourceCode, selectedFile, locateSourceLine]);

  useEffect(() => {
    if (!sourceEditorRef.current || !sourceMonacoRef.current) return;
    const monaco = sourceMonacoRef.current;
    sourceDecorationIdsRef.current = sourceEditorRef.current.deltaDecorations(
      sourceDecorationIdsRef.current,
      targetLine ? [{
        range: new monaco.Range(targetLine, 1, targetLine, 1),
        options: {
          isWholeLine: true,
          className: theme === 'dark' ? 'source-target-line-dark' : 'source-target-line-light',
          linesDecorationsClassName: theme === 'dark' ? 'source-target-gutter-dark' : 'source-target-gutter-light',
        },
      }] : []
    );
  }, [targetLine, sourceCode, selectedFile, theme]);

  const handleSourceEditorMount = useCallback<OnMount>((editor, monaco) => {
    sourceEditorRef.current = editor;
    sourceMonacoRef.current = monaco;
    editor.updateOptions({
      readOnly: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      automaticLayout: true,
      fontSize: 12,
      lineNumbersMinChars: 4,
      wordWrap: 'on',
      find: {
        addExtraSpaceOnTop: false,
        seedSearchStringFromSelection: 'selection',
        autoFindInSelection: 'never',
      },
    });
    locateSourceLine(targetLine);
  }, [locateSourceLine, targetLine]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handlePanelLayout = useCallback((layout: Record<string, number>) => {
    setPanelWidths((prev) => {
      const next = { ...prev };
      visiblePanelKeys.forEach((key) => {
        const size = layout[key];
        if (typeof size === 'number' && Number.isFinite(size) && size > 0) {
          next[key] = size;
        }
      });
      return next;
    });
  }, [visiblePanelKeys]);

  const renderTreeNode = (node: TreeNode, depth = 0): React.ReactNode => {
    const isDir = node.kind === 'dir';
    const isOpen = expandedFolders.has(node.path);
    const isSelected = !isDir && selectedFile === node.path;

    return (
      <div key={node.path}>
        <button
          type="button"
          onClick={() => {
            if (isDir) {
              toggleFolder(node.path);
              return;
            }
            setSelectedNode(null);
            openFileInSource(node.path);
          }}
          className={clsx(
            'w-full flex items-center gap-2 px-2 py-1 text-left text-xs rounded transition-colors',
            isSelected
              ? (theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-700')
              : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-gray-100')
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isDir ? (
            isOpen
              ? <FolderOpen size={14} className="text-amber-500 shrink-0" />
              : <Folder size={14} className="text-amber-500 shrink-0" />
          ) : (
            <FileText size={14} className={clsx('shrink-0', theme === 'dark' ? 'text-slate-500' : 'text-slate-400')} />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {isDir && isOpen && node.children.map((child) => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  if (view === 'home') {
    return (
      <div className={clsx(
          'min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500',
          theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'
      )}>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className={clsx(
                'absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-500',
                theme === 'dark' ? 'bg-blue-600/10' : 'bg-blue-400/20'
            )} />
            <div className={clsx(
                'absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-500',
                theme === 'dark' ? 'bg-cyan-600/10' : 'bg-cyan-400/20'
            )} />
        </div>

        <div className="absolute top-6 right-6 z-20">
            <button
                onClick={toggleTheme}
                className={clsx(
                    'p-2 rounded-full transition-all duration-300',
                    theme === 'dark'
                        ? 'bg-slate-900 text-yellow-400 hover:bg-slate-800 border border-slate-800'
                        : 'bg-white text-slate-600 hover:bg-gray-100 border border-gray-200 shadow-sm'
                )}
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>

        <div className="w-full max-w-2xl flex flex-col items-center gap-8 relative z-10">
          <div className="text-center space-y-6">
            <div className={clsx(
                'inline-flex items-center justify-center p-5 rounded-2xl shadow-2xl backdrop-blur-sm mb-2 group transition-all duration-500 border',
                theme === 'dark'
                    ? 'bg-slate-900/50 shadow-blue-500/10 border-slate-800 hover:border-blue-500/50'
                    : 'bg-white shadow-blue-200/50 border-gray-200 hover:border-blue-300'
            )}>
              <Network className={clsx(
                  'w-14 h-14 transition-colors duration-500',
                  theme === 'dark' ? 'text-blue-500 group-hover:text-cyan-400' : 'text-blue-600 group-hover:text-blue-500'
              )} />
            </div>
            <div>
                <h1 className="text-5xl font-bold tracking-tight mb-3">
                  <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>GitHub</span>{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Code Panorama
                  </span>
                </h1>
                <p className={clsx(
                    'text-lg max-w-lg mx-auto leading-relaxed',
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                )}>
                  AI 驱动的代码全景分析引擎，一键洞察项目架构核心
                </p>
            </div>
          </div>

          <div className="w-full relative">
            {homeSourceType === 'github' ? (
              <RepoInput onAnalyze={(url) => handleAnalyze(url, 'github')} isLoading={isAnalyzing} theme={theme} topContent={homeSourceTabs} />
            ) : (
              <LocalPathInput onAnalyze={(path) => handleAnalyze(path, 'local')} isLoading={isAnalyzing} theme={theme} topContent={homeSourceTabs} />
            )}

            <div className="mt-6 flex justify-center">
          <button
                onClick={triggerImport}
                className={clsx(
                    'group flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-sm backdrop-blur-sm',
                    theme === 'dark'
                        ? 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800'
                        : 'bg-white/80 border-gray-200 text-slate-500 hover:text-slate-800 hover:border-gray-300 hover:bg-white shadow-sm'
                )}
              >
                <Upload size={16} className={theme === 'dark' ? 'group-hover:text-cyan-400 transition-colors' : 'text-blue-500'} />
                导入工程文件 (MD/JSON)
              </button>
            </div>
          </div>

        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".json,.md"
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={clsx(
        'h-screen flex flex-col overflow-hidden transition-colors duration-500',
        theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-gray-50 text-slate-800'
    )}>
      <header className={clsx(
          'backdrop-blur-md border-b px-6 py-3 flex items-center justify-between shrink-0 z-20 shadow-lg',
          theme === 'dark'
            ? 'bg-slate-900/80 border-slate-800 shadow-black/20'
            : 'bg-white/80 border-gray-200 shadow-slate-200/50'
      )}>
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToHome}
            className={clsx(
                'p-2 rounded-full transition-colors',
                theme === 'dark'
                    ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                    : 'hover:bg-gray-100 text-slate-500 hover:text-slate-800'
            )}
            title="返回首页"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className={clsx(
                'p-1.5 rounded-lg border',
                theme === 'dark'
                    ? 'bg-blue-500/10 border-blue-500/20'
                    : 'bg-blue-50 border-blue-100'
            )}>
              <Network className={clsx('w-5 h-5', theme === 'dark' ? 'text-blue-400' : 'text-blue-600')} />
            </div>
            <h1 className={clsx('font-bold text-lg tracking-tight', theme === 'dark' ? 'text-slate-100' : 'text-slate-800')}>
              {graphData?.repoName || displayRepoUrl || 'Project Analysis'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button
                onClick={toggleTheme}
                className={clsx(
                    'p-2 rounded-lg transition-all duration-300 mr-2',
                    theme === 'dark'
                        ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 border border-slate-700'
                        : 'bg-gray-100 text-slate-600 hover:bg-gray-200 border border-gray-200'
                )}
                title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className={clsx(
            'w-96 border-r flex flex-col shrink-0 overflow-y-auto z-10 scrollbar-custom transition-colors duration-500',
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        )}>
           {(graphData || displayRepoUrl) && (
             <div className="p-6 space-y-8">
               <div>
                 <h2 className={clsx('text-xs font-bold uppercase tracking-widest mb-4', theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>
                   Agent 工作日志
                 </h2>
                 <div className={clsx(
                   'rounded-xl border overflow-hidden',
                   theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-gray-200'
                 )}>
                   <div className={clsx(
                     'px-3 py-2 text-[11px] font-mono border-b flex items-center justify-between gap-2',
                     theme === 'dark' ? 'text-slate-400 border-slate-800 bg-slate-900/60' : 'text-slate-500 border-gray-200 bg-gray-50'
                   )}>
                     <div className="inline-flex items-center gap-2">
                       <Terminal size={13} className="text-blue-500" />
                       <span>Agent 工作日志</span>
                     </div>
                     <button
                       type="button"
                       onClick={() => setIsAgentFullscreenOpen(true)}
                       className={clsx(
                         'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] transition-colors',
                         theme === 'dark'
                           ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                           : 'border-gray-200 text-slate-600 hover:bg-gray-50'
                       )}
                       title="全屏查看 Agent 面板"
                     >
                       <Maximize2 size={11} />
                       全屏
                     </button>
                   </div>
                   <div className="h-80">
                     {panelLogs.length > 0 || status !== 'idle' ? (
                       <AgentLog logs={panelLogs} status={status} theme={theme} hideHeader embedded />
                     ) : (
                       <div className={clsx(
                         'h-full flex items-center justify-center text-sm',
                         theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                       )}>
                         等待开始分析
                       </div>
                     )}
                   </div>
                   <div className={clsx(
                     'border-t px-3 py-2 text-[11px] grid grid-cols-3 gap-2',
                     theme === 'dark' ? 'border-slate-800 bg-slate-950/50 text-slate-300' : 'border-gray-200 bg-gray-50 text-slate-700'
                   )}>
                     <div className="min-w-0">
                       <div className={clsx('opacity-70', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>输入 Token</div>
                       <div className="font-mono truncate">{mergedAiUsageStats.inputTokens.toLocaleString()}</div>
                     </div>
                     <div className="min-w-0">
                       <div className={clsx('opacity-70', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>输出 Token</div>
                       <div className="font-mono truncate">{mergedAiUsageStats.outputTokens.toLocaleString()}</div>
                     </div>
                     <div className="min-w-0">
                       <div className={clsx('opacity-70', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>AI 调用次数</div>
                       <div className="font-mono truncate">{mergedAiUsageStats.callCount.toLocaleString()}</div>
                     </div>
                   </div>
                 </div>
               </div>

               <div>
                 <h2 className={clsx('text-xs font-bold uppercase tracking-widest mb-4', theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>分析状态</h2>
                 <div className={clsx(
                   'rounded-xl p-4 border text-sm',
                   theme === 'dark' ? 'bg-slate-950/50 border-slate-800 text-slate-300' : 'bg-gray-50 border-gray-200 text-slate-700'
                 )}>
                   <div className="mb-2">
                     <div className="flex items-center gap-2 min-w-0">
                       <div
                         className={clsx(
                           'font-mono text-xs opacity-80 min-w-0 flex-1',
                           isRepoUrlExpanded ? 'whitespace-normal break-all' : 'truncate',
                           theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                         )}
                         title={displayRepoUrl || graphData?.repoName || '未开始'}
                       >
                         {displayRepoUrl || graphData?.repoName || '未开始'}
                       </div>
                       {!isRepoUrlExpanded && (
                         <button
                           type="button"
                           onClick={() => setIsRepoUrlExpanded(true)}
                           className={clsx(
                             'shrink-0 px-1.5 py-0.5 rounded text-[10px] border',
                             theme === 'dark'
                               ? 'text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-600'
                               : 'text-slate-500 border-gray-200 hover:text-slate-700 hover:border-gray-300'
                           )}
                           title="查看完整项目地址"
                         >
                           ...
                         </button>
                       )}
                       {isRepoUrlExpanded && (
                         <button
                           type="button"
                           onClick={() => setIsRepoUrlExpanded(false)}
                           className={clsx(
                             'shrink-0 px-1.5 py-0.5 rounded text-[10px] border',
                             theme === 'dark'
                               ? 'text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-600'
                               : 'text-slate-500 border-gray-200 hover:text-slate-700 hover:border-gray-300'
                           )}
                           title="收起项目地址"
                         >
                           收起
                         </button>
                       )}
                     </div>
                   </div>
                   <div className="flex items-center justify-between">
                     <span>当前阶段</span>
                     <span className="text-xs font-mono">{status}</span>
                   </div>
                   <div className="flex items-center justify-between mt-2">
                     <span>节点数</span>
                     <span className="text-xs font-mono">{graphData?.nodes?.length || 0}</span>
                   </div>
                   <div className="flex items-center justify-between mt-2">
                     <span>连线数</span>
                     <span className="text-xs font-mono">{graphData?.edges?.length || 0}</span>
                   </div>
                   <div className="mt-3 flex items-center gap-2">
                     <button
                       type="button"
                       onClick={stopAnalysis}
                       disabled={!isAnalyzing}
                       className={clsx(
                         'flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                         theme === 'dark'
                           ? 'border-rose-700/70 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'
                           : 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100'
                       )}
                     >
                       停止分析
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         const target = displayRepoUrl || repoUrl;
                         if (!target) return;
                         const sourceType = /^https?:\/\//i.test(target) ? 'github' as const : 'local' as const;
                         handleAnalyze(target, sourceType);
                       }}
                       disabled={isAnalyzing || !(displayRepoUrl || repoUrl)}
                       className={clsx(
                         'flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                         theme === 'dark'
                           ? 'border-blue-700/70 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20'
                           : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                       )}
                     >
                       重新分析
                     </button>
                   </div>
                 </div>
               </div>

               <div>
                 <h2 className={clsx('text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2', theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>
                   <Code2 size={14} className="text-blue-500" />
                   项目简介
                 </h2>
                 <div className={clsx(
                     'rounded-xl p-4 border transition-colors',
                     theme === 'dark'
                        ? 'bg-slate-950/50 border-slate-800/50 hover:border-slate-700'
                        : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                 )}>
                   <p className={clsx('text-sm leading-relaxed', isSummaryExpanded ? '' : 'line-clamp-6', theme === 'dark' ? 'text-slate-300' : 'text-slate-600')}>
                     {graphData?.project?.summary || '暂无简介'}
                   </p>
                   {graphData?.project?.summary && (
                     <button
                       onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                       className={clsx('mt-3 text-xs font-medium flex items-center gap-1 transition-colors', theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700')}
                     >
                       {isSummaryExpanded ? (
                         <>收起 <ChevronUp size={12} /></>
                       ) : (
                         <>查看更多 <ChevronDown size={12} /></>
                       )}
                     </button>
                   )}
                 </div>
               </div>

               <div>
                 <h2 className={clsx('text-xs font-bold uppercase tracking-widest mb-4', theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>技术栈</h2>
                 <div className="flex flex-wrap gap-2">
                   {(graphData?.project?.techStack || []).map((tech) => (
                     <span
                       key={tech}
                       className={clsx(
                           'px-3 py-1 border rounded-md text-xs font-medium shadow-sm transition-all cursor-default',
                           theme === 'dark'
                            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600'
                            : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50 hover:border-gray-300'
                       )}
                     >
                       {tech}
                     </span>
                   ))}
                 </div>
               </div>

               <div>
                  <h2 className={clsx('text-xs font-bold uppercase tracking-widest mb-4', theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>模块概览</h2>
                  <div className="space-y-2.5">
                    {(graphData?.modules || []).map(mod => (
                        <button
                            key={mod.id}
                            onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
                            className={clsx(
                                'w-full flex items-center gap-3 text-sm p-2 rounded-lg border transition-all cursor-pointer',
                                activeModule === mod.id
                                    ? 'ring-2 ring-offset-1 ring-offset-transparent'
                                    : 'border-transparent',
                                theme === 'dark'
                                    ? 'text-slate-400 bg-slate-950/30 hover:bg-slate-900 hover:border-slate-800'
                                    : 'text-slate-600 bg-gray-50 hover:bg-white hover:border-gray-200'
                            )}
                            style={{
                                borderColor: activeModule === mod.id ? mod.color : undefined
                            }}
                        >
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: mod.color, boxShadow: `0 0 8px ${mod.color}40`}}></div>
                            <span className="font-mono text-xs flex-1 text-left">{mod.name}</span>
                        </button>
                    ))}
                  </div>
                  {shouldShowReanalyzeModulesButton && (
                    <button
                      type="button"
                      onClick={() => { void reanalyzeModules(); }}
                      disabled={isReanalyzingModules}
                      className={clsx(
                        'mt-3 w-full rounded-lg border px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                        theme === 'dark'
                          ? 'border-amber-700/70 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
                          : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                      )}
                    >
                      {isReanalyzingModules ? '重新分析中...' : '重新分析模块'}
                    </button>
                  )}
               </div>

               <div>
                 <h2 className={clsx('text-xs font-bold uppercase tracking-widest mb-4', theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>工程文件</h2>
                 <div className={clsx(
                   'rounded-xl border overflow-hidden',
                   theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-gray-200'
                 )}>
                   <div className={clsx(
                     'px-3 py-2 text-[11px] font-mono border-b flex items-center justify-between gap-2',
                     theme === 'dark' ? 'text-slate-400 border-slate-800 bg-slate-900/60' : 'text-slate-500 border-gray-200 bg-gray-50'
                   )}>
                     <span>工程文件</span>
                     <button
                       type="button"
                       onClick={() => setIsProjectFilesFullscreenOpen(true)}
                       className={clsx(
                         'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] transition-colors',
                         theme === 'dark'
                           ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                           : 'border-gray-200 text-slate-600 hover:bg-gray-50'
                       )}
                       title="全屏查看工程文件"
                     >
                       <Maximize2 size={11} />
                       全屏
                     </button>
                   </div>
                   <pre className={clsx(
                     'p-3 text-[10px] leading-relaxed max-h-64 overflow-auto whitespace-pre-wrap break-words',
                     theme === 'dark' ? 'text-slate-300 scrollbar-custom' : 'text-slate-700 scrollbar-custom'
                   )}>
                     {projectPanoramaMarkdown || '尚未生成'}
                   </pre>
                 </div>
               </div>

             </div>
           )}
        </div>

        <div className={clsx(
            'flex-1 relative overflow-hidden flex flex-col transition-colors duration-500',
            theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'
        )}>
           <div className={clsx(
               'h-14 border-b flex items-center justify-between px-6 shrink-0 z-10',
               theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white/50 border-gray-200'
           )}>
               <div className="flex items-center gap-4 min-w-0">
                 <div className={clsx('text-sm font-medium flex items-center gap-2 shrink-0', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>
                     <FolderTree size={16} />
                     分析工作台
                 </div>
                 {displayRepoUrl && isDisplayRepoUrlHttp ? (
                   <a
                     href={displayRepoUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className={clsx(
                       'min-w-0 max-w-[560px] inline-flex items-center gap-1.5 text-xs underline underline-offset-2',
                       theme === 'dark' ? 'text-blue-300 hover:text-blue-200' : 'text-blue-700 hover:text-blue-800'
                     )}
                     title={displayRepoUrl}
                   >
                     <Github size={13} className="shrink-0" />
                     <span className="truncate">{displayRepoUrl}</span>
                   </a>
                 ) : null}
               </div>
               <div className="flex items-center gap-2">
                    <div className={clsx(
                      'inline-flex rounded-lg border overflow-hidden',
                      theme === 'dark' ? 'border-slate-700 bg-slate-900/40' : 'border-gray-200 bg-white'
                    )}>
                      {panelButtons.map((btn, idx) => {
                        const Icon = btn.icon;
                        const active = isPanelVisible[btn.key];
                        return (
                          <button
                            key={btn.key}
                            type="button"
                            onClick={() => setIsPanelVisible((prev) => ({ ...prev, [btn.key]: !prev[btn.key] }))}
                            className={clsx(
                              'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors',
                              idx > 0 && (theme === 'dark' ? 'border-l border-slate-700' : 'border-l border-gray-200'),
                              active
                                ? (theme === 'dark' ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-50 text-blue-700')
                                : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-gray-50')
                            )}
                          >
                            <Icon size={13} />
                            {btn.label}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={handleExportPanoramaMd}
                      disabled={!projectPanoramaMarkdown}
                      className={clsx(
                          'flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-lg transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed',
                          theme === 'dark'
                            ? 'text-slate-300 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white hover:shadow-md hover:border-slate-600'
                            : 'text-slate-600 bg-white border-gray-200 hover:bg-gray-50 hover:text-slate-900'
                      )}
                    >
                      <Download size={16} />
                      导出工程文件
                    </button>
                    <button
                      onClick={handleExportImage}
                      disabled={isExportingImage}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 border border-transparent rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <ImageIcon size={16} />
                      {isExportingImage ? '导出中...' : '导出图片'}
                    </button>
               </div>
           </div>

           <div className="flex-1 relative overflow-hidden">
                 {visiblePanelKeys.length === 0 ? (
                  <div className={clsx(
                    'w-full h-full flex items-center justify-center text-sm',
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                  )}>
                    请至少显示一个面板
                  </div>
                 ) : (
                  <Group
                    orientation="horizontal"
                    className="w-full h-full"
                    id="analysis-workspace-panels"
                    defaultLayout={visiblePanelKeys.reduce<Record<string, number>>((acc, key) => {
                      acc[key] = normalizedPanelWidths[key];
                      return acc;
                    }, {})}
                    onLayoutChanged={handlePanelLayout}
                  >
                    {visiblePanelKeys.map((panelKey, index) => (
                      <React.Fragment key={panelKey}>
                        <Panel
                          id={panelKey}
                          defaultSize={normalizedPanelWidths[panelKey]}
                          minSize={PANEL_MIN_WIDTH[panelKey]}
                        >
                          {panelKey === 'files' && (
                            <section className={clsx('h-full min-w-[140px] flex flex-col', theme === 'dark' ? 'bg-slate-950/70' : 'bg-white')}>
                              <div className={clsx('px-4 py-3 border-b text-sm font-medium shrink-0 flex items-center gap-2', theme === 'dark' ? 'border-slate-800 text-slate-300 bg-slate-900/60' : 'border-gray-200 text-slate-700 bg-gray-50')}>
                                <ListTree size={14} /> 文件列表面板
                              </div>
                              <div className={clsx('flex-1 min-h-0 overflow-auto p-2 scrollbar-custom', theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
                                {fileTree.length > 0 ? fileTree.map((node) => renderTreeNode(node)) : (
                                  <div className={clsx('text-xs px-2 py-3', theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>
                                    暂无文件列表数据
                                  </div>
                                )}
                              </div>
                            </section>
                          )}

                          {panelKey === 'source' && (
                            <section className={clsx('h-full min-w-[240px] flex flex-col', theme === 'dark' ? 'bg-slate-950' : 'bg-white')}>
                              <div className={clsx('px-4 py-3 border-b text-sm font-medium shrink-0 flex items-center justify-between', theme === 'dark' ? 'border-slate-800 text-slate-300 bg-slate-900/60' : 'border-gray-200 text-slate-700 bg-gray-50')}>
                                <div className="flex items-center gap-2">
                                  <FileCode2 size={14} />
                                  <span>源代码面板</span>
                                  <span className={clsx('text-xs font-mono truncate max-w-[360px]', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')} title={selectedFile || '未选择文件'}>
                                    {selectedFile ? ` / ${selectedFile}` : ''}
                                  </span>
                                </div>
                                {selectedNode?.line ? (
                                  <div className={clsx('text-[11px] font-mono flex items-center gap-1', theme === 'dark' ? 'text-cyan-300' : 'text-cyan-700')}>
                                    <Target size={12} /> L{selectedNode.line}
                                  </div>
                                ) : null}
                              </div>
                              <div className={clsx('px-3 py-1.5 border-b text-[11px] font-mono', theme === 'dark' ? 'border-slate-800 bg-slate-900/30 text-slate-400' : 'border-gray-200 bg-gray-50 text-slate-500')}>
                                使用 Ctrl/Cmd + F 进行源码搜索（Monaco 原生查找）
                              </div>
                              <div className={clsx('flex-1 min-h-0 overflow-auto scrollbar-custom', theme === 'dark' ? 'bg-slate-950' : 'bg-white')}>
                                {sourceLoading ? (
                                  <div className={clsx('h-full flex items-center justify-center text-sm', theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>
                                    正在加载源码...
                                  </div>
                                ) : sourceError ? (
                                  <div className={clsx('p-4 text-xs', theme === 'dark' ? 'text-amber-300' : 'text-amber-700')}>
                                    {sourceError}
                                  </div>
                                ) : sourceCode ? (
                                  <Editor
                                    path={selectedFile || 'source-code'}
                                    language={detectMonacoLanguageFromPath(selectedFile)}
                                    value={sourceCode}
                                    onMount={handleSourceEditorMount}
                                    theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                                    options={{
                                      readOnly: true,
                                      minimap: { enabled: false },
                                      scrollBeyondLastLine: false,
                                      smoothScrolling: true,
                                      automaticLayout: true,
                                      fontSize: 12,
                                      lineNumbersMinChars: 4,
                                      wordWrap: 'on',
                                    }}
                                  />
                                ) : (
                                  <div className={clsx('h-full flex items-center justify-center text-sm', theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}>
                                    选择函数节点或文件以查看源码
                                  </div>
                                )}
                              </div>
                            </section>
                          )}

                          {panelKey === 'panorama' && (
                            <section className={clsx('h-full min-w-[280px]', theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50')}>
                              {graphData ? (
                                <GraphViewer
                                  data={graphData}
                                  ref={graphViewerRef}
                                  theme={theme}
                                  activeModule={activeModule}
                                  onManualDrill={manualDrillNode}
                                  maxDrillDepth={maxDrillDepth}
                                  onSelectNode={handleGraphNodeSelect}
                                  onUpdateNodeDescription={handleUpdateNodeDescription}
                                />
                              ) : (
                                <div className={clsx(
                                  'h-full flex items-center justify-center text-sm',
                                  theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                                )}>
                                  正在准备全景图画布...
                                </div>
                              )}
                            </section>
                          )}
                        </Panel>

                        {index < visiblePanelKeys.length - 1 && (
                          <Separator
                            className={clsx(
                              'w-1.5 shrink-0 cursor-col-resize transition-colors',
                              theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-200 hover:bg-gray-300'
                            )}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </Group>
                 )}
           </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json,.md"
        className="hidden"
      />

      {isAgentFullscreenOpen && (
        <div className={clsx(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          theme === 'dark' ? 'bg-slate-950/85' : 'bg-slate-900/55'
        )}>
          <div className={clsx(
            'w-[min(1080px,92vw)] h-[min(88vh,900px)] rounded-xl border overflow-hidden flex flex-col',
            theme === 'dark' ? 'border-slate-800 bg-slate-950/90' : 'border-gray-200 bg-white/95'
          )}>
            <div className={clsx(
              'h-14 px-5 border-b flex items-center justify-between backdrop-blur-sm shrink-0',
              theme === 'dark' ? 'border-slate-800 bg-slate-950/85' : 'border-gray-200 bg-white/90'
            )}>
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-blue-500" />
                <span className={clsx('text-sm font-medium', theme === 'dark' ? 'text-slate-200' : 'text-slate-800')}>
                  Agent 工作日志（全屏）
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAgentFullscreenOpen(false)}
                className={clsx(
                  'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors',
                  theme === 'dark'
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-gray-200 text-slate-600 hover:bg-gray-100'
                )}
              >
                <X size={14} />
                关闭
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {panelLogs.length > 0 || status !== 'idle' ? (
                <AgentLog logs={panelLogs} status={status} theme={theme} hideHeader embedded />
              ) : (
                <div className={clsx(
                  'h-full flex items-center justify-center text-sm',
                  theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                )}>
                  等待开始分析
                </div>
              )}
            </div>
            <div className={clsx(
              'shrink-0 border-t px-4 py-2 text-[11px] grid grid-cols-3 gap-2',
              theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-300' : 'border-gray-200 bg-gray-50 text-slate-700'
            )}>
              <div className="min-w-0">
                <div className={clsx('opacity-70', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>输入 Token</div>
                <div className="font-mono truncate">{mergedAiUsageStats.inputTokens.toLocaleString()}</div>
              </div>
              <div className="min-w-0">
                <div className={clsx('opacity-70', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>输出 Token</div>
                <div className="font-mono truncate">{mergedAiUsageStats.outputTokens.toLocaleString()}</div>
              </div>
              <div className="min-w-0">
                <div className={clsx('opacity-70', theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}>AI 调用次数</div>
                <div className="font-mono truncate">{mergedAiUsageStats.callCount.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProjectFilesFullscreenOpen && (
        <div className={clsx(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          theme === 'dark' ? 'bg-slate-950/85' : 'bg-slate-900/55'
        )}>
          <div className={clsx(
            'w-[min(1200px,94vw)] h-[min(90vh,980px)] rounded-xl border overflow-hidden flex flex-col',
            theme === 'dark' ? 'border-slate-800 bg-slate-950/90' : 'border-gray-200 bg-white/95'
          )}>
            <div className={clsx(
              'h-14 px-5 border-b flex items-center justify-between backdrop-blur-sm shrink-0',
              theme === 'dark' ? 'border-slate-800 bg-slate-950/85' : 'border-gray-200 bg-white/90'
            )}>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                <span className={clsx('text-sm font-medium', theme === 'dark' ? 'text-slate-200' : 'text-slate-800')}>
                  工程文件（全屏）
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectFilesFullscreenOpen(false)}
                className={clsx(
                  'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors',
                  theme === 'dark'
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-gray-200 text-slate-600 hover:bg-gray-100'
                )}
              >
                <X size={14} />
                关闭
              </button>
            </div>
            <div className={clsx(
              'flex-1 min-h-0 overflow-auto p-4',
              theme === 'dark' ? 'bg-slate-950 text-slate-300 scrollbar-custom' : 'bg-white text-slate-700 scrollbar-custom'
            )}>
              <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                {projectPanoramaMarkdown || '尚未生成'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
