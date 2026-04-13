import dotenv from 'dotenv';

dotenv.config();

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function optionalInt(key: string, fallback: number): number {
  const raw = process.env[key];
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return isNaN(parsed) ? fallback : parsed;
}

export const config = {
  port: optionalInt('PORT', 3001),
  logLevel: optional('LOG_LEVEL', 'info'),

  youtube: {
    channelId: optional('YOUTUBE_CHANNEL_ID', ''),
    liveId: optional('YOUTUBE_LIVE_ID', ''),
    reconnectDelayMs: optionalInt('YT_RECONNECT_DELAY_MS', 5_000),
    maxReconnectAttempts: optionalInt('YT_MAX_RECONNECT_ATTEMPTS', 10),
  },

  discord: {
    token: optional('DISCORD_TOKEN', ''),
    channelIds: optional('DISCORD_CHANNEL_IDS', '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    guildIds: optional('DISCORD_GUILD_IDS', '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },

  circuitBreaker: {
    failureThreshold: optionalInt('CB_FAILURE_THRESHOLD', 5),
    recoveryTimeoutMs: optionalInt('CB_RECOVERY_TIMEOUT_MS', 30_000),
  },
} as const;

export type AppConfig = typeof config;

/** Valida que pelo menos uma fonte está configurada */
export function validateConfig(): void {
  const hasYoutube = Boolean(config.youtube.channelId || config.youtube.liveId);
  const hasDiscord = Boolean(config.discord.token);

  if (!hasYoutube && !hasDiscord) {
    throw new Error(
      'Nenhuma fonte de chat configurada. Defina YOUTUBE_CHANNEL_ID/YOUTUBE_LIVE_ID e/ou DISCORD_TOKEN no .env'
    );
  }
}
