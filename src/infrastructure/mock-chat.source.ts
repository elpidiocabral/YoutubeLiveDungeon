import { EventEmitter } from 'events';
import type { IChatSource } from '../core/ports';
import type { UnifiedChatMessage } from '../core/entities';

const MOCK_AUTHORS = [
  { id: 'user-001', name: 'DungeonMaster', avatarUrl: 'https://i.pravatar.cc/40?u=1' },
  { id: 'user-002', name: 'WarriorX', avatarUrl: 'https://i.pravatar.cc/40?u=2' },
  { id: 'user-003', name: 'Elfa_Mage', avatarUrl: 'https://i.pravatar.cc/40?u=3' },
];

const MOCK_MESSAGES = [
  [{ type: 'text' as const, value: 'Que dungeon incrível! ' }, { type: 'emoji' as const, value: '🔥', url: '' }],
  [{ type: 'text' as const, value: 'Atacar o boss!' }],
  [{ type: 'text' as const, value: 'Usa a poção ' }, { type: 'emoji' as const, value: '🧪', url: '' }],
  [{ type: 'text' as const, value: 'GGGG!' }],
  [{ type: 'emoji' as const, value: '⚔️', url: '' }, { type: 'text' as const, value: ' vai guerreiro!' }],
];

let messageIndex = 0;

export class MockChatSource extends EventEmitter implements IChatSource {
  readonly sourceId = 'mock';
  private timer: NodeJS.Timeout | null = null;
  private readonly intervalMs: number;

  constructor(intervalMs = 2000) {
    super();
    this.intervalMs = intervalMs;
  }

  async start(): Promise<void> {
    console.log(`[MockChatSource] Iniciado — emitindo mensagens a cada ${this.intervalMs}ms`);
    this.timer = setInterval(() => this.emitFakeMessage(), this.intervalMs);
    // emite uma imediatamente
    this.emitFakeMessage();
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log('[MockChatSource] Parado.');
  }

  private emitFakeMessage(): void {
    const author = MOCK_AUTHORS[Math.floor(Math.random() * MOCK_AUTHORS.length)];
    const richContent = MOCK_MESSAGES[messageIndex % MOCK_MESSAGES.length];
    messageIndex++;

    const message: UnifiedChatMessage = {
      id: `mock-${Date.now()}`,
      source: 'youtube',
      author,
      content: richContent.map((p) => p.value).join(''),
      richContent,
      timestamp: new Date(),
      metadata: {
        isOwner: Math.random() < 0.1,
        isModerator: Math.random() < 0.2,
        isMember: Math.random() < 0.5,
      },
    };

    this.emit('message', message);
  }

  on(event: 'message', listener: (msg: UnifiedChatMessage) => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  off(event: 'message', listener: (msg: UnifiedChatMessage) => void): this;
  off(event: 'error', listener: (err: Error) => void): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off(event: string, listener: (...args: any[]) => void): this {
    return super.off(event, listener);
  }
}
