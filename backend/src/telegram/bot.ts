import { Telegraf, Context } from "telegraf";
import { message } from "telegraf/filters";
import { processMessage } from "./geminiAgent";
import { formatForTelegram } from "./format";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN no está configurado en el entorno.");
}

export const bot = new Telegraf(BOT_TOKEN);

const allowedIds = new Set<number>(
  (process.env.ALLOWED_TELEGRAM_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number),
);

// Rate limiting: 15 mensajes por minuto por usuario
const userBuckets = new Map<number, number[]>();
const RATE_MAX = 15;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(userId: number): boolean {
  const now = Date.now();
  const bucket = userBuckets.get(userId) ?? [];
  const recent = bucket.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) return true;
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
    } else {
      userBuckets.set(userId, recent);
    }
  }
}, 5 * 60_000).unref();

bot.use(async (ctx: Context, next) => {
  const userId = ctx.from?.id;
  if (!userId || (allowedIds.size > 0 && !allowedIds.has(userId))) {
    await ctx.reply("⛔ Acceso denegado. No estás autorizado para usar este bot.");
    return;
  }
  return next();
});

bot.on(message("text"), async (ctx) => {
  const text = ctx.message.text;
  if (!text) return;

  const userId = ctx.from!.id;
  if (isRateLimited(userId)) {
    await ctx.reply("⏳ Demasiados mensajes. Espera un minuto e intenta de nuevo.");
    return;
  }

  const typingInterval = setInterval(() => ctx.sendChatAction("typing"), 4000);

  try {
    const response = await processMessage(text);
    await ctx.reply(formatForTelegram(response), { parse_mode: "HTML" });
  } catch (err) {
    console.error("Error en bot:", err);
    await ctx.reply("Ocurrió un error al procesar tu mensaje. Intenta de nuevo.");
  } finally {
    clearInterval(typingInterval);
  }
});

export async function startBot(): Promise<void> {
  bot.launch();
  console.log("Telegram bot iniciado (polling).");
}

export async function stopBot(): Promise<void> {
  bot.stop("Servidor detenido");
  console.log("Telegram bot detenido.");
}
