import { chromium } from "playwright";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const COMMUNITY = "nolimit";
const OUT_DIR = `/home/claude/skool/${COMMUNITY}`;
const STATE_FILE = "/home/claude/skool/auth-state.json";

// Modules URLs (déjà identifiés dans selected-modules.json)
const MODULE_URLS = [
  {
    name: "creative-strategy",
    url: "https://www.skool.com/nolimit/classroom/309c0ddb?md=73d16a3ccaae4f8ca02366a494b9e578",
  },
  {
    name: "creatives-system",
    url: "https://www.skool.com/nolimit/classroom/b8dd8464?md=938921746b564a5bb1365021ab8b16ae",
  },
  // META MEDIA BUYING — à identifier (peut-être ouvrir manuellement et le passer ici)
];

const VIDEO_PATTERNS = [
  /\.m3u8/i,
  /\.mp4(\?|$)/i,
  /\.ts(\?|$)/i,
  /vimeo\.com.*\/video/i,
  /wistia/i,
  /muxcdn/i,
  /cloudfront.*video/i,
];

function looksLikeVideo(url) {
  return VIDEO_PATTERNS.some((p) => p.test(url));
}

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-blink-features=AutomationControlled", "--autoplay-policy=no-user-gesture-required"],
});
const context = await browser.newContext({
  storageState: STATE_FILE,
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  viewport: { width: 1280, height: 1800 },
  locale: "fr-FR",
});

const allLessons = [];

for (const mod of MODULE_URLS) {
  console.log(`\n=== Module: ${mod.name} ===`);
  const page = await context.newPage();
  const lessonsForModule = [];

  // Capture all video-like URLs
  page.on("response", async (res) => {
    const url = res.url();
    if (looksLikeVideo(url)) {
      const status = res.status();
      console.log(`  [video] ${status} ${url.slice(0, 120)}...`);
      lessonsForModule.push({
        url,
        status,
        pageUrl: page.url(),
        ts: Date.now(),
      });
    }
  });

  console.log(`  Ouverture: ${mod.url}`);
  await page.goto(mod.url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(10000); // laisse le player charger

  let nextCount = 0;
  while (nextCount < 30) {
    // Try to click "Next" / "Suivant" button
    const clicked = await page.evaluate(() => {
      const needles = ["next lesson", "next", "suivant", "lecon suivante", "leçon suivante"];
      for (const el of document.querySelectorAll("button, a, div[role='button']")) {
        const text = (el.textContent || "").trim().toLowerCase();
        if (!text || text.length > 30) continue;
        for (const n of needles) {
          if (text === n || text.startsWith(n)) {
            const rect = el.getBoundingClientRect();
            if (rect.width < 20 || rect.height < 20) continue;
            el.scrollIntoView({ block: "center" });
            return { found: true, text };
          }
        }
      }
      return { found: false };
    });
    if (!clicked.found) {
      console.log(`  Pas de bouton "next" trouvé → fin du module`);
      break;
    }
    // Real mouse click at the element coords
    const coords = await page.evaluate(() => {
      const marked = document.activeElement;
      if (marked && marked.tagName) {
        const r = marked.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      }
      return null;
    });
    const before = page.url();
    if (coords) {
      await page.mouse.click(coords.x, coords.y);
    } else {
      // fallback: keyboard right arrow (Skool may support it)
      await page.keyboard.press("ArrowRight");
    }
    nextCount++;
    console.log(`  Next #${nextCount} (${clicked.text})`);
    await page.waitForTimeout(8000); // let new video load
    if (page.url() === before) {
      console.log(`  URL n'a pas change, on arrete`);
      break;
    }
  }

  allLessons.push({
    module: mod.name,
    startUrl: mod.url,
    videos: lessonsForModule,
    lessonsExplored: nextCount + 1,
  });

  await page.close();
}

await writeFile(
  path.join(OUT_DIR, "video-urls.json"),
  JSON.stringify(allLessons, null, 2)
);

console.log("\n=== RECAP ===");
for (const m of allLessons) {
  console.log(`${m.module}: ${m.videos.length} URLs vidéo, ${m.lessonsExplored} leçons explorées`);
}
console.log(`\nFichier: ${OUT_DIR}/video-urls.json`);

await browser.close();
