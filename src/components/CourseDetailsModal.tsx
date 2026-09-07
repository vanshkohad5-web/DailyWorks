import React, { useState } from 'react';
import {
  X,
  User,
  Clock,
  MapPin,
  Award,
  Calendar,
  BookOpen,
  CheckCircle2,
  Circle,
  Plus,
  Edit3,
  Save,
  Check,
  Filter,
  Layers,
  Sparkles,
  ListTodo
} from 'lucide-react';
import { Subject, Task, Priority } from '../types.ts';
import { ConstellationCanvas } from './ConstellationCanvas.tsx';

interface CourseDetailsModalProps {
  subject: Subject | null;
  tasks: Task[];
  onClose: () => void;
  onToggleTask: (id: string, completed: boolean) => Promise<void>;
  onAddTask: (task: { title: string; tag: string; priority?: Priority }) => Promise<void>;
  onUpdateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  onFilterBySubject: (code: string) => void;
  isDark: boolean;
}

export const CourseDetailsModal: React.FC<CourseDetailsModalProps> = ({
  subject,
  tasks,
  onClose,
  onToggleTask,
  onAddTask,
  onUpdateSubject,
  onFilterBySubject,
  isDark,
}) => {
  if (!subject) return null;

  // Find all tasks related to this subject
  const courseTasks = tasks.filter(
    (t) =>
      t.tag.toLowerCase().includes(subject.code.toLowerCase()) ||
      subject.code.toLowerCase().includes(t.tag.toLowerCase())
  );

  const completedCount = courseTasks.filter((t) => t.completed).length;
  const progressPercent = courseTasks.length > 0 ? Math.round((completedCount / courseTasks.length) * 100) : 0;

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editInstructor, setEditInstructor] = useState(subject.instructor || '');
  const [editSchedule, setEditSchedule] = useState(subject.schedule || '');
  const [editLocation, setEditLocation] = useState(subject.location || '');
  const [editCredits, setEditCredits] = useState(String(subject.credits || ''));
  const [editTerm, setEditTerm] = useState(subject.term || '');
  const [editDescription, setEditDescription] = useState(subject.description || '');
  const [isSaving, setIsSaving] = useState(false);

  // Quick Add Task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('normal');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleSaveDetails = async () => {
    try {
      setIsSaving(true);
      await onUpdateSubject(subject.id, {
        instructor: editInstructor.trim() || undefined,
        schedule: editSchedule.trim() || undefined,
        location: editLocation.trim() || undefined,
        credits: editCredits.trim() || undefined,
        term: editTerm.trim() || undefined,
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update subject details:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      setIsAddingTask(true);
      await onAddTask({
        title: newTaskTitle.trim(),
        tag: subject.code,
        priority: newTaskPriority,
      });
      setNewTaskTitle('');
    } catch (err) {
      console.error('Failed to add task for subject:', err);
    } finally {
      setIsAddingTask(false);
    }
  };

  return (
    <div
      id="course-details-modal-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="course-details-modal-content"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden transition-all my-8 max-h-[90vh] flex flex-col ${
          isDark
            ? 'bg-[#0c0d12] border-white/15 text-slate-100 shadow-black/90'
            : 'bg-white border-slate-200 text-slate-900 shadow-indigo-950/20'
        }`}
      >
        {/* Modal Banner Header with Constellation Art */}
        <div className="relative w-full h-44 sm:h-52 overflow-hidden flex-shrink-0">
          <ConstellationCanvas
            type={subject.constellationType}
            color={subject.color}
            isDark={isDark}
          />

          {/* Close Button */}
          <button
            id="close-course-details-modal"
            type="button"
            onClick={onClose}
            aria-label="Close course details"
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/70 hover:bg-black/90 border border-white/20 text-white/80 hover:text-white transition-all z-20 shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Overlay Gradient on Banner */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12]/90 via-transparent to-black/20 pointer-events-none" />

          {/* Banner Title Content */}
          <div className="absolute bottom-4 left-5 sm:left-7 right-5 flex items-end justify-between gap-4 z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono-code font-bold tracking-widest px-2.5 py-0.5 rounded-lg bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase">
                  {subject.code}
                </span>
                <span className="text-xs font-mono-code tracking-wider text-white/70 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  {subject.constellationType}
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
                {subject.title}
              </h2>
            </div>

            {/* Quick Filter In Workspace Button */}
            <button
              id="filter-workspace-by-course"
              type="button"
              onClick={() => {
                onFilterBySubject(subject.code);
                onClose();
              }}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-mono-code font-semibold shadow-lg shadow-indigo-500/30 transition-all select-none"
            >
              <Filter className="w-3.5 h-3.5" />
              Focus In Workspace
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Action Bar (Edit Details / Filter for Mobile) */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-code text-indigo-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Academic Course Dossier
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="edit-course-details-toggle"
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1.5 text-xs font-mono-code px-3 py-1.5 rounded-xl border transition-all ${
                  isEditing
                    ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300'
                    : isDark
                    ? 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Cancel Editing' : 'Edit Details'}
              </button>

              <button
                type="button"
                onClick={() => {
                  onFilterBySubject(subject.code);
                  onClose();
                }}
                className="sm:hidden flex items-center gap-1.5 text-xs font-mono-code px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-sm"
              >
                <Filter className="w-3.5 h-3.5" />
                Focus
              </button>
            </div>
          </div>

          {/* Quick Academic Key-Value Badges */}
          {!isEditing ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Instructor */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-indigo-400 mb-1">
                  <User className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">Instructor</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold truncate">
                  {subject.instructor || 'Faculty Instructor'}
                </p>
              </div>

              {/* Schedule */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-purple-400 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">Schedule</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold truncate">
                  {subject.schedule || 'Schedule TBA'}
                </p>
              </div>

              {/* Location */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-cyan-400 mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">Location</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold truncate">
                  {subject.location || 'Main Campus'}
                </p>
              </div>

              {/* Credits & Term */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white shadow-xs'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-emerald-400 mb-1">
                  <Award className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">Credits</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold truncate">
                  {subject.credits || '4.0 Credits'} • {subject.term || 'Fall 2026'}
                </p>
              </div>
            </div>
          ) : (
            /* Editing Form */
            <div className={`p-5 rounded-2xl border space-y-4 ${
              isDark ? 'bg-white/[0.04] border-indigo-500/30' : 'bg-slate-50 border-indigo-200'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono-code uppercase text-indigo-400 mb-1 font-medium">
                    Instructor
                  </label>
                  <input
                    type="text"
                    value={editInstructor}
                    onChange={(e) => setEditInstructor(e.target.value)}
                    placeholder="e.g. Prof. Margaret Holloway"
                    className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code uppercase text-purple-400 mb-1 font-medium">
                    Schedule
                  </label>
                  <input
                    type="text"
                    value={editSchedule}
                    onChange={(e) => setEditSchedule(e.target.value)}
                    placeholder="e.g. Tue, Thu • 10:00 AM - 11:30 AM"
                    className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code uppercase text-cyan-400 mb-1 font-medium">
                    Location / Room
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Auditorium C • Arts Quad"
                    className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-code uppercase text-emerald-400 mb-1 font-medium">
                    Credits / Units
                  </label>
                  <input
                    type="text"
                    value={editCredits}
                    onChange={(e) => setEditCredits(e.target.value)}
                    placeholder="e.g. 4.0 Credits"
                    className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none ${
                      isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono-code uppercase text-white/60 mb-1 font-medium">
                  Course Description & Syllabus Summary
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  placeholder="Summarize course goals, office hours, or required texts..."
                  className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-none resize-none ${
                    isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveDetails}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/25"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Description Section */}
          {!isEditing && (
            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white shadow-xs'
              }`}
            >
              <h3 className="text-xs font-mono-code uppercase text-white/50 dark:text-white/50 tracking-wider mb-2 font-semibold">
                Course Description & Focus
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-white/80 dark:text-white/80">
                {subject.description || 'No description provided yet. Click "Edit Details" to add syllabus milestones and lecture notes.'}
              </p>
            </div>
          )}

          {/* Syllabus Curriculum Modules */}
          {subject.syllabus && subject.syllabus.length > 0 && !isEditing && (
            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-white shadow-xs'
              }`}
            >
              <h3 className="text-xs font-mono-code uppercase text-indigo-300 tracking-wider mb-3 font-semibold flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Curriculum Syllabus Modules
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {subject.syllabus.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs ${
                      isDark ? 'border-white/5 bg-white/[0.02] text-white/75' : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-mono-code font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked Tasks & Progress Section */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-mono-code uppercase tracking-wider font-semibold">
                  Course Tasks ({completedCount}/{courseTasks.length})
                </h3>
              </div>
              <span className="text-xs font-mono-code font-bold text-indigo-400">
                {progressPercent}% Done
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-4">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Quick Add Task for this Course Form */}
            <form onSubmit={handleQuickAddTask} className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder={`Add new task for ${subject.code}...`}
                className={`flex-1 text-xs px-3.5 py-2 rounded-xl border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-black/30 border-white/10 text-white placeholder-white/40 focus:border-indigo-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                className={`text-xs px-2.5 py-2 rounded-xl border focus:outline-none font-mono-code ${
                  isDark ? 'bg-[#0c0d12] border-white/10 text-white/80' : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
              <button
                type="submit"
                disabled={isAddingTask || !newTaskTitle.trim()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-mono-code font-semibold flex items-center gap-1 shadow-md shadow-indigo-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>

            {/* Course Tasks List */}
            {courseTasks.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono-code text-white/40">
                No tasks currently linked to {subject.code}. Use the input above to add your first assignment!
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {courseTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      t.completed
                        ? 'opacity-60 bg-white/[0.01] border-white/5'
                        : isDark
                        ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                        : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTask(t.id, !t.completed)}
                      className="flex items-center gap-2.5 text-left flex-1"
                    >
                      {t.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-white/30 hover:text-indigo-400 flex-shrink-0" />
                      )}
                      <span
                        className={`text-xs ${
                          t.completed ? 'line-through text-white/40' : 'text-white/90 font-medium'
                        }`}
                      >
                        {t.title}
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono-code uppercase px-2 py-0.5 rounded-full border font-medium ${
                          t.priority === 'high'
                            ? 'border-rose-500/40 text-rose-300 bg-rose-500/10'
                            : t.priority === 'low'
                            ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                            : 'border-slate-500/30 text-slate-300 bg-slate-500/10'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 text-xs font-mono-code ${
            isDark ? 'border-white/10 bg-white/[0.02] text-white/50' : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>COURSE PERSISTED IN SYSTEM</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onFilterBySubject(subject.code);
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl border border-indigo-400/40 text-indigo-300 hover:bg-indigo-500/15 transition-colors font-medium"
            >
              Filter Tasks
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
