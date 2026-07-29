"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const Sentry = __importStar(require("@sentry/node"));
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
dotenv_1.default.config();
const rateLimitPerEndpoint_1 = require("./middleware/rateLimitPerEndpoint");
const errorHandler_1 = require("./middleware/errorHandler");
const metrics_1 = require("./middleware/metrics");
const auth_1 = __importDefault(require("./routes/auth"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const clients_1 = __importDefault(require("./routes/clients"));
const services_1 = __importDefault(require("./routes/services"));
const colaboradores_1 = __importDefault(require("./routes/colaboradores"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const commissions_1 = __importDefault(require("./routes/commissions"));
const cashRegisters_1 = __importDefault(require("./routes/cashRegisters"));
const reports_1 = __importDefault(require("./routes/reports"));
const settings_1 = __importDefault(require("./routes/settings"));
const mfa_1 = __importDefault(require("./routes/mfa"));
const telegram_1 = __importDefault(require("./routes/telegram"));
const loyalty_1 = __importDefault(require("./routes/loyalty"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const products_1 = __importDefault(require("./routes/products"));
const orders_1 = __importDefault(require("./routes/orders"));
const audit_1 = __importDefault(require("./routes/audit"));
const bot_1 = require("./telegram/bot");
Sentry.init({
    dsn: process.env.SENTRY_DSN || "",
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1"),
});
const logger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || "info",
    transport: process.env.NODE_ENV !== "production" ? { target: "pino-pretty" } : undefined,
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use((0, compression_1.default)());
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: CORS_ORIGIN, credentials: true }));
app.use(express_1.default.json());
app.use((0, pino_http_1.default)({ logger }));
app.use(metrics_1.metricsMiddleware);
app.use("/api/auth/login", rateLimitPerEndpoint_1.authLimiter);
app.use("/api/services", rateLimitPerEndpoint_1.publicLimiter);
app.use("/api/appointments/public", rateLimitPerEndpoint_1.publicLimiter);
app.use(rateLimitPerEndpoint_1.apiLimiter);
app.use("/api/auth", auth_1.default);
app.use("/api/appointments", appointments_1.default);
app.use("/api/clients", clients_1.default);
app.use("/api/services", services_1.default);
app.use("/api/colaboradores", colaboradores_1.default);
app.use("/api/inventory", inventory_1.default);
app.use("/api/commissions", commissions_1.default);
app.use("/api/cash-registers", cashRegisters_1.default);
app.use("/api/reports", reports_1.default);
app.use("/api/settings", settings_1.default);
app.use("/api/auth/mfa", mfa_1.default);
app.use("/api/telegram", telegram_1.default);
app.use("/api/loyalty", loyalty_1.default);
app.use("/api/reviews", reviews_1.default);
app.use("/api/notifications", notifications_1.default);
app.use("/api/products", products_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/audit", audit_1.default);
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/api/metrics", metrics_1.metricsEndpoint);
Sentry.setupExpressErrorHandler(app);
app.use(errorHandler_1.errorHandler);
if (process.env.NODE_ENV !== "test") {
    const server = app.listen(PORT, async () => {
        console.log(`Backend running on http://localhost:${PORT}`);
        if (process.env.NODE_ENV !== "production") {
            await (0, bot_1.startBot)();
        }
    });
    const shutdown = async (signal) => {
        console.log(`\n${signal} recibida. Cerrando servidor...`);
        server.close(async () => {
            try {
                const { db: dbInstance } = await Promise.resolve().then(() => __importStar(require("./lib/db")));
                // close underlying pool if available
                if (typeof dbInstance?.$client?.end === "function") {
                    await dbInstance.$client.end();
                }
            }
            catch { }
            console.log("Servidor cerrado.");
            process.exit(0);
        });
        setTimeout(() => {
            console.error("Shutdown forzado por timeout.");
            process.exit(1);
        }, 10_000).unref();
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
}
exports.default = app;
//# sourceMappingURL=index.js.map