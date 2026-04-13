import { EventEmitter } from 'events';
import type { UnifiedChatMessage } from './entities';
/**
 * Port: contrato que qualquer fonte de chat deve implementar.
 * Emite eventos 'message' e 'error'.
 */
export interface IChatSource {
    readonly sourceId: string;
    start(): Promise<void>;
    stop(): void;
    on(event: 'message', listener: (msg: UnifiedChatMessage) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    off(event: 'message', listener: (msg: UnifiedChatMessage) => void): this;
    off(event: 'error', listener: (err: Error) => void): this;
}
/**
 * Port: barramento interno de mensagens — desacopla fontes dos consumidores (WebSocket).
 */
export interface IMessageBus extends EventEmitter {
    publish(message: UnifiedChatMessage): void;
}
//# sourceMappingURL=ports.d.ts.map