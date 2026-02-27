import React, { useState } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface RepoInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  theme: 'light' | 'dark';
  topContent?: React.ReactNode;
}

export function RepoInput({ onAnalyze, isLoading, theme, topContent }: RepoInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={clsx(
      "w-full p-8 backdrop-blur-xl rounded-2xl shadow-2xl border relative group overflow-hidden transition-colors duration-500",
      isDark 
        ? "bg-slate-900/80 border-slate-800" 
        : "bg-white/80 border-gray-200 shadow-blue-100"
    )}>
      {/* Glow Effect */}
      <div className={clsx(
        "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl transition-all duration-700",
        isDark 
          ? "bg-blue-500/10 group-hover:bg-blue-500/20" 
          : "bg-blue-400/20 group-hover:bg-blue-400/30"
      )}></div>

      {topContent}
      
      <p className={clsx(
        "mb-8 text-sm relative z-10 transition-colors",
        isDark ? "text-slate-400" : "text-slate-500"
      )}>
        输入 GitHub 仓库地址，AI 将为您分析核心架构并生成可视化全景图。
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        <div className="relative group/input">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/facebook/react"
            className={clsx(
              "w-full pl-11 pr-4 py-3.5 border rounded-xl focus:ring-2 outline-none transition-all text-sm",
              isDark 
                ? "bg-slate-950/50 border-slate-700 focus:ring-blue-500/50 focus:border-blue-500 text-slate-200 placeholder-slate-600 group-hover/input:border-slate-600" 
                : "bg-gray-50 border-gray-200 focus:ring-blue-500/30 focus:border-blue-500 text-slate-800 placeholder-slate-400 group-hover/input:border-gray-300"
            )}
            required
          />
          <Search className={clsx(
            "absolute left-4 top-3.5 w-5 h-5 transition-colors",
            isDark 
              ? "text-slate-500 group-focus-within/input:text-blue-400" 
              : "text-slate-400 group-focus-within/input:text-blue-500"
          )} />
        </div>

        <button
          type="submit"
          disabled={isLoading || !url}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="animate-pulse">正在深度分析仓库...</span>
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
