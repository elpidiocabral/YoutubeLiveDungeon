export declare const config: {
    readonly port: number;
    readonly logLevel: string;
    readonly youtube: {
        readonly channelId: string;
        readonly liveId: string;
        readonly reconnectDelayMs: number;
        readonly maxReconnectAttempts: number;
    };
    readonly discord: {
        readonly token: string;
        readonly channelIds: string[];
        readonly guildIds: string[];
    };
    readonly circuitBreaker: {
        readonly failureThreshold: number;
        readonly recoveryTimeoutMs: number;
    };
};
export type AppConfig = typeof config;
/** Valida que pelo menos uma fonte está configurada */
export declare function validateConfig(): void;
//# sourceMappingURL=env.d.ts.map