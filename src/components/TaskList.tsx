import React, { useState } from 'react';
import { Check, Plus, Trash2, Edit2, CheckSquare, Tag, AlertCircle } from 'lucide-react';
import { Task, Priority } from '../types.ts';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string, completed: boolean) => Promise<void>;
  onAddTask: (task: { title: string; tag: string; priority?: Priority }) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  isDark: boolean;
  selectedTag: string | null;
  onClearTagFilter: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
  isDark,
  selectedTag,
  onClearTagFilter,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTag, setEditTag] = useState('');

  // Collect unique existing tags for quick suggestion
  const existingTags = Array.from(new Set(tasks.map((t) => t.tag).filter(Boolean)));
  if (!existingTags.includes('GENERAL')) existingTags.unshift('GENERAL');

  // Filter tasks if selectedTag is active
  const displayedTasks = selectedTag
    ? tasks.filter((t) => t.tag.toLowerCase().includes(selectedTag.toLowerCase()) || selectedTag.toLowerCase().includes(t.tag.toLowerCase()))
    : tasks;

  const totalCount = displayedTasks.length;
  const completedCount = displayedTasks.filter((t) => t.completed).length;

  const handleCreateTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    const assignedTag = newTag.trim() ? newTag.trim().toUpperCase() : selectedTag || 'GENERAL';
    await onAddTask({
      title: newTitle.trim(),
      tag: assignedTag,
    });

    setNewTitle('');
    setShowTagSelector(false);
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditTag(task.tag);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) return;
    await onUpdateTask(id, {
      title: editTitle.trim(),
      tag: editTag.trim().toUpperCase() || 'GENERAL',
    });
    setEditingTaskId(null);
  };

  return (
    <div
      id="daily-tasks-panel"
      className={`rounded-2xl border p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 shadow-2xl shadow-black/80 hover:-translate-y-0.5 ${
        isDark ? 'border-white/15 bg-[#0b0c12]/90 shadow-black/80' : 'border-slate-200/90 bg-white/95 shadow-slate-950/20'
      }`}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 text-xs font-mono-code tracking-widest uppercase font-medium ${
                isDark ? 'text-indigo-300' : 'text-indigo-700'
              }`}
            >
              <Check className="w-3.5 h-3.5 text-indigo-400" />
              TODAY'S FOCUS
            </span>

            {selectedTag && (
              <button
                onClick={onClearTagFilter}
                className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition-colors"
                title="Click to clear filter"
              >
                tag: {selectedTag} ✕
              </button>
            )}
          </div>

          {/* Progress pill */}
          <div
            id="task-progress-badge"
            className="px-3 py-0.5 rounded-full text-xs font-mono-code font-semibold tracking-wider bg-white/10 text-indigo-300 border border-white/15"
          >
            {completedCount}/{totalCount}
          </div>
        </div>

        {/* Display Title */}
        <h2
          className={`text-2xl sm:text-[26px] font-bold tracking-tight mb-5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Daily tasks
        </h2>

        {/* Task List */}
        <div className="space-y-2.5 mb-6">
          {displayedTasks.length === 0 ? (
            <div
              className={`py-8 text-center text-xs font-mono-code uppercase tracking-wider rounded-xl border border-dashed ${
                isDark ? 'border-white/10 text-white/40' : 'border-slate-300 text-slate-500'
              }`}
            >
              No tasks found. Add a new task below.
            </div>
          ) : (
            displayedTasks.map((task) => {
              const isEditing = editingTaskId === task.id;

              return (
                <div
                  key={task.id}
                  id={`task-item-${task.id}`}
                  className={`group relative flex items-start justify-between p-3 sm:p-3.5 rounded-xl border transition-all duration-200 ${
                    isDark
                      ? 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5 hover:border-white/15'
                      : 'bg-white/60 hover:bg-white/90 border-slate-200/60 hover:border-indigo-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Custom Checkbox */}
                    <button
                      id={`checkbox-${task.id}`}
                      type="button"
                      aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
                      onClick={() => onToggleTask(task.id, !task.completed)}
                      className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                          : isDark
                          ? 'bg-black/20 border-indigo-400/40 hover:border-indigo-400 text-transparent'
                          : 'bg-white border-slate-300 hover:border-indigo-500 text-transparent'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    {/* Task Title & Tag */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-2 mr-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                            className={`w-full text-sm px-3 py-1.5 rounded-lg border focus:outline-none ${
                              isDark
                                ? 'bg-black/30 border-white/15 text-white focus:border-indigo-400'
                                : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                            }`}
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editTag}
                            onChange={(e) => setEditTag(e.target.value)}
                            placeholder="Tag (e.g. SCITES030)"
                            className={`w-36 text-xs font-mono-code px-2 py-1 rounded-lg border uppercase focus:outline-none ${
                              isDark
                                ? 'bg-black/30 border-white/15 text-white/80'
                                : 'bg-white border-slate-300 text-slate-700'
                            }`}
                          />
                          <div className="flex gap-2 text-xs">
                            <button
                              onClick={() => handleSaveEdit(task.id)}
                              className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingTaskId(null)}
                              className="px-3 py-1 text-white/50 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p
                            onClick={() => onToggleTask(task.id, !task.completed)}
                            className={`text-[14px] leading-relaxed cursor-pointer select-none transition-all ${
                              task.completed
                                ? 'line-through text-white/35 dark:text-white/35 text-slate-400'
                                : isDark
                                ? 'text-white/90 hover:text-white'
                                : 'text-slate-800 hover:text-slate-950 font-medium'
                            }`}
                          >
                            {task.title}
                          </p>
                          <span
                            className={`inline-block text-[10px] font-mono-code tracking-wider uppercase mt-1 px-2 py-0.5 rounded-full border ${
                              task.completed
                                ? 'text-white/30 border-white/5 bg-transparent'
                                : isDark
                                ? 'text-indigo-300 border-indigo-500/30 bg-indigo-500/10'
                                : 'text-indigo-700 border-indigo-200 bg-indigo-50'
                            }`}
                          >
                            {task.tag}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons on Hover */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                      <button
                        id={`edit-task-${task.id}`}
                        type="button"
                        aria-label="Edit task"
                        onClick={() => handleStartEdit(task)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`delete-task-${task.id}`}
                        type="button"
                        aria-label="Delete task"
                        onClick={() => onDeleteTask(task.id)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Task Box at Bottom */}
      <div className="mt-auto pt-2">
        <form
          onSubmit={handleCreateTask}
          className={`flex items-stretch rounded-xl border transition-all duration-200 ${
            isDark
              ? 'border-white/10 bg-black/50 focus-within:border-indigo-500/60'
              : 'border-slate-200 bg-white focus-within:border-indigo-500 shadow-xs'
          }`}
        >
          <div className="relative flex-1 flex items-center">
            <input
              id="new-task-input"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a new task..."
              className={`w-full px-4 py-2.5 text-xs sm:text-sm bg-transparent focus:outline-none ${
                isDark ? 'text-white placeholder-white/40' : 'text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Quick Tag Selector Pill button */}
          <div className="flex items-center px-1">
            <button
              type="button"
              id="toggle-tag-selector"
              onClick={() => setShowTagSelector(!showTagSelector)}
              title="Assign Tag"
              className={`text-[10px] font-mono-code uppercase px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                newTag
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold'
                  : isDark
                  ? 'text-white/50 border-white/10 hover:text-white hover:border-white/20'
                  : 'text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
            >
              <Tag className="w-2.5 h-2.5" />
              {newTag || (selectedTag ? selectedTag : 'TAG')}
            </button>
          </div>

          {/* Submit button with vibrant Indigo/Purple gradient */}
          <button
            id="submit-new-task"
            type="submit"
            aria-label="Add task"
            disabled={!newTitle.trim()}
            className={`w-11 sm:w-12 flex items-center justify-center border-l rounded-r-xl transition-all ${
              isDark
                ? 'border-white/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 disabled:text-white/20 disabled:hover:bg-transparent'
                : 'border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 disabled:text-slate-300 disabled:hover:bg-transparent'
            }`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        {/* Tag selection dropdown drawer if expanded */}
        {showTagSelector && (
          <div
            className={`mt-2 p-2.5 rounded-xl border text-xs flex flex-wrap items-center gap-1.5 ${
              isDark ? 'bg-[#0c0d12]/95 border-white/10' : 'bg-white border-slate-200 shadow-lg'
            }`}
          >
            <span className={`text-[10px] font-mono-code mr-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              PRESETS:
            </span>
            {existingTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setNewTag(tag);
                  setShowTagSelector(false);
                }}
                className={`px-2.5 py-0.5 rounded-lg font-mono-code text-[11px] border transition-colors ${
                  newTag === tag
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : isDark
                    ? 'bg-white/5 border-white/10 text-white/70 hover:border-indigo-400'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-indigo-400'
                }`}
              >
                {tag}
              </button>
            ))}
            <input
              type="text"
              placeholder="Custom tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value.toUpperCase())}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono-code border focus:outline-none uppercase ${
                isDark
                  ? 'bg-black/40 border-white/10 text-white focus:border-indigo-400'
                  : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-indigo-500'
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
};
