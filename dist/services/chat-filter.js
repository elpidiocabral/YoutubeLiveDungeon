"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatFilter = void 0;
const logger_1 = require("../utils/logger");
/**
 * Filtra mensagens de chat.
 * Quando commandPrefix está definido, apenas mensagens cujo
 * conteúdo começa com esse prefixo são publicadas no barramento.
 */
class ChatFilter {
    constructor() {
        this.commandPrefix = null;
    }
    setCommandPrefix(prefix) {
        const normalized = prefix?.trim() ?? null;
        this.commandPrefix = normalized || null;
        logger_1.logger.info('[ChatFilter] Prefixo de comando atualizado', {
            commandPrefix: this.commandPrefix ?? '(sem filtro)',
        });
    }
    getSettings() {
        return { commandPrefix: this.commandPrefix };
    }
    /** Retorna true se a mensagem deve ser publicada */
    passes(message) {
        if (!this.commandPrefix)
            return true;
        return message.content.trimStart().startsWith(this.commandPrefix);
    }
}
exports.ChatFilter = ChatFilter;
//# sourceMappingURL=chat-filter.js.map