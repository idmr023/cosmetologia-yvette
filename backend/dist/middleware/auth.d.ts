import { Request, Response, NextFunction } from "express";
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
export declare function authenticate(req: Request, res: Response, next: NextFunction): void;
export declare function authorize(...roles: string[]): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map