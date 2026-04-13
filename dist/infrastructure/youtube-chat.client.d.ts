import { EventEmitter } from 'events';
import type { IChatSource } from '../core/ports';
import type { UnifiedChatMessage } from '../core/entities';
export declare class YouTubeChatClient extends EventEmitter implements IChatSource {
    readonly sourceId = "youtube";
    private liveChat;
    private reconnectAttempts;
    private reconnectTimer;
    private stopped;
    private readonly circuitBreaker;
    constructor();
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