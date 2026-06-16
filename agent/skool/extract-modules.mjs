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
  viewport: { width: 1280, height: 1800 },
  locale: "fr-FR",
});
const page = await context.newPage();

async function loadClassroom() {
  await page.goto(CLASSROOM_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(8000);
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(500);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
}

async function findCardCoords(name) {
  return page.evaluate((target) => {
    const needle = target.toLowerCase();
    const all = document.querySelectorAll("*");
    let best = null;
    let minDepth = Infinity;
    for (const el of all) {
      const text = (el.textContent || "").trim().toLowerCase();
      if (text !== needle) continue; // exact match for the title
      const depth = el.querySelectorAll("*").length;
      if (depth < minDepth) {
        minDepth = depth;
        best = el;
      }
    }
    if (!best) return null;

    // Walk up to find a card-sized clickable container
    let node = best;
    let card = best;
    while (node && node !== document.body) {
      const rect = node.getBoundingClientRect();
      if (rect.width > 200 && rect.height > 150) {
        card = node;
        const style = getComputedStyle(node);
        if (
          style.cursor === "pointer" ||
          node.tagName === "A" ||
          node.tagName === "ARTICLE"
        ) {
          break;
        }
      }
      node = node.parentElement;
    }

    card.scrollIntoView({ block: "center", behavior: "instant" });
    const rect = card.getBoundingClientRect();
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
      width: rect.width,
      height: rect.height,
      tag: card.tagName,
      cls: (card.className || "").toString().slice(0, 80),
    };
  }, name);
}

async function extractLessons() {
  // After landing on a module page, scroll and grab all lesson links
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(500);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  return page.evaluate(() => {
    const items = [];
    for (const a of document.querySelectorAll("a[href]")) {
      const href = a.href;
      const text = (a.textContent || "").trim();
      if (
        /skool\.com\/[^/]+\/classroom\/[^/]+\/[^/?#]+/.test(href) &&
        text &&
        !href.endsWith("/classroom")
      ) {
        items.push({ title: text.slice(0, 200), href });
      }
    }
    return Array.from(new Map(items.map((i) => [i.href, i])).values());
  });
}

const results = [];

for (const moduleName of TARGET_MODULES) {
  console.log(`\n=== Module: ${moduleName} ===`);
  await loadClassroom();
  await page.waitForTimeout(500);

  const coords = await findCardCoords(moduleName);
  if (!coords) {
    console.error("  Pas trouve");
    results.push({ module: moduleName, error: "not_found" });
    continue;
  }
  console.log(
    `  Card <${coords.tag}> ${Math.round(coords.width)}x${Math.round(coords.height)} @ (${Math.round(coords.x)}, ${Math.round(coords.y)})`
  );

  // Real mouse click at the card center
  const urlBefore = page.url();
  await page.mouse.move(coords.x, coords.y);
  await page.waitForTimeout(300);
  await page.mouse.click(coords.x, coords.y);

  // Wait for URL to change
  for (let i = 0; i < 20; i++) {
    if (page.url() !== urlBefore) break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(3000);

  const moduleUrl = page.url();
  if (moduleUrl === urlBefore) {
    console.error("  Click sans effet (URL inchangee)");
    results.push({ module: moduleName, error: "click_no_effect" });
    continue;
  }
  console.log(`  Module ouvert: ${moduleUrl}`);

  const slug = moduleName.toLowerCase().replace(/\s+/g, "-");
  await page.screenshot({
    path: path.join(OUT_DIR, `module-${slug}.png`),
    fullPage: true,
  });

  const lessons = await extractLessons();
  console.log(`  Lecons trouvees: ${lessons.length}`);
  results.push({ module: moduleName, url: moduleUrl, lessons });
}

await writeFile(
  path.join(OUT_DIR, "selected-modules.json"),
  JSON.stringify(results, null, 2)
);

console.log("\n=== RECAP ===");
for (const r of results) {
  if (r.error) {
    console.log(`${r.module}: ERREUR (${r.error})`);
  } else {
    console.log(`${r.module}: ${r.lessons.length} lecons`);
  }
}
console.log(`\nResultat sauve: ${OUT_DIR}/selected-modules.json`);

await browser.close();
