import React, { useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  BackgroundVariant,
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
  getNodesBounds
} from '@xyflow/react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import CustomNode from './CustomNode';
import { GraphData, GraphNode } from '../types';
import { transformGraphDataToFlow } from '../utils/layout';

const nodeTypes = {
  custom: CustomNode,
};

export interface GraphViewerRef {
  exportImage: () => Promise<void>;
}

interface GraphViewerProps {
  data: GraphData | null;
  theme: 'light' | 'dark';
  activeModule: string | null;
  onManualDrill?: (nodeId: string) => void;
  maxDrillDepth?: number;
  onSelectNode?: (node: GraphNode) => void;
  onUpdateNodeDescription?: (nodeId: string, description: string) => void;
}

// Inner component to use ReactFlow hooks
const GraphViewerInner = forwardRef<GraphViewerRef, GraphViewerProps>(({ data, theme, activeModule, onManualDrill, maxDrillDepth, onSelectNode, onUpdateNodeDescription }, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [draftDescription, setDraftDescription] = useState('');
  const { getNodes } = useReactFlow();
  const formatFileWithLine = (node: GraphNode) => {
    const rawLine = (node as unknown as { line?: unknown }).line;
    const lineNumber = typeof rawLine === 'number' ? rawLine : Number(rawLine);
    if (Number.isFinite(lineNumber) && lineNumber > 0) {
      return `${node.file}(L${Math.floor(lineNumber)})`;
    }
    return node.file;
  };
  const formatHttpEndpoint = (node: GraphNode) => {
    if (!node.httpRoute) return '';
    return `${node.httpMethod ? `${node.httpMethod} ` : ''}${node.httpRoute}`;
  };

  useImperativeHandle(ref, () => ({
    exportImage: async () => {
      // 1. Get all nodes and calculate bounding box
      const nodes = getNodes();
      if (nodes.length === 0) return;

      const nodesBounds = getNodesBounds(nodes);
      
      // 2. Calculate dimensions with padding
      const padding = 50;
      const imageWidth = nodesBounds.width + (padding * 2);
      const imageHeight = nodesBounds.height + (padding * 2);
      
      const element = document.querySelector('.react-flow__viewport') as HTMLElement;
      
      if (element) {
        try {
            const bgColor = theme === 'dark' ? '#1c1917' : '#fafaf9'; // stone-900 or stone-50
            const desiredPixelRatio = 6;
            const maxExportPixels = 120_000_000; // safety cap to reduce browser canvas failures
            const basePixels = Math.max(1, imageWidth * imageHeight);
            const limitedPixelRatio = Math.max(
              1,
              Math.min(desiredPixelRatio, Math.sqrt(maxExportPixels / basePixels))
            );
            const dataUrl = await toPng(element, {
                backgroundColor: bgColor,
                width: imageWidth,
                height: imageHeight,
                style: {
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                    transform: `translate(${-nodesBounds.x + padding}px, ${-nodesBounds.y + padding}px) scale(1)`,
                },
                pixelRatio: limitedPixelRatio,
            });
            
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `code-panorama-${new Date().getTime()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (err) {
            console.error('Export failed', err);
            alert('导出图片失败');
        }
      }
    }
  }));

  useEffect(() => {
    if (data) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = transformGraphDataToFlow(data, activeModule, {
        onManualDrill,
        maxDrillDepth,
      });
      // Pass theme to nodes via data
      const nodesWithTheme = layoutedNodes.map(node => ({
        ...node,
        data: { ...node.data, theme }
      }));
      setNodes(nodesWithTheme);
      setEdges(layoutedEdges);
    }
  }, [data, activeModule, setNodes, setEdges, theme, onManualDrill, maxDrillDepth]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: theme === 'dark' ? '#57534e' : '#a8a29e' } } as Edge, eds)),
    [setEdges, theme],
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    const originalNode = data?.nodes.find(n => n.id === node.id);
    if (originalNode) {
        const moduleName = data?.modules?.find(m => m.id === originalNode.module)?.name || originalNode.module;
        const selected = { ...originalNode, module: moduleName };
        setSelectedNode(selected);
        setDraftDescription(originalNode.description || '');
        onSelectNode?.(selected);
    }
  };

  const onPaneClick = () => {
    setSelectedNode(null);
    setDraftDescription('');
  };

  useEffect(() => {
    if (!selectedNode || !data) return;
    const latestNode = data.nodes.find(n => n.id === selectedNode.id);
    if (!latestNode) return;
    const moduleName = data.modules?.find(m => m.id === latestNode.module)?.name || latestNode.module;
    if (
      latestNode.description === selectedNode.description
      && latestNode.label === selectedNode.label
      && latestNode.file === selectedNode.file
      && latestNode.line === selectedNode.line
      && latestNode.httpRoute === selectedNode.httpRoute
      && latestNode.httpMethod === selectedNode.httpMethod
      && moduleName === selectedNode.module
    ) {
      return;
    }
    const refreshedNode = { ...latestNode, module: moduleName };
    setSelectedNode(refreshedNode);
    setDraftDescription(latestNode.description || '');
  }, [data, selectedNode]);

  const handleSaveDescription = () => {
    if (!selectedNode || !onUpdateNodeDescription) return;
    const nextDescription = draftDescription.trim();
    onUpdateNodeDescription(selectedNode.id, nextDescription);
    setSelectedNode((prev) => (prev ? { ...prev, description: nextDescription } : prev));
  };

  const handleCancelDescription = () => {
    if (!selectedNode) return;
    setDraftDescription(selectedNode.description || '');
  };

  if (!data) return null;

  return (
    <div className={`w-full h-full flex flex-col ${theme === 'dark' ? 'bg-stone-900' : 'bg-stone-50'}`}>
      <div className="flex-1 relative overflow-hidden">
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
            className="w-full h-full"
            minZoom={0.1}
        >
            <Background 
                color={theme === 'dark' ? '#44403c' : '#e7e5e4'} 
                gap={16} 
                variant={BackgroundVariant.Dots}
            />
            <Controls 
                className={`${theme === 'dark' ? 'bg-stone-800 border-stone-700 [&>button]:!bg-stone-800 [&>button]:!border-stone-700 [&>button]:!fill-stone-300 [&>button:hover]:!bg-stone-700' : 'bg-white border-stone-200 shadow-sm'}`} 
            />
        </ReactFlow>

        {/* Node Detail Popup */}
        <AnimatePresence>
            {selectedNode && (
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className={`absolute bottom-6 right-6 z-20 w-80 rounded-xl shadow-2xl border overflow-hidden ${
                    theme === 'dark' 
                        ? 'bg-stone-900 border-stone-700 shadow-black/50' 
                        : 'bg-white border-stone-200'
                }`}
            >
                <div className={`px-4 py-3 border-b flex justify-between items-start ${
                    theme === 'dark' ? 'bg-stone-900 border-stone-800' : 'bg-stone-50 border-stone-100'
                }`}>
                <div>
                    <h3 className={`font-bold ${theme === 'dark' ? 'text-stone-100' : 'text-stone-900'}`}>{selectedNode.label}</h3>
                    <p className={`text-xs font-mono mt-0.5 ${theme === 'dark' ? 'text-stone-500' : 'text-stone-500'}`}>
                      {formatFileWithLine(selectedNode)}
                    </p>
                </div>
                <button onClick={() => setSelectedNode(null)} className={`${theme === 'dark' ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600'}`}>
                    <X size={16} />
                </button>
                </div>
                <div className="p-4">
                <div className="mb-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 mr-2">
                    {selectedNode.type}
                    </span>
                    {selectedNode.module && (
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        theme === 'dark' ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-700'
                    }`}>
                        {selectedNode.module}
                    </span>
                    )}
                </div>
                {formatHttpEndpoint(selectedNode) && (
                  <div className={`mb-3 rounded-md border px-2 py-1 font-mono text-xs ${
                    theme === 'dark'
                      ? 'border-emerald-900 bg-emerald-950/40 text-emerald-300'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}>
                    {formatHttpEndpoint(selectedNode)}
                  </div>
                )}
                <label className={`mb-1 block text-xs font-medium ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
                    函数功能描述
                </label>
                <textarea
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  rows={4}
                  className={`w-full resize-none rounded-lg border px-3 py-2 text-sm leading-relaxed outline-none transition-colors ${
                    theme === 'dark'
                      ? 'border-stone-700 bg-stone-900 text-stone-200 placeholder:text-stone-500 focus:border-amber-500'
                      : 'border-stone-300 bg-white text-stone-700 placeholder:text-stone-400 focus:border-amber-500'
                  }`}
                  placeholder="请输入函数功能描述"
                />
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelDescription}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      theme === 'dark'
                        ? 'border border-stone-700 text-stone-300 hover:bg-stone-800'
                        : 'border border-stone-300 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDescription}
                    disabled={!onUpdateNodeDescription || draftDescription.trim() === (selectedNode.description || '').trim()}
                    className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    保存
                  </button>
                </div>
                </div>
            </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export const GraphViewer = forwardRef<GraphViewerRef, GraphViewerProps>((props, ref) => {
  return (
    <ReactFlowProvider children={<GraphViewerInner {...props} ref={ref} />} />
  );
});
