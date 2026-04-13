import { EventEmitter } from 'events';
import type { Server as HttpServer } from 'http';
import type { IMessageBus } from '../core/ports';
import type { UnifiedChatMessage } from '../core/entities';
export declare class SocketServer {
    private io;
    constructor(httpServer: HttpServer, messageBus: IMessageBus);
    close(): Promise<void>;
}
/** Implementação simples do barramento de mensagens usando EventEmitter */
export declare class MessageBus extends EventEmitter implements IMessageBus {
    publish(message: UnifiedChatMessage): void;
}
//# sourceMappingURL=socket.server.d.ts.map