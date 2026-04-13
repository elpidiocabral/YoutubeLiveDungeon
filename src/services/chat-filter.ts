import type { UnifiedChatMessage } from '../core/entities';
import { logger } from '../utils/logger';

export interface FilterSettings {
  commandPrefix: string | null;
}

/**
 * Filtra mensagens de chat.
 * Quando commandPrefix está definido, apenas mensagens cujo
 * conteúdo começa com esse prefixo são publicadas no barramento.
 */
export class ChatFilter {
  private commandPrefix: string | null = null;

  setCommandPrefix(prefix: string | null): void {
    const normalized = prefix?.trim() ?? null;
    this.commandPrefix = normalized || null;
    logger.info('[ChatFilter] Prefixo de comando atualizado', {
      commandPrefix: this.commandPrefix ?? '(sem filtro)',
    });
  }

  getSettings(): FilterSettings {
    return { commandPrefix: this.commandPrefix };
  }

  /** Retorna true se a mensagem deve ser publicada */
  passes(message: UnifiedChatMessage): boolean {
    if (!this.commandPrefix) return true;
    return message.content.trimStart().startsWith(this.commandPrefix);
  }
}
