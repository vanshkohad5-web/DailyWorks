export type Priority = 'low' | 'normal' | 'high';

export interface Task {
  id: string;
  title: string;
  tag: string;
  completed: boolean;
  priority: Priority;
  createdAt: string;
  dueDate?: string;
}

export type ConstellationType = 'moon-orbit' | 'geometry-mesh' | 'star-cluster' | 'pulsar';

export interface Subject {
  id: string;
  code: string;
  title: string;
  constellationType: ConstellationType;
  color: string;
  taskCount?: number;
  instructor?: string;
  schedule?: string;
  location?: string;
  credits?: string | number;
  term?: string;
  description?: string;
  syllabus?: string[];
}

export interface BrainDumpData {
  content: string;
  lastUpdated: string;
}

export type TaskFilter = 'all' | 'active' | 'completed';

export type ThemeMode = 'dark' | 'light';

export interface WeatherData {
  city: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  uvIndex: number;
  dailyForecast: {
    date: string;
    weatherCode: number;
    tempMax: number;
    tempMin: number;
  }[];
}
