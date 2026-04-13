import { Router, type Request, type Response } from 'express';
import type { ChatFilter } from '../services/chat-filter';

export function createSettingsRouter(filter: ChatFilter): Router {
  const router = Router();

  /**
   * GET /api/settings
   * Retorna as configurações atuais.
   */
  router.get('/', (_req: Request, res: Response): void => {
    res.json(filter.getSettings());
  });

  /**
   * POST /api/settings
   * Body: { "commandPrefix": "!" }  — passa null ou "" para desativar o filtro.
   */
  router.post('/', (req: Request, res: Response): void => {
    const { commandPrefix } = req.body as { commandPrefix?: unknown };

    if (commandPrefix !== undefined && commandPrefix !== null && typeof commandPrefix !== 'string') {
      res.status(400).json({ error: '"commandPrefix" deve ser uma string ou null.' });
      return;
    }

    filter.setCommandPrefix(typeof commandPrefix === 'string' ? commandPrefix : null);
    res.json({ success: true, settings: filter.getSettings() });
  });

  return router;
}
