"use client";

import React, { useRef, useState, useEffect } from 'react';
import { RepoInput } from './components/RepoInput';
import { AgentLog } from './components/AgentLog';
import { GraphViewer, GraphViewerRef } from './components/GraphViewer';
import { useGithubAgent } from './hooks/useGithubAgent';
import { Github, Code2, Network, Download, Upload, ChevronDown, ChevronUp, Image as ImageIcon, ArrowLeft, Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';

function App() {
  const { status, logs, graphData, setGraphData, analyzeRepo } = useGithubAgent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const graphViewerRef = useRef<GraphViewerRef>(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [view, setView] = useState<'home' | 'result'>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const isAnalyzing = ['validating', 'fetching_tree', 'analyzing_structure', 'fetching_content', 'generating_graph'].includes(status);

  // Automatically switch to result view when analysis is complete
  useEffect(() => {
    if (status === 'complete' && graphData) {
      setView('result');
    }
  }, [status, graphData]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleAnalyze = (url: string, token?: string) => {
    analyzeRepo(url, token);
  };

  const handleExportImage = async () => {
    if (graphViewerRef.current) {
      await graphViewerRef.current.exportImage();
    }
  };

  const handleExportHtml = () => {
    if (!graphData) return;
    
    // Create a complete HTML file with embedded data
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${graphData.repoName} - 代码全景图</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; background-color: #f8fafc; height: 100vh; display: flex; flex-direction: column; }
        #header { background: white; padding: 1rem 2rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.05); z-index: 10; }
        #header h1 { margin: 0; font-size: 1.25rem; color: #1e293b; display: flex; align-items: center; gap: 0.5rem; }
        #container { flex: 1; position: relative; overflow: hidden; }
        #mynetwork { width: 100%; height: 100%; }
        .legend { position: absolute; top: 1rem; left: 1rem; background: rgba(255,255,255,0.9); padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); max-width: 300px; z-index: 10; font-size: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .legend-item { display: flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border-radius: 9999px; border: 1px solid transparent; cursor: pointer; transition: all 0.2s; }
        .legend-item:hover { opacity: 0.8; }
        .legend-item.inactive { opacity: 0.4; background: #f1f5f9 !important; border-color: #cbd5e1 !important; color: #94a3b8 !important; }
        .node-popup { position: absolute; display: none; background: white; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 0.75rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); max-width: 320px; z-index: 100; pointer-events: none; transition: opacity 0.2s; }
        .popup-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem; }
        .popup-title { font-weight: 600; color: #0f172a; font-size: 0.875rem; }
        .popup-meta { font-size: 0.75rem; color: #64748b; font-family: monospace; margin-top: 0.125rem; }
        .popup-badges { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
        .badge { padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.625rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em; }
        .badge-type { background: #dbeafe; color: #1d4ed8; }
        .badge-module { background: #f1f5f9; color: #334155; }
        .popup-desc { font-size: 0.875rem; color: #334155; line-height: 1.5; }
    </style>
    <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
</head>
<body>
    <div id="header">
        <h1>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
            ${graphData.repoName} <span style="font-weight:normal; color:#64748b; font-size:0.875rem;">代码全景图</span>
        </h1>
        <div style="font-size: 0.75rem; color: #64748b;">Generated by GitHub Agent</div>
    </div>
    <div id="container">
        <div id="legend" class="legend"></div>
        <div id="mynetwork"></div>
        <div id="nodePopup" class="node-popup"></div>
    </div>

    <script type="text/javascript">
        const data = ${JSON.stringify(graphData)};
        
        // Transform data for vis-network
        const nodes = new vis.DataSet(data.nodes.map(n => {
            const mod = data.modules.find(m => m.id === n.module);
            const color = mod ? mod.color : '#94a3b8';
            return {
                id: n.id,
                label: n.label,
                title: n.description, // Tooltip
                color: {
                    background: 'white',
                    border: color,
                    highlight: { background: '#f8fafc', border: color }
                },
                shape: 'box',
                font: { size: 14, face: 'monospace' },
                borderWidth: 2,
                shadow: { enabled: true, color: 'rgba(0,0,0,0.1)', size: 10, x: 0, y: 4 },
                margin: 10,
                // Custom data for popup
                _fullData: n,
                _moduleName: mod ? mod.name : n.module
            };
        }));

        const edges = new vis.DataSet(data.edges.map(e => ({
            from: e.source,
            to: e.target,
            arrows: 'to',
            color: { color: '#cbd5e1', highlight: '#94a3b8' },
            width: 1,
            smooth: { type: 'cubicBezier', roundness: 0.5 }
        })));

        const container = document.getElementById('mynetwork');
        const networkData = { nodes: nodes, edges: edges };
        const options = {
            layout: {
                hierarchical: {
                    enabled: true,
                    direction: 'UD',
                    sortMethod: 'directed',
                    nodeSpacing: 200,
                    levelSpacing: 150
                }
            },
            physics: {
                enabled: false
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                zoomView: true
            }
        };

        const network = new vis.Network(container, networkData, options);

        // Legend
        const legendContainer = document.getElementById('legend');
        let activeModule = null;

        if (data.modules && data.modules.length > 0) {
            legendContainer.innerHTML = '<div style="width:100%; margin-bottom:0.25rem; font-weight:600; color:#64748b;">模块筛选:</div>';
            data.modules.forEach(mod => {
                const item = document.createElement('div');
                item.className = 'legend-item';
                item.style.backgroundColor = mod.color;
                item.style.color = 'white';
                item.style.borderColor = mod.color;
                item.innerText = mod.name;
                
                item.onclick = () => {
                    if (activeModule === mod.id) {
                        activeModule = null;
                        // Reset
                        nodes.forEach(n => {
                            nodes.update({id: n.id, opacity: 1});
                        });
                        edges.forEach(e => {
                            edges.update({id: e.id, color: {opacity: 1}});
                        });
                        Array.from(legendContainer.children).forEach(c => {
                            if(c.classList.contains('legend-item')) c.classList.remove('inactive');
                        });
                    } else {
                        activeModule = mod.id;
                        // Dim others
                        const moduleNodes = data.nodes.filter(n => n.module === mod.id).map(n => n.id);
                        nodes.forEach(n => {
                            nodes.update({id: n.id, opacity: moduleNodes.includes(n.id) ? 1 : 0.2});
                        });
                        // Update legend styles
                        Array.from(legendContainer.children).forEach(c => {
                            if(c.classList.contains('legend-item')) {
                                if (c.innerText === mod.name) c.classList.remove('inactive');
                                else c.classList.add('inactive');
                            }
                        });
                    }
                };
                legendContainer.appendChild(item);
            });
        } else {
            legendContainer.style.display = 'none';
        }

        // Custom Popup
        const popup = document.getElementById('nodePopup');
        
        network.on("click", function (params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = nodes.get(nodeId);
                const fullData = node._fullData;
                
                // Position popup near the node (simplified, ideally convert canvas to DOM coords)
                // For simplicity in this static export, we'll just show it fixed or use simpler logic
                // Let's use the pointer event if possible, but network click event gives pointer
                
                const domPos = params.pointer.DOM;
                popup.style.left = (domPos.x + 20) + 'px';
                popup.style.top = (domPos.y - 20) + 'px';
                popup.style.display = 'block';
                
                let moduleBadge = '';
                if (node._moduleName) {
                    moduleBadge = \`<span class="badge badge-module">\${node._moduleName}</span>\`;
                }

                popup.innerHTML = \`
                    <div class="popup-header">
                        <div>
                            <div class="popup-title">\${fullData.label}</div>
                            <div class="popup-meta">\${fullData.file}</div>
                        </div>
                    </div>
                    <div class="popup-badges">
                        <span class="badge badge-type">\${fullData.type}</span>
                        \${moduleBadge}
                    </div>
                    <div class="popup-desc">
                        \${fullData.description || "暂无描述"}
                    </div>
                \`;
            } else {
                popup.style.display = 'none';
            }
        });
        
        network.on("dragStart", function() {
            popup.style.display = 'none';
        });
        
        network.on("zoom", function() {
            popup.style.display = 'none';
        });

    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${graphData.repoName}-panorama.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let importedData = null;

        // Strategy 1: Try to extract from <script id="panorama-data"> (Legacy format)
        const legacyMatch = content.match(/<script id="panorama-data" type="application\/json">([\s\S]*?)<\/script>/);
        if (legacyMatch && legacyMatch[1]) {
            try {
                importedData = JSON.parse(legacyMatch[1]);
            } catch (err) {
                console.warn('Failed to parse legacy HTML format', err);
            }
        }

        // Strategy 2: Try to extract from const data = ... (New format)
        if (!importedData && content.includes('const data =')) {
            // Match "const data = " followed by a JSON object, ending with a semicolon
            // We use a slightly more robust regex that looks for the start and tries to find the matching closing brace
            // But since JSON.stringify doesn't include semicolons inside strings usually (unless escaped), 
            // and we control the format, looking for the trailing semicolon is usually safe.
            const match = content.match(/const data = ({[\s\S]*?});/);
            if (match && match[1]) {
                try {
                    importedData = JSON.parse(match[1]);
                } catch (err) {
                    console.warn('Failed to parse new HTML format', err);
                }
            }
        }

        // Strategy 3: Try parsing the whole file as JSON
        if (!importedData) {
            try {
                importedData = JSON.parse(content);
            } catch (err) {
                // Not a JSON file
            }
        }

        if (importedData && importedData.nodes && importedData.edges) {
          setGraphData(importedData);
          setView('result');
        } else {
          // If we parsed something but it lacks nodes/edges
          if (importedData) {
              alert('无效的数据格式: 缺少 nodes 或 edges');
          } else {
              alert('无法识别的文件格式。请导入 .json 文件或由本工具导出的 .html 文件。');
          }
        }
      } catch (error: any) {
        console.error('Import failed', error);
        alert('导入失败: ' + error.message);
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  // --- View: Home ---
  if (view === 'home') {
    return (
      <div className={clsx(
          "min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500",
          theme === 'dark' ? "bg-slate-950" : "bg-gray-50"
      )}>
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className={clsx(
                "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-500",
                theme === 'dark' ? "bg-blue-600/10" : "bg-blue-400/20"
            )} />
            <div className={clsx(
                "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-500",
                theme === 'dark' ? "bg-cyan-600/10" : "bg-cyan-400/20"
            )} />
        </div>

        {/* Theme Toggle (Home) */}
        <div className="absolute top-6 right-6 z-20">
            <button 
                onClick={toggleTheme}
                className={clsx(
                    "p-2 rounded-full transition-all duration-300",
                    theme === 'dark' 
                        ? "bg-slate-900 text-yellow-400 hover:bg-slate-800 border border-slate-800" 
                        : "bg-white text-slate-600 hover:bg-gray-100 border border-gray-200 shadow-sm"
                )}
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>

        <div className="w-full max-w-2xl flex flex-col items-center gap-8 relative z-10">
          {/* Logo / Header */}
          <div className="text-center space-y-6">
            <div className={clsx(
                "inline-flex items-center justify-center p-5 rounded-2xl shadow-2xl backdrop-blur-sm mb-2 group transition-all duration-500 border",
                theme === 'dark' 
                    ? "bg-slate-900/50 shadow-blue-500/10 border-slate-800 hover:border-blue-500/50" 
                    : "bg-white shadow-blue-200/50 border-gray-200 hover:border-blue-300"
            )}>
              <Network className={clsx(
                  "w-14 h-14 transition-colors duration-500",
                  theme === 'dark' ? "text-blue-500 group-hover:text-cyan-400" : "text-blue-600 group-hover:text-blue-500"
              )} />
            </div>
            <div>
                <h1 className="text-5xl font-bold tracking-tight mb-3">
                  <span className={theme === 'dark' ? "text-white" : "text-slate-900"}>GitHub</span>{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Code Panorama
                  </span>
                </h1>
                <p className={clsx(
                    "text-lg max-w-lg mx-auto leading-relaxed",
                    theme === 'dark' ? "text-slate-400" : "text-slate-600"
                )}>
                  AI 驱动的代码全景分析引擎，一键洞察项目架构核心
                </p>
            </div>
          </div>

          {/* Input Section */}
          <div className="w-full relative">
            <RepoInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} theme={theme} />
            
            {/* Upload Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={triggerImport}
                className={clsx(
                    "group flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-sm backdrop-blur-sm",
                    theme === 'dark'
                        ? "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800"
                        : "bg-white/80 border-gray-200 text-slate-500 hover:text-slate-800 hover:border-gray-300 hover:bg-white shadow-sm"
                )}
              >
                <Upload size={16} className={theme === 'dark' ? "group-hover:text-cyan-400 transition-colors" : "text-blue-500"} />
                导入已有全景图 (JSON/HTML)
              </button>
            </div>
          </div>

          {/* Status Panel */}
          {(isAnalyzing || status === 'error' || logs.length > 0) && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AgentLog logs={logs} status={status} />
            </div>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".json,.html"
          className="hidden"
        />
      </div>
    );
  }

  // --- View: Result ---
  return (
    <div className={clsx(
        "h-screen flex flex-col overflow-hidden transition-colors duration-500",
        theme === 'dark' ? "bg-slate-950 text-slate-200" : "bg-gray-50 text-slate-800"
    )}>
      {/* Header / Navigation */}
      <header className={clsx(
          "backdrop-blur-md border-b px-6 py-3 flex items-center justify-between shrink-0 z-20 shadow-lg",
          theme === 'dark' 
            ? "bg-slate-900/80 border-slate-800 shadow-black/20" 
            : "bg-white/80 border-gray-200 shadow-slate-200/50"
      )}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('home')}
            className={clsx(
                "p-2 rounded-full transition-colors",
                theme === 'dark' 
                    ? "hover:bg-slate-800 text-slate-400 hover:text-white" 
                    : "hover:bg-gray-100 text-slate-500 hover:text-slate-800"
            )}
            title="返回首页"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className={clsx(
                "p-1.5 rounded-lg border",
                theme === 'dark' 
                    ? "bg-blue-500/10 border-blue-500/20" 
                    : "bg-blue-50 border-blue-100"
            )}>
              <Network className={clsx("w-5 h-5", theme === 'dark' ? "text-blue-400" : "text-blue-600")} />
            </div>
            <h1 className={clsx("font-bold text-lg tracking-tight", theme === 'dark' ? "text-slate-100" : "text-slate-800")}>
              {graphData?.repoName || 'Project Analysis'}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={toggleTheme}
                className={clsx(
                    "p-2 rounded-lg transition-all duration-300 mr-2",
                    theme === 'dark' 
                        ? "bg-slate-800 text-yellow-400 hover:bg-slate-700 border border-slate-700" 
                        : "bg-gray-100 text-slate-600 hover:bg-gray-200 border border-gray-200"
                )}
                title={theme === 'dark' ? "切换到浅色模式" : "切换到深色模式"}
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Project Info */}
        <div className={clsx(
            "w-80 border-r flex flex-col shrink-0 overflow-y-auto z-10 scrollbar-custom transition-colors duration-500",
            theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"
        )}>
           {graphData && (
             <div className="p-6 space-y-8">
               {/* Project Summary */}
               <div>
                 <h2 className={clsx("text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2", theme === 'dark' ? "text-slate-500" : "text-slate-400")}>
                   <Code2 size={14} className="text-blue-500" />
                   项目简介
                 </h2>
                 <div className={clsx(
                     "rounded-xl p-4 border transition-colors",
                     theme === 'dark' 
                        ? "bg-slate-950/50 border-slate-800/50 hover:border-slate-700" 
                        : "bg-gray-50 border-gray-100 hover:border-gray-200"
                 )}>
                   <p className={clsx("text-sm leading-relaxed", isSummaryExpanded ? '' : 'line-clamp-6', theme === 'dark' ? "text-slate-300" : "text-slate-600")}>
                     {graphData.project?.summary || '暂无简介'}
                   </p>
                   {graphData.project?.summary && graphData.project.summary.length > 150 && (
                     <button 
                       onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                       className={clsx("mt-3 text-xs font-medium flex items-center gap-1 transition-colors", theme === 'dark' ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700")}
                     >
                       {isSummaryExpanded ? (
                         <>收起 <ChevronUp size={12} /></>
                       ) : (
                         <>展开更多 <ChevronDown size={12} /></>
                       )}
                     </button>
                   )}
                 </div>
               </div>

               {/* Tech Stack */}
               <div>
                 <h2 className={clsx("text-xs font-bold uppercase tracking-widest mb-4", theme === 'dark' ? "text-slate-500" : "text-slate-400")}>技术栈</h2>
                 <div className="flex flex-wrap gap-2">
                   {graphData.project?.techStack?.map((tech) => (
                     <span
                       key={tech}
                       className={clsx(
                           "px-3 py-1 border rounded-md text-xs font-medium shadow-sm transition-all cursor-default",
                           theme === 'dark'
                            ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600"
                            : "bg-white border-gray-200 text-slate-600 hover:bg-gray-50 hover:border-gray-300"
                       )}
                     >
                       {tech}
                     </span>
                   ))}
                 </div>
               </div>
               
               {/* Stats / Modules Legend */}
               <div>
                  <h2 className={clsx("text-xs font-bold uppercase tracking-widest mb-4", theme === 'dark' ? "text-slate-500" : "text-slate-400")}>模块概览</h2>
                  <div className="space-y-2.5">
                    {graphData.modules?.map(mod => (
                        <button 
                            key={mod.id} 
                            onClick={() => setActiveModule(activeModule === mod.id ? null : mod.id)}
                            className={clsx(
                                "w-full flex items-center gap-3 text-sm p-2 rounded-lg border transition-all cursor-pointer",
                                activeModule === mod.id
                                    ? "ring-2 ring-offset-1 ring-offset-transparent"
                                    : "border-transparent",
                                theme === 'dark' 
                                    ? "text-slate-400 bg-slate-950/30 hover:bg-slate-900 hover:border-slate-800" 
                                    : "text-slate-600 bg-gray-50 hover:bg-white hover:border-gray-200"
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
               </div>
             </div>
           )}
        </div>

        {/* Right Panel: Graph */}
        <div className={clsx(
            "flex-1 relative overflow-hidden flex flex-col transition-colors duration-500",
            theme === 'dark' ? "bg-slate-950" : "bg-gray-50"
        )}>
           {/* Right Panel Header (Title Bar) */}
           <div className={clsx(
               "h-14 border-b flex items-center justify-between px-6 shrink-0 z-10",
               theme === 'dark' ? "bg-slate-900/50 border-slate-800" : "bg-white/50 border-gray-200"
           )}>
               <div className={clsx("text-sm font-medium", theme === 'dark' ? "text-slate-400" : "text-slate-500")}>
                   全景图预览
               </div>
               <div className="flex items-center gap-3">
                    <button
                      onClick={handleExportHtml}
                      className={clsx(
                          "flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-lg transition-all shadow-sm",
                          theme === 'dark'
                            ? "text-slate-300 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white hover:shadow-md hover:border-slate-600"
                            : "text-slate-600 bg-white border-gray-200 hover:bg-gray-50 hover:text-slate-900"
                      )}
                    >
                      <Download size={16} />
                      导出 HTML
                    </button>
                    <button
                      onClick={handleExportImage}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 border border-transparent rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/20"
                    >
                      <ImageIcon size={16} />
                      导出图片
                    </button>
               </div>
           </div>

           {/* Graph Container */}
           <div className="flex-1 relative overflow-hidden p-4">
               <div className={clsx(
                   "w-full h-full relative rounded-2xl overflow-hidden shadow-2xl border ring-1 transition-colors duration-500",
                   theme === 'dark'
                    ? "shadow-blue-500/5 border-slate-800 ring-white/5"
                    : "shadow-slate-200 border-gray-200 ring-black/5"
               )}>
                 <GraphViewer data={graphData} ref={graphViewerRef} theme={theme} activeModule={activeModule} />
               </div>
           </div>
        </div>
      </div>
      
      {/* Hidden File Input for Import (reused) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json,.html"
        className="hidden"
      />
    </div>
  );
}

export default App;
