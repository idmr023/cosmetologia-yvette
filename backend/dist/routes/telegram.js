"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bot_1 = require("../telegram/bot");
const router = (0, express_1.Router)();
router.post("/webhook", async (req, res) => {
    try {
        await bot_1.bot.handleUpdate(req.body, res);
    }
    catch (err) {
        console.error("Error en webhook de Telegram:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Error interno al procesar webhook" });
        }
    }
});
router.get("/set-webhook", async (_req, res) => {
    const url = process.env.WEBHOOK_URL;
    if (!url) {
        res.status(400).json({ error: "WEBHOOK_URL no configurado en el entorno." });
        return;
    }
    try {
        const webhookUrl = `${url}/api/telegram/webhook`;
        await bot_1.bot.telegram.setWebhook(webhookUrl);
        res.json({ ok: true, webhook: webhookUrl });
    }
    catch (err) {
        console.error("Error al configurar webhook:", err);
        res.status(500).json({ error: "Error al configurar webhook en Telegram." });
    }
});
exports.default = router;
//# sourceMappingURL=telegram.js.map