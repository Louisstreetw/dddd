import TelegramBot from "node-telegram-bot-api";
import { spawn } from "node:child_process";
import { appendFile, readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const TOKEN = process.env.TELEGRAM_TOKEN;
const MEMORY_DIR = process.env.MEMORY_DIR || "/root";
const OWNER_FILE = path.join(MEMORY_DIR, ".telegram-owner");
const JOURNAL = path.join(MEMORY_DIR, "journal-recent.md");
const CLAUDE_CWD = MEMORY_DIR;
const WHISPER_PYTHON =
  process.env.WHISPER_PYTHON || "/opt/trading/whisper-venv/bin/python3";
const TRANSCRIBE_SCRIPT =
  process.env.TRANSCRIBE_SCRIPT || "/opt/trading/agent/transcribe.py";

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

const SESSION_MARKER = path.join(MEMORY_DIR, ".claude-session-active");

const SYSTEM_NUDGE =
  "Tu es l'agent personnel de Louis sur son serveur Hetzner. Reponds DIRECTEMENT et BRIEVEMENT a son message, comme un pote. Pas de menu d'options sauf s'il demande explicitement 'par ou je commence'. S'il te dit 'tu m'entends', tu dis juste 'oui'. S'il te demande un haiku, tu donnes un haiku. Reste conversationnel.";

function spawnClaude(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", args, {
      cwd: CLAUDE_CWD,
      env: { ...process.env, CI: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
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

async function askClaude(prompt) {
  const baseArgs = [
    "--dangerously-skip-permissions",
    "--append-system-prompt",
    SYSTEM_NUDGE,
    "-p",
    prompt,
  ];
  const hasSession = existsSync(SESSION_MARKER);
  try {
    const args = hasSession ? ["--continue", ...baseArgs] : baseArgs;
    const reply = await spawnClaude(args);
    if (!hasSession) await writeFile(SESSION_MARKER, ts());
    return reply;
  } catch (e) {
    if (
      hasSession &&
      /no.*(session|conversation)|cannot.*continue/i.test(e.message)
    ) {
      const reply = await spawnClaude(baseArgs);
      await writeFile(SESSION_MARKER, ts());
      return reply;
    }
    throw e;
  }
}

function chunk(text, size = 3800) {
  const parts = [];
  for (let i = 0; i < text.length; i += size) parts.push(text.slice(i, i + size));
  return parts;
}

function transcribeAudio(audioPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(WHISPER_PYTHON, [TRANSCRIBE_SCRIPT, audioPath, "fr"], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("close", (code) => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(err || `transcribe exited ${code}`));
    });
  });
}

async function handleUserText(chatId, sourceLabel, text) {
  await logEntry(sourceLabel, text);
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
  if (msg.voice || msg.audio) return;
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
  await handleUserText(chatId, "Louis", text);
});

bot.on("voice", async (msg) => {
  const chatId = String(msg.chat.id);
  if (chatId !== ownerChatId) {
    if (ownerChatId) await bot.sendMessage(chatId, "Bot prive.");
    return;
  }

  const voice = msg.voice;
  const tmpPath = `/tmp/voice-${voice.file_unique_id}.ogg`;

  try {
    bot.sendChatAction(chatId, "typing").catch(() => {});

    const fileLink = await bot.getFileLink(voice.file_id);
    const res = await fetch(fileLink);
    if (!res.ok) throw new Error(`download failed: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(tmpPath, buf);

    const transcript = await transcribeAudio(tmpPath);
    if (!transcript) {
      await bot.sendMessage(chatId, "(vocal vide ou inaudible)");
      return;
    }

    await handleUserText(chatId, "Louis (vocal)", transcript);
  } catch (e) {
    console.error("[bot] voice error", e);
    await bot.sendMessage(chatId, `Erreur vocal: ${e.message.slice(0, 500)}`);
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
});

bot.on("polling_error", (e) => console.error("[bot] polling", e.message));
