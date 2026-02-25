import React, { useEffect, useRef, useState } from 'react';
import { Terminal, CheckCircle2, AlertCircle, BrainCircuit, ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { LogEntry } from '../types';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

interface AgentLogProps {
  logs: LogEntry[];
  status?: string;
}

export function AgentLog({ logs, status }: AgentLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, expandedLogs]);

  const toggleExpand = (id: string) => {
    setExpandedLogs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (logs.length === 0) return null;

  return (
    <div className="w-full mt-6 bg-slate-950/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col flex-1 min-h-[300px] relative">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-800 rounded">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-300 tracking-wide">AGENT_TERMINAL</span>
        </div>
        {status && (
            <span className={clsx(
                "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                status === 'analyzing' ? "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse" :
                status === 'complete' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                status === 'error' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                "bg-slate-800 text-slate-400 border-slate-700"
            )}>
                {status}
            </span>
        )}
      </div>
      
      {/* Logs Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs scrollbar-custom bg-slate-950/50"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={clsx(
                "flex flex-col border-l-2 pl-3 py-1",
                log.type === 'error' ? "text-red-400 border-red-500/50 bg-red-500/5 rounded-r" :
                log.type === 'success' ? "text-green-400 border-green-500/50" :
                log.type === 'thinking' ? "text-purple-400 border-purple-500/50" :
                "text-slate-300 border-slate-700"
              )}
            >
              <div className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 opacity-80">
                    {log.type === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
                    {log.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {log.type === 'thinking' && <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />}
                    {log.type === 'info' && <span className="w-3.5 h-3.5 block rounded-full bg-blue-500/20 border border-blue-500/50 text-[9px] flex items-center justify-center text-blue-400">i</span>}
                  </span>
                  <span className="leading-relaxed opacity-90 flex-1">{log.message}</span>
                  
                  {log.details && log.details.length > 0 && (
                    <button 
                        onClick={() => toggleExpand(log.id)}
                        className="p-0.5 hover:bg-white/10 rounded transition-colors"
                    >
                        {expandedLogs[log.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  )}
              </div>

              {/* Expandable Details Panel */}
              <AnimatePresence>
                  {log.details && expandedLogs[log.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                          <div className="mt-2 ml-5 p-2 bg-black/20 rounded border border-white/5 max-h-60 overflow-y-auto scrollbar-custom">
                              <div className="text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider font-bold">文件列表 ({log.details.length})</div>
                              <div className="space-y-1">
                                  {log.details.map((file, idx) => (
                                      <div key={idx} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-300 transition-colors">
                                          <FileText size={10} className="opacity-50" />
                                          <span className="truncate">{file}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Cursor Effect */}
        {status === 'analyzing' && (
            <motion.div 
                animate={{ opacity: [0, 1, 0] }} 
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-4 bg-blue-500 ml-1 inline-block align-middle"
            />
        )}
      </div>
    </div>
  );
}
