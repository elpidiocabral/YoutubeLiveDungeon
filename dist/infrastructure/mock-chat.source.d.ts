import { EventEmitter } from 'events';
import type { IChatSource } from '../core/ports';
import type { UnifiedChatMessage } from '../core/entities';
export declare class MockChatSource extends EventEmitter implements IChatSource {
    readonly sourceId = "mock";
    private timer;
    private readonly intervalMs;
    constructor(intervalMs?: number);
    start(): Promise<void>;
    stop(): void;
    private emitFakeMessage;
    on(event: 'message', listener: (msg: UnifiedChatMessage) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    off(event: 'message', listener: (msg: UnifiedChatMessage) => void): this;
    off(event: 'error', listener: (err: Error) => void): this;
}
//# sourceMappingURL=mock-chat.source.d.ts.map