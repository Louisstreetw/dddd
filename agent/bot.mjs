import TelegramBot from "node-telegram-bot-api";
import { spawn } from "node:child_process";
import { appendFile, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const TOKEN = process.env.TELEGRAM_TOKEN;
const MEMORY_DIR = process.env.MEMORY_DIR || "/root";
const OWNER_FILE = path.join(MEMORY_DIR, ".telegram-owner");
const JOURNAL = path.join(MEMORY_DIR, "journal-recent.md");
const CLAUDE_CWD = MEMORY_DIR;

if (!TOKEN) {
  console.error("TELEGRAM_TOKEN missing in environment");
  process.exit(1);
}

await mkdir(MEMORY_DIR, { recursive: true });
if (!existsSync(JOURNAL)) {
  await writeFile(JOURNAL, `# Journal (7 derniers jours)\n\n`);
}

let ownerChatId = existsSync(OWNER_FILE)
  ? (await readFile(OWNER_FILE, "utf8")).trim()
  : null;

const bot = new TelegramBot(TOKEN, { polling: true });

const me = await bot.getMe();
console.log(`[bot] running as @${me.username}`);
if (ownerChatId) {
  console.log(`[bot] locked to owner chat id ${ownerChatId}`);
} else {
  console.log("[bot] no owner set — first /start will claim ownership");
}

function ts() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

async function logEntry(role, content) {
  await appendFile(JOURNAL, `\n## ${ts()} — Telegram\n\n**${role}:** ${content}\n`);
}

function askClaude(prompt) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "claude",
      ["--dangerously-skip-permissions", "-p", prompt],
      {
        cwd: CLAUDE_CWD,
        env: { ...process.env, CI: "1" },
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("close", (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(err || `claude exited with code ${code}`));
    });
  });
}

function chunk(text, size = 3800) {
  const parts = [];
  for (let i = 0; i < text.length; i += size) parts.push(text.slice(i, i + size));
  return parts;
}

bot.onText(/^\/start/, async (msg) => {
  const chatId = String(msg.chat.id);
  if (!ownerChatId) {
    ownerChatId = chatId;
    await writeFile(OWNER_FILE, chatId);
    await bot.sendMessage(
      chatId,
      `Bonjour Louis ! Bot connecte au serveur claude-trading-01. Memoire persistante active. Ecris-moi n'importe quoi.`
    );
    console.log(`[bot] ownership claimed by ${chatId}`);
    return;
  }
  if (chatId === ownerChatId) {
    await bot.sendMessage(chatId, "Deja connecte. Vas-y, ecris-moi.");
  } else {
    await bot.sendMessage(chatId, "Bot prive.");
  }
});

bot.on("message", async (msg) => {
  if (msg.text?.startsWith("/start")) return;
  const chatId = String(msg.chat.id);
  if (!ownerChatId) {
    await bot.sendMessage(chatId, "Envoie /start d'abord pour claim ce bot.");
    return;
  }
  if (chatId !== ownerChatId) {
    await bot.sendMessage(chatId, "Bot prive.");
    return;
  }
  const text = msg.text?.trim();
  if (!text) return;

  await logEntry("Louis", text);
  bot.sendChatAction(chatId, "typing").catch(() => {});

  try {
    const reply = await askClaude(text);
    if (!reply) {
      await bot.sendMessage(chatId, "(reponse vide de Claude)");
      return;
    }
    await logEntry("Claude", reply);
    for (const part of chunk(reply)) {
      await bot.sendMessage(chatId, part);
    }
  } catch (e) {
    console.error("[bot] claude error", e);
    await bot.sendMessage(chatId, `Erreur Claude: ${e.message.slice(0, 500)}`);
  }
});

bot.on("polling_error", (e) => console.error("[bot] polling", e.message));
