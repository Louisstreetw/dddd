import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const COMMUNITY = process.argv[2] || "nolimit";
const CLASSROOM_URL = `https://www.skool.com/${COMMUNITY}/classroom`;
const OUT_DIR = `/home/claude/skool/${COMMUNITY}`;
const STATE_FILE = "/home/claude/skool/auth-state.json";

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
});
const context = await browser.newContext({
  storageState: STATE_FILE,
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  viewport: { width: 1280, height: 800 },
  locale: "fr-FR",
});
const page = await context.newPage();

console.log(`Navigation: ${CLASSROOM_URL}`);
await page.goto(CLASSROOM_URL, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(5000);

// Random scroll to look human
for (let i = 0; i < 3; i++) {
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(800 + Math.random() * 800);
}

console.log("Capture de la page classroom...");
await page.screenshot({
  path: path.join(OUT_DIR, "classroom.png"),
  fullPage: true,
});

console.log("Extraction des modules visibles...");
const modules = await page.$$eval("a", (links) =>
  links
    .filter((a) => /\/classroom\//.test(a.href))
    .map((a) => ({
      title: (a.textContent || "").trim().slice(0, 200),
      href: a.href,
    }))
    .filter((m) => m.title && m.href.split("/classroom/")[1])
);

const uniqueModules = Array.from(
  new Map(modules.map((m) => [m.href, m])).values()
);

console.log(`Trouvé ${uniqueModules.length} modules/leçons.`);
await writeFile(
  path.join(OUT_DIR, "modules.json"),
  JSON.stringify(uniqueModules, null, 2)
);
console.log(`Sauvé: ${OUT_DIR}/modules.json`);

await browser.close();
console.log("Done.");
