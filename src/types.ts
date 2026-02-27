export interface ProjectInfo {
  language: string;
  techStack: string[];
  summary: string;
}

export interface GraphModule {
  id: string;
  name: string;
  color: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'function' | 'class' | 'file' | 'module';
  file: string;
  line?: number;
  httpMethod?: string;
  httpRoute?: string;
  importance: 'high' | 'medium' | 'low';
  description: string;
  module: string; // Module ID
  depth?: number;
  drillFlag?: -1 | 0 | 1;
  callStatus?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  repoName?: string;
  repoUrl?: string;
  project: ProjectInfo;
  modules: GraphModule[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  allFiles?: string[];
  callChainRecords?: Array<{
    nodeId: string;
    functionName: string;
    file?: string;
    line?: number;
    depth: number;
    drillFlag: -1 | 0 | 1;
    parentNodeId?: string;
    status: 'queued' | 'analyzing' | 'done' | 'skipped' | 'failed';
    locateAttempts?: string[];
    error?: string;
  }>;
  panoramaMarkdown?: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'thinking';
  details?: string[];
  aiTrace?: {
    request: string;
    response: string;
    label?: string;
  };
}

export interface AiUsageStats {
  inputTokens: number;
  outputTokens: number;
  callCount: number;
}

export type AgentStatus =
  | 'idle'
  | 'validating'
  | 'fetching_tree'
  | 'analyzing_structure'
  | 'fetching_content'
  | 'recursive_drilling'
  | 'generating_graph'
  | 'complete'
  | 'error';
