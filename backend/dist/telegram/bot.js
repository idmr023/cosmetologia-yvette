"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bot = void 0;
exports.startBot = startBot;
exports.stopBot = stopBot;
const telegraf_1 = require("telegraf");
const filters_1 = require("telegraf/filters");
const geminiAgent_1 = require("./geminiAgent");
const format_1 = require("./format");
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN no está configurado en el entorno.");
}
exports.bot = new telegraf_1.Telegraf(BOT_TOKEN);
const allowedIds = new Set((process.env.ALLOWED_TELEGRAM_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number));
// Rate limiting: 15 mensajes por minuto por usuario
const userBuckets = new Map();
const RATE_MAX = 15;
const RATE_WINDOW_MS = 60_000;
function isRateLimited(userId) {
    const now = Date.now();
    const bucket = userBuckets.get(userId) ?? [];
    const recent = bucket.filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length >= RATE_MAX)
        return true;
    recent.push(now);
    userBuckets.set(userId, recent);
    return false;
}
// Limpieza periódica de buckets inactivos
setInterval(() => {
    const cutoff = Date.now() - RATE_WINDOW_MS;
    for (const [userId, timestamps] of userBuckets) {
        const recent = timestamps.filter((t) => t > cutoff);
        if (recent.length === 0) {
            userBuckets.delete(userId);
        }
        else {
            userBuckets.set(userId, recent);
        }
    }
}, 5 * 60_000).unref();
exports.bot.use(async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || (allowedIds.size > 0 && !allowedIds.has(userId))) {
        await ctx.reply("⛔ Acceso denegado. No estás autorizado para usar este bot.");
        return;
    }
    return next();
});
exports.bot.on((0, filters_1.message)("text"), async (ctx) => {
    const text = ctx.message.text;
    if (!text)
        return;
    const userId = ctx.from.id;
    if (isRateLimited(userId)) {
        await ctx.reply("⏳ Demasiados mensajes. Espera un minuto e intenta de nuevo.");
        return;
    }
    const typingInterval = setInterval(() => ctx.sendChatAction("typing"), 4000);
    try {
        const response = await (0, geminiAgent_1.processMessage)(text);
        await ctx.reply((0, format_1.formatForTelegram)(response), { parse_mode: "HTML" });
    }
    catch (err) {
        console.error("Error en bot:", err);
        await ctx.reply("Ocurrió un error al procesar tu mensaje. Intenta de nuevo.");
    }
    finally {
        clearInterval(typingInterval);
    }
});
async function startBot() {
    exports.bot.launch();
    console.log("Telegram bot iniciado (polling).");
}
async function stopBot() {
    exports.bot.stop("Servidor detenido");
    console.log("Telegram bot detenido.");
}
//# sourceMappingURL=bot.js.map