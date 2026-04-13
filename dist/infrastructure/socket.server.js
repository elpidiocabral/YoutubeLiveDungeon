"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBus = exports.SocketServer = void 0;
const events_1 = require("events");
const socket_io_1 = require("socket.io");
const logger_1 = require("../utils/logger");
const CHAT_MESSAGE_EVENT = 'chat:message';
class SocketServer {
    constructor(httpServer, messageBus) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: { origin: '*', methods: ['GET', 'POST'] },
        });
        this.io.on('connection', (socket) => {
            logger_1.logger.info('[Socket.io] Cliente conectado', { id: socket.id });
            socket.on('disconnect', () => {
                logger_1.logger.info('[Socket.io] Cliente desconectado', { id: socket.id });
            });
        });
        messageBus.on(CHAT_MESSAGE_EVENT, (message) => {
            this.io.emit(CHAT_MESSAGE_EVENT, message);
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.io.close((err) => (err ? reject(err) : resolve()));
        });
    }
}
exports.SocketServer = SocketServer;
/** Implementação simples do barramento de mensagens usando EventEmitter */
class MessageBus extends events_1.EventEmitter {
    publish(message) {
        this.emit(CHAT_MESSAGE_EVENT, message);
    }
}
exports.MessageBus = MessageBus;
//# sourceMappingURL=socket.server.js.map