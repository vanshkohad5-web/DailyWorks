import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

export const tasksRouter = Router();

// GET /api/tasks - list all tasks
tasksRouter.get('/', (req: Request, res: Response) => {
  try {
    const { tag, completed } = req.query;
    let tasks = db.getTasks();

    if (tag && typeof tag === 'string') {
      tasks = tasks.filter((t) => t.tag.toLowerCase() === tag.toLowerCase());
    }

    if (completed !== undefined) {
      const isCompleted = completed === 'true';
      tasks = tasks.filter((t) => t.completed === isCompleted);
    }

    res.json({ success: true, tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks - create task
tasksRouter.post('/', (req: Request, res: Response) => {
  try {
    const { title, tag, completed = false, priority = 'normal', dueDate } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ success: false, error: 'Task title is required' });
      return;
    }

    const newTask = db.createTask({
      title: title.trim(),
      tag: (tag && typeof tag === 'string') ? tag.trim().toUpperCase() : 'GENERAL',
      completed: Boolean(completed),
      priority: ['low', 'normal', 'high'].includes(priority) ? priority : 'normal',
      dueDate: dueDate || undefined
    });

    res.status(201).json({ success: true, task: newTask });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/tasks/:id - update task
tasksRouter.patch('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // sanitize updates
    const sanitized: Record<string, any> = {};
    if (updates.title !== undefined) sanitized.title = String(updates.title).trim();
    if (updates.tag !== undefined) sanitized.tag = String(updates.tag).trim().toUpperCase();
    if (updates.completed !== undefined) sanitized.completed = Boolean(updates.completed);
    if (updates.priority !== undefined) sanitized.priority = updates.priority;
    if (updates.dueDate !== undefined) sanitized.dueDate = updates.dueDate;

    const updated = db.updateTask(id, sanitized);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    res.json({ success: true, task: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/tasks/:id - delete task
tasksRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteTask(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks/reorder - reorder task list
tasksRouter.post('/reorder', (req: Request, res: Response) => {
  try {
    const { taskIds } = req.body;
    if (!Array.isArray(taskIds)) {
      res.status(400).json({ success: false, error: 'taskIds must be an array' });
      return;
    }

    const reordered = db.reorderTasks(taskIds);
    res.json({ success: true, tasks: reordered });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
