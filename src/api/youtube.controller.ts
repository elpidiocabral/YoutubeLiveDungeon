import { Router, type Request, type Response } from 'express';
import type { YouTubeLiveService } from '../services/youtube-live.service';

export function createYoutubeRouter(service: YouTubeLiveService): Router {
  const router = Router();

  /**
   * POST /api/youtube/start
   * Body: { "url": "https://www.youtube.com/watch?v=..." }
   */
  router.post('/start', (req: Request, res: Response): void => {
    const { url } = req.body as { url?: unknown };

    if (!url || typeof url !== 'string' || url.trim() === '') {
      res.status(400).json({ error: 'O campo "url" é obrigatório.' });
      return;
    }

    service
      .startLive(url)
      .then((result) => {
        if (result.success) {
          res.status(200).json(result);
        } else {
          res.status(422).json(result);
        }
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Erro interno';
        res.status(500).json({ success: false, error: message });
      });
  });

  /**
   * POST /api/youtube/stop
   */
  router.post('/stop', (_req: Request, res: Response): void => {
    service.stopLive();
    res.json({ success: true });
  });

  /**
   * GET /api/youtube/status
   */
  router.get('/status', (_req: Request, res: Response): void => {
    res.json(service.getStatus());
  });

  return router;
}
