import type { ChatItem, MessageItem } from 'youtube-chat/dist/types/data';
import type { UnifiedChatMessage, RichContentPart } from '../core/entities';

function isEmojiItem(item: MessageItem): item is Exclude<MessageItem, { text: string }> {
  return 'emojiText' in item;
}

function buildRichContent(message: MessageItem[]): RichContentPart[] {
  return message.map((item): RichContentPart => {
    if (isEmojiItem(item)) {
      return { type: 'emoji', value: item.emojiText, url: item.url };
    }
    return { type: 'text', value: item.text };
  });
}

function buildPlainText(message: MessageItem[]): string {
  return message
    .map((item) => (isEmojiItem(item) ? item.emojiText : item.text))
    .join('');
}

export function adaptYouTubeChatItem(item: ChatItem): UnifiedChatMessage {
  return {
    id: item.id,
    source: 'youtube',
    author: {
      id: item.author.channelId,
      name: item.author.name,
      avatarUrl: item.author.thumbnail?.url,
    },
    content: buildPlainText(item.message),
    richContent: buildRichContent(item.message),
    timestamp: item.timestamp,
    metadata: {
      isOwner: item.isOwner,
      isModerator: item.isModerator,
      isMember: item.isMembership,
      superchat: item.superchat
        ? { amount: item.superchat.amount, currency: '', color: item.superchat.color }
        : undefined,
    },
  };
}
