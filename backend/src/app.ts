import express from 'express';

import { filingsRouter } from './routes/filings';
import { summaryRouter } from './routes/summary';
import { errorHandler } from './libs/errorHandler';

export function createApp() {
  const app = express();

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use(filingsRouter);
  app.use(summaryRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  app.use(errorHandler);

  return app;
}