import { Router } from 'express';

export const healthRouter = Router();

const startedAt = new Date();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    startedAt: startedAt.toISOString(),
    timestamp: new Date().toISOString(),
  });
});
