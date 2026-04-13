type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
interface CircuitBreakerConfig {
    failureThreshold: number;
    recoveryTimeoutMs: number;
}
/**
 * Circuit Breaker simples com três estados: CLOSED, OPEN, HALF_OPEN.
 *
 * - CLOSED  → operação normal; falhas são contadas.
 * - OPEN    → falhas excederam o limite; operações bloqueadas.
 * - HALF_OPEN → recoveryTimeout expirou; permite uma tentativa de reconexão.
 */
export declare class CircuitBreaker {
    private readonly name;
    private readonly config;
    private state;
    private failureCount;
    private lastFailureTime;
    constructor(name: string, config: CircuitBreakerConfig);
    /** Retorna true se o circuit está OPEN (operação deve ser bloqueada). */
    isOpen(): boolean;
    recordSuccess(): void;
    recordFailure(): void;
    getState(): CircuitState;
    getStats(): {
        name: string;
        state: CircuitState;
        failureCount: number;
    };
}
export {};
//# sourceMappingURL=circuit-breaker.d.ts.map