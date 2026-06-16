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

async function findAndClickModule(name) {
  await page.goto(CLASSROOM_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(8000);

  // Scroll to load all cards
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(600);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);

  // Try to find a clickable element whose text contains the name
  const clicked = await page.evaluate((target) => {
    const needle = target.toLowerCase();
    const all = document.querySelectorAll("*");
    let bestEl = null;
    let bestDepth = Infinity;

    for (const el of all) {
      const text = (el.textContent || "").trim().toLowerCase();
      if (!text.includes(needle)) continue;
      // Prefer the smallest element that contains the target text
      const depth = el.querySelectorAll("*").length;
      if (depth < bestDepth) {
        bestDepth = depth;
        bestEl = el;
      }
    }

    if (!bestEl) return { ok: false, reason: "not_found" };

    // Find the nearest clickable ancestor (a, button, role=button, cursor:pointer)
    let node = bestEl;
    while (node && node !== document.body) {
      const tag = node.tagName;
      const style = window.getComputedStyle(node);
      const clickable =
        tag === "A" ||
        tag === "BUTTON" ||
        node.getAttribute("role") === "button" ||
        node.onclick != null ||
        style.cursor === "pointer";
      if (clickable) {
        // Scroll into view and mark for click
        node.scrollIntoView({ block: "center" });
        node.setAttribute("data-claude-clicktarget", "1");
        return {
          ok: true,
          tag: node.tagName,
          href: node.href || null,
          text: (node.textContent || "").trim().slice(0, 200),
        };
      }
      node = node.parentElement;
    }
    return { ok: false, reason: "no_clickable_parent" };
  }, name);

  if (!clicked.ok) {
    console.error(`  Pas trouve (${clicked.reason}): ${name}`);
    return null;
  }
  console.log(`  Match: <${clicked.tag}> "${clicked.text.slice(0, 80)}"`);

  // If we already have the href, navigate directly
  if (clicked.href) {
    console.log(`  Navigation directe: ${clicked.href}`);
    await page.goto(clicked.href, { waitUntil: "domcontentloaded" });
  } else {
    console.log(`  Click sur l'element marque...`);
    await page.click('[data-claude-clicktarget="1"]');
  }

  await page.waitForTimeout(6000);
  return page.url();
}

const results = [];

for (const moduleName of TARGET_MODULES) {
  console.log(`\n=== Module: ${moduleName} ===`);
  const moduleUrl = await findAndClickModule(moduleName);
  if (!moduleUrl) {
    results.push({ module: moduleName, error: "not_found" });
    continue;
  }
  console.log(`  URL module: ${moduleUrl}`);

  // Scroll the module page to load lessons
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(700);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);

  const slug = moduleName.toLowerCase().replace(/\s+/g, "-");
  await page.screenshot({
    path: path.join(OUT_DIR, `module-${slug}.png`),
    fullPage: true,
  });

  // Extract lessons (links inside the module page)
  const lessons = await page.evaluate(() => {
    const items = [];
    for (const a of document.querySelectorAll("a[href]")) {
      const href = a.href;
      const text = (a.textContent || "").trim();
      // Skool lesson URLs have pattern /classroom/<module>/<lesson>
      if (/skool\.com\/.+\/classroom\/.+\/.+/.test(href) && text) {
        items.push({ title: text.slice(0, 200), href });
      }
    }
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
  if (r.error) {
    console.log(`${r.module}: ERREUR (${r.error})`);
  } else {
    console.log(`${r.module}: ${r.lessons.length} lecons`);
  }
}
console.log(`\nResultat sauve: ${OUT_DIR}/selected-modules.json`);

await browser.close();
