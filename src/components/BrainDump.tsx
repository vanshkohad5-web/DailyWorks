import React, { useState, useEffect, useRef } from 'react';
import { Edit3, ChevronDown, Check, Copy, Trash2, ListPlus } from 'lucide-react';
import { BrainDumpData } from '../types.ts';

interface BrainDumpProps {
  initialData: BrainDumpData;
  onSave: (content: string) => Promise<void>;
  onConvertToTask?: (text: string) => void;
  isDark: boolean;
}

export const BrainDump: React.FC<BrainDumpProps> = ({
  initialData,
  onSave,
  onConvertToTask,
  isDark,
}) => {
  const [content, setContent] = useState(initialData.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync if initialData changes externally
  useEffect(() => {
    if (initialData.content !== undefined && content === '') {
      setContent(initialData.content);
    }
  }, [initialData]);

  // Debounced auto-save
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextVal = e.target.value;
    setContent(nextVal);
    setIsSaving(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await onSave(nextVal);
        setIsSaving(false);
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error('Failed to autosave brain dump', err);
        setIsSaving(false);
      }
    }, 600);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowMenu(false);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your brain dump?')) {
      setContent('');
      onSave('');
      setShowMenu(false);
    }
  };

  const handleConvertFirstLine = () => {
    const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length > 0 && onConvertToTask) {
      onConvertToTask(lines[0]);
      setShowMenu(false);
    }
  };

  const charCount = content.length;

  return (
    <div
      id="brain-dump-panel"
      className={`rounded-2xl border p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 shadow-2xl shadow-black/80 hover:-translate-y-0.5 ${
        isDark ? 'border-white/15 bg-[#0b0c12]/90 shadow-black/80' : 'border-slate-200/90 bg-white/95 shadow-slate-950/20'
      }`}
    >
      <div>
        {/* Header Row: ✎ BRAIN DUMP             ⌄ */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 text-xs font-mono-code tracking-widest uppercase font-medium ${
                isDark ? 'text-indigo-300' : 'text-indigo-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              BRAIN DUMP
            </span>
          </div>

          <div className="relative">
            <button
              id="brain-dump-options-menu"
              type="button"
              aria-label="Brain dump options"
              onClick={() => setShowMenu(!showMenu)}
              className={`p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors ${
                !isDark && 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-2xl py-1.5 z-20 text-xs font-mono-code ${
                  isDark ? 'bg-[#0c0d12]/95 border-white/10 text-white/80' : 'bg-white border-slate-200 text-slate-700 shadow-xl'
                }`}
              >
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`w-full px-3.5 py-2 flex items-center gap-2 text-left hover:bg-indigo-500/15 hover:text-indigo-300 transition-colors`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </button>

                {onConvertToTask && content.trim() && (
                  <button
                    type="button"
                    onClick={handleConvertFirstLine}
                    className={`w-full px-3.5 py-2 flex items-center gap-2 text-left hover:bg-indigo-500/15 hover:text-indigo-300 transition-colors`}
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    Send top line to tasks
                  </button>
                )}

                <div className={`my-1 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`} />

                <button
                  type="button"
                  onClick={handleClear}
                  className={`w-full px-3.5 py-2 flex items-center gap-2 text-left text-rose-400 hover:bg-rose-500/10 transition-colors`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear note
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            id="brain-dump-textarea"
            value={content}
            onChange={handleChange}
            placeholder="Leave a thought here..."
            rows={9}
            className={`w-full resize-none rounded-xl bg-transparent p-1.5 text-xs sm:text-sm leading-relaxed tracking-wide font-mono-code focus:outline-none transition-colors ${
              isDark
                ? 'text-white/90 placeholder-white/30'
                : 'text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {/* Footer Status */}
      <div
        className={`pt-3 mt-4 border-t flex items-center justify-between text-[11px] font-mono-code uppercase tracking-wider ${
          isDark ? 'border-white/10 text-white/40' : 'border-slate-200/80 text-slate-500'
        }`}
      >
        <span id="brain-dump-char-count">{charCount} CHARACTERS</span>

        <div className="flex items-center gap-1.5">
          {isSaving ? (
            <span className="text-amber-400 animate-pulse flex items-center gap-1">
              SAVING...
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              AUTOSAVED
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
