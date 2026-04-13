"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeChatClient = void 0;
const events_1 = require("events");
const youtube_chat_1 = require("youtube-chat");
const youtube_adapter_1 = require("../adapters/youtube.adapter");
const circuit_breaker_1 = require("../services/circuit-breaker");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class YouTubeChatClient extends events_1.EventEmitter {
    constructor() {
        super();
        this.sourceId = 'youtube';
        this.liveChat = null;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.stopped = false;
        this.circuitBreaker = new circuit_breaker_1.CircuitBreaker('youtube-chat', {
            failureThreshold: env_1.config.circuitBreaker.failureThreshold,
            recoveryTimeoutMs: env_1.config.circuitBreaker.recoveryTimeoutMs,
        });
    }
    async start() {
        this.stopped = false;
        await this.connect();
    }
    async connect() {
        if (this.circuitBreaker.isOpen()) {
            logger_1.logger.warn('[YouTube] Circuit breaker OPEN — aguardando recuperação');
            this.scheduleReconnect();
            return;
        }
        const youtubeId = env_1.config.youtube.liveId
            ? { liveId: env_1.config.youtube.liveId }
            : { channelId: env_1.config.youtube.channelId };
        logger_1.logger.info('[YouTube] Iniciando conexão com live chat', { youtubeId });
        this.liveChat = new youtube_chat_1.LiveChat(youtubeId);
        this.attachHandlers(this.liveChat);
        const started = await this.liveChat.start().catch((err) => {
            this.handleError(err instanceof Error ? err : new Error(String(err)));
            return false;
        });
        if (started) {
            logger_1.logger.info('[YouTube] Live chat conectado', {
                liveId: this.liveChat.liveId,
            });
            this.circuitBreaker.recordSuccess();
            this.reconnectAttempts = 0;
        }
    }
    attachHandlers(liveChat) {
        liveChat.on('chat', (chatItem) => {
            try {
                const unified = (0, youtube_adapter_1.adaptYouTubeChatItem)(chatItem);
                this.emit('message', unified);
            }
            catch (err) {
                logger_1.logger.error('[YouTube] Erro ao adaptar mensagem', { err });
            }
        });
        liveChat.on('end', (reason) => {
            logger_1.logger.warn('[YouTube] Live chat encerrado', { reason });
            if (!this.stopped)
                this.scheduleReconnect();
        });
        liveChat.on('error', (err) => {
            this.handleError(err instanceof Error ? err : new Error(String(err)));
        });
    }
    handleError(err) {
        logger_1.logger.error('[YouTube] Erro no live chat', { message: err.message });
        this.circuitBreaker.recordFailure();
        this.emit('error', err);
        if (!this.stopped)
            this.scheduleReconnect();
    }
    scheduleReconnect() {
        if (this.stopped)
            return;
        if (this.reconnectAttempts >= env_1.config.youtube.maxReconnectAttempts) {
            logger_1.logger.error('[YouTube] Número máximo de tentativas atingido. Desistindo.');
            return;
        }
        const delay = env_1.config.youtube.reconnectDelayMs * Math.pow(2, this.reconnectAttempts);
        this.reconnectAttempts++;
        logger_1.logger.info(`[YouTube] Tentando reconexão em ${delay}ms (tentativa ${this.reconnectAttempts})`);
        this.reconnectTimer = setTimeout(async () => {
            await this.connect();
        }, delay);
    }
    stop() {
        this.stopped = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.liveChat?.stop('Manual stop');
        this.liveChat = null;
        logger_1.logger.info('[YouTube] Cliente parado.');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event, listener) {
        return super.on(event, listener);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off(event, listener) {
        return super.off(event, listener);
    }
}
exports.YouTubeChatClient = YouTubeChatClient;
//# sourceMappingURL=youtube-chat.client.js.map