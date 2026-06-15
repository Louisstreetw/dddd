import TelegramBot from "node-telegram-bot-api";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const TOKEN = process.env.NOTIFY_TOKEN;
const MEMORY_DIR = process.env.MEMORY_DIR || "/root";
const OWNER_FILE = path.join(MEMORY_DIR, ".telegram-notify-owner");

if (!TOKEN) {
  console.error("NOTIFY_TOKEN missing in environment");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

const me = await bot.getMe();
console.log(`[notify-bot] running as @${me.username}`);

bot.onText(/^\/start/, async (msg) => {
  const chatId = String(msg.chat.id);
  await writeFile(OWNER_FILE, chatId);
  await bot.sendMessage(
    chatId,
    `🔔 Bot de notifications connecte au serveur claude-trading-01.\n\n` +
      `Tu recevras ici :\n` +
      `• Les mises a jour de code deployees\n` +
      `• Les alertes ROAS (Meta Ads)\n` +
      `• Les recaps quotidiens\n` +
      `• Les pings importants du serveur\n\n` +
      `Pour parler avec Claude, utilise @AssistantEcom_bot.`
  );
});

bot.on("message", async (msg) => {
  if (msg.text?.startsWith("/start")) return;
  await bot.sendMessage(
    msg.chat.id,
    "Ce bot ne fait QUE recevoir des notifications du serveur.\n" +
      "Pour parler a Claude, va sur @AssistantEcom_bot."
  );
});

bot.on("polling_error", (e) =>
  console.error("[notify-bot] polling error:", e.message)
);
