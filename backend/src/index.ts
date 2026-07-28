import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import pino from "pino";
import pinoHttp from "pino-http";

dotenv.config();

import { authLimiter, apiLimiter, publicLimiter } from "./middleware/rateLimitPerEndpoint";
import { errorHandler } from "./middleware/errorHandler";
import { metricsMiddleware, metricsEndpoint } from "./middleware/metrics";

import authRoutes from "./routes/auth";
import appointmentRoutes from "./routes/appointments";
import clientRoutes from "./routes/clients";
import serviceRoutes from "./routes/services";
import colaboradorRoutes from "./routes/colaboradores";
import inventoryRoutes from "./routes/inventory";
import commissionRoutes from "./routes/commissions";
import cashRegisterRoutes from "./routes/cashRegisters";
import reportRoutes from "./routes/reports";
import settingRoutes from "./routes/settings";
import mfaRoutes from "./routes/mfa";
import telegramRoutes from "./routes/telegram";
import loyaltyRoutes from "./routes/loyalty";
import reviewRoutes from "./routes/reviews";
import notificationRoutes from "./routes/notifications";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import auditRoutes from "./routes/audit";
import { startBot } from "./telegram/bot";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1"),
});

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV !== "production" ? { target: "pino-pretty" } : undefined,
});

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(metricsMiddleware);

app.use("/api/auth/login", authLimiter);
app.use("/api/services", publicLimiter);
app.use("/api/appointments/public", publicLimiter);
app.use(apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/colaboradores", colaboradorRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/commissions", commissionRoutes);
app.use("/api/cash-registers", cashRegisterRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/auth/mfa", mfaRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/audit", auditRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.get("/api/metrics", metricsEndpoint);

Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  const server = app.listen(PORT, async () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    if (process.env.NODE_ENV !== "production") {
      await startBot();
    }
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} recibida. Cerrando servidor...`);
    server.close(async () => {
      try {
        const { db: dbInstance } = await import("./lib/db");
        // close underlying pool if available
        if (typeof (dbInstance as any)?.$client?.end === "function") {
          await (dbInstance as any).$client.end();
        }
      } catch {}
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

export default app;
