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
  Clock3,
  Settings,
  Sun,
  Moon,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Group, Panel, Separator } from 'react-resizable-panels';
import Editor, { OnMount } from '@monaco-editor/react';
import { useDevRefreshDiagnostics } from './hooks/useDevRefreshDiagnostics';

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

type HistoryListItem = {
  id: string;
  name: string;
  sourceType: 'github' | 'local';
  source: string;
  createdAt: string;
  language: string;
  techStack: string[];
  mdFile: string;
};

type HistoryStoredRecord = HistoryListItem & {
  markdown: string;
  graphData: GraphData;
  logs: LogEntry[];
  aiUsageStats: AiUsageStats;
};

type AppSettings = {
  theme: 'light' | 'dark';
  githubToken: string;
  llmBaseUrl: string;
  llmModel: string;
  llmApiKey: string;
  maxDrillDepth: number;
  maxChildCallsPerFunction: number;
};

const PANEL_MIN_WIDTH: Record<PanelKey, number> = {
  files: 8,
  source: 18,
  panorama: 18,
};
const HISTORY_PAGE_SIZE = 10;
const HISTORY_STORAGE_KEY = 'code-panorama-history-items';

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

function readLocalHistoryRecords(): HistoryStoredRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(Boolean);
  } catch {
    return [];
  }
}

