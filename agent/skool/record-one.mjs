import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const URL = process.env.URL;
const DURATION_FILE = process.env.DURATION_FILE;
const STATE_FILE = "/home/claude/skool/auth-state.json";

if (!URL || !DURATION_FILE) {
  console.error("Missing URL or DURATION_FILE env");
  process.exit(1);
}

// Headed mode — needs DISPLAY set by parent shell to :99 (Xvfb)
const browser = await chromium.launch({
  headless: false,
  args: [
    "--no-sandbox",
    "--disable-blink-features=AutomationControlled",
    "--autoplay-policy=no-user-gesture-required",
    "--disable-features=IsolateOrigins,site-per-process",
    "--disable-dev-shm-usage",
  ],
});

const context = await browser.newContext({
  storageState: STATE_FILE,
  viewport: { width: 1280, height: 720 },
  locale: "fr-FR",
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
});

const page = await context.newPage();

console.log(`Opening ${URL}`);
await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(8000);

// Scroll briefly to trigger any lazy load
await page.evaluate(() => window.scrollBy(0, 200));
await page.waitForTimeout(1500);

// Try to find the video element and play it
const result = await page.evaluate(async () => {
  // Find player iframe (Skool may use Wistia/Vimeo embedded)
  const iframes = [...document.querySelectorAll("iframe")];
  // Also look for direct video elements
  const directVideos = [...document.querySelectorAll("video")];

  // Strategy 1: direct <video> in main document
  for (const v of directVideos) {
    try {
      v.muted = false;
      v.volume = 1.0;
      await v.play();
      return {
        ok: true,
        source: "direct-video",
        duration: v.duration,
        currentSrc: v.currentSrc || v.src || null,
      };
    } catch (e) {}
  }

  // Strategy 2: video inside iframe (only same-origin works)
  for (const iframe of iframes) {
    try {
      const doc = iframe.contentDocument;
      if (!doc) continue;
      const v = doc.querySelector("video");
      if (v) {
        v.muted = false;
        v.volume = 1.0;
        try {
          await v.play();
        } catch {}
        return {
          ok: true,
          source: "iframe-video",
          duration: v.duration,
          currentSrc: v.currentSrc || v.src || null,
          iframeSrc: iframe.src,
        };
      }
    } catch (e) {}
  }

  // Strategy 3: click on a play button
  for (const el of document.querySelectorAll("button, div[role='button'], div[class*='play' i]")) {
    const r = el.getBoundingClientRect();
    if (r.width > 30 && r.width < 200 && r.height > 30 && r.height < 200) {
      el.click();
      break;
    }
  }
  await new Promise((r) => setTimeout(r, 2000));

  // Check again for video
  for (const v of document.querySelectorAll("video")) {
    if (!isNaN(v.duration) && v.duration > 1) {
      return {
        ok: true,
        source: "after-click",
        duration: v.duration,
        currentSrc: v.currentSrc || v.src || null,
      };
    }
  }

  return {
    ok: false,
    source: "none",
    iframeCount: iframes.length,
    iframes: iframes.map((i) => i.src),
  };
});

console.log("Detection:", JSON.stringify(result));

if (!result.ok || !result.duration || isNaN(result.duration) || result.duration < 5) {
  // Fallback: assume a 10-minute lesson (we'll over-record to be safe)
  console.log("Pas de duree fiable, fallback 600s");
  await writeFile(DURATION_FILE, "600");
} else {
  await writeFile(DURATION_FILE, String(result.duration));
}

// Keep the page open while ffmpeg records — sleep ~30 min then exit
console.log("Playwright keeps the page open while ffmpeg records...");
await page.waitForTimeout(35 * 60 * 1000);
await browser.close();
