import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  email: string;
  role: "admin" | "colaborador" | "cliente";
  colaboradorId?: string;
  clientId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token no proporcionado." });
    return;
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado." });
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado." });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "No autorizado." });
      return;
    }
    next();
  };
}