function writeLocalHistoryRecords(items: HistoryStoredRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

function App() {
  const THEME_STORAGE_KEY = 'code-panorama-theme';
  const APP_SETTINGS_STORAGE_KEY = 'code-panorama-settings';
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === 'undefined') {
      return {
        theme: 'dark',
        githubToken: '',
        llmBaseUrl: '',
        llmModel: '',
        llmApiKey: '',
        maxDrillDepth: 2,
        maxChildCallsPerFunction: 10,
      };
    }
    try {
      const raw = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
      if (!raw) {
        const fallbackTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        return {
          theme: fallbackTheme === 'light' || fallbackTheme === 'dark' ? fallbackTheme : 'dark',
          githubToken: '',
          llmBaseUrl: '',
          llmModel: '',
          llmApiKey: '',
          maxDrillDepth: 2,
          maxChildCallsPerFunction: 10,
        };
      }
      const parsed = JSON.parse(raw);
      return {
        theme: parsed?.theme === 'light' ? 'light' : 'dark',
        githubToken: String(parsed?.githubToken || ''),
        llmBaseUrl: String(parsed?.llmBaseUrl || ''),
        llmModel: String(parsed?.llmModel || ''),
        llmApiKey: String(parsed?.llmApiKey || ''),
        maxDrillDepth: Math.max(1, Math.min(5, Number(parsed?.maxDrillDepth || 2) || 2)),
        maxChildCallsPerFunction: Math.max(5, Math.min(20, Number(parsed?.maxChildCallsPerFunction || 10) || 10)),
      };
    } catch {
      return {
        theme: 'dark',
        githubToken: '',
        llmBaseUrl: '',
        llmModel: '',
        llmApiKey: '',
        maxDrillDepth: 2,
        maxChildCallsPerFunction: 10,
      };
    }
  });
  const theme = settings.theme;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLlmApiKey, setShowLlmApiKey] = useState(false);
  const settingsSnapshotRef = useRef<AppSettings | null>(null);
  const openSettings = () => {
    settingsSnapshotRef.current = { ...settings };
    setShowLlmApiKey(false);
    setIsSettingsOpen(true);
  };
  const cancelSettings = () => {
    if (settingsSnapshotRef.current) {
      setSettings(settingsSnapshotRef.current);
    }
    setShowLlmApiKey(false);
    setIsSettingsOpen(false);
  };
  const saveSettings = () => {
    settingsSnapshotRef.current = null;
    setShowLlmApiKey(false);
    setIsSettingsOpen(false);
  };
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
  } = useGithubAgent({
    llmBaseUrl: settings.llmBaseUrl,
    llmModel: settings.llmModel,
    llmApiKey: settings.llmApiKey,
    maxDrillDepth: settings.maxDrillDepth,
    maxChildCallsPerFunction: settings.maxChildCallsPerFunction,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const graphViewerRef = useRef<GraphViewerRef>(null);
  const sourceEditorRef = useRef<any>(null);
  const sourceMonacoRef = useRef<any>(null);
  const sourceDecorationIdsRef = useRef<string[]>([]);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isRepoUrlExpanded, setIsRepoUrlExpanded] = useState(false);
  const [homeSourceType, setHomeSourceType] = useState<'github' | 'local'>('github');
  const [view, setView] = useState<'home' | 'result'>('home');
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
  const [historyItems, setHistoryItems] = useState<HistoryListItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [loadingHistoryId, setLoadingHistoryId] = useState<string | null>(null);
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const autoSaveStateRef = useRef<{ armed: boolean; lastSavedFingerprint: string }>({ armed: false, lastSavedFingerprint: '' });
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
  const totalHistoryPages = Math.max(1, Math.ceil(historyItems.length / HISTORY_PAGE_SIZE));
  const pagedHistoryItems = useMemo(() => {
    const start = (historyPage - 1) * HISTORY_PAGE_SIZE;
    return historyItems.slice(start, start + HISTORY_PAGE_SIZE);
  }, [historyItems, historyPage]);
  const {
    enabled: devDiagnosticsEnabled,
    append: appendDevDiagnostic,
  } = useDevRefreshDiagnostics({
    component: 'App',
    getSnapshot: () => ({
      view,
      status,
      homeSourceType,
      hasGraphData: Boolean(graphData),
      repoUrl: displayRepoUrl,
      selectedFile,
      selectedNodeId: selectedNode?.id || '',
      historyCount: historyItems.length,
    }),
  });

  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const items = readLocalHistoryRecords()
        .map(({ markdown, graphData, logs, aiUsageStats, ...rest }) => rest)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHistoryItems(items);
    } catch (error: any) {
      setHistoryError(error?.message || '加载历史记录失败');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

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
      theme === 'dark' ? 'border-stone-800 bg-stone-900/35' : 'border-amber-100 bg-amber-50/85'
    )}>
      <div className="flex items-end gap-6">
        <button
          type="button"
          onClick={() => setHomeSourceType('github')}
          className={clsx(
            'relative inline-flex items-center gap-2 pb-3 text-sm font-semibold transition-colors',
            homeSourceType === 'github'
              ? (theme === 'dark' ? 'text-amber-300' : 'text-amber-700')
              : (theme === 'dark' ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-700')
          )}
        >
          <Github size={15} />
          GitHub 仓库
          <span className={clsx(
            'pointer-events-none absolute -bottom-px left-0 h-0.5 w-full rounded-full transition-opacity',
            theme === 'dark' ? 'bg-amber-400' : 'bg-amber-600',
            homeSourceType === 'github' ? 'opacity-100' : 'opacity-0'
          )} />
        </button>
        <button
          type="button"
          onClick={() => setHomeSourceType('local')}
          className={clsx(
            'relative inline-flex items-center gap-2 pb-3 text-sm font-semibold transition-colors',
            homeSourceType === 'local'
              ? (theme === 'dark' ? 'text-amber-300' : 'text-amber-700')
              : (theme === 'dark' ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-700')
          )}
        >
          <FolderOpen size={15} />
          本地目录
          <span className={clsx(
            'pointer-events-none absolute -bottom-px left-0 h-0.5 w-full rounded-full transition-opacity',
            theme === 'dark' ? 'bg-amber-400' : 'bg-amber-600',
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

  useEffect(() => {
    if (!devDiagnosticsEnabled) return;
    appendDevDiagnostic('view', `view changed to ${view}`, {
      status,
      hasGraphData: Boolean(graphData),
      repoUrl: displayRepoUrl,
    });
  }, [appendDevDiagnostic, devDiagnosticsEnabled, displayRepoUrl, graphData, status, view]);

  useEffect(() => {
    if (!devDiagnosticsEnabled) return;
    appendDevDiagnostic('status', `analysis status=${status}`, {
      view,
      hasGraphData: Boolean(graphData),
      nodeCount: graphData?.nodes?.length || 0,
      edgeCount: graphData?.edges?.length || 0,
    });
  }, [appendDevDiagnostic, devDiagnosticsEnabled, graphData, status, view]);

  useEffect(() => {
    let cancelled = false;
    const hydrateLlmDefaultsFromEnv = async () => {
      try {
        const response = await fetch('/api/settings/llm-defaults', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = await response.json();
        if (cancelled) return;
        const envBaseUrl = String(payload?.llmBaseUrl || '').trim();
        const envModel = String(payload?.llmModel || '').trim();
        setSettings((prev) => ({
          ...prev,
          llmBaseUrl: prev.llmBaseUrl.trim() || envBaseUrl,
          llmModel: prev.llmModel.trim() || envModel,
        }));
      } catch {
        // ignore fetch errors
      }
    };
    void hydrateLlmDefaultsFromEnv();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, settings.theme);
      window.localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore storage errors
    }
  }, [settings, APP_SETTINGS_STORAGE_KEY, THEME_STORAGE_KEY]);

  useEffect(() => {
    void refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    setHistoryPage((prev) => Math.min(Math.max(1, prev), totalHistoryPages));
  }, [totalHistoryPages]);

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
    const llmBaseUrl = settings.llmBaseUrl.trim();
    const llmModel = settings.llmModel.trim();
    const llmApiKey = settings.llmApiKey.trim();
    const githubToken = settings.githubToken.trim();

    if (!llmBaseUrl || !llmModel || !llmApiKey) {
      window.alert('请先在设置中完善 AI 配置后再开始分析。');
      return;
    }

    if (sourceType === 'github' && !githubToken) {
      window.alert('请先在设置中填写 GitHub Token 后再开始分析。');
      return;
    }

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
    autoSaveStateRef.current.armed = true;
    analyzeRepo(url, sourceType === 'github' ? githubToken : undefined, sourceType);
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
          autoSaveStateRef.current.armed = false;
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

  const handleLoadHistory = useCallback(async (id: string) => {
    if (!id || loadingHistoryId) return;
    setLoadingHistoryId(id);
    try {
      const item = readLocalHistoryRecords().find((record) => record.id === id);
      if (!item?.graphData) {
        throw new Error('加载历史工程失败');
      }
      clearFileCache();
      setImportedLogs(Array.isArray(item.logs) ? item.logs : []);
      setImportedAiUsage({
        inputTokens: Number(item?.aiUsageStats?.inputTokens || 0) || 0,
        outputTokens: Number(item?.aiUsageStats?.outputTokens || 0) || 0,
        callCount: Number(item?.aiUsageStats?.callCount || 0) || 0,
      });
      setImportedAiUsageStats({ inputTokens: 0, outputTokens: 0, callCount: 0 });
      autoSaveStateRef.current.armed = false;
      setLastExportFingerprint(null);
      hydrateImportedContext(item.graphData, String(item.markdown || item.graphData?.panoramaMarkdown || ''));
      setView('result');
    } catch (error: any) {
      alert(error?.message || '加载历史工程失败');
    } finally {
      setLoadingHistoryId(null);
    }
  }, [clearFileCache, hydrateImportedContext, loadingHistoryId, setImportedAiUsageStats]);

  const handleDeleteHistory = useCallback(async (id: string) => {
    if (!id || loadingHistoryId || deletingHistoryId) return;
    const ok = window.confirm('确认删除这个历史工程吗？删除后不可恢复。');
    if (!ok) return;
    setDeletingHistoryId(id);
    try {
      const nextItems = readLocalHistoryRecords().filter((record) => record.id !== id);
      writeLocalHistoryRecords(nextItems);
      await refreshHistory();
    } catch (error: any) {
      alert(error?.message || '删除历史工程失败');
    } finally {
      setDeletingHistoryId(null);
    }
  }, [deletingHistoryId, loadingHistoryId, refreshHistory]);

  const handleReanalyzeModules = useCallback(async () => {
    autoSaveStateRef.current.armed = true;
    setLastExportFingerprint(null);
    await reanalyzeModules();
  }, [reanalyzeModules]);

  useEffect(() => {
    if (status !== 'complete') return;
    if (!autoSaveStateRef.current.armed) return;
    if (!graphData || !projectPanoramaMarkdown) return;

    const fingerprint = getCurrentExportFingerprint();
    if (!fingerprint || autoSaveStateRef.current.lastSavedFingerprint === fingerprint) {
      autoSaveStateRef.current.armed = false;
      return;
    }

    const source = graphData.repoUrl || displayRepoUrl || repoUrl || '';
    if (!source) return;

    const sourceType: 'github' | 'local' = /^https?:\/\//i.test(source) ? 'github' : 'local';
    const name = graphData.repoName || source.split('/').filter(Boolean).pop() || 'project';

    const run = async () => {
      try {
        const nextRecord: HistoryStoredRecord = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
          name,
          sourceType,
          source,
          createdAt: new Date().toISOString(),
          language: graphData.project?.language || 'Unknown',
          techStack: Array.isArray(graphData.project?.techStack) ? graphData.project.techStack.slice(0, 20) : [],
          mdFile: '',
          markdown: fingerprint,
          graphData,
          logs: panelLogs,
          aiUsageStats: mergedAiUsageStats,
        };
        const existing = readLocalHistoryRecords().filter((record) => record.source !== source);
        writeLocalHistoryRecords([nextRecord, ...existing].slice(0, 50));
        autoSaveStateRef.current.lastSavedFingerprint = fingerprint;
        autoSaveStateRef.current.armed = false;
        await refreshHistory();
      } catch (error) {
        console.error('Auto save history failed:', error);
      }
    };
    void run();
  }, [
    status,
    graphData,
    projectPanoramaMarkdown,
    getCurrentExportFingerprint,
    displayRepoUrl,
    repoUrl,
    panelLogs,
    mergedAiUsageStats,
    refreshHistory,
  ]);

  const handleBackToHome = useCallback(() => {
    setView('home');
  }, []);

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

  const settingsModal = isSettingsOpen ? (
    <div
      className={clsx(
        'fixed inset-0 z-[60] flex items-center justify-center p-4',
        theme === 'dark' ? 'bg-black/70' : 'bg-stone-900/45'
      )}
      onClick={cancelSettings}
    >
      <div
        className={clsx(
          'w-[min(520px,94vw)] max-h-[min(88vh,720px)] rounded-2xl border overflow-hidden flex flex-col shadow-2xl',
          theme === 'dark' ? 'border-stone-600 bg-stone-800 shadow-black/60 ring-1 ring-stone-700/50' : 'border-stone-200 bg-white shadow-stone-400/30'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={clsx(
          'px-6 py-4 border-b flex items-center justify-between shrink-0',
          theme === 'dark' ? 'border-stone-700' : 'border-stone-200'
        )}>
          <div className="flex items-center gap-2.5">
            <div className={clsx('p-1.5 rounded-lg', theme === 'dark' ? 'bg-amber-500/15' : 'bg-amber-50')}>
              <Settings size={16} className="text-amber-500" />
            </div>
            <span className={clsx('text-sm font-semibold', theme === 'dark' ? 'text-stone-100' : 'text-stone-800')}>
              系统设置
            </span>
          </div>
          <button
            type="button"
            onClick={cancelSettings}
            className={clsx(
              'p-1.5 rounded-lg transition-colors',
              theme === 'dark'
                ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-700'
                : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
            )}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className={clsx('flex-1 overflow-y-auto p-6 space-y-6 text-sm scrollbar-custom', theme === 'dark' ? 'text-stone-200' : 'text-stone-700')}>
          <section>
            <div
              className={clsx(
                'rounded-xl border px-4 py-3 text-[12px] leading-5',
                theme === 'dark'
                  ? 'border-amber-500/30 bg-amber-500/10 text-stone-300'
                  : 'border-amber-200 bg-amber-50 text-stone-600'
              )}
            >
              <div className={clsx('font-semibold', theme === 'dark' ? 'text-amber-300' : 'text-amber-700')}>
                设置保存说明
              </div>
              <div className="mt-1">
                本页面中的全部设置仅保存在当前浏览器本地，包括外观、GitHub 配置、AI 模型配置和分析参数；这些数据不会保存到服务端，也不会同步给其他设备或用户。
              </div>
              <a
                href="https://github.com/xuanyuanzhifeng/code-panorama"
                target="_blank"
                rel="noreferrer"
                className={clsx(
                  'mt-1.5 inline-flex items-center gap-1 underline underline-offset-2 transition-colors',
                  theme === 'dark' ? 'text-amber-300 hover:text-amber-200' : 'text-amber-700 hover:text-amber-800'
                )}
              >
                项目已开源: github.com/xuanyuanzhifeng/code-panorama
              </a>
            </div>
          </section>

          {/* Theme */}
          <section>
            <div className={clsx('text-xs font-semibold uppercase tracking-wider mb-3', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>
              外观
            </div>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSettings((prev) => ({ ...prev, theme: mode }))}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-medium transition-all',
                    settings.theme === mode
                      ? (theme === 'dark'
                        ? 'border-amber-500/60 bg-amber-500/10 text-amber-300 shadow-sm shadow-amber-500/10'
                        : 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100')
                      : (theme === 'dark'
                        ? 'border-stone-700 text-stone-400 hover:text-stone-200 hover:bg-stone-700/50'
                        : 'border-stone-200 text-stone-500 hover:text-stone-700 hover:bg-stone-50')
                  )}
                >
                  {mode === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                  {mode === 'dark' ? '深色模式' : '浅色模式'}
                </button>
              ))}
            </div>
          </section>

          {/* AI Config */}
          <section>
            <div className={clsx('text-xs font-semibold uppercase tracking-wider mb-3', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>
              GitHub 配置
            </div>
            <div className={clsx(
              'rounded-xl border p-4 space-y-4',
              theme === 'dark' ? 'border-stone-700 bg-stone-900/50' : 'border-stone-200 bg-stone-50/50'
            )}>
              <label className="block">
                <div className={clsx('text-xs font-medium mb-1.5', theme === 'dark' ? 'text-stone-300' : 'text-stone-600')}>GitHub Token</div>
                <input
                  type="password"
                  value={settings.githubToken}
                  onChange={(e) => setSettings((prev) => ({ ...prev, githubToken: e.target.value }))}
                  placeholder="用于私有仓库访问与提高 API 额度"
                  className={clsx(
                    'w-full rounded-lg border px-3 py-2 text-xs outline-none transition-colors focus:ring-1',
                    theme === 'dark'
                      ? 'border-stone-600 bg-stone-800 text-stone-200 placeholder:text-stone-500 focus:border-amber-500/50 focus:ring-amber-500/30'
                      : 'border-stone-300 bg-white text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-200'
                  )}
                />
              </label>
            </div>
          </section>

          <section>
            <div className={clsx('text-xs font-semibold uppercase tracking-wider mb-3', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>
              AI 模型配置
            </div>
            <div className={clsx(
              'rounded-xl border p-4 space-y-4',
              theme === 'dark' ? 'border-stone-700 bg-stone-900/50' : 'border-stone-200 bg-stone-50/50'
            )}>
              <label className="block">
                <div className={clsx('text-xs font-medium mb-1.5', theme === 'dark' ? 'text-stone-300' : 'text-stone-600')}>Base URL</div>
                <input
                  type="text"
                  value={settings.llmBaseUrl}
                  onChange={(e) => setSettings((prev) => ({ ...prev, llmBaseUrl: e.target.value }))}
                  placeholder="留空使用服务端默认值"
                  className={clsx(
                    'w-full rounded-lg border px-3 py-2 text-xs outline-none transition-colors focus:ring-1',
                    theme === 'dark'
                      ? 'border-stone-600 bg-stone-800 text-stone-200 placeholder:text-stone-500 focus:border-amber-500/50 focus:ring-amber-500/30'
                      : 'border-stone-300 bg-white text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-200'
                  )}
                />
              </label>
              <label className="block">
                <div className={clsx('text-xs font-medium mb-1.5', theme === 'dark' ? 'text-stone-300' : 'text-stone-600')}>Model</div>
                <input
                  type="text"
                  value={settings.llmModel}
                  onChange={(e) => setSettings((prev) => ({ ...prev, llmModel: e.target.value }))}
                  placeholder="留空使用服务端默认值"
                  className={clsx(
                    'w-full rounded-lg border px-3 py-2 text-xs outline-none transition-colors focus:ring-1',
                    theme === 'dark'
                      ? 'border-stone-600 bg-stone-800 text-stone-200 placeholder:text-stone-500 focus:border-amber-500/50 focus:ring-amber-500/30'
                      : 'border-stone-300 bg-white text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-200'
                  )}
                />
              </label>
              <label className="block">
                <div className={clsx('text-xs font-medium mb-1.5', theme === 'dark' ? 'text-stone-300' : 'text-stone-600')}>API Key</div>
                <div className="relative">
                  <input
                    type={showLlmApiKey ? 'text' : 'password'}
                    value={settings.llmApiKey}
                    onChange={(e) => setSettings((prev) => ({ ...prev, llmApiKey: e.target.value }))}
                    placeholder="留空使用服务端默认值"
                    className={clsx(
                      'w-full rounded-lg border px-3 py-2 pr-9 text-xs outline-none transition-colors focus:ring-1',
                      theme === 'dark'
                        ? 'border-stone-600 bg-stone-800 text-stone-200 placeholder:text-stone-500 focus:border-amber-500/50 focus:ring-amber-500/30'
                        : 'border-stone-300 bg-white text-stone-700 placeholder:text-stone-400 focus:border-amber-400 focus:ring-amber-200'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLlmApiKey((prev) => !prev)}
                    className={clsx(
                      'absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 transition-colors',
                      theme === 'dark' ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-700'
                    )}
                    title={showLlmApiKey ? '隐藏 API Key' : '显示 API Key'}
                  >
                    {showLlmApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </label>
            </div>
          </section>

          {/* Analysis Params */}
          <section>
            <div className={clsx('text-xs font-semibold uppercase tracking-wider mb-3', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>
              分析参数
            </div>
            <div className={clsx(
              'rounded-xl border p-4 space-y-5',
              theme === 'dark' ? 'border-stone-700 bg-stone-900/50' : 'border-stone-200 bg-stone-50/50'
            )}>
              {/* MAX_DRILL_DEPTH slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className={clsx('text-xs font-medium', theme === 'dark' ? 'text-stone-300' : 'text-stone-600')}>最大下钻深度</div>
                    <div className={clsx('text-[10px] mt-0.5', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>DEFAULT_MAX_DRILL_DEPTH</div>
                  </div>
                  <span className={clsx(
                    'tabular-nums text-sm font-bold min-w-[2ch] text-center',
                    theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                  )}>
                    {settings.maxDrillDepth}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={clsx('text-[10px] shrink-0', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>1</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={settings.maxDrillDepth}
                    onChange={(e) => setSettings((prev) => ({ ...prev, maxDrillDepth: Number(e.target.value) }))}
                    className={clsx(
                      'flex-1 h-1.5 rounded-full appearance-none cursor-pointer',
                      '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer',
                      theme === 'dark'
                        ? 'bg-stone-700 [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:shadow-amber-500/30'
                        : 'bg-stone-200 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow-amber-300/40'
                    )}
                  />
                  <span className={clsx('text-[10px] shrink-0', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>5</span>
                </div>
              </div>

              <div className={clsx('border-t', theme === 'dark' ? 'border-stone-700/60' : 'border-stone-200')} />

              {/* MAX_CHILD_CALLS_PER_FUNCTION slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className={clsx('text-xs font-medium', theme === 'dark' ? 'text-stone-300' : 'text-stone-600')}>单函数最大子调用数</div>
                    <div className={clsx('text-[10px] mt-0.5', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>MAX_CHILD_CALLS_PER_FUNCTION</div>
                  </div>
                  <span className={clsx(
                    'tabular-nums text-sm font-bold min-w-[2ch] text-center',
                    theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                  )}>
                    {settings.maxChildCallsPerFunction}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={clsx('text-[10px] shrink-0', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>5</span>
                  <input
                    type="range"
                    min={5}
                    max={20}
                    step={1}
                    value={settings.maxChildCallsPerFunction}
                    onChange={(e) => setSettings((prev) => ({ ...prev, maxChildCallsPerFunction: Number(e.target.value) }))}
                    className={clsx(
                      'flex-1 h-1.5 rounded-full appearance-none cursor-pointer',
                      '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer',
                      theme === 'dark'
                        ? 'bg-stone-700 [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:shadow-amber-500/30'
                        : 'bg-stone-200 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow-amber-300/40'
                    )}
                  />
                  <span className={clsx('text-[10px] shrink-0', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>20</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className={clsx(
          'px-6 py-4 border-t flex items-center justify-end gap-3 shrink-0',
          theme === 'dark' ? 'border-stone-700' : 'border-stone-200'
        )}>
          <button
            type="button"
            onClick={cancelSettings}
            className={clsx(
              'rounded-lg border px-4 py-2 text-xs font-medium transition-colors',
              theme === 'dark'
                ? 'border-stone-600 text-stone-300 hover:text-stone-100 hover:bg-stone-700'
                : 'border-stone-200 text-stone-600 hover:text-stone-800 hover:bg-stone-50'
            )}
          >
            取消
          </button>
          <button
            type="button"
            onClick={saveSettings}
            className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 px-5 py-2 text-xs font-medium text-white transition-all shadow-sm shadow-amber-900/20 hover:shadow-amber-900/30"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  ) : null;

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
              ? (theme === 'dark' ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-700')
              : (theme === 'dark' ? 'text-stone-300 hover:bg-stone-800' : 'text-stone-700 hover:bg-stone-100')
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isDir ? (
            isOpen
              ? <FolderOpen size={14} className="text-amber-500 shrink-0" />
              : <Folder size={14} className="text-amber-500 shrink-0" />
          ) : (
            <FileText size={14} className={clsx('shrink-0', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')} />
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
          'min-h-screen flex flex-col items-center justify-start p-6 pt-10 pb-10 relative overflow-hidden transition-colors duration-500',
          theme === 'dark' ? 'bg-stone-900' : 'bg-amber-50/30'
      )}>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className={clsx(
                'absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-500',
                theme === 'dark' ? 'bg-amber-600/10' : 'bg-amber-400/20'
            )} />
            <div className={clsx(
                'absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-500',
                theme === 'dark' ? 'bg-orange-600/10' : 'bg-orange-400/20'
            )} />
        </div>

        <div className="absolute top-6 right-6 z-20">
            <button
                onClick={openSettings}
                className={clsx(
                    'p-2 rounded-full transition-all duration-300',
                    theme === 'dark'
                        ? 'bg-stone-900 text-amber-400 hover:bg-stone-800 border border-stone-800'
                        : 'bg-white text-stone-600 hover:bg-amber-50 border border-amber-200 shadow-sm'
                )}
                title="设置"
            >
                <Settings size={20} />
            </button>
        </div>

        <div className="w-full max-w-5xl flex flex-col items-center gap-8 relative z-10">
          <div className="text-center space-y-6">
            <div className={clsx(
                'inline-flex items-center justify-center p-5 rounded-2xl shadow-2xl backdrop-blur-sm mb-2 group transition-all duration-500 border',
                theme === 'dark'
                    ? 'bg-stone-900/50 shadow-amber-500/10 border-stone-800 hover:border-amber-500/50'
                    : 'bg-white shadow-amber-200/50 border-amber-100 hover:border-amber-300'
            )}>
              <Network className={clsx(
                  'w-14 h-14 transition-colors duration-500',
                  theme === 'dark' ? 'text-amber-500 group-hover:text-orange-400' : 'text-amber-600 group-hover:text-amber-500'
              )} />
            </div>
            <div>
                <h1 className="text-5xl font-bold tracking-tight mb-3">
                  <span className={theme === 'dark' ? 'text-white' : 'text-stone-900'}>Code</span>{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                    Panorama
                  </span>
                </h1>
                <p className={clsx(
                    'text-lg max-w-lg mx-auto leading-relaxed',
                    theme === 'dark' ? 'text-stone-400' : 'text-stone-600'
                )}>
                  AI 驱动的代码全景分析引擎，一键洞察项目架构核心
                </p>
            </div>
          </div>

          <div className="w-full relative">
            <div className="max-w-2xl mx-auto">
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
                          ? 'bg-stone-900/50 border-stone-800 text-stone-400 hover:text-white hover:border-stone-600 hover:bg-stone-800'
                          : 'bg-white/80 border-amber-200 text-stone-500 hover:text-stone-800 hover:border-amber-300 hover:bg-white shadow-sm'
                  )}
                >
                  <Upload size={16} className={theme === 'dark' ? 'group-hover:text-orange-400 transition-colors' : 'text-amber-500'} />
                  导入工程文件 (MD/JSON)
                </button>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center justify-between mb-5 px-1">
                <div className="flex items-center gap-2">
                  <div className={clsx('w-1 h-4 rounded-full', theme === 'dark' ? 'bg-amber-500' : 'bg-amber-400')} />
                  <h2 className={clsx('text-sm font-semibold tracking-wide', theme === 'dark' ? 'text-stone-200' : 'text-stone-700')}>
                    历史分析工程
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => { void refreshHistory(); }}
                  className={clsx(
                    'text-xs rounded-md border px-2.5 py-1 transition-colors',
                    theme === 'dark'
                      ? 'border-stone-700 text-stone-400 hover:text-stone-200 hover:bg-stone-800 hover:border-stone-600'
                      : 'border-stone-200 text-stone-500 hover:text-stone-700 hover:bg-white'
                  )}
                >
                  刷新
                </button>
              </div>

              {historyError ? (
                <div className={clsx('rounded-lg border px-3 py-2 text-xs', theme === 'dark' ? 'border-rose-700/40 text-rose-300 bg-rose-500/10' : 'border-rose-200 bg-rose-50 text-rose-700')}>
                  {historyError}
                </div>
              ) : null}

              {historyLoading ? (
                <div className={clsx('rounded-lg border px-3 py-6 text-center text-xs', theme === 'dark' ? 'border-stone-800 text-stone-400' : 'border-stone-200 text-stone-500')}>
                  正在加载历史记录...
                </div>
              ) : historyItems.length === 0 ? (
                <div className={clsx('rounded-lg border px-3 py-6 text-center text-xs', theme === 'dark' ? 'border-stone-800 text-stone-500' : 'border-stone-200 text-stone-500')}>
                  暂无历史工程。完成一次分析后会自动保存到当前浏览器本地。
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pagedHistoryItems.map((item) => {
                    const loading = loadingHistoryId === item.id;
                    const deleting = deletingHistoryId === item.id;
                    const techTags = (item.techStack || []).slice(0, 4);
                    const langColorMap: Record<string, { dark: string; light: string }> = {
                      TypeScript: { dark: 'text-blue-300 bg-blue-500/15', light: 'text-blue-700 bg-blue-50' },
                      JavaScript: { dark: 'text-yellow-300 bg-yellow-500/15', light: 'text-yellow-700 bg-yellow-50' },
                      Python:     { dark: 'text-sky-300 bg-sky-500/15', light: 'text-sky-700 bg-sky-50' },
                      Go:         { dark: 'text-cyan-300 bg-cyan-500/15', light: 'text-cyan-700 bg-cyan-50' },
                      Rust:       { dark: 'text-orange-300 bg-orange-500/15', light: 'text-orange-700 bg-orange-50' },
                      Java:       { dark: 'text-red-300 bg-red-500/15', light: 'text-red-700 bg-red-50' },
                      'C++':      { dark: 'text-pink-300 bg-pink-500/15', light: 'text-pink-700 bg-pink-50' },
                      C:          { dark: 'text-indigo-300 bg-indigo-500/15', light: 'text-indigo-700 bg-indigo-50' },
                      Ruby:       { dark: 'text-rose-300 bg-rose-500/15', light: 'text-rose-700 bg-rose-50' },
                      PHP:        { dark: 'text-violet-300 bg-violet-500/15', light: 'text-violet-700 bg-violet-50' },
                      Swift:      { dark: 'text-orange-300 bg-orange-500/15', light: 'text-orange-700 bg-orange-50' },
                      Kotlin:     { dark: 'text-purple-300 bg-purple-500/15', light: 'text-purple-700 bg-purple-50' },
                      Vue:        { dark: 'text-emerald-300 bg-emerald-500/15', light: 'text-emerald-700 bg-emerald-50' },
                    };
                    const langKey = item.language || '';
                    const langColors = langColorMap[langKey] || { dark: 'text-stone-300 bg-stone-700/50', light: 'text-stone-600 bg-stone-100' };
                    return (
                      <div
                        key={item.id}
                        className={clsx(
                          'group relative rounded-xl border p-4 transition-all duration-200',
                          theme === 'dark'
                            ? 'border-stone-700/60 bg-stone-800/40 hover:bg-stone-800/80 hover:border-stone-600 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5'
                            : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-md hover:shadow-amber-100/40 hover:-translate-y-0.5'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => { void handleLoadHistory(item.id); }}
                          disabled={Boolean(loadingHistoryId || deletingHistoryId)}
                          className="w-full pr-10 text-left disabled:opacity-60"
                        >
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className={clsx('text-sm font-semibold truncate', theme === 'dark' ? 'text-stone-100 group-hover:text-white' : 'text-stone-800')} title={item.name}>
                            {item.name}
                          </div>
                          <span className={clsx(
                            'shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                            item.sourceType === 'github'
                              ? (theme === 'dark' ? 'text-violet-300 bg-violet-500/15' : 'text-violet-700 bg-violet-50')
                              : (theme === 'dark' ? 'text-blue-300 bg-blue-500/15' : 'text-blue-700 bg-blue-50')
                          )}>
                            {item.sourceType === 'github' ? <Github size={10} /> : <FolderOpen size={10} />}
                            {item.sourceType === 'github' ? 'GitHub' : '本地'}
                          </span>
                        </div>

                        <div className={clsx('text-xs truncate font-mono', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')} title={item.source}>
                          {item.source}
                        </div>

                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className={clsx(
                            'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                            theme === 'dark' ? langColors.dark : langColors.light
                          )}>
                            <FileCode2 size={10} />
                            {langKey || 'Unknown'}
                          </span>
                          {techTags.map((tag) => (
                            <span
                              key={`${item.id}_${tag}`}
                              className={clsx(
                                'rounded-md px-1.5 py-0.5 text-[10px]',
                                theme === 'dark' ? 'bg-stone-800/60 text-stone-400' : 'bg-stone-100 text-stone-500'
                              )}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-2.5 flex items-center justify-between">
                          <div className={clsx('flex items-center gap-1 text-[11px]', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>
                            <Clock3 size={10} />
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                          {(loading || deleting) && (
                            <span className={clsx('text-[11px] animate-pulse', theme === 'dark' ? 'text-amber-400' : 'text-amber-600')}>
                              {loading ? '加载中...' : '删除中...'}
                            </span>
                          )}
                        </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => { void handleDeleteHistory(item.id); }}
                          disabled={Boolean(loadingHistoryId || deletingHistoryId)}
                          className={clsx(
                            'absolute bottom-3 right-3 inline-flex items-center justify-center rounded-md border p-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                            theme === 'dark'
                              ? 'border-stone-700 text-stone-400 hover:text-rose-300 hover:border-rose-600/60 hover:bg-rose-500/10'
                              : 'border-stone-200 text-stone-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50'
                          )}
                          title="删除历史工程"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={clsx('text-xs', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>
                      第 {historyPage} / {totalHistoryPages} 页
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                        disabled={historyPage <= 1}
                        className={clsx(
                          'text-xs rounded-md border px-2.5 py-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                          theme === 'dark'
                            ? 'border-stone-700 text-stone-300 hover:bg-stone-800'
                            : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        )}
                      >
                        上一页
                      </button>
                      <button
                        type="button"
                        onClick={() => setHistoryPage((prev) => Math.min(totalHistoryPages, prev + 1))}
                        disabled={historyPage >= totalHistoryPages}
                        className={clsx(
                          'text-xs rounded-md border px-2.5 py-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                          theme === 'dark'
                            ? 'border-stone-700 text-stone-300 hover:bg-stone-800'
                            : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        )}
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                </div>
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
        {settingsModal}
      </div>
    );
  }

  return (
    <div className={clsx(
        'h-screen flex flex-col overflow-hidden transition-colors duration-500',
        theme === 'dark' ? 'bg-stone-900 text-stone-200' : 'bg-stone-50 text-stone-800'
    )}>
      <header className={clsx(
          'backdrop-blur-md border-b px-6 py-3 flex items-center justify-between shrink-0 z-20 shadow-lg',
          theme === 'dark'
            ? 'bg-stone-900/80 border-stone-800 shadow-black/20'
            : 'bg-white/80 border-stone-200 shadow-stone-200/50'
      )}>
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToHome}
            className={clsx(
                'p-2 rounded-full transition-colors',
                theme === 'dark'
                    ? 'hover:bg-stone-800 text-stone-400 hover:text-white'
                    : 'hover:bg-stone-100 text-stone-500 hover:text-stone-800'
            )}
            title="返回首页"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className={clsx(
                'p-1.5 rounded-lg border',
                theme === 'dark'
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-amber-50 border-amber-100'
            )}>
              <Network className={clsx('w-5 h-5', theme === 'dark' ? 'text-amber-400' : 'text-amber-600')} />
            </div>
            <h1 className={clsx('font-bold text-lg tracking-tight', theme === 'dark' ? 'text-stone-100' : 'text-stone-800')}>
              {graphData?.repoName || displayRepoUrl || 'Project Analysis'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button
                onClick={openSettings}
                className={clsx(
                    'p-2 rounded-lg transition-all duration-300 mr-2',
                    theme === 'dark'
                        ? 'bg-stone-800 text-amber-400 hover:bg-stone-700 border border-stone-700'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                )}
                title="设置"
            >
                <Settings size={18} />
            </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className={clsx(
            'w-96 border-r flex flex-col shrink-0 overflow-y-auto z-10 scrollbar-custom transition-colors duration-500',
            theme === 'dark' ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
        )}>
           {(graphData || displayRepoUrl) && (
             <div className="p-6 space-y-8">
               <div>
                 <h2 className={clsx('text-xs font-bold uppercase tracking-widest mb-4', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>
                   Agent 工作日志
                 </h2>
                 <div className={clsx(
                   'rounded-xl border overflow-hidden',
                   theme === 'dark' ? 'bg-stone-900/60 border-stone-800' : 'bg-white border-stone-200'
                 )}>
                   <div className={clsx(
                     'px-3 py-2 text-[11px] font-mono border-b flex items-center justify-between gap-2',
                     theme === 'dark' ? 'text-stone-400 border-stone-800 bg-stone-900/60' : 'text-stone-500 border-stone-200 bg-stone-50'
                   )}>
                     <div className="inline-flex items-center gap-2">
                       <Terminal size={13} className="text-amber-500" />
                       <span>Agent 工作日志</span>
                     </div>
                     <button
                       type="button"
                       onClick={() => setIsAgentFullscreenOpen(true)}
                       className={clsx(
                         'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] transition-colors',
                         theme === 'dark'
                           ? 'border-stone-700 text-stone-300 hover:bg-stone-800'
                           : 'border-stone-200 text-stone-600 hover:bg-stone-50'
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
                         theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
                       )}>
                         等待开始分析
                       </div>
                     )}
                   </div>
                   <div className={clsx(
                     'border-t px-3 py-2 text-[11px] grid grid-cols-3 gap-2',
                     theme === 'dark' ? 'border-stone-800 bg-stone-900/50 text-stone-300' : 'border-stone-200 bg-stone-50 text-stone-700'
                   )}>
                     <div className="min-w-0">
                       <div className={clsx('opacity-70', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>输入 Token</div>
                       <div className="font-mono truncate">{mergedAiUsageStats.inputTokens.toLocaleString()}</div>
                     </div>
                     <div className="min-w-0">
                       <div className={clsx('opacity-70', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>输出 Token</div>
                       <div className="font-mono truncate">{mergedAiUsageStats.outputTokens.toLocaleString()}</div>
                     </div>
                     <div className="min-w-0">
                       <div className={clsx('opacity-70', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>AI 调用次数</div>
                       <div className="font-mono truncate">{mergedAiUsageStats.callCount.toLocaleString()}</div>
                     </div>
                   </div>
                 </div>
               </div>

               <div>
                 <h2 className={clsx('text-xs font-bold uppercase tracking-widest mb-4', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>分析状态</h2>
                 <div className={clsx(
                   'rounded-xl p-4 border text-sm',
                   theme === 'dark' ? 'bg-stone-900/50 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-700'
                 )}>
                   <div className="mb-2">
                     <div className="flex items-center gap-2 min-w-0">
                       <div
                         className={clsx(
                           'font-mono text-xs opacity-80 min-w-0 flex-1',
                           isRepoUrlExpanded ? 'whitespace-normal break-all' : 'truncate',
                           theme === 'dark' ? 'text-stone-400' : 'text-stone-500'
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
                               ? 'text-stone-400 border-stone-700 hover:text-stone-200 hover:border-stone-600'
                               : 'text-stone-500 border-stone-200 hover:text-stone-700 hover:border-stone-300'
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
                               ? 'text-stone-400 border-stone-700 hover:text-stone-200 hover:border-stone-600'
                               : 'text-stone-500 border-stone-200 hover:text-stone-700 hover:border-stone-300'
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
                           ? 'border-amber-700/70 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
                           : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                       )}
                     >
                       重新分析
                     </button>
                   </div>
                 </div>
               </div>

               <div>
                 <h2 className={clsx('text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>
                   <Code2 size={14} className="text-amber-500" />
                   项目简介
                 </h2>
                 <div className={clsx(
                     'rounded-xl p-4 border transition-colors',
                     theme === 'dark'
                        ? 'bg-stone-900/50 border-stone-800/50 hover:border-stone-700'
                        : 'bg-stone-50 border-stone-100 hover:border-stone-200'
                 )}>
                   <p className={clsx('text-sm leading-relaxed', isSummaryExpanded ? '' : 'line-clamp-6', theme === 'dark' ? 'text-stone-300' : 'text-stone-600')}>
                     {graphData?.project?.summary || '暂无简介'}
                   </p>
                   {graphData?.project?.summary && (
                     <button
                       onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                       className={clsx('mt-3 text-xs font-medium flex items-center gap-1 transition-colors', theme === 'dark' ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700')}
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
                 <h2 className={clsx('text-xs font-bold uppercase tracking-widest mb-4', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>技术栈</h2>
                 <div className="flex flex-wrap gap-2">
                   {(graphData?.project?.techStack || []).map((tech) => (
                     <span
                       key={tech}
                       className={clsx(
                           'px-3 py-1 border rounded-md text-xs font-medium shadow-sm transition-all cursor-default',
                           theme === 'dark'
                            ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700 hover:border-stone-600'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
                       )}
                     >
                       {tech}
                     </span>
                   ))}
                 </div>
               </div>

               <div>
                  <h2 className={clsx('text-xs font-bold uppercase tracking-widest mb-4', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>模块概览</h2>
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
                                    ? 'text-stone-400 bg-stone-900/30 hover:bg-stone-900 hover:border-stone-800'
                                    : 'text-stone-600 bg-stone-50 hover:bg-white hover:border-stone-200'
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
                      onClick={() => { void handleReanalyzeModules(); }}
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
                 <h2 className={clsx('text-xs font-bold uppercase tracking-widest mb-4', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>工程文件</h2>
                 <div className={clsx(
                   'rounded-xl border overflow-hidden',
                   theme === 'dark' ? 'bg-stone-900/60 border-stone-800' : 'bg-white border-stone-200'
                 )}>
                   <div className={clsx(
                     'px-3 py-2 text-[11px] font-mono border-b flex items-center justify-between gap-2',
                     theme === 'dark' ? 'text-stone-400 border-stone-800 bg-stone-900/60' : 'text-stone-500 border-stone-200 bg-stone-50'
                   )}>
                     <span>工程文件</span>
                     <button
                       type="button"
                       onClick={() => setIsProjectFilesFullscreenOpen(true)}
                       className={clsx(
                         'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] transition-colors',
                         theme === 'dark'
                           ? 'border-stone-700 text-stone-300 hover:bg-stone-800'
                           : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                       )}
                       title="全屏查看工程文件"
                     >
                       <Maximize2 size={11} />
                       全屏
                     </button>
                   </div>
                   <pre className={clsx(
                     'p-3 text-[10px] leading-relaxed max-h-64 overflow-auto whitespace-pre-wrap break-words',
                     theme === 'dark' ? 'text-stone-300 scrollbar-custom' : 'text-stone-700 scrollbar-custom'
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
            theme === 'dark' ? 'bg-stone-900' : 'bg-stone-50'
        )}>
           <div className={clsx(
               'h-14 border-b flex items-center justify-between px-6 shrink-0 z-10',
               theme === 'dark' ? 'bg-stone-900/50 border-stone-800' : 'bg-white/50 border-stone-200'
           )}>
               <div className="flex items-center gap-4 min-w-0">
                 <div className={clsx('text-sm font-medium flex items-center gap-2 shrink-0', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>
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
                       theme === 'dark' ? 'text-amber-300 hover:text-amber-200' : 'text-amber-700 hover:text-amber-800'
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
                      theme === 'dark' ? 'border-stone-700 bg-stone-900/40' : 'border-stone-200 bg-white'
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
                              idx > 0 && (theme === 'dark' ? 'border-l border-stone-700' : 'border-l border-stone-200'),
                              active
                                ? (theme === 'dark' ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-50 text-amber-700')
                                : (theme === 'dark' ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-500 hover:bg-stone-50')
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
                            ? 'text-stone-300 bg-stone-800 border-stone-700 hover:bg-stone-700 hover:text-white hover:shadow-md hover:border-stone-600'
                            : 'text-stone-600 bg-white border-stone-200 hover:bg-stone-50 hover:text-stone-900'
                      )}
                    >
                      <Download size={16} />
                      导出工程文件
                    </button>
                    <button
                      onClick={handleExportImage}
                      disabled={isExportingImage}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-orange-600 border border-transparent rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
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
                    theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
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
                            <section className={clsx('h-full min-w-[140px] flex flex-col', theme === 'dark' ? 'bg-stone-900/70' : 'bg-white')}>
                              <div className={clsx('px-4 py-3 border-b text-sm font-medium shrink-0 flex items-center gap-2', theme === 'dark' ? 'border-stone-800 text-stone-300 bg-stone-900/60' : 'border-stone-200 text-stone-700 bg-stone-50')}>
                                <ListTree size={14} /> 文件列表面板
                              </div>
                              <div className={clsx('flex-1 min-h-0 overflow-auto p-2 scrollbar-custom', theme === 'dark' ? 'text-stone-300' : 'text-stone-700')}>
                                {fileTree.length > 0 ? fileTree.map((node) => renderTreeNode(node)) : (
                                  <div className={clsx('text-xs px-2 py-3', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>
                                    暂无文件列表数据
                                  </div>
                                )}
                              </div>
                            </section>
                          )}

                          {panelKey === 'source' && (
                            <section className={clsx('h-full min-w-[240px] flex flex-col', theme === 'dark' ? 'bg-stone-900' : 'bg-white')}>
                              <div className={clsx('px-4 py-3 border-b text-sm font-medium shrink-0 flex items-center justify-between', theme === 'dark' ? 'border-stone-800 text-stone-300 bg-stone-900/60' : 'border-stone-200 text-stone-700 bg-stone-50')}>
                                <div className="flex items-center gap-2">
                                  <FileCode2 size={14} />
                                  <span>源代码面板</span>
                                  <span className={clsx('text-xs font-mono truncate max-w-[360px]', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')} title={selectedFile || '未选择文件'}>
                                    {selectedFile ? ` / ${selectedFile}` : ''}
                                  </span>
                                </div>
                                {selectedNode?.line ? (
                                  <div className={clsx('text-[11px] font-mono flex items-center gap-1', theme === 'dark' ? 'text-amber-300' : 'text-amber-700')}>
                                    <Target size={12} /> L{selectedNode.line}
                                  </div>
                                ) : null}
                              </div>
                              <div className={clsx('px-3 py-1.5 border-b text-[11px] font-mono', theme === 'dark' ? 'border-stone-800 bg-stone-900/30 text-stone-400' : 'border-stone-200 bg-stone-50 text-stone-500')}>
                                使用 Ctrl/Cmd + F 进行源码搜索（Monaco 原生查找）
                              </div>
                              <div className={clsx('flex-1 min-h-0 overflow-auto scrollbar-custom', theme === 'dark' ? 'bg-stone-900' : 'bg-white')}>
                                {sourceLoading ? (
                                  <div className={clsx('h-full flex items-center justify-center text-sm', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>
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
                                  <div className={clsx('h-full flex items-center justify-center text-sm', theme === 'dark' ? 'text-stone-500' : 'text-stone-400')}>
                                    选择函数节点或文件以查看源码
                                  </div>
                                )}
                              </div>
                            </section>
                          )}

                          {panelKey === 'panorama' && (
                            <section className={clsx('h-full min-w-[280px]', theme === 'dark' ? 'bg-stone-900' : 'bg-stone-50')}>
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
                                  theme === 'dark' ? 'text-stone-500' : 'text-stone-400'
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
                              theme === 'dark' ? 'bg-stone-800 hover:bg-stone-700' : 'bg-stone-200 hover:bg-stone-300'
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
          theme === 'dark' ? 'bg-black/70' : 'bg-stone-900/45'
        )}>
          <div className={clsx(
            'w-[min(1080px,92vw)] h-[min(88vh,900px)] rounded-xl border overflow-hidden flex flex-col shadow-2xl',
            theme === 'dark' ? 'border-stone-600 bg-stone-800 shadow-black/60 ring-1 ring-stone-700/50' : 'border-stone-200 bg-white/95 shadow-stone-400/30'
          )}>
            <div className={clsx(
              'h-14 px-5 border-b flex items-center justify-between shrink-0',
              theme === 'dark' ? 'border-stone-700 bg-stone-800' : 'border-stone-200 bg-white/90'
            )}>
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-amber-500" />
                <span className={clsx('text-sm font-medium', theme === 'dark' ? 'text-stone-100' : 'text-stone-800')}>
                  Agent 工作日志（全屏）
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAgentFullscreenOpen(false)}
                className={clsx(
                  'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors',
                  theme === 'dark'
                    ? 'border-stone-600 text-stone-300 hover:bg-stone-700'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-100'
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
                  theme === 'dark' ? 'text-stone-400' : 'text-stone-400'
                )}>
                  等待开始分析
                </div>
              )}
            </div>
            <div className={clsx(
              'shrink-0 border-t px-4 py-2 text-[11px] grid grid-cols-3 gap-2',
              theme === 'dark' ? 'border-stone-700 bg-stone-800 text-stone-300' : 'border-stone-200 bg-stone-50 text-stone-700'
            )}>
              <div className="min-w-0">
                <div className={clsx('opacity-70', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>输入 Token</div>
                <div className="font-mono truncate">{mergedAiUsageStats.inputTokens.toLocaleString()}</div>
              </div>
              <div className="min-w-0">
                <div className={clsx('opacity-70', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>输出 Token</div>
                <div className="font-mono truncate">{mergedAiUsageStats.outputTokens.toLocaleString()}</div>
              </div>
              <div className="min-w-0">
                <div className={clsx('opacity-70', theme === 'dark' ? 'text-stone-400' : 'text-stone-500')}>AI 调用次数</div>
                <div className="font-mono truncate">{mergedAiUsageStats.callCount.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProjectFilesFullscreenOpen && (
        <div className={clsx(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          theme === 'dark' ? 'bg-black/70' : 'bg-stone-900/45'
        )}>
          <div className={clsx(
            'w-[min(1200px,94vw)] h-[min(90vh,980px)] rounded-xl border overflow-hidden flex flex-col shadow-2xl',
            theme === 'dark' ? 'border-stone-600 bg-stone-800 shadow-black/60 ring-1 ring-stone-700/50' : 'border-stone-200 bg-white/95 shadow-stone-400/30'
          )}>
            <div className={clsx(
              'h-14 px-5 border-b flex items-center justify-between shrink-0',
              theme === 'dark' ? 'border-stone-700 bg-stone-800' : 'border-stone-200 bg-white/90'
            )}>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-amber-500" />
                <span className={clsx('text-sm font-medium', theme === 'dark' ? 'text-stone-100' : 'text-stone-800')}>
                  工程文件（全屏）
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectFilesFullscreenOpen(false)}
                className={clsx(
                  'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors',
                  theme === 'dark'
                    ? 'border-stone-600 text-stone-300 hover:bg-stone-700'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-100'
                )}
              >
                <X size={14} />
                关闭
              </button>
            </div>
            <div className={clsx(
              'flex-1 min-h-0 overflow-auto p-4',
              theme === 'dark' ? 'bg-stone-800 text-stone-200 scrollbar-custom' : 'bg-white text-stone-700 scrollbar-custom'
            )}>
              <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-words">
                {projectPanoramaMarkdown || '尚未生成'}
              </pre>
            </div>
          </div>
        </div>
      )}

      {settingsModal}
    </div>
  );
}

export default App;
