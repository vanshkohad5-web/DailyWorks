import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../types.ts';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  const isDark = theme === 'dark';

  return (
    <div
      id="theme-toggle-container"
      className={`inline-flex items-center p-1 rounded-full border transition-all duration-200 ${
        isDark
          ? 'bg-black/60 border-white/15 text-white/70'
          : 'bg-white border-slate-200/90 text-slate-700 shadow-xs'
      }`}
    >
      <button
        id="theme-toggle-light-btn"
        type="button"
        onClick={() => !isDark || onToggle()}
        aria-label="Switch to light mode"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-code transition-all select-none ${
          !isDark
            ? 'bg-white text-slate-900 shadow-xs font-semibold'
            : 'text-white/50 hover:text-white/90'
        }`}
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[10px] tracking-wider uppercase">Light</span>
      </button>

      <button
        id="theme-toggle-dark-btn"
        type="button"
        onClick={() => isDark || onToggle()}
        aria-label="Switch to dark mode"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-code transition-all select-none ${
          isDark
            ? 'bg-white/15 text-white shadow-xs font-semibold border border-white/10'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Moon className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-[10px] tracking-wider uppercase">Dark</span>
      </button>
    </div>
  );
};
