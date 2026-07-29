"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.circuitQuery = void 0;
exports.circuitBreaker = circuitBreaker;
var CircuitState;
(function (CircuitState) {
    CircuitState[CircuitState["CLOSED"] = 0] = "CLOSED";
    CircuitState[CircuitState["OPEN"] = 1] = "OPEN";
    CircuitState[CircuitState["HALF_OPEN"] = 2] = "HALF_OPEN";
})(CircuitState || (CircuitState = {}));
function circuitBreaker(fn, options = {}) {
    const { failureThreshold = 5, resetTimeoutMs = 30_000, fallback } = options;
    let state = CircuitState.CLOSED;
    let failureCount = 0;
    let lastFailureTime = 0;
    return async function wrapped(...args) {
        if (state === CircuitState.OPEN) {
            if (Date.now() - lastFailureTime >= resetTimeoutMs) {
                state = CircuitState.HALF_OPEN;
            }
            else {
                if (fallback)
                    return fallback(...args);
                throw new Error("CircuitBreaker: circuito abierto");
            }
        }
        try {
            const result = await fn(...args);
            if (state === CircuitState.HALF_OPEN) {
                state = CircuitState.CLOSED;
                failureCount = 0;
            }
            return result;
        }
        catch (err) {
            failureCount++;
            lastFailureTime = Date.now();
            if (failureCount >= failureThreshold) {
                state = CircuitState.OPEN;
            }
            if (fallback)
                return fallback(...args);
            throw err;
        }
    };
}
exports.circuitQuery = circuitBreaker(async (...args) => {
    const queryFn = args[0];
    return queryFn();
}, {
    failureThreshold: 3,
    resetTimeoutMs: 15_000,
    fallback: async () => {
        console.warn("[CircuitBreaker] Usando fallback — BD no disponible");
        return [];
    },
});
//# sourceMappingURL=circuitBreaker.js.map