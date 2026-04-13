import { EventEmitter } from 'events';
import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import type { IMessageBus } from '../core/ports';
import type { UnifiedChatMessage } from '../core/entities';
import { logger } from '../utils/logger';

const CHAT_MESSAGE_EVENT = 'chat:message';

export class SocketServer {
  private io: SocketIOServer;

  constructor(httpServer: HttpServer, messageBus: IMessageBus) {
    this.io = new SocketIOServer(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    this.io.on('connection', (socket) => {
      logger.info('[Socket.io] Cliente conectado', { id: socket.id });
      socket.on('disconnect', () => {
        logger.info('[Socket.io] Cliente desconectado', { id: socket.id });
      });
    });

    messageBus.on(CHAT_MESSAGE_EVENT, (message: UnifiedChatMessage) => {
      this.io.emit(CHAT_MESSAGE_EVENT, message);
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.io.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

/** Implementação simples do barramento de mensagens usando EventEmitter */
export class MessageBus extends EventEmitter implements IMessageBus {
  publish(message: UnifiedChatMessage): void {
    this.emit(CHAT_MESSAGE_EVENT, message);
  }
}
