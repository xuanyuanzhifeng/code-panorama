import { Node, Edge, Position } from '@xyflow/react';
import { GraphData } from '../types';

// Custom Tree Layout
// Arranges nodes in a "Folder Directory" style (Left-to-Right Tree):
// - Ensures children are always to the right of parents (Max Depth) to avoid backward edges
const getTreeLayoutElements = (nodes: Node[], edges: Edge[]) => {
  const nodeWidth = 280;
  const nodeHeight = 100;
  const xIndent = 320; // Horizontal spacing (Node Width + Gap)
  const ySpacing = 20; // Vertical spacing between nodes

  // 1. Build Adjacency List & In-Degree
  const adj: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  
  nodes.forEach(n => {
    adj[n.id] = [];
    inDegree[n.id] = 0;
  });

  edges.forEach(e => {
    if (adj[e.source]) {
      adj[e.source].push(e.target);
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    }
  });

  // 2. Calculate Depths (Longest Path / Layering)
  // This ensures that if A -> B, Depth(B) > Depth(A)
  const depth: Record<string, number> = {};
  nodes.forEach(n => depth[n.id] = 0);

  // Relax edges |V| times to propagate depths (Bellman-Ford style for DAGs)
  // We limit iterations to prevent infinite loops in case of cycles
  const iterations = nodes.length;
  for (let i = 0; i < iterations; i++) {
    let changed = false;
    edges.forEach(e => {
      // If source and target are valid
      if (depth[e.source] !== undefined && depth[e.target] !== undefined) {
        if (depth[e.target] < depth[e.source] + 1) {
          depth[e.target] = depth[e.source] + 1;
          changed = true;
        }
      }
    });
    if (!changed) break;
  }

  // 3. DFS Traversal to assign Y positions (keeping subtrees together)
  // We prioritize visiting nodes that haven't been placed yet.
  const visited = new Set<string>();
  let currentY = 0;
  const positions: Record<string, { x: number, y: number }> = {};

  // Sort roots: nodes with in-degree 0, or lowest depth
  const roots = nodes.filter(n => inDegree[n.id] === 0);
  // If no roots (full cycle), pick node with min depth (0)
  if (roots.length === 0 && nodes.length > 0) {
    const minDepth = Math.min(...Object.values(depth));
    roots.push(...nodes.filter(n => depth[n.id] === minDepth));
  }

  const dfs = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    // Assign position
    // X is determined by Depth (strict layering)
    // Y is determined by DFS order (visual grouping)
    positions[nodeId] = {
      x: depth[nodeId] * xIndent,
      y: currentY
    };

    currentY += nodeHeight + ySpacing;

    // Visit children
    // Sort children by some criteria if needed (e.g. file name, or original edge order)
    const children = adj[nodeId] || [];
    children.forEach(childId => {
      dfs(childId);
    });
  };

  roots.forEach(root => dfs(root.id));
  
  // Handle disconnected components
  nodes.forEach(n => {
    if (!visited.has(n.id)) {
      dfs(n.id);
    }
  });

  // 4. Apply positions
  const layoutedNodes = nodes.map(node => {
    const pos = positions[node.id] || { x: 0, y: 0 };
    return {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Bottom,
      position: pos
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const transformGraphDataToFlow = (data: GraphData, activeModuleId?: string | null) => {
  const moduleColorMap = new Map(data.modules?.map(m => [m.id, m.color]) || []);
  const moduleNameMap = new Map(data.modules?.map(m => [m.id, m.name]) || []);

  const nodes: Node[] = data.nodes.map((node) => {
    return {
      id: node.id,
      type: 'custom',
      data: { 
        ...node,
        color: moduleColorMap.get(node.module),
        module: moduleNameMap.get(node.module) || node.module,
        isDimmed: activeModuleId && node.module !== activeModuleId,
        isHighlighted: activeModuleId && node.module === activeModuleId
      },
      position: { x: 0, y: 0 }, 
    };
  });

  const edges: Edge[] = data.edges.map((edge) => {
    const sourceNode = data.nodes.find(n => n.id === edge.source);
    const targetNode = data.nodes.find(n => n.id === edge.target);
    const isDimmed = activeModuleId && (sourceNode?.module !== activeModuleId || targetNode?.module !== activeModuleId);

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'step', // Orthogonal lines
      animated: true,
      style: { 
        stroke: isDimmed ? '#e2e8f0' : '#94a3b8',
        opacity: isDimmed ? 0.3 : 1,
        strokeWidth: 1.5
      },
    };
  });

  return getTreeLayoutElements(nodes, edges);
};
