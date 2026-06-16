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
  viewport: { width: 1280, height: 1600 },
  locale: "fr-FR",
});
const page = await context.newPage();

console.log(`Navigation: ${CLASSROOM_URL}`);
await page.goto(CLASSROOM_URL, { waitUntil: "networkidle", timeout: 30000 });
console.log("Attente du chargement client-side...");
await page.waitForTimeout(8000);

// Scroll progressively to trigger lazy load
console.log("Scroll pour declencher le lazy load...");
for (let i = 0; i < 8; i++) {
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(700 + Math.random() * 500);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1500);

console.log("Capture full page...");
await page.screenshot({
  path: path.join(OUT_DIR, "classroom.png"),
  fullPage: true,
});

console.log("Dump HTML brut pour debug...");
const html = await page.content();
await writeFile(path.join(OUT_DIR, "classroom.html"), html);

console.log("Extraction de TOUS les liens et boutons cliquables...");
const all = await page.evaluate(() => {
  const out = [];
  // links
  for (const a of document.querySelectorAll("a[href]")) {
    out.push({
      kind: "a",
      text: (a.textContent || "").trim().slice(0, 200),
      href: a.href,
    });
  }
  // divs/buttons cliquables avec onclick ou cursor:pointer
  for (const el of document.querySelectorAll(
    "div[role='button'], button, [data-testid], [class*='card'], [class*='Card']"
  )) {
    const text = (el.textContent || "").trim().slice(0, 200);
    if (text) {
      out.push({
        kind: el.tagName.toLowerCase(),
        text,
        attrs: {
          class: el.className?.toString().slice(0, 120),
          testid: el.getAttribute("data-testid") || undefined,
          role: el.getAttribute("role") || undefined,
        },
      });
    }
  }
  return out;
});

await writeFile(
  path.join(OUT_DIR, "all-elements.json"),
  JSON.stringify(all, null, 2)
);

const classroomLinks = all.filter(
  (e) => e.kind === "a" && /\/classroom\//.test(e.href || "")
);
console.log(`Liens classroom trouves: ${classroomLinks.length}`);

const modulesUnique = Array.from(
  new Map(classroomLinks.map((m) => [m.href, m])).values()
);
await writeFile(
  path.join(OUT_DIR, "modules.json"),
  JSON.stringify(modulesUnique, null, 2)
);

const pageTitle = await page.title();
console.log(`Titre de la page: ${pageTitle}`);
console.log(`Total elements extraits: ${all.length}`);
console.log(`Modules uniques: ${modulesUnique.length}`);
console.log(`Fichiers debug: ${OUT_DIR}/{classroom.png, classroom.html, all-elements.json}`);

await browser.close();
console.log("Done.");
