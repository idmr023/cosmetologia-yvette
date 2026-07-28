import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos de inicio de sesión. Intente nuevamente en 15 minutos." },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intente nuevamente." },
  skip: (req) => {
    const skipPaths = ["/api/auth/login", "/api/services", "/api/appointments/public"];
    return skipPaths.some((p) => req.path === p || req.path.startsWith(p + "/"));
  },
});

export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intente nuevamente." },
});
