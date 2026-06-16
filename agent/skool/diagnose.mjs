import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "/home/claude/skool/nolimit/diagnose";
const STATE_FILE = "/home/claude/skool/auth-state.json";
const MODULE_URL =
  "https://www.skool.com/nolimit/classroom/309c0ddb?md=73d16a3ccaae4f8ca02366a494b9e578";

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
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  viewport: { width: 1280, height: 1800 },
  locale: "fr-FR",
});
const page = await context.newPage();

const allResponses = [];

page.on("response", async (res) => {
  const url = res.url();
  const ct = res.headers()["content-type"] || "";
  const status = res.status();
  let body = null;
  if (ct.includes("json") && status < 400) {
    try {
      const txt = await res.text();
      body = txt.slice(0, 5000);
    } catch {}
  }
  allResponses.push({ url, status, ct, body });
});

console.log("Ouverture du module...");
await page.goto(MODULE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(8000);

// Try to find and click the video player to trigger video load
console.log("Tentative de click sur le player video...");
const playClicked = await page.evaluate(() => {
  // Find video element or play button
  const videos = document.querySelectorAll("video");
  for (const v of videos) {
    try {
      v.muted = true;
      v.play();
      return { method: "video.play()", count: videos.length };
    } catch {}
  }
  // Look for a play button (svg, button with play icon)
  for (const el of document.querySelectorAll("button, div[role='button']")) {
    const text = (el.textContent || "").toLowerCase();
    if (text.includes("play") || text.includes("lecture") || el.querySelector("svg")) {
      const r = el.getBoundingClientRect();
      if (r.width > 30 && r.height > 30 && r.width < 200) {
        el.click();
        return { method: "click play btn", text };
      }
    }
  }
  return { method: "none" };
});
console.log(`  ${JSON.stringify(playClicked)}`);

await page.waitForTimeout(10000); // let video load

console.log("\nCapture HTML, screenshot, network...");
await page.screenshot({ path: path.join(OUT_DIR, "module.png"), fullPage: true });
await writeFile(path.join(OUT_DIR, "module.html"), await page.content());

// Extract embedded data
const embedded = await page.evaluate(() => {
  const out = {};
  try {
    out.nextData = window.__NEXT_DATA__
      ? JSON.stringify(window.__NEXT_DATA__).slice(0, 200000)
      : null;
  } catch {}
  out.videos = [...document.querySelectorAll("video")].map((v) => ({
    src: v.src,
    currentSrc: v.currentSrc,
    sources: [...v.querySelectorAll("source")].map((s) => s.src),
  }));
  out.iframes = [...document.querySelectorAll("iframe")].map((i) => ({
    src: i.src,
    name: i.name,
  }));
  out.scripts = [...document.querySelectorAll("script")]
    .map((s) => ({
      src: s.src || null,
      content: s.src ? null : (s.textContent || "").slice(0, 3000),
    }))
    .filter((s) => s.src || (s.content && /vimeo|video|mux|m3u8|mp4|wistia/i.test(s.content)));
  out.dataAttrs = [];
  for (const el of document.querySelectorAll("[data-video-src], [data-src], [data-url]")) {
    out.dataAttrs.push({
      tag: el.tagName,
      attrs: {
        "data-video-src": el.getAttribute("data-video-src"),
        "data-src": el.getAttribute("data-src"),
        "data-url": el.getAttribute("data-url"),
      },
    });
  }
  return out;
});

await writeFile(path.join(OUT_DIR, "embedded.json"), JSON.stringify(embedded, null, 2));

// Filter network responses for interesting ones
const interesting = allResponses.filter(
  (r) =>
    /api|video|stream|m3u8|mp4|vimeo|mux|wistia|cloudflare|playback/i.test(r.url) &&
    !r.url.includes(".css") &&
    !r.url.includes(".woff") &&
    !r.url.includes(".png") &&
    !r.url.includes(".svg") &&
    !r.url.includes(".jpg")
);

await writeFile(
  path.join(OUT_DIR, "network-interesting.json"),
  JSON.stringify(interesting, null, 2)
);

await writeFile(
  path.join(OUT_DIR, "network-all-urls.txt"),
  allResponses.map((r) => `[${r.status}] ${r.url}`).join("\n")
);

console.log("\n=== RECAP ===");
console.log(`Network responses total: ${allResponses.length}`);
console.log(`Network interesting:    ${interesting.length}`);
console.log(`Video tags:              ${embedded.videos.length}`);
console.log(`Iframes:                 ${embedded.iframes.length}`);
console.log(`__NEXT_DATA__ presente:  ${embedded.nextData ? "OUI" : "NON"}`);
console.log(`\nFichiers ecrits dans: ${OUT_DIR}/`);
console.log("  - module.png (capture)");
console.log("  - module.html (HTML brut)");
console.log("  - embedded.json (videos, iframes, __NEXT_DATA__, etc.)");
console.log("  - network-interesting.json (requetes filtrees)");
console.log("  - network-all-urls.txt (toutes les URLs)");

await browser.close();
