import { config, validateConfig } from './config/env';
import { logger } from './utils/logger';
import { ExpressServer } from './infrastructure/express.server';
import { SocketServer, MessageBus } from './infrastructure/socket.server';
import { ChatOrchestrator } from './services/chat.orchestrator';
import { YouTubeLiveService } from './services/youtube-live.service';
import { ChatFilter } from './services/chat-filter';
import { createYoutubeRouter } from './api/youtube.controller';
import { createSettingsRouter } from './api/settings.controller';
import type { IChatSource } from './core/ports';

async function bootstrap(): Promise<void> {
  validateConfig();

  // ── Infraestrutura HTTP / WebSocket ─────────────────────────
  const expressServer = new ExpressServer();
  const messageBus = new MessageBus();
  new SocketServer(expressServer.httpServer, messageBus);

  // ── Filtro de comandos (compartilhado entre todas as fontes) ─
  const chatFilter = new ChatFilter();

  // ── YouTube Live Service (controlado via API) ───────────────
  const youtubeLiveService = new YouTubeLiveService(messageBus, chatFilter);
  expressServer.app.use('/api/youtube', createYoutubeRouter(youtubeLiveService));
  expressServer.app.use('/api/settings', createSettingsRouter(chatFilter));

  await expressServer.listen();

  // ── Fontes estáticas de chat (Dependency Injection) ─────────
  const sources: IChatSource[] = [];

  if (config.discord.token) {
    const { DiscordChatClient } = await import('./infrastructure/discord.client');
    sources.push(new DiscordChatClient());
  }

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Recebido ${signal}. Encerrando...`);
    youtubeLiveService.stopLive();
    await expressServer.close();
    process.exit(0);
  };

  if (sources.length > 0) {
    const orchestrator = new ChatOrchestrator(sources, messageBus, chatFilter);
    await orchestrator.startAll();

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  } else {
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  }
}

bootstrap().catch((err: unknown) => {
  logger.error('Falha fatal ao iniciar a aplicação', { err });
  process.exit(1);
});
