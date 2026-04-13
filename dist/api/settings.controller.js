"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSettingsRouter = createSettingsRouter;
const express_1 = require("express");
function createSettingsRouter(filter) {
    const router = (0, express_1.Router)();
    /**
     * GET /api/settings
     * Retorna as configurações atuais.
     */
    router.get('/', (_req, res) => {
        res.json(filter.getSettings());
    });
    /**
     * POST /api/settings
     * Body: { "commandPrefix": "!" }  — passa null ou "" para desativar o filtro.
     */
    router.post('/', (req, res) => {
        const { commandPrefix } = req.body;
        if (commandPrefix !== undefined && commandPrefix !== null && typeof commandPrefix !== 'string') {
            res.status(400).json({ error: '"commandPrefix" deve ser uma string ou null.' });
            return;
        }
        filter.setCommandPrefix(typeof commandPrefix === 'string' ? commandPrefix : null);
        res.json({ success: true, settings: filter.getSettings() });
    });
    return router;
}
//# sourceMappingURL=settings.controller.js.map