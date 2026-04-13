"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordChatClient = void 0;
const events_1 = require("events");
const discord_js_1 = require("discord.js");
const discord_adapter_1 = require("../adapters/discord.adapter");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class DiscordChatClient extends events_1.EventEmitter {
    constructor() {
        super();
        this.sourceId = 'discord';
        this.client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
            ],
        });
    }
    async start() {
        this.client.on(discord_js_1.Events.MessageCreate, (message) => {
            if (message.author.bot)
                return;
            const inAllowedChannel = env_1.config.discord.channelIds.length === 0 ||
                env_1.config.discord.channelIds.includes(message.channelId);
            const inAllowedGuild = env_1.config.discord.guildIds.length === 0 ||
                (message.guildId !== null &&
                    env_1.config.discord.guildIds.includes(message.guildId));
            if (!inAllowedChannel || !inAllowedGuild)
                return;
            try {
                const unified = (0, discord_adapter_1.adaptDiscordMessage)(message);
                this.emit('message', unified);
            }
            catch (err) {
                logger_1.logger.error('[Discord] Erro ao adaptar mensagem', { err });
            }
        });
        this.client.on(discord_js_1.Events.Error, (err) => {
            logger_1.logger.error('[Discord] Erro no client', { message: err.message });
            this.emit('error', err);
        });
        this.client.once(discord_js_1.Events.ClientReady, (readyClient) => {
            logger_1.logger.info(`[Discord] Conectado como ${readyClient.user.tag}`);
        });
        await this.client.login(env_1.config.discord.token);
    }
    stop() {
        this.client.destroy();
        logger_1.logger.info('[Discord] Cliente parado.');
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
exports.DiscordChatClient = DiscordChatClient;
//# sourceMappingURL=discord.client.js.map