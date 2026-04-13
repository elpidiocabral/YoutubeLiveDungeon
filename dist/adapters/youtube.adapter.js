"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adaptYouTubeChatItem = adaptYouTubeChatItem;
function isEmojiItem(item) {
    return 'emojiText' in item;
}
function buildRichContent(message) {
    return message.map((item) => {
        if (isEmojiItem(item)) {
            return { type: 'emoji', value: item.emojiText, url: item.url };
        }
        return { type: 'text', value: item.text };
    });
}
function buildPlainText(message) {
    return message
        .map((item) => (isEmojiItem(item) ? item.emojiText : item.text))
        .join('');
}
function adaptYouTubeChatItem(item) {
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
//# sourceMappingURL=youtube.adapter.js.map