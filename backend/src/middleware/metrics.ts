import { Request, Response, NextFunction } from "express";
import client from "prom-client";

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"] as const,
  registers: [register],
});

const httpDurationHistogram = new client.Histogram({
  name: "http_request_duration_ms",
  help: "HTTP request duration in ms",
  labelNames: ["method", "route", "status"] as const,
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [register],
});

const activeConnections = new client.Gauge({
  name: "http_active_connections",
  help: "Active HTTP connections",
  registers: [register],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
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

export async function metricsEndpoint(_req: Request, res: Response): Promise<void> {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
}
