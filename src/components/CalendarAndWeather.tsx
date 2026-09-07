import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Cloud,
  Droplets,
  Wind,
  RefreshCw,
  MapPin,
  CalendarDays,
  Plus,
  Search,
  X,
  Navigation,
  Loader2,
  Check,
  History
} from 'lucide-react';
import { Task, WeatherData } from '../types.ts';

export interface CityOption {
  name: string;
  admin1?: string;
  country?: string;
  lat: number;
  lon: number;
  timezone: string;
}

const POPULAR_PRESETS: CityOption[] = [
  { name: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.6917, timezone: 'Asia/Tokyo' },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, timezone: 'America/New_York' },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
  { name: 'San Francisco', country: 'United States', lat: 37.7749, lon: -122.4194, timezone: 'America/Los_Angeles' },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Mumbai', country: 'India', lat: 19.0728, lon: 72.8826, timezone: 'Asia/Kolkata' },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780, timezone: 'Asia/Seoul' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, timezone: 'Europe/Berlin' },
];

function getWeatherInfo(code: number, isDay: boolean): { label: string; icon: React.ReactNode } {
  if (code === 0) {
    return isDay
      ? { label: 'Clear Sky', icon: <Sun className="w-6 h-6 text-amber-400" /> }
      : { label: 'Starlit Clear', icon: <Moon className="w-6 h-6 text-indigo-300" /> };
  }
  if (code === 1 || code === 2) {
    return isDay
      ? { label: 'Partly Cloudy', icon: <CloudSun className="w-6 h-6 text-amber-300" /> }
      : { label: 'Partly Cloudy', icon: <CloudMoon className="w-6 h-6 text-indigo-200" /> };
  }
  if (code === 3) {
    return { label: 'Overcast', icon: <Cloud className="w-6 h-6 text-slate-300" /> };
  }
  if (code === 45 || code === 48) {
    return { label: 'Misty Fog', icon: <CloudFog className="w-6 h-6 text-slate-300" /> };
  }
  if (code >= 51 && code <= 57) {
    return { label: 'Light Drizzle', icon: <CloudRain className="w-6 h-6 text-sky-400" /> };
  }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    return { label: 'Rain Showers', icon: <CloudRain className="w-6 h-6 text-blue-400" /> };
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return { label: 'Snow Flurries', icon: <CloudSnow className="w-6 h-6 text-cyan-200" /> };
  }
  if (code >= 95 && code <= 99) {
    return { label: 'Thunderstorm', icon: <CloudLightning className="w-6 h-6 text-amber-400" /> };
  }
  return { label: 'Mild Conditions', icon: <Cloud className="w-6 h-6 text-slate-400" /> };
}

interface CalendarAndWeatherProps {
  tasks: Task[];
  onAddTask?: (task: { title: string; tag: string; priority: 'low' | 'normal' | 'high' }) => void;
  isDark: boolean;
}

