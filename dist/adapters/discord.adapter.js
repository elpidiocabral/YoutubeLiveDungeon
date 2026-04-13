"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptDiscordMessage = adaptDiscordMessage;
function adaptDiscordMessage(message) {
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
        timestamp: message.createdAt,
        metadata: {
            isOwner: false,
            isModerator: message.member?.permissions.has('ModerateMembers') ?? false,
            isMember: true,
            channelId: message.channelId,
            guildId: message.guildId ?? undefined,
        },
    };
}
//# sourceMappingURL=discord.adapter.js.map