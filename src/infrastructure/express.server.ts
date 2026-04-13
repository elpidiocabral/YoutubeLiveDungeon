import express, { type Application } from 'express';
import { createServer, type Server as HttpServer } from 'http';
import { healthRouter } from '../api/health.controller';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export class ExpressServer {
  readonly app: Application;
  readonly httpServer: HttpServer;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use('/health', healthRouter);
    this.httpServer = createServer(this.app);
  }

  listen(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.listen(config.port, () => {
        logger.info(`[Express] Servidor escutando na porta ${config.port}`);
        resolve();
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.close((err) => (err ? reject(err) : resolve()));
    });
  }
}
