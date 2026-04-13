"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = void 0;
/**
 * Circuit Breaker simples com três estados: CLOSED, OPEN, HALF_OPEN.
 *
 * - CLOSED  → operação normal; falhas são contadas.
 * - OPEN    → falhas excederam o limite; operações bloqueadas.
 * - HALF_OPEN → recoveryTimeout expirou; permite uma tentativa de reconexão.
 */
class CircuitBreaker {
    constructor(name, config) {
        this.name = name;
        this.config = config;
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.lastFailureTime = 0;
    }
    /** Retorna true se o circuit está OPEN (operação deve ser bloqueada). */
    isOpen() {
        if (this.state === 'OPEN') {
            const elapsed = Date.now() - this.lastFailureTime;
            if (elapsed >= this.config.recoveryTimeoutMs) {
                this.state = 'HALF_OPEN';
                return false;
            }
            return true;
        }
        return false;
    }
    recordSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }
    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.config.failureThreshold) {
            this.state = 'OPEN';
        }
    }
    getState() {
        return this.state;
    }
    getStats() {
        return {
            name: this.name,
            state: this.state,
            failureCount: this.failureCount,
        };
    }
}
exports.CircuitBreaker = CircuitBreaker;
//# sourceMappingURL=circuit-breaker.js.map