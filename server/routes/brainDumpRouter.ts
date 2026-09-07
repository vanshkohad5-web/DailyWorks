import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

export const brainDumpRouter = Router();

// GET /api/braindump - get current brain dump note
brainDumpRouter.get('/', (req: Request, res: Response) => {
  try {
    const data = db.getBrainDump();
    res.json({ success: true, brainDump: data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/braindump - autosave brain dump content
brainDumpRouter.post('/', (req: Request, res: Response) => {
  try {
    const { content = '' } = req.body;
    const updated = db.saveBrainDump(String(content));
    res.json({ success: true, brainDump: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
