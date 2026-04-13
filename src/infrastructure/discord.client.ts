import { EventEmitter } from 'events';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import type { IChatSource } from '../core/ports';
import type { UnifiedChatMessage } from '../core/entities';
import { adaptDiscordMessage } from '../adapters/discord.adapter';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export class DiscordChatClient extends EventEmitter implements IChatSource {
  readonly sourceId = 'discord';

  private readonly client: Client;

  constructor() {
    super();
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  async start(): Promise<void> {
    this.client.on(Events.MessageCreate, (message) => {
      if (message.author.bot) return;

      const inAllowedChannel =
        config.discord.channelIds.length === 0 ||
        config.discord.channelIds.includes(message.channelId);

      const inAllowedGuild =
        config.discord.guildIds.length === 0 ||
        (message.guildId !== null &&
          config.discord.guildIds.includes(message.guildId));

      if (!inAllowedChannel || !inAllowedGuild) return;

      try {
        const unified = adaptDiscordMessage(message);
        this.emit('message', unified);
      } catch (err) {
        logger.error('[Discord] Erro ao adaptar mensagem', { err });
      }
    });

    this.client.on(Events.Error, (err) => {
      logger.error('[Discord] Erro no client', { message: err.message });
      this.emit('error', err);
    });

    this.client.once(Events.ClientReady, (readyClient) => {
      logger.info(`[Discord] Conectado como ${readyClient.user.tag}`);
    });

    await this.client.login(config.discord.token);
  }

  stop(): void {
    this.client.destroy();
    logger.info('[Discord] Cliente parado.');
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
