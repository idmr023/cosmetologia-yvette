"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function errorHandler(err, _req, res, _next) {
    console.error(err);
    if (err instanceof zod_1.ZodError) {
        res.status(400).json({
            error: "Datos inválidos.",
            details: err.errors.map((e) => ({
                path: e.path.join("."),
                message: e.message,
            })),
        });
        return;
    }
    res.status(500).json({ error: "Error interno del servidor." });
}
//# sourceMappingURL=errorHandler.js.map