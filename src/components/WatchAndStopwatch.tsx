import React, { useState, useEffect, useRef } from 'react';
import { Clock, Timer, Play, Pause, RotateCcw, Flag, Calendar, Globe, Maximize2, Minimize2 } from 'lucide-react';

interface WatchAndStopwatchProps {
  isDark: boolean;
}

interface LapItem {
  id: number;
  lapTime: number;
  totalTime: number;
}

export const WatchAndStopwatch: React.FC<WatchAndStopwatchProps> = ({ isDark }) => {
  // Mode: 'both' (split), 'clock' (only real-time watch), 'stopwatch' (only stopwatch)
  const [activeTab, setActiveTab] = useState<'both' | 'clock' | 'stopwatch'>('both');
  const [is24Hour, setIs24Hour] = useState<boolean>(false);

  // --- Real-time Digital Watch State ---
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(new Date());
    }, 250); // updates smoothly 4 times/sec to capture exact second transitions

    return () => clearInterval(timerId);
  }, []);

  // Format real-time watch
  const hoursRaw = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const period = hoursRaw >= 12 ? 'PM' : 'AM';
  const hours12 = hoursRaw % 12 || 12;
  const displayHours = is24Hour ? String(hoursRaw).padStart(2, '0') : String(hours12).padStart(2, '0');

  const dateFormatted = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timezoneStr = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';

  // --- Stopwatch State ---
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0); // in milliseconds
  const [laps, setLaps] = useState<LapItem[]>([]);

  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // High precision timer with requestAnimationFrame to avoid drift
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedTime;

      const step = () => {
        setElapsedTime(performance.now() - startTimeRef.current);
        animFrameRef.current = requestAnimationFrame(step);
      };

      animFrameRef.current = requestAnimationFrame(step);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (!isRunning && elapsedTime === 0) return;
    const previousTotal = laps.length > 0 ? laps[0].totalTime : 0;
    const lapDelta = elapsedTime - previousTotal;

    const newLap: LapItem = {
      id: laps.length + 1,
      lapTime: lapDelta > 0 ? lapDelta : elapsedTime,
      totalTime: elapsedTime,
    };

    setLaps((prev) => [newLap, ...prev]);
  };

  // Format Stopwatch time: HH:MM:SS.cs
  const formatStopwatchTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const centis = Math.floor((ms % 1000) / 10);

    const pad = (n: number) => String(n).padStart(2, '0');

    if (hrs > 0) {
      return {
        main: `${pad(hrs)}:${pad(mins)}:${pad(secs)}`,
        sub: `.${pad(centis)}`,
      };
    }

    return {
      main: `${pad(mins)}:${pad(secs)}`,
      sub: `.${pad(centis)}`,
    };
  };

  const swFormatted = formatStopwatchTime(elapsedTime);

  // Find min/max laps for highlighting
  const lapTimes = laps.map((l) => l.lapTime);
  const fastestLap = lapTimes.length > 1 ? Math.min(...lapTimes) : null;
  const slowestLap = lapTimes.length > 1 ? Math.max(...lapTimes) : null;

  return (
    <div
      id="watch-stopwatch-widget"
      className={`rounded-2xl border transition-all duration-300 shadow-2xl shadow-black/80 hover:-translate-y-0.5 overflow-hidden p-5 sm:p-6 mb-8 ${
        isDark
          ? 'border-white/15 bg-[#0b0c12]/90 shadow-black/80'
          : 'border-slate-200/90 bg-white/95 shadow-slate-950/20'
      }`}
    >
      {/* Top Controller: Widget Title & View Toggle Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span
              className={`text-xs font-mono-code tracking-widest uppercase font-semibold ${
                isDark ? 'text-indigo-300' : 'text-indigo-700'
              }`}
            >
              CHRONO SUITE
            </span>
            <p className={`text-[11px] ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
              Real-time digital watch & study stopwatch
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-white/10 bg-black/40">
          <button
            id="tab-view-both"
            type="button"
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1 rounded-lg text-xs font-mono-code transition-all select-none ${
              activeTab === 'both'
                ? 'bg-indigo-600 text-white shadow-sm font-medium'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Split View
          </button>
          <button
            id="tab-view-clock"
            type="button"
            onClick={() => setActiveTab('clock')}
            className={`px-3 py-1 rounded-lg text-xs font-mono-code transition-all select-none ${
              activeTab === 'clock'
                ? 'bg-indigo-600 text-white shadow-sm font-medium'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Digital Watch
          </button>
          <button
            id="tab-view-stopwatch"
            type="button"
            onClick={() => setActiveTab('stopwatch')}
            className={`px-3 py-1 rounded-lg text-xs font-mono-code transition-all select-none ${
              activeTab === 'stopwatch'
                ? 'bg-indigo-600 text-white shadow-sm font-medium'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {/* Main Grid: Watch on Left, Stopwatch on Right */}
      <div
        className={`grid gap-6 items-stretch ${
          activeTab === 'both'
            ? 'grid-cols-1 lg:grid-cols-2'
            : 'grid-cols-1'
        }`}
      >
        {/* ================= SECTION 1: DIGITAL REAL-TIME WATCH ================= */}
        {(activeTab === 'both' || activeTab === 'clock') && (
          <div
            id="digital-real-time-watch"
            className={`flex flex-col justify-between p-5 sm:p-6 rounded-xl border transition-all duration-300 relative overflow-hidden ${
              isDark
                ? 'bg-white/[0.03] border-white/5 hover:border-white/10'
                : 'bg-white/60 border-slate-200/80 shadow-xs'
            }`}
          >
            {/* Watch Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span
                  className={`text-[11px] font-mono-code tracking-widest uppercase font-medium ${
                    isDark ? 'text-white/70' : 'text-slate-700'
                  }`}
                >
                  REAL-TIME DIGITAL WATCH
                </span>
              </div>

              {/* 12h / 24h Toggle */}
              <button
                id="toggle-12h-24h"
                type="button"
                onClick={() => setIs24Hour(!is24Hour)}
                className={`text-[10px] font-mono-code px-2 py-0.5 rounded-md border transition-all uppercase ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-indigo-300 hover:border-indigo-400/50'
                    : 'border-slate-300 bg-white text-indigo-700 hover:border-indigo-400'
                }`}
                title="Toggle 12/24 hour format"
              >
                {is24Hour ? '24H Format' : '12H Format'}
              </button>
            </div>

            {/* Digital Clock Display */}
            <div className="py-2 sm:py-4 flex flex-col items-center justify-center relative z-10">
              <div className="flex items-baseline gap-2 font-mono-code select-none tracking-tight">
                <span
                  id="digital-clock-time"
                  className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-mono-code transition-colors ${
                    isDark
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200 drop-shadow-sm'
                      : 'text-slate-900'
                  }`}
                >
                  {displayHours}:{minutes}
                </span>

                <div className="flex flex-col">
                  <span
                    id="digital-clock-seconds"
                    className="text-xl sm:text-2xl font-bold font-mono-code text-indigo-400"
                  >
                    :{seconds}
                  </span>
                  {!is24Hour && (
                    <span
                      id="digital-clock-period"
                      className="text-[10px] sm:text-xs font-mono-code uppercase font-semibold text-white/50 dark:text-white/50"
                    >
                      {period}
                    </span>
                  )}
                </div>
              </div>

              {/* Date & Timezone Metadata */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs font-mono-code">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white/70'
                      : 'border-slate-200 bg-white text-slate-700 shadow-xs'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span id="digital-clock-date">{dateFormatted}</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                    isDark
                      ? 'border-white/10 bg-white/5 text-white/50'
                      : 'border-slate-200 bg-white text-slate-600 shadow-xs'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-400/80" />
                  <span id="digital-clock-timezone" className="truncate max-w-[140px]">
                    {timezoneStr}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Info */}
            <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-mono-code ${
              isDark ? 'border-white/10 text-white/40' : 'border-slate-200 text-slate-500'
            }`}>
              <span>ACCURATE REAL-TIME SYNC</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ACTIVE
              </span>
            </div>
          </div>
        )}

        {/* ================= SECTION 2: TIME STOPWATCH ================= */}
        {(activeTab === 'both' || activeTab === 'stopwatch') && (
          <div
            id="time-stopwatch"
            className={`flex flex-col justify-between p-5 sm:p-6 rounded-xl border transition-all duration-300 relative overflow-hidden ${
              isDark
                ? 'bg-white/[0.03] border-white/5 hover:border-white/10'
                : 'bg-white/60 border-slate-200/80 shadow-xs'
            }`}
          >
            {/* Stopwatch Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <Timer className="w-3.5 h-3.5 text-purple-400" />
                <span
                  className={`text-[11px] font-mono-code tracking-widest uppercase font-medium ${
                    isDark ? 'text-white/70' : 'text-slate-700'
                  }`}
                >
                  TIME STOPWATCH
                </span>
              </div>

              {laps.length > 0 && (
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full border border-purple-500/30 text-purple-300 bg-purple-500/10 font-medium">
                  {laps.length} {laps.length === 1 ? 'Lap' : 'Laps'} recorded
                </span>
              )}
            </div>

            {/* Stopwatch Large Digits Display */}
            <div className="py-2 sm:py-3 flex flex-col items-center justify-center relative z-10">
              <div className="flex items-baseline font-mono-code select-none">
                <span
                  id="stopwatch-display-main"
                  className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-mono-code ${
                    isRunning
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-200 to-white'
                      : isDark
                      ? 'text-white'
                      : 'text-slate-900'
                  }`}
                >
                  {swFormatted.main}
                </span>
                <span
                  id="stopwatch-display-sub"
                  className="text-2xl sm:text-3xl font-bold font-mono-code text-purple-400 ml-0.5"
                >
                  {swFormatted.sub}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center justify-center gap-3 w-full max-w-xs">
                {/* Start / Pause Button */}
                <button
                  id="stopwatch-start-pause-btn"
                  type="button"
                  onClick={handleStartStop}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-mono-code text-xs font-semibold shadow-lg transition-all duration-200 ${
                    isRunning
                      ? 'bg-amber-500/90 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/30'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>PAUSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>{elapsedTime > 0 ? 'RESUME' : 'START'}</span>
                    </>
                  )}
                </button>

                {/* Lap Button */}
                <button
                  id="stopwatch-lap-btn"
                  type="button"
                  onClick={handleLap}
                  disabled={!isRunning && elapsedTime === 0}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-mono-code text-xs font-semibold border transition-all ${
                    isRunning
                      ? 'border-purple-400/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20'
                      : isDark
                      ? 'border-white/10 text-white/30 cursor-not-allowed'
                      : 'border-slate-200 text-slate-300 cursor-not-allowed'
                  }`}
                  title="Record lap"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>LAP</span>
                </button>

                {/* Reset Button */}
                <button
                  id="stopwatch-reset-btn"
                  type="button"
                  onClick={handleReset}
                  disabled={elapsedTime === 0 && !isRunning}
                  className={`p-2.5 rounded-xl border transition-all ${
                    elapsedTime > 0
                      ? 'border-white/10 hover:border-rose-400/40 text-white/60 hover:text-rose-400 hover:bg-rose-500/10'
                      : isDark
                      ? 'border-white/5 text-white/20 cursor-not-allowed'
                      : 'border-slate-200 text-slate-300 cursor-not-allowed'
                  }`}
                  title="Reset stopwatch"
                  aria-label="Reset stopwatch"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Laps List (if any laps recorded) */}
            {laps.length > 0 && (
              <div
                id="stopwatch-laps-container"
                className="mt-4 pt-3 border-t border-white/10 max-h-36 overflow-y-auto pr-1 space-y-1.5"
              >
                {laps.map((lap) => {
                  const isFastest = lapTimes.length > 1 && lap.lapTime === fastestLap;
                  const isSlowest = lapTimes.length > 1 && lap.lapTime === slowestLap;
                  const lapTimeFormatted = formatStopwatchTime(lap.lapTime);
                  const totalFormatted = formatStopwatchTime(lap.totalTime);

                  return (
                    <div
                      key={lap.id}
                      className={`flex items-center justify-between text-xs font-mono-code px-3 py-1.5 rounded-lg transition-colors ${
                        isFastest
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                          : isSlowest
                          ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                          : isDark
                          ? 'bg-white/[0.02] text-white/70'
                          : 'bg-white/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Lap {lap.id}</span>
                        {isFastest && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Fastest
                          </span>
                        )}
                        {isSlowest && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Slowest
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          +{lapTimeFormatted.main}
                          {lapTimeFormatted.sub}
                        </span>
                        <span className="text-white/40 text-[10px]">
                          {totalFormatted.main}
                          {totalFormatted.sub}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Status */}
            <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-mono-code ${
              isDark ? 'border-white/10 text-white/40' : 'border-slate-200 text-slate-500'
            }`}>
              <span>ACCURACY: 10MS HIGH-PRECISION</span>
              <span className={isRunning ? 'text-purple-400 font-semibold animate-pulse' : 'text-white/40'}>
                {isRunning ? 'RUNNING' : elapsedTime > 0 ? 'PAUSED' : 'READY'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
