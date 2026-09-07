import { Task, Subject, BrainDumpData } from './types.ts';

export const api = {
  // Tasks
  async getTasks(): Promise<Task[]> {
    const res = await fetch('/api/tasks');
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const data = await res.json();
    return data.tasks || [];
  },

  async createTask(task: { title: string; tag: string; priority?: string; dueDate?: string }): Promise<Task> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    const data = await res.json();
    return data.task;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    const data = await res.json();
    return data.task;
  },

  async deleteTask(id: string): Promise<void> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
  },

  async reorderTasks(taskIds: string[]): Promise<Task[]> {
    const res = await fetch('/api/tasks/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskIds }),
    });
    if (!res.ok) throw new Error('Failed to reorder tasks');
    const data = await res.json();
    return data.tasks;
  },

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    const res = await fetch('/api/subjects');
    if (!res.ok) throw new Error('Failed to fetch subjects');
    const data = await res.json();
    return data.subjects || [];
  },

  async getSubject(id: string): Promise<Subject & { tasks?: Task[] }> {
    const res = await fetch(`/api/subjects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch subject');
    const data = await res.json();
    return data.subject;
  },

  async createSubject(subject: Partial<Subject> & { code: string; title: string; constellationType: string }): Promise<Subject> {
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subject),
    });
    if (!res.ok) throw new Error('Failed to create subject');
    const data = await res.json();
    return data.subject;
  },

  async updateSubject(id: string, updates: Partial<Subject>): Promise<Subject> {
    const res = await fetch(`/api/subjects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update subject');
    const data = await res.json();
    return data.subject;
  },

  async deleteSubject(id: string): Promise<void> {
    const res = await fetch(`/api/subjects/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete subject');
  },

  // Brain Dump
  async getBrainDump(): Promise<BrainDumpData> {
    const res = await fetch('/api/braindump');
    if (!res.ok) throw new Error('Failed to fetch brain dump');
    const data = await res.json();
    return data.brainDump;
  },

  async saveBrainDump(content: string): Promise<BrainDumpData> {
    const res = await fetch('/api/braindump', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to save brain dump');
    const data = await res.json();
    return data.brainDump;
  },
};
