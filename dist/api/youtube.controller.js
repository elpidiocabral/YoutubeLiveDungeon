"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createYoutubeRouter = createYoutubeRouter;
const express_1 = require("express");
function createYoutubeRouter(service) {
    const router = (0, express_1.Router)();
    /**
     * POST /api/youtube/start
     * Body: { "url": "https://www.youtube.com/watch?v=..." }
     */
    router.post('/start', (req, res) => {
        const { url } = req.body;
        if (!url || typeof url !== 'string' || url.trim() === '') {
            res.status(400).json({ error: 'O campo "url" é obrigatório.' });
            return;
        }
        service
            .startLive(url)
            .then((result) => {
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(422).json(result);
            }
        })
            .catch((err) => {
            const message = err instanceof Error ? err.message : 'Erro interno';
            res.status(500).json({ success: false, error: message });
        });
    });
    /**
     * POST /api/youtube/stop
     */
    router.post('/stop', (_req, res) => {
        service.stopLive();
        res.json({ success: true });
    });
    /**
     * GET /api/youtube/status
     */
    router.get('/status', (_req, res) => {
        res.json(service.getStatus());
    });
    return router;
}
//# sourceMappingURL=youtube.controller.js.map