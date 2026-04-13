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

/** Valida a configuração no startup. YouTube agora é controlado via API em runtime. */
export function validateConfig(): void {
  if (!config.discord.token && config.discord.channelIds.length === 0) {
    console.warn(
      '[Config] DISCORD_TOKEN não definido — fonte Discord inativa. ' +
        'Para YouTube, use POST /api/youtube/start com a URL da live.'
    );
  }
}
