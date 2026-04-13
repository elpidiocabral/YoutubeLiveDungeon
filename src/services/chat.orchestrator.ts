import type { IChatSource, IMessageBus } from '../core/ports';
import type { ChatFilter } from './chat-filter';
import { logger } from '../utils/logger';

/**
 * Orquestra múltiplas fontes de chat.
 * Recebe as fontes por injeção de dependência, assina os eventos
 * e publica as mensagens normalizadas no barramento interno.
 */
export class ChatOrchestrator {
  private readonly sources: IChatSource[];

  constructor(
    sources: IChatSource[],
    private readonly messageBus: IMessageBus,
    private readonly filter: ChatFilter
  ) {
    this.sources = sources;
  }

  async startAll(): Promise<void> {
    for (const source of this.sources) {
      source.on('message', (msg) => {
        if (this.filter.passes(msg)) this.messageBus.publish(msg);
      });

      source.on('error', (err) => {
        logger.error(`[Orchestrator] Erro na fonte "${source.sourceId}"`, {
          message: err.message,
        });
      });

      try {
        await source.start();
        logger.info(`[Orchestrator] Fonte "${source.sourceId}" iniciada`);
      } catch (err) {
        logger.error(`[Orchestrator] Falha ao iniciar fonte "${source.sourceId}"`, { err });
      }
    }
  }

  stopAll(): void {
    for (const source of this.sources) {
      try {
        source.stop();
        logger.info(`[Orchestrator] Fonte "${source.sourceId}" parada`);
      } catch (err) {
        logger.error(`[Orchestrator] Erro ao parar fonte "${source.sourceId}"`, { err });
      }
    }
  }
}
