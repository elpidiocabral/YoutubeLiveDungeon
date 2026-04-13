import type { Message } from 'discord.js';
import type { UnifiedChatMessage, MessageAttachment } from '../core/entities';

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;
const VIDEO_EXTENSIONS = /\.(mp4|mov|webm|avi|mkv)$/i;

function resolveMediaType(filename: string): MessageAttachment['mediaType'] {
  if (IMAGE_EXTENSIONS.test(filename)) return 'image';
  if (VIDEO_EXTENSIONS.test(filename)) return 'video';
  return 'file';
}

export function adaptDiscordMessage(message: Message): UnifiedChatMessage {
  const attachments: MessageAttachment[] = [...message.attachments.values()].map((a) => ({
    url: a.url,
    name: a.name ?? 'attachment',
    mediaType: resolveMediaType(a.name ?? ''),
    width: a.width ?? undefined,
    height: a.height ?? undefined,
  }));

  return {
    id: message.id,
    source: 'discord',
    author: {
      id: message.author.id,
      name: message.member?.displayName ?? message.author.username,
      avatarUrl: message.author.displayAvatarURL(),
    },
    content: message.content,
    richContent: [{ type: 'text', value: message.content }],
    attachments,
    timestamp: message.createdAt,
    metadata: {
      isOwner: false,
      isModerator:
        message.member?.permissions.has('ModerateMembers') ?? false,
      isMember: true,
      channelId: message.channelId,
      guildId: message.guildId ?? undefined,
    },
  };
}
