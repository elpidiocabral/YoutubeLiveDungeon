/**
 * Domínio central: entidades unificadas consumidas por toda a aplicação.
 * Agnósticas em relação à fonte de origem.
 */
export type MessageSource = 'youtube' | 'discord';
export interface RichContentPart {
    type: 'text' | 'emoji';
    /** Texto legível ou shortcode do emoji */
    value: string;
    /** URL da imagem (apenas para type === 'emoji') */
    url?: string;
}
export interface SuperChatInfo {
    amount: string;
    currency: string;
    color: string;
}
export interface UnifiedChatMessage {
    /** ID único da mensagem (string opaca por fonte) */
    id: string;
    source: MessageSource;
    author: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    /** Texto plano concatenado — conveniente para busca e logging */
    content: string;
    /** Representação rica com partes de texto e emojis */
    richContent: RichContentPart[];
    timestamp: Date;
    metadata: {
        isOwner: boolean;
        isModerator: boolean;
        isMember: boolean;
        superchat?: SuperChatInfo;
        /** ID do canal Discord de origem */
        channelId?: string;
        /** ID do servidor Discord de origem */
        guildId?: string;
    };
}
//# sourceMappingURL=entities.d.ts.map