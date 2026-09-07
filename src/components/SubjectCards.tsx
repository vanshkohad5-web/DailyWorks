import React, { useState } from 'react';
import { ArrowUpRight, Plus, X, Trash2, BookOpen, Info, Filter, Clock } from 'lucide-react';
import { Subject } from '../types.ts';
import { ConstellationCanvas } from './ConstellationCanvas.tsx';

interface SubjectCardsProps {
  subjects: Subject[];
  selectedSubject: string | null;
  onSelectSubject: (code: string | null) => void;
  onViewDetails: (subject: Subject) => void;
  onAddSubject: (subject: { code: string; title: string; constellationType: any; color: string }) => Promise<void>;
  onDeleteSubject: (id: string) => Promise<void>;
  isDark: boolean;
}

export const SubjectCards: React.FC<SubjectCardsProps> = ({
  subjects,
  selectedSubject,
  onSelectSubject,
  onViewDetails,
  onAddSubject,
  onDeleteSubject,
  isDark,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [constellationType, setConstellationType] = useState<'moon-orbit' | 'geometry-mesh' | 'star-cluster'>('moon-orbit');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newTitle.trim()) return;
    await onAddSubject({
      code: newCode.trim().toUpperCase(),
      title: newTitle.trim(),
      constellationType,
      color: constellationType === 'moon-orbit' ? '#38bdf8' : constellationType === 'geometry-mesh' ? '#818cf8' : '#2dd4bf',
    });
    setNewCode('');
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono-code tracking-widest uppercase font-semibold ${
            isDark ? 'text-indigo-300' : 'text-indigo-700'
          }`}>
            COURSES & MODULES
          </span>
          <span className={`text-[11px] font-mono-code ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            • Click any course to inspect full details
          </span>
        </div>

        {selectedSubject && (
          <button
            type="button"
            onClick={() => onSelectSubject(null)}
            className="text-xs font-mono-code text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
          >
            Clear Filter: <span className="font-bold">{selectedSubject}</span> ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {subjects.map((sub) => {
          const isSelected = selectedSubject === sub.code;
          return (
            <div
              key={sub.id}
              id={`subject-card-${sub.code.toLowerCase()}`}
              onClick={() => onViewDetails(sub)}
              className={`group relative flex flex-col rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden ${
                isSelected
                  ? isDark
                    ? 'border-indigo-400 ring-2 ring-indigo-500/50 bg-[#0b0c12]/95 shadow-2xl shadow-indigo-500/25 -translate-y-1'
                    : 'border-indigo-500 ring-2 ring-indigo-400/40 bg-white shadow-2xl -translate-y-1'
                  : isDark
                  ? 'border-white/15 hover:border-indigo-400/60 bg-[#0b0c12]/90 hover:bg-[#0b0c12] shadow-xl shadow-black/80 hover:shadow-2xl hover:shadow-indigo-500/15 hover:-translate-y-1'
                  : 'border-slate-200/90 hover:border-indigo-400 bg-white/95 hover:bg-white shadow-xl shadow-slate-950/15 hover:-translate-y-1'
              }`}
            >
              {/* Canvas Header */}
              <div className="relative">
                <ConstellationCanvas
                  type={sub.constellationType}
                  color={sub.color}
                  isDark={isDark}
                />
                
                {/* Floating "Inspect Details" hover pill */}
                <div className="absolute top-3 right-3 opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="flex items-center gap-1 text-[10px] font-mono-code tracking-wider px-2.5 py-1 rounded-lg bg-black/60 border border-white/20 text-white/90 shadow-md">
                    <Info className="w-3 h-3 text-indigo-300" />
                    DETAILS
                  </span>
                </div>
              </div>

              {/* Card Footer Metadata */}
              <div
                className={`p-4 sm:p-5 flex flex-col justify-between border-t transition-colors flex-1 ${
                  isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100/80 bg-white/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold tracking-wider font-mono-code ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {sub.code}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                          FILTER ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Filter Shortcut button */}
                      <button
                        type="button"
                        title={isSelected ? "Clear filter" : `Filter workspace tasks by ${sub.code}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSubject(isSelected ? null : sub.code);
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300'
                            : 'border-white/10 text-white/40 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Filter className="w-3.5 h-3.5" />
                      </button>

                      {subjects.length > 2 && (
                        <button
                          id={`delete-subject-${sub.id}`}
                          type="button"
                          title="Delete subject"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSubject(sub.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p
                    className={`text-xs tracking-tight line-clamp-1 font-medium ${
                      isDark ? 'text-white/80' : 'text-slate-700'
                    }`}
                  >
                    {sub.title}
                  </p>

                  {/* Subtitle / Instructor preview */}
                  <p
                    className={`text-[11px] mt-1 truncate ${
                      isDark ? 'text-white/50' : 'text-slate-500'
                    }`}
                  >
                    {sub.instructor ? sub.instructor : sub.schedule ? sub.schedule : 'Click to inspect syllabus & notes'}
                  </p>
                </div>

                {/* Bottom Card Action Bar */}
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono-code text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  <span className="flex items-center gap-1">
                    View Course Details
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Subject Card Option */}
        {!isAdding ? (
          <button
            id="add-subject-button"
            type="button"
            onClick={() => setIsAdding(true)}
            className={`hidden sm:flex flex-col items-center justify-center min-h-[180px] rounded-2xl border border-dashed transition-all duration-200 ${
              isDark
                ? 'border-white/10 hover:border-white/20 bg-[#0c0d12]/70 hover:bg-[#0c0d12]/90 text-white/40 hover:text-white/80'
                : 'border-slate-300 hover:border-indigo-300 bg-white/70 hover:bg-white text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center mb-2 bg-white/5">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono-code uppercase tracking-wider">Add Course / Subject</span>
          </button>
        ) : (
          <form
            onSubmit={handleSubmit}
            className={`p-5 rounded-2xl border flex flex-col justify-between ${
              isDark ? 'border-indigo-500/40 bg-[#0c0d12]/95 shadow-2xl' : 'border-indigo-300 bg-white shadow-xl'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono-code uppercase text-indigo-400 flex items-center gap-1.5 font-semibold">
                <BookOpen className="w-3.5 h-3.5" /> New Course
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 mb-3">
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Code (e.g. CS101)"
                required
                className={`w-full text-xs font-mono-code px-3 py-2 rounded-xl border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-black/30 border-white/10 text-white placeholder-white/30 focus:border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title (e.g. Algorithms)"
                required
                className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-black/30 border-white/10 text-white placeholder-white/30 focus:border-indigo-500'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
              <select
                value={constellationType}
                onChange={(e) => setConstellationType(e.target.value as any)}
                className={`w-full text-xs font-mono-code px-3 py-2 rounded-xl border focus:outline-none ${
                  isDark
                    ? 'bg-[#0c0d12] border-white/10 text-white/80'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <option value="moon-orbit">Moon Orbit Art</option>
                <option value="geometry-mesh">Geometric Constellation</option>
                <option value="star-cluster">Star Cluster</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs px-3 py-1.5 text-white/50 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-md shadow-indigo-500/25"
              >
                Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
