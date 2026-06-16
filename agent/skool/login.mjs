import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: "/opt/trading/agent/.env" });

const EMAIL = process.env.SKOOL_EMAIL;
const PASSWORD = process.env.SKOOL_PASSWORD;
const OUT_DIR = "/home/claude/skool";
const STATE_FILE = path.join(OUT_DIR, "auth-state.json");

if (!EMAIL || !PASSWORD) {
  console.error("Manquant: SKOOL_EMAIL ou SKOOL_PASSWORD dans .env");
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

console.log("Lancement du navigateur...");
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
});
const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  viewport: { width: 1280, height: 800 },
  locale: "fr-FR",
});
const page = await context.newPage();

console.log("Navigation vers skool.com/login...");
await page.goto("https://www.skool.com/login", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2000);

console.log("Remplissage email + password...");
await page.fill('input[type="email"], input[name="email"]', EMAIL);
await page.waitForTimeout(800);
await page.fill('input[type="password"], input[name="password"]', PASSWORD);
await page.waitForTimeout(800);

console.log("Soumission du formulaire...");
await page.click('button[type="submit"]');

await page.waitForTimeout(6000);
const url = page.url();
console.log(`URL apres login: ${url}`);

if (/login|sign[-_]?in/i.test(url)) {
  console.error("ECHEC du login (toujours sur la page login).");
  await page.screenshot({ path: path.join(OUT_DIR, "login-failure.png") });
  console.error(`Screenshot: ${OUT_DIR}/login-failure.png`);
  await browser.close();
  process.exit(1);
}

console.log("Login OK. Sauvegarde de la session...");
await context.storageState({ path: STATE_FILE });
await page.screenshot({ path: path.join(OUT_DIR, "after-login.png") });

await browser.close();
console.log(`OK. Session sauvee: ${STATE_FILE}`);
