import fs from 'fs';
import path from 'path';

export interface Task {
  id: string;
  title: string;
  tag: string;
  completed: boolean;
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
  dueDate?: string;
}

export interface Subject {
  id: string;
  code: string;
  title: string;
  constellationType: 'moon-orbit' | 'geometry-mesh' | 'star-cluster' | 'pulsar';
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

export interface BrainDump {
  content: string;
  lastUpdated: string;
}

export interface DatabaseSchema {
  tasks: Task[];
  subjects: Subject[];
  brainDump: BrainDump;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DATA: DatabaseSchema = {
  subjects: [
    {
      id: 'sub-1',
      code: 'PHARM1110',
      title: 'Art history',
      constellationType: 'moon-orbit',
      color: '#38bdf8',
      instructor: 'Prof. Margaret Holloway',
      schedule: 'Tue, Thu • 10:00 AM - 11:30 AM',
      location: 'Auditorium C • Arts Quad',
      credits: '4.0 Credits',
      term: 'Fall 2026',
      description: 'Comprehensive study of visual arts, architectural movements, classical iconography, and renaissance celestial perspective techniques.',
      syllabus: [
        'Module 1: Classical Iconography & Pigment Science',
        'Module 2: Optical Geometry & Renaissance Perspective',
        'Module 3: Astronomical Illustrations & Cartography',
        'Module 4: Modern Critical Analysis & Term Paper'
      ]
    },
    {
      id: 'sub-2',
      code: 'MATH1110',
      title: 'Mathematics',
      constellationType: 'geometry-mesh',
      color: '#818cf8',
      instructor: 'Dr. Stephen Adler',
      schedule: 'Mon, Wed, Fri • 09:00 AM - 10:00 AM',
      location: 'Hall 304 • Science Annex',
      credits: '4.0 Credits',
      term: 'Fall 2026',
      description: 'Rigorous foundation in linear algebra, multivariable calculus, vector calculus, and discrete mathematical geometry for engineering & science majors.',
      syllabus: [
        'Module 1: Vector Spaces & Matrix Decompositions',
        'Module 2: Multivariable Integration & Green\'s Theorem',
        'Module 3: Differential Forms & Geometric Meshes',
        'Module 4: Eigenvalues & Computational Systems'
      ]
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Review chapter 04 notes',
      tag: 'READFR1C0',
      completed: true,
      priority: 'normal',
      createdAt: '2026-09-07T08:00:00.000Z'
    },
    {
      id: 'task-2',
      title: 'Finish problem set',
      tag: 'SCITES030',
      completed: false,
      priority: 'high',
      createdAt: '2026-09-07T08:30:00.000Z'
    },
    {
      id: 'task-3',
      title: 'Sketch project outline',
      tag: 'PHINCH13G',
      completed: false,
      priority: 'normal',
      createdAt: '2026-09-07T09:15:00.000Z'
    },
    {
      id: 'task-4',
      title: 'Read research abstract',
      tag: 'REEDFR1C0',
      completed: false,
      priority: 'normal',
      createdAt: '2026-09-07T10:00:00.000Z'
    },
    {
      id: 'task-5',
      title: 'Plan tomorrow morning',
      tag: 'PERSONAL',
      completed: true,
      priority: 'low',
      createdAt: '2026-09-07T11:00:00.000Z'
    }
  ],
  brainDump: {
    content: '',
    lastUpdated: new Date().toISOString()
  }
};

export class Database {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);

