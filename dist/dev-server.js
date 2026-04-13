"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Script de desenvolvimento/teste.
 *
 * Flags opcionais:
 *   --mock              Ativa a fonte simulada (padrão: desativada)
 *   --interval <ms>     Intervalo entre mensagens mock (padrão: 2000)
 *
 * Uso:
 *   npx ts-node src/dev-server.ts              # só rotas reais
 *   npx ts-node src/dev-server.ts --mock       # mock ativo
 *   npx ts-node src/dev-server.ts --mock --interval 500
 */
require("dotenv/config");
const express_server_1 = require("./infrastructure/express.server");
const socket_server_1 = require("./infrastructure/socket.server");
const chat_orchestrator_1 = require("./services/chat.orchestrator");
const youtube_live_service_1 = require("./services/youtube-live.service");
const chat_filter_1 = require("./services/chat-filter");
const youtube_controller_1 = require("./api/youtube.controller");
const settings_controller_1 = require("./api/settings.controller");
const mock_chat_source_1 = require("./infrastructure/mock-chat.source");
const discord_client_1 = require("./infrastructure/discord.client");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const args = process.argv.slice(2);
const useMock = args.includes('--mock');
const intervalIdx = args.indexOf('--interval');
const intervalMs = intervalIdx !== -1 ? parseInt(args[intervalIdx + 1], 10) : 2000;
async function main() {
    const expressServer = new express_server_1.ExpressServer();
    const messageBus = new socket_server_1.MessageBus();
    new socket_server_1.SocketServer(expressServer.httpServer, messageBus);
    // ── Filtro de comandos (compartilhado entre todas as fontes) ─
    const chatFilter = new chat_filter_1.ChatFilter();
    // ── YouTube controlado via API (sempre presente) ────────────
    const youtubeLiveService = new youtube_live_service_1.YouTubeLiveService(messageBus, chatFilter);
    expressServer.app.use('/api/youtube', (0, youtube_controller_1.createYoutubeRouter)(youtubeLiveService));
    expressServer.app.use('/api/settings', (0, settings_controller_1.createSettingsRouter)(chatFilter));
    await expressServer.listen();
    // ── Fontes estáticas (Discord, etc.) ────────────────────────
    const staticSources = [];
    if (env_1.config.discord.token) {
        staticSources.push(new discord_client_1.DiscordChatClient());
        logger_1.logger.info('  Discord:   token encontrado — iniciando bot...');
    }
    else {
        logger_1.logger.info('  Discord:   DISCORD_TOKEN não definido — fonte desativada');
    }
    if (staticSources.length > 0) {
        const staticOrchestrator = new chat_orchestrator_1.ChatOrchestrator(staticSources, messageBus, chatFilter);
        await staticOrchestrator.startAll();
    }
    logger_1.logger.info('──────────────────────────────────────────────');
    logger_1.logger.info('  Dev Server pronto!');
    logger_1.logger.info('  Health:    http://localhost:3001/health');
    logger_1.logger.info('  Status:    http://localhost:3001/api/youtube/status');
    logger_1.logger.info('  WebSocket: ws://localhost:3001  (evento: chat:message)');
    logger_1.logger.info(`  Mock:      ${useMock ? `ATIVO (intervalo: ${intervalMs}ms)` : 'desativado'}`);
    logger_1.logger.info('──────────────────────────────────────────────');
    if (useMock) {
        const mock = new mock_chat_source_1.MockChatSource(intervalMs);
        const mockOrchestrator = new chat_orchestrator_1.ChatOrchestrator([mock], messageBus, chatFilter);
        await mockOrchestrator.startAll();
        const shutdown = () => {
            mockOrchestrator.stopAll();
            youtubeLiveService.stopLive();
            void expressServer.close();
            process.exit(0);
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
    else {
        const shutdown = () => {
            youtubeLiveService.stopLive();
            void expressServer.close();
            process.exit(0);
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
}
main().catch((err) => {
    logger_1.logger.error('Erro fatal no dev-server', { err });
    process.exit(1);
});
//# sourceMappingURL=dev-server.js.map