import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

// Define the data structure stored in node.data
interface CustomNodeData extends Record<string, unknown> {
  label: string;
  type: 'function' | 'class' | 'file' | 'module';
  file: string;
  line?: number | string;
  httpMethod?: string;
  httpRoute?: string;
  importance: 'high' | 'medium' | 'low';
  description: string;
  module: string;
  color?: string;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  theme?: 'light' | 'dark';
  isLeaf?: boolean;
  canManualDrill?: boolean;
  callStatus?: string;
  onManualDrill?: (nodeId: string) => void;
}

// Define the Node type using the data structure
type CustomNodeType = Node<CustomNodeData>;

const CustomNode = ({ data, id }: NodeProps<CustomNodeType>) => {
  const isHighImportance = data.importance === 'high';
  const headerColor = data.color || (isHighImportance ? '#d97706' : '#64748b'); // Blue or Slate
  const isDark = data.theme === 'dark';
  const isManualDrilling = data.isLeaf && data.callStatus === 'analyzing';
  const rawLine = data.line;
  const parsedLine = typeof rawLine === 'number' ? rawLine : Number(rawLine);
  const lineSuffix = Number.isFinite(parsedLine) && parsedLine > 0 ? `(L${Math.floor(parsedLine)})` : '';
  const fileName = data.file.split('/').pop() || data.file;
  const endpoint = data.httpRoute ? `${data.httpMethod ? `${data.httpMethod} ` : ''}${data.httpRoute}` : '';
  
  return (
    <div 
      className={clsx(
        "rounded-md border shadow-sm min-w-[240px] transition-all duration-300 overflow-visible",
        "hover:shadow-md cursor-pointer relative",
        isDark ? "bg-stone-900 border-stone-700" : "bg-white border-stone-200",
        data.isDimmed ? "opacity-40 grayscale" : "opacity-100",
        data.isHighlighted 
            ? (isDark ? "ring-2 ring-offset-1 ring-offset-stone-900 ring-amber-500 scale-105 z-10" : "ring-2 ring-offset-1 ring-amber-400 scale-105 z-10") 
            : ""
      )}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-stone-400 !-left-1" />
      
      <div className="rounded-[inherit] overflow-hidden">
        {/* Header: File Name */}
        <div 
          className="px-3 py-1.5 text-xs font-mono text-white flex items-center justify-between"
          style={{ backgroundColor: headerColor }}
        >
          <span className="truncate max-w-[180px]" title={`${data.file}${lineSuffix}`}>
            {fileName}{lineSuffix}
          </span>
          {data.module && (
            <span className="opacity-80 text-[10px] bg-black/20 px-1.5 rounded">
              {data.module}
            </span>
          )}
        </div>

        {/* Body: Function Name */}
        <div className="px-3 py-2.5">
          <div className={clsx("text-sm font-bold truncate", isDark ? "text-stone-200" : "text-stone-800")} title={data.label}>
            {data.label}
          </div>
          {endpoint && (
            <div
              className={clsx(
                "mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-mono",
                isDark ? "bg-emerald-950/50 text-emerald-300" : "bg-emerald-50 text-emerald-700"
              )}
              title={endpoint}
            >
              {endpoint}
            </div>
          )}
          {data.description && (
            <div className={clsx("text-[10px] mt-1 line-clamp-2 leading-tight", isDark ? "text-stone-400" : "text-stone-500")}>
              {data.description}
            </div>
          )}
        </div>
      </div>

      {isManualDrilling && (
        <div
          className={clsx(
            "absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-20 rounded-full p-0.5 nodrag nopan shadow-sm",
            isDark ? "bg-stone-800/90 text-[#d97706]" : "bg-white border border-stone-200 text-[#d97706]"
          )}
          title="正在分析中..."
        >
          <Loader2 size={14} className="animate-spin" />
        </div>
      )}

      {!isManualDrilling && data.isLeaf && data.canManualDrill && data.onManualDrill && (
        <button
          type="button"
          className={clsx(
            "absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-20 rounded-full p-0.5 nodrag nopan transition-colors shadow-sm cursor-pointer",
            isDark ? "bg-stone-800/90 hover:bg-stone-700 text-[#d97706]" : "bg-white border border-stone-200 hover:bg-amber-50 text-[#d97706]"
          )}
          title="手动下钻下一层"
          onClick={(e) => {
            e.stopPropagation();
            data.onManualDrill?.(id);
          }}
        >
          <PlusCircle size={14} />
        </button>
      )}

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-2 h-2 !bg-stone-400 !-bottom-1 !left-1/2 !-translate-x-1/2" 
      />
    </div>
  );
};

export default memo(CustomNode);
