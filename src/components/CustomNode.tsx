import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { clsx } from 'clsx';

// Define the data structure stored in node.data
interface CustomNodeData extends Record<string, unknown> {
  label: string;
  type: 'function' | 'class' | 'file' | 'module';
  file: string;
  importance: 'high' | 'medium' | 'low';
  description: string;
  module: string;
  color?: string;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  theme?: 'light' | 'dark';
}

// Define the Node type using the data structure
type CustomNodeType = Node<CustomNodeData>;

const CustomNode = ({ data }: NodeProps<CustomNodeType>) => {
  const isHighImportance = data.importance === 'high';
  const headerColor = data.color || (isHighImportance ? '#3b82f6' : '#64748b'); // Blue or Slate
  const isDark = data.theme === 'dark';
  
  return (
    <div 
      className={clsx(
        "rounded-md border shadow-sm min-w-[240px] transition-all duration-300 overflow-hidden",
        "hover:shadow-md cursor-pointer relative",
        isDark ? "bg-slate-900 border-slate-700" : "bg-white border-gray-200",
        data.isDimmed ? "opacity-40 grayscale" : "opacity-100",
        data.isHighlighted 
            ? (isDark ? "ring-2 ring-offset-1 ring-offset-slate-950 ring-blue-500 scale-105 z-10" : "ring-2 ring-offset-1 ring-blue-400 scale-105 z-10") 
            : ""
      )}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-gray-400 !-left-1" />
      
      {/* Header: File Name */}
      <div 
        className="px-3 py-1.5 text-xs font-mono text-white flex items-center justify-between"
        style={{ backgroundColor: headerColor }}
      >
        <span className="truncate max-w-[180px]" title={data.file}>
          {data.file.split('/').pop()}
        </span>
        {data.module && (
          <span className="opacity-80 text-[10px] bg-black/20 px-1.5 rounded">
            {data.module}
          </span>
        )}
      </div>

      {/* Body: Function Name */}
      <div className="px-3 py-2.5">
        <div className={clsx("text-sm font-bold truncate", isDark ? "text-slate-200" : "text-gray-800")} title={data.label}>
          {data.label}
        </div>
        {data.description && (
          <div className={clsx("text-[10px] mt-1 line-clamp-2 leading-tight", isDark ? "text-slate-400" : "text-gray-500")}>
            {data.description}
          </div>
        )}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-2 h-2 !bg-gray-400 !-bottom-1 !left-1/2 !-translate-x-1/2" 
      />
    </div>
  );
};

export default memo(CustomNode);
