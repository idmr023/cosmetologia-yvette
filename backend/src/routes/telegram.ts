import { Router, Request, Response } from "express";
import { bot } from "../telegram/bot";

const router = Router();

router.post("/webhook", async (req: Request, res: Response) => {
  try {
    await bot.handleUpdate(req.body, res);
  } catch (err) {
    console.error("Error en webhook de Telegram:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error interno al procesar webhook" });
    }
  }
});

router.get("/set-webhook", async (_req: Request, res: Response) => {
  const url = process.env.WEBHOOK_URL;
  if (!url) {
    res.status(400).json({ error: "WEBHOOK_URL no configurado en el entorno." });
    return;
  }
  try {
    const webhookUrl = `${url}/api/telegram/webhook`;
    await bot.telegram.setWebhook(webhookUrl);
    res.json({ ok: true, webhook: webhookUrl });
  } catch (err) {
    console.error("Error al configurar webhook:", err);
    res.status(500).json({ error: "Error al configurar webhook en Telegram." });
  }
});

export default router;
