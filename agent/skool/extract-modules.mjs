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
  await page.waitForTimeout(7000);
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
      // Partial match: target appears at start (handles "META MEDIA BUYING & SURFSCALING")
      if (!text.startsWith(needle)) continue;
      const depth = el.querySelectorAll("*").length;
      if (depth < minDepth) {
        minDepth = depth;
        best = el;
      }
    }
    if (!best) return null;

    // Walk up to find a card-sized container
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
    const r = card.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, tag: card.tagName };
  }, name);
}

async function extractAllClickables() {
  // Comprehensive: find ALL elements that look interactive, with text and coordinates
  return page.evaluate(() => {
    const items = [];
    const seen = new Set();
    for (const el of document.querySelectorAll("*")) {
      const text = (el.textContent || "").trim();
      if (text.length < 3 || text.length > 250) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 80 || rect.height < 18) continue;
      if (rect.y < 0 || rect.y > 3000) continue;
      const style = getComputedStyle(el);
      const interactive =
        el.tagName === "A" ||
        el.tagName === "BUTTON" ||
        el.getAttribute("role") === "button" ||
        el.getAttribute("role") === "link" ||
        style.cursor === "pointer";
      if (!interactive) continue;
      // Skip very nested items (probably children of a card)
      if (el.querySelectorAll("*").length > 30) continue;
      const key = `${text.slice(0, 60)}|${Math.round(rect.x)}|${Math.round(rect.y)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({
        text: text.slice(0, 200),
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
        w: Math.round(rect.width),
        h: Math.round(rect.height),
        tag: el.tagName,
        href: el.href || null,
      });
    }
    return items;
  });
}

const results = [];

for (const moduleName of TARGET_MODULES) {
  console.log(`\n=== Module: ${moduleName} ===`);
  await loadClassroom();

  const coords = await findCardCoords(moduleName);
  if (!coords) {
    console.error("  Pas trouve sur classroom");
    results.push({ module: moduleName, error: "module_not_found" });
    continue;
  }
  console.log(`  Card <${coords.tag}> @ (${Math.round(coords.x)}, ${Math.round(coords.y)})`);

  const urlBefore = page.url();
  await page.mouse.move(coords.x, coords.y);
  await page.waitForTimeout(300);
  await page.mouse.click(coords.x, coords.y);

  for (let i = 0; i < 20; i++) {
    if (page.url() !== urlBefore) break;
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(4000);

  const moduleUrl = page.url();
  if (moduleUrl === urlBefore) {
    console.error("  Click sans effet");
    results.push({ module: moduleName, error: "click_no_effect" });
    continue;
  }
  console.log(`  Module ouvert: ${moduleUrl}`);

  // Wait for lesson list to render, scroll module page
  await page.waitForTimeout(3000);
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(400);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);

  const slug = moduleName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
  await page.screenshot({
    path: path.join(OUT_DIR, `module-${slug}.png`),
    fullPage: true,
  });

  // Dump full HTML for debug
  const html = await page.content();
  await writeFile(path.join(OUT_DIR, `module-${slug}.html`), html);

  // Get all interactive elements on the module page
  const clickables = await extractAllClickables();
  await writeFile(
    path.join(OUT_DIR, `module-${slug}-clickables.json`),
    JSON.stringify(clickables, null, 2)
  );
  console.log(`  Elements interactifs trouves: ${clickables.length}`);

  // Filter to find likely lessons: small height, in the body
  const lessonCandidates = clickables.filter(
    (c) => c.h < 80 && c.w > 200 && c.text.length > 8 && c.text.length < 150
  );
  console.log(`  Candidats lecons (h<80 w>200): ${lessonCandidates.length}`);

  results.push({
    module: moduleName,
    url: moduleUrl,
    lessonCandidates: lessonCandidates.slice(0, 50),
  });
}

await writeFile(
  path.join(OUT_DIR, "selected-modules.json"),
  JSON.stringify(results, null, 2)
);

console.log("\n=== RECAP ===");
for (const r of results) {
  if (r.error) console.log(`${r.module}: ERREUR (${r.error})`);
  else console.log(`${r.module}: ${r.lessonCandidates?.length || 0} candidats lecons`);
}
console.log(`\nResultat: ${OUT_DIR}/selected-modules.json`);
console.log(`Debug HTML + clickables JSON dans ${OUT_DIR}/`);

await browser.close();
