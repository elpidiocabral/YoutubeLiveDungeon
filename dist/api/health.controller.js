"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
exports.healthRouter = (0, express_1.Router)();
const startedAt = new Date();
exports.healthRouter.get('/', (_req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        startedAt: startedAt.toISOString(),
        timestamp: new Date().toISOString(),
    });
});
//# sourceMappingURL=health.controller.js.map