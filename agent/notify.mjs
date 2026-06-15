import { readFile } from "node:fs/promises";
import path from "node:path";

const TOKEN = process.env.TELEGRAM_TOKEN;
const MEMORY_DIR = process.env.MEMORY_DIR || "/root";
const OWNER_FILE = path.join(MEMORY_DIR, ".telegram-owner");

if (!TOKEN) {
  console.error("TELEGRAM_TOKEN missing");
  process.exit(1);
}

const message = process.argv.slice(2).join(" ");
if (!message) {
  console.error("usage: node notify.mjs <message>");
  process.exit(1);
}

const chatId = (await readFile(OWNER_FILE, "utf8")).trim();

const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ chat_id: chatId, text: message }),
});

if (!res.ok) {
  console.error("telegram error", res.status, await res.text());
  process.exit(1);
}
console.log("sent");
