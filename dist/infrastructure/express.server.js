"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const health_controller_1 = require("../api/health.controller");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
class ExpressServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use('/health', health_controller_1.healthRouter);
        this.httpServer = (0, http_1.createServer)(this.app);
    }
    listen() {
        return new Promise((resolve) => {
            this.httpServer.listen(env_1.config.port, () => {
                logger_1.logger.info(`[Express] Servidor escutando na porta ${env_1.config.port}`);
                resolve();
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.httpServer.close((err) => (err ? reject(err) : resolve()));
        });
    }
}
exports.ExpressServer = ExpressServer;
//# sourceMappingURL=express.server.js.map