"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockChatSource = void 0;
const events_1 = require("events");
const MOCK_AUTHORS = [
    { id: 'user-001', name: 'DungeonMaster', avatarUrl: 'https://i.pravatar.cc/40?u=1' },
    { id: 'user-002', name: 'WarriorX', avatarUrl: 'https://i.pravatar.cc/40?u=2' },
    { id: 'user-003', name: 'Elfa_Mage', avatarUrl: 'https://i.pravatar.cc/40?u=3' },
];
const MOCK_MESSAGES = [
    [{ type: 'text', value: 'Que dungeon incrível! ' }, { type: 'emoji', value: '🔥', url: '' }],
    [{ type: 'text', value: 'Atacar o boss!' }],
    [{ type: 'text', value: 'Usa a poção ' }, { type: 'emoji', value: '🧪', url: '' }],
    [{ type: 'text', value: 'GGGG!' }],
    [{ type: 'emoji', value: '⚔️', url: '' }, { type: 'text', value: ' vai guerreiro!' }],
];
let messageIndex = 0;
class MockChatSource extends events_1.EventEmitter {
    constructor(intervalMs = 2000) {
        super();
        this.sourceId = 'mock';
        this.timer = null;
        this.intervalMs = intervalMs;
    }
    async start() {
        console.log(`[MockChatSource] Iniciado — emitindo mensagens a cada ${this.intervalMs}ms`);
        this.timer = setInterval(() => this.emitFakeMessage(), this.intervalMs);
        // emite uma imediatamente
        this.emitFakeMessage();
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        console.log('[MockChatSource] Parado.');
    }
    emitFakeMessage() {
        const author = MOCK_AUTHORS[Math.floor(Math.random() * MOCK_AUTHORS.length)];
        const richContent = MOCK_MESSAGES[messageIndex % MOCK_MESSAGES.length];
        messageIndex++;
        const message = {
            id: `mock-${Date.now()}`,
            source: 'youtube',
            author,
            content: richContent.map((p) => p.value).join(''),
            richContent,
            attachments: [],
            timestamp: new Date(),
            metadata: {
                isOwner: Math.random() < 0.1,
                isModerator: Math.random() < 0.2,
                isMember: Math.random() < 0.5,
            },
        };
        this.emit('message', message);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event, listener) {
        return super.on(event, listener);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off(event, listener) {
        return super.off(event, listener);
    }
}
exports.MockChatSource = MockChatSource;
//# sourceMappingURL=mock-chat.source.js.map