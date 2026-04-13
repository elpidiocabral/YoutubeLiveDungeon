"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const express_server_1 = require("./infrastructure/express.server");
const socket_server_1 = require("./infrastructure/socket.server");
const chat_orchestrator_1 = require("./services/chat.orchestrator");
const youtube_live_service_1 = require("./services/youtube-live.service");
const chat_filter_1 = require("./services/chat-filter");
const youtube_controller_1 = require("./api/youtube.controller");
const settings_controller_1 = require("./api/settings.controller");
async function bootstrap() {
    (0, env_1.validateConfig)();
    // ── Infraestrutura HTTP / WebSocket ─────────────────────────
    const expressServer = new express_server_1.ExpressServer();
    const messageBus = new socket_server_1.MessageBus();
    new socket_server_1.SocketServer(expressServer.httpServer, messageBus);
    // ── Filtro de comandos (compartilhado entre todas as fontes) ─
    const chatFilter = new chat_filter_1.ChatFilter();
    // ── YouTube Live Service (controlado via API) ───────────────
    const youtubeLiveService = new youtube_live_service_1.YouTubeLiveService(messageBus, chatFilter);
    expressServer.app.use('/api/youtube', (0, youtube_controller_1.createYoutubeRouter)(youtubeLiveService));
    expressServer.app.use('/api/settings', (0, settings_controller_1.createSettingsRouter)(chatFilter));
    await expressServer.listen();
    // ── Fontes estáticas de chat (Dependency Injection) ─────────
    const sources = [];
    if (env_1.config.discord.token) {
        const { DiscordChatClient } = await Promise.resolve().then(() => __importStar(require('./infrastructure/discord.client')));
        sources.push(new DiscordChatClient());
    }
    const shutdown = async (signal) => {
        logger_1.logger.info(`Recebido ${signal}. Encerrando...`);
        youtubeLiveService.stopLive();
        await expressServer.close();
        process.exit(0);
    };
    if (sources.length > 0) {
        const orchestrator = new chat_orchestrator_1.ChatOrchestrator(sources, messageBus, chatFilter);
        await orchestrator.startAll();
        process.on('SIGTERM', () => void shutdown('SIGTERM'));
        process.on('SIGINT', () => void shutdown('SIGINT'));
    }
    else {
        process.on('SIGTERM', () => void shutdown('SIGTERM'));
        process.on('SIGINT', () => void shutdown('SIGINT'));
    }
}
bootstrap().catch((err) => {
    logger_1.logger.error('Falha fatal ao iniciar a aplicação', { err });
    process.exit(1);
});
//# sourceMappingURL=index.js.map