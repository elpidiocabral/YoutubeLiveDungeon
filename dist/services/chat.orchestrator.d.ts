import type { IChatSource, IMessageBus } from '../core/ports';
/**
 * Orquestra múltiplas fontes de chat.
 * Recebe as fontes por injeção de dependência, assina os eventos
 * e publica as mensagens normalizadas no barramento interno.
 */
export declare class ChatOrchestrator {
    private readonly messageBus;
    private readonly sources;
    constructor(sources: IChatSource[], messageBus: IMessageBus);
    startAll(): Promise<void>;
    stopAll(): void;
}
//# sourceMappingURL=chat.orchestrator.d.ts.map