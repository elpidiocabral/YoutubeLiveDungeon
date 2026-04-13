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
import 'dotenv/config';
import { ExpressServer } from './infrastructure/express.server';
import { SocketServer, MessageBus } from './infrastructure/socket.server';
import { ChatOrchestrator } from './services/chat.orchestrator';
import { YouTubeLiveService } from './services/youtube-live.service';
import { ChatFilter } from './services/chat-filter';
import { createYoutubeRouter } from './api/youtube.controller';
import { createSettingsRouter } from './api/settings.controller';
import { MockChatSource } from './infrastructure/mock-chat.source';
import { DiscordChatClient } from './infrastructure/discord.client';
import type { IChatSource } from './core/ports';
import { config } from './config/env';
import { logger } from './utils/logger';

const args = process.argv.slice(2);
const useMock = args.includes('--mock');
const intervalIdx = args.indexOf('--interval');
const intervalMs = intervalIdx !== -1 ? parseInt(args[intervalIdx + 1], 10) : 2000;

async function main(): Promise<void> {
  const expressServer = new ExpressServer();
  const messageBus = new MessageBus();
  new SocketServer(expressServer.httpServer, messageBus);

  // ── Filtro de comandos (compartilhado entre todas as fontes) ─
  const chatFilter = new ChatFilter();

  // ── YouTube controlado via API (sempre presente) ────────────
  const youtubeLiveService = new YouTubeLiveService(messageBus, chatFilter);
  expressServer.app.use('/api/youtube', createYoutubeRouter(youtubeLiveService));
  expressServer.app.use('/api/settings', createSettingsRouter(chatFilter));

  await expressServer.listen();

  // ── Fontes estáticas (Discord, etc.) ────────────────────────
  const staticSources: IChatSource[] = [];
  if (config.discord.token) {
    staticSources.push(new DiscordChatClient());
    logger.info('  Discord:   token encontrado — iniciando bot...');
  } else {
    logger.info('  Discord:   DISCORD_TOKEN não definido — fonte desativada');
  }

  if (staticSources.length > 0) {
    const staticOrchestrator = new ChatOrchestrator(staticSources, messageBus, chatFilter);
    await staticOrchestrator.startAll();
  }

  logger.info('──────────────────────────────────────────────');
  logger.info('  Dev Server pronto!');
  logger.info('  Health:    http://localhost:3001/health');
  logger.info('  Status:    http://localhost:3001/api/youtube/status');
  logger.info('  WebSocket: ws://localhost:3001  (evento: chat:message)');
  logger.info(`  Mock:      ${useMock ? `ATIVO (intervalo: ${intervalMs}ms)` : 'desativado'}`);
  logger.info('──────────────────────────────────────────────');

  if (useMock) {
    const mock = new MockChatSource(intervalMs);
    const mockOrchestrator = new ChatOrchestrator([mock], messageBus, chatFilter);
    await mockOrchestrator.startAll();

    const shutdown = (): void => {
      mockOrchestrator.stopAll();
      youtubeLiveService.stopLive();
      void expressServer.close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } else {
    const shutdown = (): void => {
      youtubeLiveService.stopLive();
      void expressServer.close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }
}

main().catch((err: unknown) => {
  logger.error('Erro fatal no dev-server', { err });
  process.exit(1);
});
