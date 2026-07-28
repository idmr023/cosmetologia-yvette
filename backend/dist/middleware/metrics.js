"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsMiddleware = metricsMiddleware;
exports.metricsEndpoint = metricsEndpoint;
const prom_client_1 = __importDefault(require("prom-client"));
const register = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register });
const httpRequestCounter = new prom_client_1.default.Counter({
    name: "http_requests_total",
    help: "Total HTTP requests",
    labelNames: ["method", "route", "status"],
    registers: [register],
});
const httpDurationHistogram = new prom_client_1.default.Histogram({
    name: "http_request_duration_ms",
    help: "HTTP request duration in ms",
    labelNames: ["method", "route", "status"],
    buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
    registers: [register],
});
const activeConnections = new prom_client_1.default.Gauge({
    name: "http_active_connections",
    help: "Active HTTP connections",
    registers: [register],
});
function metricsMiddleware(req, res, next) {
    activeConnections.inc();
    const end = httpDurationHistogram.startTimer();
    res.on("finish", () => {
        const labels = { method: req.method, route: req.route?.path || req.path, status: res.statusCode };
        httpRequestCounter.inc(labels);
        end(labels);
        activeConnections.dec();
    });
    next();
}
async function metricsEndpoint(_req, res) {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
}
//# sourceMappingURL=metrics.js.map