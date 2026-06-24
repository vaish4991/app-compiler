import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './utils/logger.ts';
import { compilePrompt } from './utils/compiler.ts';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// In-memory store for compilation results (would be database in production)
const compilationStore = new Map<
  string,
  {
    prompt: string;
    config: any;
    generatedApp: any;
    metrics: any;
    status: 'pending' | 'success' | 'failed';
    timestamp: Date;
  }
>();

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Main compilation endpoint
app.post('/api/compile', async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({
      error: 'Invalid prompt',
      message: 'Prompt must be a non-empty string',
    });
  }

  const compilationId = uuidv4();
  logger.info('New compilation request', { compilationId, promptLength: prompt.length });

  try {
    // Store initial state
    compilationStore.set(compilationId, {
      prompt,
      config: null,
      generatedApp: null,
      metrics: null,
      status: 'pending',
      timestamp: new Date(),
    });

    // Run compilation pipeline
    const result = await compilePrompt(prompt);

    // Update store
    compilationStore.set(compilationId, {
      prompt,
      config: result.config || null,
      generatedApp: result.generatedApp || null,
      metrics: result.metrics,
      status: result.success ? 'success' : 'failed',
      timestamp: new Date(),
    });

    if (result.success) {
      res.json({
        id: compilationId,
        status: 'success',
        appId: result.appId,
        config: result.config,
        generatedApp: {
          id: result.generatedApp?.id,
          path: result.generatedApp?.path,
        },
        metrics: result.metrics,
      });
    } else {
      res.status(400).json({
        id: compilationId,
        status: 'failed',
        error: result.error,
        metrics: result.metrics,
      });
    }
  } catch (error) {
    logger.error('Compilation error', { compilationId, error: String(error) });
    res.status(500).json({
      id: compilationId,
      status: 'failed',
      error: 'Internal server error',
      message: String(error),
    });
  }
});

// Get compilation status
app.get('/api/status/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const result = compilationStore.get(id);

  if (!result) {
    return res.status(404).json({ error: 'Compilation not found' });
  }

  res.json({
    id,
    status: result.status,
    timestamp: result.timestamp,
    config: result.status === 'success' ? result.config : null,
    metrics: result.metrics,
  });
});

// Get all compilations (for metrics/evaluation)
app.get('/api/compilations', (req: Request, res: Response) => {
  const compilations = Array.from(compilationStore.entries()).map(([id, data]) => ({
    id,
    status: data.status,
    timestamp: data.timestamp,
    metrics: data.metrics,
  }));

  res.json({ compilations, total: compilations.length });
});

// Get system metrics
app.get('/api/metrics', (req: Request, res: Response) => {
  const compilations = Array.from(compilationStore.values());
  const successCount = compilations.filter(c => c.status === 'success').length;
  const failedCount = compilations.filter(c => c.status === 'failed').length;
  const totalTime = compilations.reduce((sum, c) => sum + (c.metrics?.totalDuration || 0), 0);
  const avgTime = compilations.length > 0 ? totalTime / compilations.length : 0;

  res.json({
    totalCompilations: compilations.length,
    successCount,
    failedCount,
    successRate: compilations.length > 0 ? (successCount / compilations.length) * 100 : 0,
    averageLatency: avgTime,
    totalLatency: totalTime,
  });
});

// Get generated app files
app.get('/api/app/:appId/files', (req: Request, res: Response) => {
  const { appId } = req.params;
  const compilation = Array.from(compilationStore.values()).find(
    c => c.generatedApp?.id === appId
  );

  if (!compilation || !compilation.generatedApp) {
    return res.status(404).json({ error: 'App not found' });
  }

  res.json({
    appId,
    files: {
      packageJson: compilation.generatedApp.packageJson,
      nextPages: Array.from(compilation.generatedApp.nextPages.entries()),
      apiRoutes: Array.from(compilation.generatedApp.apiRoutes.entries()),
      dbMigrations: Array.from(compilation.generatedApp.dbMigrations.entries()),
      dockerCompose: compilation.generatedApp.dockerCompose,
    },
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response) => {
  logger.error('Unhandled error', { error: String(err) });
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? String(err) : 'An error occurred',
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Backend server started on port ${PORT}`);
});
