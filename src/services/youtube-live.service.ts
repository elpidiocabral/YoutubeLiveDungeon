import { YouTubeChatClient } from '../infrastructure/youtube-chat.client';
import type { IMessageBus } from '../core/ports';
import { parseYouTubeLiveId } from '../utils/youtube-url';
import { logger } from '../utils/logger';

export type LiveStatus =
  | { active: false }
  | { active: true; liveId: string; startedAt: string };

export class YouTubeLiveService {
  private activeClient: YouTubeChatClient | null = null;
  private currentLiveId: string | undefined;
  private startedAt: Date | undefined;

  constructor(private readonly messageBus: IMessageBus) {}

  async startLive(
    urlOrId: string
  ): Promise<{ success: true; liveId: string } | { success: false; error: string }> {
    const parsed = parseYouTubeLiveId(urlOrId);
    if (!parsed) {
      return {
        success: false,
        error: `Não foi possível extrair um liveId de "${urlOrId}". Formatos aceitos: URL completa do YouTube ou ID de 11 caracteres.`,
      };
    }

    // Para live anterior se houver
    if (this.activeClient) {
      logger.info('[YTLiveService] Parando live anterior antes de iniciar nova', {
        liveId: this.currentLiveId,
      });
      this.stopLive();
    }

    const { liveId } = parsed;
    this.activeClient = new YouTubeChatClient({ liveId });
    this.currentLiveId = liveId;
    this.startedAt = new Date();

    this.activeClient.on('message', (msg) => this.messageBus.publish(msg));
    this.activeClient.on('error', (err) => {
      logger.error('[YTLiveService] Erro no cliente', { message: err.message });
    });

    try {
      await this.activeClient.start();
      logger.info('[YTLiveService] Live iniciada', { liveId });
      return { success: true, liveId };
    } catch (err) {
      this.stopLive();
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: `Falha ao conectar na live: ${message}` };
    }
  }

  stopLive(): void {
    if (this.activeClient) {
      this.activeClient.stop();
      logger.info('[YTLiveService] Live parada', { liveId: this.currentLiveId });
    }
    this.activeClient = null;
    this.currentLiveId = undefined;
    this.startedAt = undefined;
  }

  getStatus(): LiveStatus {
    if (!this.activeClient || !this.currentLiveId || !this.startedAt) {
      return { active: false };
    }
    return {
      active: true,
      liveId: this.currentLiveId,
      startedAt: this.startedAt.toISOString(),
    };
  }
}