export const CalendarAndWeather: React.FC<CalendarAndWeatherProps> = ({
  tasks,
  onAddTask,
  isDark,
}) => {
  // Calendar State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [realTimeNow, setRealTimeNow] = useState(() => new Date());

  // Weather State
  const [selectedCity, setSelectedCity] = useState<CityOption>(() => {
    try {
      const saved = localStorage.getItem('study_space_selected_city');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return POPULAR_PRESETS[0];
  });

  const [recentCities, setRecentCities] = useState<CityOption[]>(() => {
    try {
      const saved = localStorage.getItem('study_space_recent_cities');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return POPULAR_PRESETS.slice(0, 4);
  });

  const [tempUnit, setTempUnit] = useState<'C' | 'F'>(() => {
    return (localStorage.getItem('study_space_temp_unit') as 'C' | 'F') || 'C';
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Global Place Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync temp unit
  const handleToggleTempUnit = () => {
    const next = tempUnit === 'C' ? 'F' : 'C';
    setTempUnit(next);
    localStorage.setItem('study_space_temp_unit', next);
  };

  // Real-time ticking clock for exact calendar sync
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTimeNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Real-time Weather Data
  const fetchWeather = useCallback(async (city: CityOption) => {
    try {
      setIsLoadingWeather(true);
      setWeatherError(null);
      const tzParam = city.timezone ? `&timezone=${encodeURIComponent(city.timezone)}` : '&timezone=auto';
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min${tzParam}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather service unavailable');
      const data = await res.json();

      const current = data.current;
      const daily = data.daily;

      const dailyForecast = (daily.time || []).slice(0, 5).map((dateStr: string, idx: number) => ({
        date: dateStr,
        weatherCode: daily.weather_code[idx],
        tempMax: Math.round(daily.temperature_2m_max[idx]),
        tempMin: Math.round(daily.temperature_2m_min[idx]),
      }));

      const weatherInfo = getWeatherInfo(current.weather_code, current.is_day === 1);

      // Display title with country if available
      const fullCityLabel = city.country ? `${city.name}, ${city.country}` : city.name;

      setWeather({
        city: fullCityLabel,
        temperature: Math.round(current.temperature_2m),
        apparentTemperature: Math.round(current.apparent_temperature),
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        weatherCode: current.weather_code,
        weatherDescription: weatherInfo.label,
        isDay: current.is_day === 1,
        uvIndex: Math.round(current.uv_index || 0),
        dailyForecast,
      });

      // Save selected city
      localStorage.setItem('study_space_selected_city', JSON.stringify(city));
    } catch (err: any) {
      console.error('Failed to fetch weather:', err);
      setWeatherError('Unable to update weather forecast');
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity, fetchWeather]);

  // Select place handler
  const handleSelectPlace = (place: CityOption) => {
    setSelectedCity(place);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);

    // Update recent cities
    setRecentCities((prev) => {
      const filtered = prev.filter((c) => c.name !== place.name || c.country !== place.country);
      const updated = [place, ...filtered].slice(0, 5);
      localStorage.setItem('study_space_recent_cities', JSON.stringify(updated));
      return updated;
    });
  };

  // Open search modal with focus
  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  // Global Geocoding Search handler (Debounced or on demand)
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=8&language=en&format=json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Geocoding service unavailable');
        const data = await res.json();

        if (data.results && Array.isArray(data.results)) {
          const mapped: CityOption[] = data.results.map((item: any) => ({
            name: item.name,
            admin1: item.admin1,
            country: item.country,
            lat: item.latitude,
            lon: item.longitude,
            timezone: item.timezone || 'auto',
          }));
          setSearchResults(mapped);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Error searching place:', err);
        setSearchError('Search failed. Check your network.');
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Current Browser Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setSearchError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Attempt reverse geocoding via bigdatacloud or Open-Meteo nearest city
          const revUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
          const res = await fetch(revUrl);
          let locName = 'My Location';
          let locCountry = '';
          if (res.ok) {
            const data = await res.json();
            locName = data.city || data.locality || 'Current Location';
            locCountry = data.countryName || '';
          }

          const myCity: CityOption = {
            name: locName,
            country: locCountry,
            lat: latitude,
            lon: longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
          };

          handleSelectPlace(myCity);
        } catch {
          const fallbackCity: CityOption = {
            name: 'Current Location',
            lat: latitude,
            lon: longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
          };
          handleSelectPlace(fallbackCity);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or error:', err);
        setSearchError('Location permission denied or unavailable');
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const numDaysInMonth = lastDayOfMonth.getDate();

    let startDayIndex = firstDayOfMonth.getDay() - 1;
    if (startDayIndex === -1) startDayIndex = 6;

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      taskCount: number;
    }> = [];

    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDate - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        taskCount: 0,
      });
    }

    const today = realTimeNow;
    for (let day = 1; day <= numDaysInMonth; day++) {
      const d = new Date(year, month, day);
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
      const isSelected =
        d.getDate() === selectedDate.getDate() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear();

      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const matchedTasks = tasks.filter((t) => {
        if (t.dueDate === dateString) return true;
        const taskCreated = new Date(t.createdAt);
        return (
          taskCreated.getDate() === day &&
          taskCreated.getMonth() === month &&
          taskCreated.getFullYear() === year
        );
      });

      days.push({
        date: d,
        isCurrentMonth: true,
        isToday,
        isSelected,
        taskCount: matchedTasks.length,
      });
    }

    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells || days.length < 35; i++) {
      if (days.length >= 35 && days.length % 7 === 0) break;
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        taskCount: 0,
      });
    }

    return days;
  }, [year, month, realTimeNow, selectedDate, tasks]);

  const selectedDateTasks = useMemo(() => {
    return tasks.filter((t) => {
      const taskCreated = new Date(t.createdAt);
      return (
        taskCreated.getDate() === selectedDate.getDate() &&
        taskCreated.getMonth() === selectedDate.getMonth() &&
        taskCreated.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [tasks, selectedDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const convertTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

  return (
    <div
      id="calendar-weather-dashboard"
      className="w-full mb-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
    >
      {/* ========================================================= */}
      {/* SECTION 1: REAL-TIME INTERACTIVE CALENDAR (7 COLUMNS)     */}
      {/* ========================================================= */}
      <div
        id="real-time-calendar"
        className={`lg:col-span-7 rounded-2xl border p-5 sm:p-6 transition-all duration-300 shadow-2xl shadow-black/80 hover:-translate-y-0.5 flex flex-col justify-between ${
          isDark
            ? 'border-white/15 bg-[#0b0c12]/90 text-white'
            : 'border-slate-200/90 bg-white/95 text-slate-900 shadow-slate-950/20'
        }`}
      >
        <div>
          {/* Calendar Header with Live Date & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-mono-code font-bold tracking-wider uppercase">
                    {monthNames[month]} {year}
                  </h3>
                  <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full border border-indigo-500/30 text-indigo-300 bg-indigo-500/15 font-semibold">
                    REAL-TIME
                  </span>
                </div>
                <p className={`text-[11px] ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                  Today: {realTimeNow.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                id="cal-jump-today-btn"
                type="button"
                onClick={handleJumpToToday}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono-code border transition-all ${
                  isDark
                    ? 'border-white/15 bg-white/5 text-white/80 hover:text-white hover:bg-white/10'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Today
              </button>
              <button
                id="cal-prev-month-btn"
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous Month"
                className={`p-1.5 rounded-lg border transition-all ${
                  isDark
                    ? 'border-white/15 bg-white/5 text-white/80 hover:text-white hover:bg-white/10'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="cal-next-month-btn"
                type="button"
                onClick={handleNextMonth}
                aria-label="Next Month"
                className={`p-1.5 rounded-lg border transition-all ${
                  isDark
                    ? 'border-white/15 bg-white/5 text-white/80 hover:text-white hover:bg-white/10'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {dayNames.map((d) => (
              <div
                key={d}
                className={`text-[10px] font-mono-code font-semibold tracking-wider py-1 ${
                  isDark ? 'text-white/40' : 'text-slate-400'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Monthly Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((cell, idx) => {
              const dayNum = cell.date.getDate();

              let cellStyle = 'text-white/30 border-transparent';
              if (cell.isCurrentMonth) {
                if (cell.isToday) {
                  cellStyle = 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold border-indigo-400/50 shadow-md shadow-indigo-500/30';
                } else if (cell.isSelected) {
                  cellStyle = isDark
                    ? 'bg-indigo-500/20 text-indigo-200 border-indigo-500/60 font-semibold ring-2 ring-indigo-500/40'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-400 font-semibold ring-2 ring-indigo-400/30';
                } else {
                  cellStyle = isDark
                    ? 'border-white/5 hover:border-white/20 hover:bg-white/5 text-white/90'
                    : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-800';
                }
              }

              return (
                <button
                  key={`${cell.date.toISOString()}-${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedDate(cell.date);
                    if (!cell.isCurrentMonth) {
                      setCurrentDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
                    }
                  }}
                  className={`h-9 sm:h-10 rounded-xl border flex flex-col items-center justify-center relative transition-all text-xs font-mono-code select-none ${cellStyle}`}
                >
                  <span className="leading-none">{dayNum}</span>

                  {/* Task indicator dots */}
                  {cell.taskCount > 0 && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: Math.min(cell.taskCount, 3) }).map((_, i) => (
                        <span
                          key={i}
                          className={`w-1 h-1 rounded-full ${
                            cell.isToday ? 'bg-amber-300' : 'bg-indigo-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Focus Card Footer */}
        <div
          className={`mt-4 pt-3.5 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono-code ${
            isDark ? 'border-white/10' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
            <span className={isDark ? 'text-white/60' : 'text-slate-600'}>
              Selected:
            </span>
            <span className="font-semibold text-indigo-300">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
              selectedDateTasks.length > 0
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-white/10 bg-black/40 text-white/40'
            }`}>
              {selectedDateTasks.length} task{selectedDateTasks.length === 1 ? '' : 's'}
            </span>
          </div>

          {onAddTask && (
            <button
              type="button"
              onClick={() => {
                onAddTask({
                  title: `Study Focus on ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                  tag: 'GENERAL',
                  priority: 'normal',
                });
              }}
              className="text-[11px] font-mono-code text-indigo-300 hover:text-white flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3 h-3" /> Quick Add on this day
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: REAL-TIME WEATHER DASHBOARD (5 COLUMNS)        */}
      {/* ========================================================= */}
      <div
        id="real-time-weather"
        className={`lg:col-span-5 rounded-2xl border p-5 sm:p-6 transition-all duration-300 shadow-2xl shadow-black/80 hover:-translate-y-0.5 flex flex-col justify-between relative ${
          isDark
            ? 'border-white/15 bg-[#0b0c12]/90 text-white'
            : 'border-slate-200/90 bg-white/95 text-slate-900 shadow-slate-950/20'
        }`}
      >
        <div>
          {/* Header with City Selector Trigger & Temp Unit Controls */}
          <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-white/10">
            {/* Global City Selector Trigger Button */}
            <button
              id="weather-select-place-btn"
              type="button"
              onClick={handleOpenSearch}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all text-left group ${
                isDark
                  ? 'border-white/15 bg-white/5 hover:bg-white/10 text-white hover:border-indigo-400/50'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="max-w-[140px] sm:max-w-[190px] truncate">
                <span className="text-xs font-mono-code font-bold uppercase tracking-wider block truncate">
                  {selectedCity.name}
                </span>
                {selectedCity.country && (
                  <span className={`text-[10px] block truncate ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
                    {selectedCity.admin1 ? `${selectedCity.admin1}, ` : ''}{selectedCity.country}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 ml-1 border border-indigo-500/30">
                Change
              </span>
            </button>

            {/* Controls: Temp Unit & Refresh Button */}
            <div className="flex items-center gap-2">
              <button
                id="weather-temp-unit-toggle"
                type="button"
                onClick={handleToggleTempUnit}
                className={`px-2 py-1 rounded-lg border text-xs font-mono-code font-semibold transition-all ${
                  isDark
                    ? 'border-white/15 bg-white/5 text-white/80 hover:text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                °{tempUnit}
              </button>

              <button
                id="weather-refresh-btn"
                type="button"
                onClick={() => fetchWeather(selectedCity)}
                aria-label="Refresh Weather"
                title="Refresh Live Weather"
                className={`p-1.5 rounded-lg border transition-all ${
                  isDark
                    ? 'border-white/15 bg-white/5 text-white/80 hover:text-white hover:bg-white/10'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Current Live Weather Hero */}
          {weather ? (
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-mono-code font-extrabold tracking-tight">
                      {convertTemp(weather.temperature)}°{tempUnit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono-code font-semibold text-indigo-300">
                      {weather.weatherDescription}
                    </span>
                    <span className={`text-[11px] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                      • Feels like {convertTemp(weather.apparentTemperature)}°
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl border border-white/10 bg-black/40 shadow-inner flex items-center justify-center">
                  {getWeatherInfo(weather.weatherCode, weather.isDay).icon}
                </div>
              </div>

              {/* Atmospheric Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {/* Humidity */}
                <div
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                    isDark ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1 text-sky-400 mb-0.5">
                    <Droplets className="w-3 h-3" />
                    <span className="text-[10px] font-mono-code uppercase text-white/50">Humidity</span>
                  </div>
                  <span className="text-xs font-mono-code font-bold">{weather.humidity}%</span>
                </div>

                {/* Wind */}
                <div
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                    isDark ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1 text-teal-400 mb-0.5">
                    <Wind className="w-3 h-3" />
                    <span className="text-[10px] font-mono-code uppercase text-white/50">Wind</span>
                  </div>
                  <span className="text-xs font-mono-code font-bold">{weather.windSpeed} km/h</span>
                </div>

                {/* UV Index */}
                <div
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center ${
                    isDark ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1 text-amber-400 mb-0.5">
                    <Sun className="w-3 h-3" />
                    <span className="text-[10px] font-mono-code uppercase text-white/50">UV Index</span>
                  </div>
                  <span className="text-xs font-mono-code font-bold">{weather.uvIndex}</span>
                </div>
              </div>

              {/* 5-Day Mini Forecast Strip */}
              <div>
                <div className="text-[10px] font-mono-code uppercase tracking-wider text-white/40 mb-2 flex items-center justify-between">
                  <span>5-Day Outlook</span>
                  <span>Min / Max</span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {weather.dailyForecast.map((day, idx) => {
                    const dayDate = new Date(day.date);
                    const dayLabel = idx === 0 ? 'Today' : dayDate.toLocaleDateString('en-US', { weekday: 'short' });
                    const iconInfo = getWeatherInfo(day.weatherCode, true);

                    return (
                      <div
                        key={day.date}
                        className={`p-2 rounded-xl border text-center flex flex-col items-center justify-between ${
                          isDark ? 'border-white/10 bg-black/30' : 'border-slate-200 bg-slate-50/80'
                        }`}
                      >
                        <span className="text-[10px] font-mono-code font-medium text-white/60 mb-1">
                          {dayLabel}
                        </span>
                        <div className="scale-75 my-0.5">
                          {iconInfo.icon}
                        </div>
                        <div className="text-[10px] font-mono-code font-bold mt-1 text-indigo-300">
                          {convertTemp(day.tempMax)}°
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs font-mono-code text-white/40">
              {weatherError || 'Loading live weather data...'}
            </div>
          )}
        </div>

        {/* Live Station Footer */}
        <div
          className={`mt-4 pt-3.5 border-t flex items-center justify-between text-[11px] font-mono-code ${
            isDark ? 'border-white/10 text-white/40' : 'border-slate-200/80 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Satellite</span>
          </div>
          <span className="truncate max-w-[170px]">{selectedCity.name}</span>
        </div>

        {/* ========================================================= */}
        {/* GLOBAL PLACE SEARCH MODAL / FLOATING POPOVER              */}
        {/* ========================================================= */}
        {isSearchOpen && (
          <div
            id="weather-search-modal"
            className="absolute inset-0 z-30 p-4 sm:p-5 rounded-2xl flex flex-col justify-between overflow-hidden bg-[#0c0d12] border border-white/20 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200"
          >
            <div>
              {/* Modal Header */}
              <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono-code font-bold tracking-wider uppercase">
                    Select Any Place
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Input Box */}
              <div className="relative mb-3">
                <input
                  ref={searchInputRef}
                  id="weather-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any city, town, or country (e.g. Mumbai, Seoul, Vancouver)..."
                  className="w-full px-3.5 py-2 pl-9 rounded-xl border border-white/20 bg-black/60 text-xs font-mono-code text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                />
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-white/40 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Action: Use My Current Location */}
              <div className="mb-3">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-mono-code font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Detecting your coordinates...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                      Use My Current Location (GPS)
                    </>
                  )}
                </button>
              </div>

              {/* Error state */}
              {searchError && (
                <div className="mb-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-mono-code">
                  {searchError}
                </div>
              )}

              {/* Search Results List */}
              {isSearching ? (
                <div className="py-6 flex items-center justify-center gap-2 text-xs font-mono-code text-white/50">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  Searching global database...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-44 overflow-y-auto space-y-1 mb-2 pr-1 custom-scrollbar">
                  {searchResults.map((item, idx) => (
                    <button
                      key={`${item.name}-${item.lat}-${item.lon}-${idx}`}
                      type="button"
                      onClick={() => handleSelectPlace(item)}
                      className="w-full px-3 py-2 rounded-xl text-left border border-white/5 hover:border-indigo-400/50 hover:bg-indigo-500/15 flex items-center justify-between text-xs font-mono-code transition-all group"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-white group-hover:text-indigo-300 block truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-white/50 block truncate">
                          {item.admin1 ? `${item.admin1}, ` : ''}{item.country || ''}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/70 group-hover:bg-indigo-500/30 group-hover:text-indigo-200 shrink-0">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim().length >= 2 ? (
                <div className="py-4 text-center text-xs font-mono-code text-white/40">
                  No places found for "{searchQuery}". Try another spelling.
                </div>
              ) : (
                /* Recent & Popular Presets */
                <div>
                  {recentCities.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1 text-[10px] font-mono-code uppercase text-white/40 mb-1.5">
                        <History className="w-3 h-3" /> Recent Searches
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentCities.map((c) => (
                          <button
                            key={`recent-${c.name}-${c.lat}`}
                            type="button"
                            onClick={() => handleSelectPlace(c)}
                            className="px-2.5 py-1 rounded-lg text-xs font-mono-code border border-white/10 bg-white/5 hover:bg-indigo-500/20 hover:border-indigo-400/40 text-white/80 hover:text-white transition-all flex items-center gap-1"
                          >
                            <span>{c.name}</span>
                            {selectedCity.name === c.name && <Check className="w-3 h-3 text-emerald-400" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-[10px] font-mono-code uppercase text-white/40 mb-1.5">
                      Popular Study Hubs
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_PRESETS.map((p) => (
                        <button
                          key={`pop-${p.name}`}
                          type="button"
                          onClick={() => handleSelectPlace(p)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono-code border transition-all ${
                            selectedCity.name === p.name
                              ? 'border-indigo-400 bg-indigo-500/30 text-indigo-200 font-bold'
                              : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer close info */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-code text-white/40">
              <span>Supports any city or region globally</span>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-white/60 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