        // Hydrate default course details if missing in existing db.json
        if (Array.isArray(this.data.subjects)) {
          this.data.subjects = this.data.subjects.map((sub) => {
            const initial = INITIAL_DATA.subjects.find(
              (i) => i.id === sub.id || i.code.toLowerCase() === sub.code.toLowerCase()
            );
            return {
              instructor: initial?.instructor || 'Faculty Instructor',
              schedule: initial?.schedule || 'Schedule TBA',
              location: initial?.location || 'Main Campus',
              credits: initial?.credits || '3.0 Credits',
              term: initial?.term || 'Academic Term',
              description: initial?.description || `${sub.title} course lectures, reading assignments, and project deliverables.`,
              syllabus: initial?.syllabus || [
                'Module 1: Foundations & Course Orientation',
                'Module 2: Core Methodology & Active Practice',
                'Module 3: Advanced Concepts & Synthesis',
                'Module 4: Final Project Review & Assessment'
              ],
              ...sub,
            };
          });
          this.save();
        }
      } else {
        this.save();
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('[DB] Failed to initialize database file:', err);
      this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to write database file:', err);
    }
  }

  // --- Task Methods ---
  public getTasks(): Task[] {
    return this.data.tasks;
  }

  public getTaskById(id: string): Task | undefined {
    return this.data.tasks.find((t) => t.id === id);
  }

  public createTask(taskData: Omit<Task, 'id' | 'createdAt'>): Task {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...taskData,
    };
    this.data.tasks.push(newTask);
    this.save();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    const index = this.data.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    this.data.tasks[index] = {
      ...this.data.tasks[index],
      ...updates,
    };
    this.save();
    return this.data.tasks[index];
  }

  public deleteTask(id: string): boolean {
    const prevLength = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter((t) => t.id !== id);
    if (this.data.tasks.length !== prevLength) {
      this.save();
      return true;
    }
    return false;
  }

  public reorderTasks(taskIds: string[]): Task[] {
    const taskMap = new Map(this.data.tasks.map((t) => [t.id, t]));
    const reordered: Task[] = [];
    for (const id of taskIds) {
      const task = taskMap.get(id);
      if (task) {
        reordered.push(task);
        taskMap.delete(id);
      }
    }
    // Append any remaining tasks that were not in taskIds
    for (const remaining of taskMap.values()) {
      reordered.push(remaining);
    }
    this.data.tasks = reordered;
    this.save();
    return this.data.tasks;
  }

  // --- Subject Methods ---
  public getSubjects(): Subject[] {
    return this.data.subjects;
  }

  public getSubjectById(id: string): Subject | undefined {
    return this.data.subjects.find((s) => s.id === id || s.code.toLowerCase() === id.toLowerCase());
  }

  public createSubject(subjectData: Omit<Subject, 'id'>): Subject {
    const newSubject: Subject = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      instructor: 'Faculty Instructor',
      schedule: 'Schedule TBA',
      location: 'Main Campus',
      credits: '3.0 Credits',
      term: 'Academic Term',
      description: `${subjectData.title} course syllabus, reading materials, and project assignments.`,
      syllabus: [
        'Module 1: Orientation & Foundations',
        'Module 2: Core Coursework & Projects',
        'Module 3: Advanced Applications',
        'Module 4: Final Assessments'
      ],
      ...subjectData,
    };
    this.data.subjects.push(newSubject);
    this.save();
    return newSubject;
  }

  public updateSubject(id: string, updates: Partial<Subject>): Subject | null {
    const index = this.data.subjects.findIndex(
      (s) => s.id === id || s.code.toLowerCase() === id.toLowerCase()
    );
    if (index === -1) return null;

    this.data.subjects[index] = {
      ...this.data.subjects[index],
      ...updates,
    };
    this.save();
    return this.data.subjects[index];
  }

  public deleteSubject(id: string): boolean {
    const prevLength = this.data.subjects.length;
    this.data.subjects = this.data.subjects.filter((s) => s.id !== id);
    if (this.data.subjects.length !== prevLength) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Brain Dump Methods ---
  public getBrainDump(): BrainDump {
    return this.data.brainDump;
  }

  public saveBrainDump(content: string): BrainDump {
    this.data.brainDump = {
      content,
      lastUpdated: new Date().toISOString()
    };
    this.save();
    return this.data.brainDump;
  }
}

export const db = new Database();
