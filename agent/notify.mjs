import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const MEMORY_DIR = process.env.MEMORY_DIR || "/root";
const MAIN_TOKEN = process.env.TELEGRAM_TOKEN;
const NOTIFY_TOKEN = process.env.NOTIFY_TOKEN;
const MAIN_OWNER = path.join(MEMORY_DIR, ".telegram-owner");
const NOTIFY_OWNER = path.join(MEMORY_DIR, ".telegram-notify-owner");

let token, ownerFile;
if (NOTIFY_TOKEN && existsSync(NOTIFY_OWNER)) {
  token = NOTIFY_TOKEN;
  ownerFile = NOTIFY_OWNER;
} else if (MAIN_TOKEN && existsSync(MAIN_OWNER)) {
  token = MAIN_TOKEN;
  ownerFile = MAIN_OWNER;
} else {
  console.error("No bot configured to receive notifications");
  process.exit(1);
}

const message = process.argv.slice(2).join(" ");
if (!message) {
  console.error("usage: node notify.mjs <message>");
  process.exit(1);
}

const chatId = (await readFile(ownerFile, "utf8")).trim();

const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ chat_id: chatId, text: message }),
});

if (!res.ok) {
  console.error("telegram error", res.status, await res.text());
  process.exit(1);
}
console.log("sent");
