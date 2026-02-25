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
  importance: 'high' | 'medium' | 'low';
  description: string;
  module: string; // Module ID
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  repoName?: string;
  project: ProjectInfo;
  modules: GraphModule[];
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'thinking';
  details?: string[];
}

export type AgentStatus = 'idle' | 'validating' | 'fetching_tree' | 'analyzing_structure' | 'fetching_content' | 'generating_graph' | 'complete' | 'error';
