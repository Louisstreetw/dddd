// Tour complet d'un module Skool: visite chaque leçon, capture URL vidéo
// (iframe Vimeo/Wistia, requêtes mp4/m3u8, etc.), produit un rapport.
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const STATE_FILE = "/home/claude/skool/auth-state.json";
const OUT_DIR = "/home/claude/skool/nolimit/discovery";

const MODULES = [
  {
    name: "creative-strategy",
    url: "https://www.skool.com/nolimit/classroom/309c0ddb?md=73d16a3ccaae4f8ca02366a494b9e578",
  },
  {
    name: "creatives-system",
    url: "https://www.skool.com/nolimit/classroom/b8dd8464?md=938921746b564a5bb1365021ab8b16ae",
  },
];

const VIDEO_RX =
  /(vimeo\.com|player\.vimeo|wistia|muxcdn|mux\.com|cloudfront\.net.*\.(mp4|m3u8|ts)|\.m3u8|\.mp4(\?|$))/i;

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-blink-features=AutomationControlled",
    "--autoplay-policy=no-user-gesture-required",
  ],
});

const context = await browser.newContext({
  storageState: STATE_FILE,
  viewport: { width: 1280, height: 900 },
  locale: "fr-FR",
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
});

async function inspectPage(page, label) {
  const result = {
    label,
    pageUrl: page.url(),
    videoUrlsFromNetwork: new Set(),
    iframes: [],
    videoTags: [],
    lessonLinks: [],
  };

  page.on("response", (res) => {
    const u = res.url();
    if (VIDEO_RX.test(u)) result.videoUrlsFromNetwork.add(u);
  });
  page.on("request", (req) => {
    const u = req.url();
    if (VIDEO_RX.test(u)) result.videoUrlsFromNetwork.add(u);
  });

  await page.waitForTimeout(10000);

  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(500);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2000);

  // Try to play a video
  await page.evaluate(async () => {
    for (const v of document.querySelectorAll("video")) {
      try {
        v.muted = false;
        await v.play();
      } catch {}
    }
    // click big play buttons
    for (const el of document.querySelectorAll("button, div[role='button']")) {
      const r = el.getBoundingClientRect();
      const cls = (el.className || "").toString().toLowerCase();
      if (
        r.width > 40 &&
        r.width < 250 &&
        r.height > 40 &&
        r.height < 250 &&
        (cls.includes("play") || el.querySelector("svg"))
      ) {
        try { el.click(); break; } catch {}
      }
    }
  });
  await page.waitForTimeout(8000);

  const dom = await page.evaluate(() => {
    const iframes = [...document.querySelectorAll("iframe")].map((i) => ({
      src: i.src,
      name: i.name,
    }));
    const videos = [...document.querySelectorAll("video")].map((v) => ({
      src: v.src,
      currentSrc: v.currentSrc,
      sources: [...v.querySelectorAll("source")].map((s) => s.src),
    }));
    const lessons = [];
    for (const a of document.querySelectorAll("a[href]")) {
      const h = a.href;
      if (/skool\.com\/[^/]+\/classroom\/[^/?#]+\?md=/.test(h)) {
        lessons.push({ title: (a.textContent || "").trim().slice(0, 200), href: h });
      }
    }
    return { iframes, videos, lessons };
  });

  result.iframes = dom.iframes;
  result.videoTags = dom.videos;
  result.lessonLinks = Array.from(
    new Map(dom.lessons.map((l) => [l.href, l])).values()
  );
  result.videoUrlsFromNetwork = [...result.videoUrlsFromNetwork];
  return result;
}

const report = [];

for (const mod of MODULES) {
  console.log(`\n=== Module ${mod.name} ===`);
  const page = await context.newPage();
  await page.goto(mod.url, { waitUntil: "domcontentloaded", timeout: 30000 });
  const moduleInspect = await inspectPage(page, "module-landing");
  console.log(
    `  Iframes: ${moduleInspect.iframes.length}, video tags: ${moduleInspect.videoTags.length}, leçons listées: ${moduleInspect.lessonLinks.length}, URLs réseau vidéo: ${moduleInspect.videoUrlsFromNetwork.length}`
  );
  await page.close();

  const lessonReports = [];
  // Visit at most 5 distinct lesson pages to save time
  const lessonsToVisit = moduleInspect.lessonLinks
    .filter((l) => l.href !== mod.url)
    .slice(0, 5);

  for (const lesson of lessonsToVisit) {
    console.log(`  -> ${lesson.title.slice(0, 60)} (${lesson.href.slice(0, 80)}...)`);
    const lp = await context.newPage();
    try {
      await lp.goto(lesson.href, { waitUntil: "domcontentloaded", timeout: 30000 });
      const inspected = await inspectPage(lp, lesson.title);
      inspected.lessonHref = lesson.href;
      lessonReports.push(inspected);
      console.log(
        `     iframes:${inspected.iframes.length} video:${inspected.videoTags.length} netVideoURLs:${inspected.videoUrlsFromNetwork.length}`
      );
    } catch (e) {
      console.log(`     ERREUR: ${e.message}`);
    }
    await lp.close();
  }

  report.push({
    module: mod.name,
    moduleUrl: mod.url,
    moduleLandingPage: moduleInspect,
    lessons: lessonReports,
  });
}

await writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));

// Summary
console.log("\n=== RAPPORT ===");
for (const m of report) {
  const allUrls = new Set();
  const allIframes = new Set();
  [m.moduleLandingPage, ...m.lessons].forEach((p) => {
    p.videoUrlsFromNetwork.forEach((u) => allUrls.add(u));
    p.iframes.forEach((i) => i.src && allIframes.add(i.src));
  });
  console.log(`\n${m.module}:`);
  console.log(`  Leçons visitées: ${m.lessons.length}`);
  console.log(`  URLs vidéo réseau uniques: ${allUrls.size}`);
  console.log(`  Iframes uniques: ${allIframes.size}`);
  console.log(`  Sample iframes:`);
  [...allIframes].slice(0, 5).forEach((s) => console.log(`    ${s.slice(0, 130)}`));
  console.log(`  Sample video URLs:`);
  [...allUrls].slice(0, 5).forEach((s) => console.log(`    ${s.slice(0, 130)}`));
}

console.log(`\nRapport complet: ${OUT_DIR}/report.json`);
await browser.close();
