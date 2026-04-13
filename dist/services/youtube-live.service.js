"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeLiveService = void 0;
const youtube_chat_client_1 = require("../infrastructure/youtube-chat.client");
const youtube_url_1 = require("../utils/youtube-url");
const logger_1 = require("../utils/logger");
class YouTubeLiveService {
    constructor(messageBus, filter) {
        this.messageBus = messageBus;
        this.filter = filter;
        this.activeClient = null;
    }
    async startLive(urlOrId) {
        const parsed = (0, youtube_url_1.parseYouTubeLiveId)(urlOrId);
        if (!parsed) {
            return {
                success: false,
                error: `Não foi possível extrair um liveId de "${urlOrId}". Formatos aceitos: URL completa do YouTube ou ID de 11 caracteres.`,
            };
        }
        // Para live anterior se houver
        if (this.activeClient) {
            logger_1.logger.info('[YTLiveService] Parando live anterior antes de iniciar nova', {
                liveId: this.currentLiveId,
            });
            this.stopLive();
        }
        const { liveId } = parsed;
        this.activeClient = new youtube_chat_client_1.YouTubeChatClient({ liveId });
        this.currentLiveId = liveId;
        this.startedAt = new Date();
        this.activeClient.on('message', (msg) => {
            if (this.filter.passes(msg))
                this.messageBus.publish(msg);
        });
        this.activeClient.on('error', (err) => {
            logger_1.logger.error('[YTLiveService] Erro no cliente', { message: err.message });
        });
        try {
            await this.activeClient.start();
            logger_1.logger.info('[YTLiveService] Live iniciada', { liveId });
            return { success: true, liveId };
        }
        catch (err) {
            this.stopLive();
            const message = err instanceof Error ? err.message : String(err);
            return { success: false, error: `Falha ao conectar na live: ${message}` };
        }
    }
    stopLive() {
        if (this.activeClient) {
            this.activeClient.stop();
            logger_1.logger.info('[YTLiveService] Live parada', { liveId: this.currentLiveId });
        }
        this.activeClient = null;
        this.currentLiveId = undefined;
        this.startedAt = undefined;
    }
    getStatus() {
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
exports.YouTubeLiveService = YouTubeLiveService;
//# sourceMappingURL=youtube-live.service.js.map