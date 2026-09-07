import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { tasksRouter } from './server/routes/tasksRouter.ts';
import { subjectsRouter } from './server/routes/subjectsRouter.ts';
import { brainDumpRouter } from './server/routes/brainDumpRouter.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // API Routes (Mounted before Vite middleware)
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/tasks', tasksRouter);
  app.use('/api/subjects', subjectsRouter);
  app.use('/api/braindump', brainDumpRouter);

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Study Space Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
