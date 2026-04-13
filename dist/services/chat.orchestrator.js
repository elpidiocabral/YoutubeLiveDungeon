"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatOrchestrator = void 0;
const logger_1 = require("../utils/logger");
/**
 * Orquestra múltiplas fontes de chat.
 * Recebe as fontes por injeção de dependência, assina os eventos
 * e publica as mensagens normalizadas no barramento interno.
 */
class ChatOrchestrator {
    constructor(sources, messageBus, filter) {
        this.messageBus = messageBus;
        this.filter = filter;
        this.sources = sources;
    }
    async startAll() {
        for (const source of this.sources) {
            source.on('message', (msg) => {
                if (this.filter.passes(msg))
                    this.messageBus.publish(msg);
            });
            source.on('error', (err) => {
                logger_1.logger.error(`[Orchestrator] Erro na fonte "${source.sourceId}"`, {
                    message: err.message,
                });
            });
            try {
                await source.start();
                logger_1.logger.info(`[Orchestrator] Fonte "${source.sourceId}" iniciada`);
            }
            catch (err) {
                logger_1.logger.error(`[Orchestrator] Falha ao iniciar fonte "${source.sourceId}"`, { err });
            }
        }
    }
    stopAll() {
        for (const source of this.sources) {
            try {
                source.stop();
                logger_1.logger.info(`[Orchestrator] Fonte "${source.sourceId}" parada`);
            }
            catch (err) {
                logger_1.logger.error(`[Orchestrator] Erro ao parar fonte "${source.sourceId}"`, { err });
            }
        }
    }
}
exports.ChatOrchestrator = ChatOrchestrator;
//# sourceMappingURL=chat.orchestrator.js.map