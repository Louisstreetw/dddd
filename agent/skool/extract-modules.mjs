import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const COMMUNITY = "nolimit";
const CLASSROOM_URL = `https://www.skool.com/${COMMUNITY}/classroom`;
const OUT_DIR = `/home/claude/skool/${COMMUNITY}`;
const STATE_FILE = "/home/claude/skool/auth-state.json";

const TARGET_MODULES = [
  "CREATIVE STRATEGY",
  "CREATIVES SYSTEM",
  "META MEDIA BUYING",
];

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
});
const context = await browser.newContext({
  storageState: STATE_FILE,
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  viewport: { width: 1280, height: 1600 },
  locale: "fr-FR",
});
const page = await context.newPage();

const results = [];

for (const moduleName of TARGET_MODULES) {
  console.log(`\n=== Module: ${moduleName} ===`);
  await page.goto(CLASSROOM_URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(5000);

  // Try to find and click the module card by text
  console.log("  Recherche du module...");
  let found = false;
  try {
    const card = page.getByText(moduleName, { exact: false }).first();
    await card.waitFor({ timeout: 8000 });
    await card.click();
    found = true;
  } catch (e) {
    console.error(`  Pas trouve: ${moduleName}`);
    continue;
  }

  await page.waitForTimeout(5000);
  const moduleUrl = page.url();
  console.log(`  URL module: ${moduleUrl}`);

  // Scroll to trigger lazy load of lessons
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(700);
  }

  const slug = moduleName.toLowerCase().replace(/\s+/g, "-");
  await page.screenshot({
    path: path.join(OUT_DIR, `module-${slug}.png`),
    fullPage: true,
  });
  const html = await page.content();
  await writeFile(path.join(OUT_DIR, `module-${slug}.html`), html);

  // Extract lesson links: usually /classroom/<module-id>/<lesson-id>
  const lessons = await page.evaluate(() => {
    const items = [];
    for (const a of document.querySelectorAll("a[href]")) {
      const href = a.href;
      const text = (a.textContent || "").trim();
      if (/\/classroom\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/.test(href) && text) {
        items.push({ title: text.slice(0, 200), href });
      }
    }
    // dedupe by href
    return Array.from(new Map(items.map((i) => [i.href, i])).values());
  });
  console.log(`  Lecons trouvees: ${lessons.length}`);
  results.push({ module: moduleName, url: moduleUrl, lessons });
}

await writeFile(
  path.join(OUT_DIR, "selected-modules.json"),
  JSON.stringify(results, null, 2)
);

console.log("\n=== RECAP ===");
for (const r of results) {
  console.log(`${r.module}: ${r.lessons.length} lecons`);
}
console.log(`\nResultat sauve: ${OUT_DIR}/selected-modules.json`);

await browser.close();
