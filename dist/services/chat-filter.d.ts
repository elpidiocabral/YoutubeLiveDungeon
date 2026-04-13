import type { UnifiedChatMessage } from '../core/entities';
export interface FilterSettings {
    commandPrefix: string | null;
}
/**
 * Filtra mensagens de chat.
 * Quando commandPrefix está definido, apenas mensagens cujo
 * conteúdo começa com esse prefixo são publicadas no barramento.
 */
export declare class ChatFilter {
    private commandPrefix;
    setCommandPrefix(prefix: string | null): void;
    getSettings(): FilterSettings;
    /** Retorna true se a mensagem deve ser publicada */
    passes(message: UnifiedChatMessage): boolean;
}
//# sourceMappingURL=chat-filter.d.ts.map