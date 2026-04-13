import { EventEmitter } from 'events';
import type { YoutubeId } from 'youtube-chat/dist/types/data';
import type { IChatSource } from '../core/ports';
import type { UnifiedChatMessage } from '../core/entities';
export declare class YouTubeChatClient extends EventEmitter implements IChatSource {
    private readonly youtubeIdOverride?;
    readonly sourceId = "youtube";
    private liveChat;
    private reconnectAttempts;
    private reconnectTimer;
    private stopped;
    private readonly circuitBreaker;
    /**
     * @param youtubeIdOverride — Quando fornecido, sobrescreve as variáveis de ambiente.
     *   Use para receber o liveId dinamicamente via API.
     */
    constructor(youtubeIdOverride?: YoutubeId | undefined);
    start(): Promise<void>;
    private connect;
    private attachHandlers;
    private handleError;
    private scheduleReconnect;
    stop(): void;
    on(event: 'message', listener: (msg: UnifiedChatMessage) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    off(event: 'message', listener: (msg: UnifiedChatMessage) => void): this;
    off(event: 'error', listener: (err: Error) => void): this;
}
//# sourceMappingURL=youtube-chat.client.d.ts.map