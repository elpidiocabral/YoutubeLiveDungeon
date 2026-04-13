/**
 * Domínio central: entidades unificadas consumidas por toda a aplicação.
 * Agnósticas em relação à fonte de origem.
 */

export type MessageSource = 'youtube' | 'discord';

export interface RichContentPart {
  type: 'text' | 'emoji' | 'image';
  /** Texto legível, shortcode do emoji ou nome do arquivo */
  value: string;
  /** URL da imagem (para type === 'emoji' ou 'image') */
  url?: string;
  /** Dimensões originais, quando disponíveis (type === 'image') */
  width?: number;
  height?: number;
}

export interface SuperChatInfo {
  amount: string;
  currency: string;
  color: string;
}

export interface MessageAttachment {
  url: string;
  /** Nome original do arquivo */
  name: string;
  /** 'image' para fotos/GIFs, 'video' para vídeos, 'file' para outros */
  mediaType: 'image' | 'video' | 'file';
  width?: number;
  height?: number;
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
  /** Representação rica com partes de texto, emojis e imagens */
  richContent: RichContentPart[];
  /** Anexos de imagem enviados na mensagem (fotos, GIFs, etc.) */
  attachments: MessageAttachment[];
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
