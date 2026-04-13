import { EventEmitter } from 'events';
import type { IChatSource } from '../core/ports';
import type { UnifiedChatMessage } from '../core/entities';
export declare class DiscordChatClient extends EventEmitter implements IChatSource {
    readonly sourceId = "discord";
    private readonly client;
    constructor();
    start(): Promise<void>;
    stop(): void;
    on(event: 'message', listener: (msg: UnifiedChatMessage) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    off(event: 'message', listener: (msg: UnifiedChatMessage) => void): this;
    off(event: 'error', listener: (err: Error) => void): this;
}
//# sourceMappingURL=discord.client.d.ts.map