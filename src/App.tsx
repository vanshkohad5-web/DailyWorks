import React, { useState, useEffect } from 'react';
import { api } from './api.ts';
import { Task, Subject, BrainDumpData, ThemeMode, Priority } from './types.ts';
import { SubjectCards } from './components/SubjectCards.tsx';
import { TaskList } from './components/TaskList.tsx';
import { BrainDump } from './components/BrainDump.tsx';
import { Footer } from './components/Footer.tsx';
import { WatchAndStopwatch } from './components/WatchAndStopwatch.tsx';
import { CalendarAndWeather } from './components/CalendarAndWeather.tsx';
import { CourseDetailsModal } from './components/CourseDetailsModal.tsx';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [brainDump, setBrainDump] = useState<BrainDumpData>({ content: '', lastUpdated: '' });
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [viewingSubject, setViewingSubject] = useState<Subject | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('study_space_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync theme to root class and localStorage
  useEffect(() => {
    localStorage.setItem('study_space_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-[#0c0d12] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen overflow-x-hidden';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-[#f0f3f8] text-slate-900 antialiased selection:bg-indigo-500/30 selection:text-indigo-900 min-h-screen overflow-x-hidden';
    }
  }, [theme]);

  // Initial load from backend API
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [fetchedTasks, fetchedSubjects, fetchedBrainDump] = await Promise.all([
          api.getTasks(),
          api.getSubjects(),
          api.getBrainDump(),
        ]);
        setTasks(fetchedTasks);
        setSubjects(fetchedSubjects);
        setBrainDump(fetchedBrainDump);
        setErrorMsg(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setErrorMsg('Unable to connect to the backend server. Changes may not persist.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Task Actions with optimistic updates
  const handleToggleTask = async (id: string, completed: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );
    try {
      await api.updateTask(id, { completed });
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleAddTask = async ({ title, tag, priority = 'normal' }: { title: string; tag: string; priority?: Priority }) => {
    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      title,
      tag,
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);

    try {
      const created = await api.createTask({ title, tag, priority });
      setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
    } catch (err) {
      console.error('Failed to create task on server:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.deleteTask(id);
    } catch (err) {
      console.error('Failed to delete task on server:', err);
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    try {
      await api.updateTask(id, updates);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  // Subject Actions
  const handleAddSubject = async (newSubject: { code: string; title: string; constellationType: any; color: string }) => {
    try {
      const created = await api.createSubject(newSubject);
      setSubjects((prev) => [...prev, created]);
    } catch (err) {
      console.error('Failed to add subject:', err);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    if (viewingSubject && viewingSubject.id === id) {
      setViewingSubject(null);
    }
    try {
      await api.deleteSubject(id);
    } catch (err) {
      console.error('Failed to delete subject:', err);
    }
  };

  const handleUpdateSubject = async (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    if (viewingSubject && viewingSubject.id === id) {
      setViewingSubject((prev) => (prev ? { ...prev, ...updates } : null));
    }
    try {
      const updated = await api.updateSubject(id, updates);
      setSubjects((prev) =>
        prev.map((s) => (s.id === id ? updated : s))
      );
      if (viewingSubject && viewingSubject.id === id) {
        setViewingSubject(updated);
      }
    } catch (err) {
      console.error('Failed to update subject on server:', err);
    }
  };

  // Brain Dump Actions
  const handleSaveBrainDump = async (content: string) => {
    try {
      const saved = await api.saveBrainDump(content);
      setBrainDump(saved);
    } catch (err) {
      console.error('Failed to save brain dump:', err);
    }
  };

  const handleConvertBrainDumpLineToTask = (text: string) => {
    handleAddTask({
      title: text,
      tag: selectedSubject || 'GENERAL',
      priority: 'normal',
    });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  const activeCount = tasks.filter((t) => !t.completed).length;
  const doneCount = tasks.filter((t) => t.completed).length;
  const urgentCount = tasks.filter((t) => !t.completed && (t.priority === 'urgent' || t.priority === 'high')).length;

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Pure Scenic Pixel Art Night Road Background */}
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden select-none">
        <img
          src="/background.jpg"
          alt="Night Pixel Road Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-100"
        />
      </div>

      {/* Main Content Area: Floating Islands */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-6 flex-1 relative z-10">
        {/* Top Status & Metrics Bar: Floating Capsule */}
        <div className={`mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-300 shadow-2xl shadow-black/80 hover:-translate-y-0.5 ${
          isDark 
            ? 'border-white/15 bg-[#0b0c12]/90 text-white' 
            : 'border-slate-200/90 bg-white/95 shadow-slate-950/20 text-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono-code font-bold tracking-wider uppercase text-slate-100 dark:text-slate-100">
                  TASQ
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border border-indigo-500/40 text-indigo-300 bg-indigo-500/20 font-mono-code font-semibold">
                  STUDY SPACE
                </span>
              </div>
              <p className="text-xs text-white/60 dark:text-white/60">
                Floating Workspace
              </p>
            </div>
          </div>

          {/* Quick Metrics Chips */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono-code shadow-md ${
              isDark ? 'border-white/10 bg-black/50' : 'border-slate-200 bg-slate-50'
            }`}>
              <span className="text-white/50 text-[10px] uppercase tracking-wider">Active</span>
              <span className="font-bold text-indigo-300">{activeCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/15 flex items-center gap-2 text-xs font-mono-code shadow-md">
              <span className="text-rose-400/80 text-[10px] uppercase tracking-wider">Urgent</span>
              <span className="font-bold text-rose-400">{urgentCount}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 flex items-center gap-2 text-xs font-mono-code shadow-md">
              <span className="text-emerald-400/80 text-[10px] uppercase tracking-wider">Done</span>
              <span className="font-bold text-emerald-300">{doneCount}</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono-code flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-amber-300 hover:text-white">✕</button>
          </div>
        )}

        {/* Chrono Suite: Digital Real-Time Watch & Study Stopwatch */}
        <section className="mb-6">
          <WatchAndStopwatch isDark={isDark} />
        </section>

        {/* Real-time Interactive Calendar & Live Weather Dashboard */}
        <section className="mb-8">
          <CalendarAndWeather
            tasks={tasks}
            onAddTask={handleAddTask}
            isDark={isDark}
          />
        </section>

        {/* Top Section: Subject / Constellation Cards */}
        <section className="mb-8">
          <SubjectCards
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            onViewDetails={setViewingSubject}
            onAddSubject={handleAddSubject}
            onDeleteSubject={handleDeleteSubject}
            isDark={isDark}
          />
        </section>

        {/* Middle Section: 2 Columns (Left: Today's Focus & Daily Tasks, Right: Brain Dump) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Column: Daily Tasks */}
          <TaskList
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            isDark={isDark}
            selectedTag={selectedSubject}
            onClearTagFilter={() => setSelectedSubject(null)}
          />

          {/* Right Column: Brain Dump */}
          <BrainDump
            initialData={brainDump}
            onSave={handleSaveBrainDump}
            onConvertToTask={handleConvertBrainDumpLineToTask}
            isDark={isDark}
          />
        </section>
      </main>

      {/* Bottom Footer Section */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Footer
          theme={theme}
          onToggleTheme={toggleTheme}
          isDark={isDark}
        />
      </div>

      {/* Course Details Modal */}
      {viewingSubject && (
        <CourseDetailsModal
          subject={viewingSubject}
          tasks={tasks}
          onClose={() => setViewingSubject(null)}
          onToggleTask={handleToggleTask}
          onAddTask={handleAddTask}
          onUpdateSubject={handleUpdateSubject}
          onFilterBySubject={(code) => setSelectedSubject(code)}
          isDark={isDark}
        />
      )}
    </div>
  );
}
