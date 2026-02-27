import React, { useState } from 'react';
import { FolderOpen, Loader2, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface LocalPathInputProps {
  onAnalyze: (path: string) => void;
  isLoading: boolean;
  theme: 'light' | 'dark';
  topContent?: React.ReactNode;
}

export function LocalPathInput({ onAnalyze, isLoading, theme, topContent }: LocalPathInputProps) {
  const [localPath, setLocalPath] = useState('');
  const [isPickingPath, setIsPickingPath] = useState(false);
  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPath.trim()) return;
    onAnalyze(localPath.trim());
  };

  const handlePickPath = async () => {
    if (isPickingPath || isLoading) return;
    setIsPickingPath(true);
    try {
      const res = await fetch('/api/local/pick', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || '目录选择失败');
      }
      if (data?.path) {
        setLocalPath(String(data.path));
      }
    } catch (error: any) {
      alert(error?.message || '目录选择失败，请手动输入路径');
    } finally {
      setIsPickingPath(false);
    }
  };

  return (
    <div className={clsx(
      "w-full p-8 backdrop-blur-xl rounded-2xl shadow-2xl border relative group overflow-hidden transition-colors duration-500",
      isDark
        ? "bg-slate-900/80 border-slate-800"
        : "bg-white/80 border-gray-200 shadow-blue-100"
    )}>
      <div className={clsx(
        "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl transition-all duration-700",
        isDark
          ? "bg-cyan-500/10 group-hover:bg-cyan-500/20"
          : "bg-cyan-400/20 group-hover:bg-cyan-400/30"
      )}></div>

      {topContent}

      <p className={clsx(
        "mb-8 text-sm relative z-10 transition-colors",
        isDark ? "text-slate-400" : "text-slate-500"
      )}>
        输入本机项目目录绝对路径，AI 将分析该目录代码并生成可视化全景图。
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div className={clsx(
          "flex items-stretch rounded-xl overflow-hidden border focus-within:ring-2 transition-all",
          isDark
            ? "border-slate-700 focus-within:ring-blue-500/50"
            : "border-gray-200 focus-within:ring-blue-500/30"
        )}>
          <input
            type="text"
            value={localPath}
            onChange={(e) => setLocalPath(e.target.value)}
            placeholder="/Users/you/projects/my-app"
            className={clsx(
              "w-full px-4 py-3.5 outline-none text-sm",
              isDark
                ? "bg-slate-950/50 text-slate-200 placeholder-slate-600"
                : "bg-gray-50 text-slate-800 placeholder-slate-400"
            )}
            required
          />
          <button
            type="button"
            onClick={handlePickPath}
            disabled={isPickingPath || isLoading}
            className={clsx(
              "shrink-0 inline-flex items-center justify-center gap-1.5 px-4 text-sm font-semibold border-l transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                : "border-gray-200 bg-white text-slate-600 hover:bg-gray-50"
            )}
            title="选择本地目录"
          >
            {isPickingPath ? <Loader2 size={15} className="animate-spin" /> : <FolderOpen size={15} />}
            选择
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || !localPath}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="animate-pulse">正在深度分析目录...</span>
            </>
          ) : (
            <>
              生成全景图
              <Sparkles className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
