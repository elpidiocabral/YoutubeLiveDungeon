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
import { createYoutubeRouter } from './api/youtube.controller';
import { MockChatSource } from './infrastructure/mock-chat.source';
import { logger } from './utils/logger';

const args = process.argv.slice(2);
const useMock = args.includes('--mock');
const intervalIdx = args.indexOf('--interval');
const intervalMs = intervalIdx !== -1 ? parseInt(args[intervalIdx + 1], 10) : 2000;

async function main(): Promise<void> {
  const expressServer = new ExpressServer();
  const messageBus = new MessageBus();
  new SocketServer(expressServer.httpServer, messageBus);

  // ── YouTube controlado via API (sempre presente) ────────────
  const youtubeLiveService = new YouTubeLiveService(messageBus);
  expressServer.app.use('/api/youtube', createYoutubeRouter(youtubeLiveService));

  await expressServer.listen();

  logger.info('──────────────────────────────────────────────');
  logger.info('  Dev Server pronto!');
  logger.info('  Health:    http://localhost:3001/health');
  logger.info('  Status:    http://localhost:3001/api/youtube/status');
  logger.info('  WebSocket: ws://localhost:3001  (evento: chat:message)');
  logger.info(`  Mock:      ${useMock ? `ATIVO (intervalo: ${intervalMs}ms)` : 'desativado'}`);
  logger.info('──────────────────────────────────────────────');

  if (useMock) {
    const mock = new MockChatSource(intervalMs);
    const orchestrator = new ChatOrchestrator([mock], messageBus);
    await orchestrator.startAll();

    const shutdown = (): void => {
      orchestrator.stopAll();
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
