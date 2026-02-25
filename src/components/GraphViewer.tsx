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
}

// Inner component to use ReactFlow hooks
const GraphViewerInner = forwardRef<GraphViewerRef, GraphViewerProps>(({ data, theme, activeModule }, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const { getNodes } = useReactFlow();

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
            const bgColor = theme === 'dark' ? '#020617' : '#f8fafc'; // slate-950 or slate-50
            const dataUrl = await toPng(element, {
                backgroundColor: bgColor,
                width: imageWidth,
                height: imageHeight,
                style: {
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                    transform: `translate(${-nodesBounds.x + padding}px, ${-nodesBounds.y + padding}px) scale(1)`,
                },
                pixelRatio: 2,
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
      const { nodes: layoutedNodes, edges: layoutedEdges } = transformGraphDataToFlow(data, activeModule);
      // Pass theme to nodes via data
      const nodesWithTheme = layoutedNodes.map(node => ({
        ...node,
        data: { ...node.data, theme }
      }));
      setNodes(nodesWithTheme);
      setEdges(layoutedEdges);
    }
  }, [data, activeModule, setNodes, setEdges, theme]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: theme === 'dark' ? '#475569' : '#94a3b8' } } as Edge, eds)),
    [setEdges, theme],
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    const originalNode = data?.nodes.find(n => n.id === node.id);
    if (originalNode) {
        const moduleName = data?.modules?.find(m => m.id === originalNode.module)?.name || originalNode.module;
        setSelectedNode({ ...originalNode, module: moduleName });
    }
  };

  const onPaneClick = () => {
    setSelectedNode(null);
  };

  if (!data) return null;

  return (
    <div className={`w-full h-full flex flex-col ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50'}`}>
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
                color={theme === 'dark' ? '#334155' : '#e2e8f0'} 
                gap={16} 
                variant={BackgroundVariant.Dots}
            />
            <Controls 
                className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700 [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!fill-slate-300 [&>button:hover]:!bg-slate-700' : 'bg-white border-gray-200 shadow-sm'}`} 
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
                        ? 'bg-slate-900 border-slate-700 shadow-black/50' 
                        : 'bg-white border-gray-200'
                }`}
            >
                <div className={`px-4 py-3 border-b flex justify-between items-start ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-100'
                }`}>
                <div>
                    <h3 className={`font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>{selectedNode.label}</h3>
                    <p className={`text-xs font-mono mt-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>{selectedNode.file}</p>
                </div>
                <button onClick={() => setSelectedNode(null)} className={`${theme === 'dark' ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}`}>
                    <X size={16} />
                </button>
                </div>
                <div className="p-4">
                <div className="mb-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 mr-2">
                    {selectedNode.type}
                    </span>
                    {selectedNode.module && (
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-gray-100 text-gray-700'
                    }`}>
                        {selectedNode.module}
                    </span>
                    )}
                </div>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                    {selectedNode.description || "暂无描述"}
                </p>
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
