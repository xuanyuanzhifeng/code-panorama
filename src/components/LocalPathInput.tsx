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
        ? "bg-stone-900/80 border-stone-800"
        : "bg-white/80 border-amber-100 shadow-amber-100"
    )}>
      <div className={clsx(
        "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl transition-all duration-700",
        isDark
          ? "bg-orange-500/10 group-hover:bg-orange-500/20"
          : "bg-orange-400/20 group-hover:bg-orange-400/30"
      )}></div>

      {topContent}

      <p className={clsx(
        "mb-8 text-sm relative z-10 transition-colors",
        isDark ? "text-stone-400" : "text-stone-500"
      )}>
        输入本机项目目录绝对路径，AI 将分析该目录代码并生成可视化全景图。
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div className={clsx(
          "flex items-stretch rounded-xl overflow-hidden border focus-within:ring-2 transition-all",
          isDark
            ? "border-stone-700 focus-within:ring-amber-500/50"
            : "border-amber-200 focus-within:ring-amber-500/30"
        )}>
          <input
            type="text"
            value={localPath}
            onChange={(e) => setLocalPath(e.target.value)}
            placeholder="/Users/you/projects/my-app"
            className={clsx(
              "w-full px-4 py-3.5 outline-none text-sm",
              isDark
                ? "bg-stone-900/50 text-stone-200 placeholder-stone-600"
                : "bg-amber-50/50 text-stone-800 placeholder-stone-400"
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
                ? "border-stone-700 bg-stone-900 text-stone-300 hover:bg-stone-800"
                : "border-amber-200 bg-white text-stone-600 hover:bg-amber-50"
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
          className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-amber-900/20 hover:shadow-amber-900/40 transform hover:-translate-y-0.5 active:translate-y-0"
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
