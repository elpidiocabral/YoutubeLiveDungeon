import { config, validateConfig } from './config/env';
import { logger } from './utils/logger';
import { ExpressServer } from './infrastructure/express.server';
import { SocketServer, MessageBus } from './infrastructure/socket.server';
import { ChatOrchestrator } from './services/chat.orchestrator';
import type { IChatSource } from './core/ports';

async function bootstrap(): Promise<void> {
  validateConfig();

  // ── Infraestrutura HTTP / WebSocket ─────────────────────────
  const expressServer = new ExpressServer();
  const messageBus = new MessageBus();
  new SocketServer(expressServer.httpServer, messageBus);
  await expressServer.listen();

  // ── Fontes de chat (Dependency Injection) ───────────────────
  const sources: IChatSource[] = [];

  if (config.youtube.channelId || config.youtube.liveId) {
    const { YouTubeChatClient } = await import('./infrastructure/youtube-chat.client');
    sources.push(new YouTubeChatClient());
  }

  if (config.discord.token) {
    const { DiscordChatClient } = await import('./infrastructure/discord.client');
    sources.push(new DiscordChatClient());
  }

  const orchestrator = new ChatOrchestrator(sources, messageBus);
  await orchestrator.startAll();

  // ── Graceful Shutdown ────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Recebido ${signal}. Encerrando...`);
    orchestrator.stopAll();
    await expressServer.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

bootstrap().catch((err: unknown) => {
  logger.error('Falha fatal ao iniciar a aplicação', { err });
  process.exit(1);
});
