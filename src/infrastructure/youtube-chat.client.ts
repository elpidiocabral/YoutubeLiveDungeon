import { EventEmitter } from 'events';
import { LiveChat } from 'youtube-chat';
import type { YoutubeId } from 'youtube-chat/dist/types/data';
import type { IChatSource } from '../core/ports';
import type { UnifiedChatMessage } from '../core/entities';
import { adaptYouTubeChatItem } from '../adapters/youtube.adapter';
import { CircuitBreaker } from '../services/circuit-breaker';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export class YouTubeChatClient extends EventEmitter implements IChatSource {
  readonly sourceId = 'youtube';

  private liveChat: LiveChat | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private stopped = false;

  private readonly circuitBreaker: CircuitBreaker;

  /**
   * @param youtubeIdOverride — Quando fornecido, sobrescreve as variáveis de ambiente.
   *   Use para receber o liveId dinamicamente via API.
   */
  constructor(private readonly youtubeIdOverride?: YoutubeId) {
    super();
    this.circuitBreaker = new CircuitBreaker('youtube-chat', {
      failureThreshold: config.circuitBreaker.failureThreshold,
      recoveryTimeoutMs: config.circuitBreaker.recoveryTimeoutMs,
    });
  }

  async start(): Promise<void> {
    this.stopped = false;
    await this.connect();
  }

  private async connect(): Promise<void> {
    if (this.circuitBreaker.isOpen()) {
      logger.warn('[YouTube] Circuit breaker OPEN — aguardando recuperação');
      this.scheduleReconnect();
      return;
    }

    const youtubeId: YoutubeId =
      this.youtubeIdOverride ??
      (config.youtube.liveId
        ? { liveId: config.youtube.liveId }
        : { channelId: config.youtube.channelId });

    logger.info('[YouTube] Iniciando conexão com live chat', { youtubeId });

    this.liveChat = new LiveChat(youtubeId);
    this.attachHandlers(this.liveChat);

    const started = await this.liveChat.start().catch((err: unknown) => {
      this.handleError(err instanceof Error ? err : new Error(String(err)));
      return false;
    });

    if (started) {
      logger.info('[YouTube] Live chat conectado', {
        liveId: this.liveChat.liveId,
      });
      this.circuitBreaker.recordSuccess();
      this.reconnectAttempts = 0;
    }
  }

  private attachHandlers(liveChat: LiveChat): void {
    liveChat.on('chat', (chatItem) => {
      try {
        const unified = adaptYouTubeChatItem(chatItem);
        this.emit('message', unified);
      } catch (err) {
        logger.error('[YouTube] Erro ao adaptar mensagem', { err });
      }
    });

    liveChat.on('end', (reason) => {
      logger.warn('[YouTube] Live chat encerrado', { reason });
      if (!this.stopped) this.scheduleReconnect();
    });

    liveChat.on('error', (err: Error | unknown) => {
      this.handleError(err instanceof Error ? err : new Error(String(err)));
    });
  }

  private handleError(err: Error): void {
    logger.error('[YouTube] Erro no live chat', { message: err.message });
    this.circuitBreaker.recordFailure();
    this.emit('error', err);
    if (!this.stopped) this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.stopped) return;
    if (this.reconnectAttempts >= config.youtube.maxReconnectAttempts) {
      logger.error('[YouTube] Número máximo de tentativas atingido. Desistindo.');
      return;
    }

    const delay = config.youtube.reconnectDelayMs * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    logger.info(`[YouTube] Tentando reconexão em ${delay}ms (tentativa ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(async () => {
      await this.connect();
    }, delay);
  }

  stop(): void {
    this.stopped = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.liveChat?.stop('Manual stop');
    this.liveChat = null;
    logger.info('[YouTube] Cliente parado.');
  }

  on(event: 'message', listener: (msg: UnifiedChatMessage) => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  off(event: 'message', listener: (msg: UnifiedChatMessage) => void): this;
  off(event: 'error', listener: (err: Error) => void): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(event: string, listener: (...args: any[]) => void): this {
    return super.off(event, listener);
  }
}
