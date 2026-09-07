import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

export const subjectsRouter = Router();

// GET /api/subjects - list all subjects
subjectsRouter.get('/', (req: Request, res: Response) => {
  try {
    const subjects = db.getSubjects();
    const tasks = db.getTasks();

    // Attach task count matching each subject code or tag
    const subjectsWithCount = subjects.map((sub) => {
      const count = tasks.filter(
        (t) => t.tag.toLowerCase().includes(sub.code.toLowerCase()) || 
               sub.code.toLowerCase().includes(t.tag.toLowerCase())
      ).length;
      return {
        ...sub,
        taskCount: count,
      };
    });

    res.json({ success: true, subjects: subjectsWithCount });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/subjects/:id - get single subject with details and tasks
subjectsRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subject = db.getSubjectById(id);
    if (!subject) {
      res.status(404).json({ success: false, error: 'Subject not found' });
      return;
    }

    const tasks = db.getTasks().filter(
      (t) => t.tag.toLowerCase().includes(subject.code.toLowerCase()) ||
             subject.code.toLowerCase().includes(t.tag.toLowerCase())
    );

    res.json({
      success: true,
      subject: {
        ...subject,
        taskCount: tasks.length,
        tasks,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/subjects - create subject
subjectsRouter.post('/', (req: Request, res: Response) => {
  try {
    const {
      code,
      title,
      constellationType = 'moon-orbit',
      color = '#38bdf8',
      instructor,
      schedule,
      location,
      credits,
      term,
      description,
      syllabus,
    } = req.body;
    if (!code || !title) {
      res.status(400).json({ success: false, error: 'code and title are required' });
      return;
    }

    const newSubject = db.createSubject({
      code: String(code).trim().toUpperCase(),
      title: String(title).trim(),
      constellationType: ['moon-orbit', 'geometry-mesh', 'star-cluster', 'pulsar'].includes(constellationType)
        ? constellationType
        : 'moon-orbit',
      color: String(color),
      instructor: instructor || 'Faculty Instructor',
      schedule: schedule || 'Schedule TBA',
      location: location || 'Main Campus',
      credits: credits || '3.0 Credits',
      term: term || 'Fall 2026',
      description: description || `${title} coursework and syllabus milestones.`,
      syllabus: Array.isArray(syllabus) ? syllabus : [
        'Module 1: Orientation & Foundations',
        'Module 2: Core Coursework & Projects',
        'Module 3: Advanced Applications',
        'Module 4: Final Assessments'
      ],
    });

    res.status(201).json({ success: true, subject: newSubject });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/subjects/:id - update subject details
subjectsRouter.patch('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = db.updateSubject(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Subject not found' });
      return;
    }

    res.json({ success: true, subject: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/subjects/:id - delete subject
subjectsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteSubject(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Subject not found' });
      return;
    }

    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
