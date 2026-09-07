import React from 'react';
import { Sun } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle.tsx';
import { ThemeMode } from '../types.ts';

interface FooterProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  isDark: boolean;
}

export const Footer: React.FC<FooterProps> = ({ theme, onToggleTheme, isDark }) => {
  return (
    <footer
      id="app-footer"
      className="w-full pb-8 transition-colors duration-200 mt-8 relative z-10"
    >
      <div
        className={`p-3.5 sm:px-6 rounded-2xl border transition-all duration-300 shadow-2xl shadow-black/80 hover:-translate-y-0.5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-code tracking-widest uppercase ${
          isDark
            ? 'border-white/15 bg-[#0b0c12]/90 text-white/60'
            : 'border-slate-200/90 bg-white/95 text-slate-600 shadow-slate-950/20'
        }`}
      >
        {/* Left Side: STUDY SPACE / 2026 */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-white/80 dark:text-white/80">STUDY SPACE / 2026</span>
        </div>

        {/* Right Side: ☼ BUILT FOR SLOW, MEANINGFUL PROGRESS & Theme Toggle */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400/80" />
            <span className="text-[11px] sm:text-xs">
              BUILT FOR SLOW, MEANINGFUL PROGRESS
            </span>
          </div>

          <div className="h-3 w-px bg-white/15 hidden sm:block" />

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </footer>
  );
};
