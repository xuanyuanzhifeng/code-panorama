import React, { useEffect, useRef, useState } from 'react';
import { Terminal, CheckCircle2, AlertCircle, BrainCircuit, ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { LogEntry } from '../types';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

interface AgentLogProps {
  logs: LogEntry[];
  status?: string;
  theme?: 'light' | 'dark';
  hideHeader?: boolean;
  embedded?: boolean;
}

export function AgentLog({ logs, status, theme = 'dark', hideHeader = false, embedded = false }: AgentLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const toggleExpand = (id: string) => {
    setExpandedLogs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (logs.length === 0) return null;

  const isRunning = status && !['idle', 'complete', 'error'].includes(status);
  const isDark = theme === 'dark';

  const content = (
    <>
      {!hideHeader && (
        <div className={clsx(
          "px-4 py-3 border-b flex items-center justify-between shrink-0",
          isDark ? "bg-stone-900/90 border-stone-800" : "bg-stone-50 border-stone-200"
        )}>
          <div className="flex items-center gap-2">
              <div className={clsx("p-1 rounded", isDark ? "bg-stone-800" : "bg-white border border-stone-200")}>
                  <Terminal className={clsx("w-3.5 h-3.5", isDark ? "text-stone-400" : "text-stone-500")} />
              </div>
              <span className={clsx("text-xs font-mono font-bold tracking-wide", isDark ? "text-stone-300" : "text-stone-700")}>AGENT_TERMINAL</span>
          </div>
          {status && (
              <span className={clsx(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border",
                  isRunning ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse" :
                  status === 'complete' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                  status === 'error' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                  "bg-stone-800 text-stone-400 border-stone-700"
              )}>
                  {status}
              </span>
          )}
        </div>
      )}
      
      {/* Logs Area */}
      <div 
        ref={scrollRef}
        className={clsx(
          "flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 font-mono text-xs scrollbar-custom",
          embedded
            ? (isDark ? "bg-transparent" : "bg-transparent")
            : (isDark ? "bg-stone-900/50" : "bg-white")
        )}
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => {
            const hasExpandable = Boolean(log.aiTrace) || Boolean(log.details && log.details.length > 0);
            const isDrillLog = log.message.includes('【下钻】');
            const isFailureLog = log.message.includes('失败');
            const displayMessage = log.message.replace(/^【下钻】/, '');
            return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={clsx(
                "flex flex-col border-l-2 pl-3 py-1",
                isFailureLog ? "text-red-400 border-red-500/60" :
                isDrillLog
                  ? (isDark ? "text-violet-400 border-violet-500/70" : "text-violet-700 border-violet-600/70")
                  :
                log.type === 'error' ? "text-red-400 border-red-500/50 bg-red-500/5 rounded-r" :
                log.type === 'success' ? "text-green-400 border-green-500/50" :
                log.type === 'thinking' ? "" :
                isDark ? "text-stone-300 border-stone-700" : "text-stone-700 border-stone-300"
              )}
              style={isFailureLog
                ? { borderLeftColor: '#ef4444' }
                : isDrillLog
                ? { borderLeftColor: '#7c3aed' }
                : (log.type === 'thinking' ? { color: '#d97706', borderLeftColor: '#d97706' } : undefined)}
            >
              {hasExpandable ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(log.id)}
                  className={clsx(
                    "w-full text-left flex items-start gap-2 rounded px-1 py-0.5 transition-colors",
                    isDark ? "hover:bg-white/5" : "hover:bg-stone-100/60"
                  )}
                >
                  <span className="mt-0.5 shrink-0 opacity-80">
                    {isFailureLog && <AlertCircle className="w-3.5 h-3.5" />}
                    {log.type === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
                    {log.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {log.type === 'thinking' && <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />}
                    {!isFailureLog && log.type === 'info' && <span className={clsx(
                      "w-3.5 h-3.5 block rounded-full border text-[9px] flex items-center justify-center",
                      isDark ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-600"
                    )}>i</span>}
                  </span>
                  <span className="leading-relaxed opacity-90 flex-1">{displayMessage}</span>
                  <span className={clsx("p-0.5 rounded transition-colors", isDark ? "text-stone-400" : "text-stone-500")}>
                    {expandedLogs[log.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </button>
              ) : (
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 opacity-80">
                    {isFailureLog && <AlertCircle className="w-3.5 h-3.5" />}
                    {log.type === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
                    {log.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {log.type === 'thinking' && <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />}
                    {!isFailureLog && log.type === 'info' && <span className={clsx(
                      "w-3.5 h-3.5 block rounded-full border text-[9px] flex items-center justify-center",
                      isDark ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-600"
                    )}>i</span>}
                  </span>
                  <span className="leading-relaxed opacity-90 flex-1">{displayMessage}</span>
                </div>
              )}

              {/* Expandable Details Panel */}
              <AnimatePresence>
                  {expandedLogs[log.id] && (log.details || log.aiTrace) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                          <div className="mt-2 ml-5 space-y-2">
                              {log.aiTrace && (
                                <div className={clsx(
                                  "p-2 rounded border max-h-80 overflow-y-auto overflow-x-hidden scrollbar-custom",
                                  isDark ? "bg-stone-800/50 border-stone-600/30" : "bg-stone-50 border-stone-200"
                                )}>
                                  <div className="text-[10px] text-orange-400 mb-1.5 uppercase tracking-wider font-bold">
                                    AI 请求 / 响应{log.aiTrace.label ? ` · ${log.aiTrace.label}` : ''}
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <div className={clsx("text-[10px] mb-1", isDark ? "text-stone-400" : "text-stone-500")}>Request</div>
                                      <pre className={clsx(
                                        "text-[10px] leading-relaxed whitespace-pre-wrap break-words rounded p-2 border",
                                        isDark ? "text-stone-300 bg-stone-800/50 border-stone-600/30" : "text-stone-700 bg-white border-stone-200"
                                      )}>
                                        {log.aiTrace.request}
                                      </pre>
                                    </div>
                                    <div>
                                      <div className={clsx("text-[10px] mb-1", isDark ? "text-stone-400" : "text-stone-500")}>Response</div>
                                      <pre className={clsx(
                                        "text-[10px] leading-relaxed whitespace-pre-wrap break-words rounded p-2 border",
                                        isDark ? "text-stone-300 bg-stone-800/50 border-stone-600/30" : "text-stone-700 bg-white border-stone-200"
                                      )}>
                                        {log.aiTrace.response}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {log.details && (
                                <div className={clsx(
                                  "p-2 rounded border max-h-60 overflow-y-auto overflow-x-hidden scrollbar-custom",
                                  isDark ? "bg-stone-800/50 border-stone-600/30" : "bg-stone-50 border-stone-200"
                                )}>
                                  <div className={clsx("text-[10px] mb-1.5 uppercase tracking-wider font-bold", isDark ? "text-stone-400" : "text-stone-500")}>文件列表 ({log.details.length})</div>
                                  <div className="space-y-1">
                                      {log.details.map((file, idx) => (
                                          <div key={idx} className={clsx(
                                            "flex items-center gap-1.5 transition-colors",
                                            isDark ? "text-stone-400 hover:text-stone-300" : "text-stone-500 hover:text-stone-700"
                                          )}>
                                              <FileText size={10} className="opacity-50" />
                                              <span className="truncate">{file}</span>
                                          </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                          </div>
                      </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>
          )})}
        </AnimatePresence>
        
        {/* Cursor Effect */}
        {isRunning && (
            <motion.div 
                animate={{ opacity: [0, 1, 0] }} 
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-4 bg-amber-500 ml-1 inline-block align-middle"
            />
        )}
      </div>
    </>
  );

  if (embedded) {
    return <div className="w-full h-full min-h-0 flex flex-col">{content}</div>;
  }

  return (
    <div className={clsx(
      "w-full h-full backdrop-blur-md rounded-xl shadow-2xl border overflow-hidden flex flex-col min-h-[240px] relative",
      isDark ? "bg-stone-900/80 border-stone-800" : "bg-white/90 border-stone-200 shadow-stone-200/70"
    )}>
      {content}
    </div>
  );
}
