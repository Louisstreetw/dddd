import { readFile, writeFile, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const MEMORY_DIR = process.env.MEMORY_DIR || "/root";
const RECENT = path.join(MEMORY_DIR, "journal-recent.md");
const DAYS = path.join(MEMORY_DIR, "journal-jours.md");
const WEEKS = path.join(MEMORY_DIR, "journal-semaines.md");
const MONTHS = path.join(MEMORY_DIR, "journal-mois.md");

const KEEP_RECENT_DAYS = 7;
const KEEP_DAILY_DAYS = 30;
const KEEP_WEEKLY_DAYS = 365;

function today() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgo(d) {
  const t = new Date();
  t.setDate(t.getDate() - d);
  return t.toISOString().slice(0, 10);
}

function askClaude(prompt) {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", ["-p", prompt], {
      cwd: MEMORY_DIR,
      env: { ...process.env, CI: "1" },
    });
    let out = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.on("close", (c) => (c === 0 ? resolve(out.trim()) : reject(new Error(`exit ${c}`))));
  });
}

function partitionByDate(content) {
  const buckets = new Map();
  const entries = content.split(/\n## /).slice(1);
  for (const raw of entries) {
    const dateMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) continue;
    const date = dateMatch[1];
    if (!buckets.has(date)) buckets.set(date, []);
    buckets.get(date).push("## " + raw);
  }
  return buckets;
}

async function compactRecent() {
  if (!existsSync(RECENT)) return;
  const content = await readFile(RECENT, "utf8");
  const buckets = partitionByDate(content);
  const cutoff = daysAgo(KEEP_RECENT_DAYS);

  const keepEntries = [];
  const compressDays = [];

  for (const [date, entries] of buckets) {
    if (date >= cutoff) {
      keepEntries.push(...entries);
    } else {
      compressDays.push({ date, entries });
    }
  }

  for (const { date, entries } of compressDays) {
    const transcript = entries.join("\n");
    const summary = await askClaude(
      `Voici les conversations du ${date} avec Louis. Resume en 5-10 lignes ` +
        `les decisions prises, les actions effectuees, les chiffres importants, ` +
        `et ce qu'il faut retenir long terme. Pas de bavardage.\n\n${transcript}`
    );
    await appendFile(DAYS, `\n## ${date}\n${summary}\n`);
    console.log(`compacted ${date}`);
  }

  await writeFile(
    RECENT,
    `# Journal (${KEEP_RECENT_DAYS} derniers jours)\n${keepEntries.join("\n")}\n`
  );
}

async function compactDaysToWeeks() {
  if (!existsSync(DAYS)) return;
  const content = await readFile(DAYS, "utf8");
  const buckets = partitionByDate(content);
  const cutoff = daysAgo(KEEP_DAILY_DAYS);

  const oldDays = [];
  const keepDays = [];
  for (const [date, entries] of buckets) {
    (date >= cutoff ? keepDays : oldDays).push({ date, entries });
  }

  if (!oldDays.length) return;

  const weekBuckets = new Map();
  for (const { date, entries } of oldDays) {
    const d = new Date(date);
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
    const key = `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
    if (!weekBuckets.has(key)) weekBuckets.set(key, []);
    weekBuckets.get(key).push(...entries);
  }

  for (const [week, entries] of weekBuckets) {
    const transcript = entries.join("\n");
    const summary = await askClaude(
      `Voici les resumes journaliers de la semaine ${week}. Compresse en ` +
        `8-12 lignes les faits marquants, les chiffres globaux, et les leçons.\n\n${transcript}`
    );
    await appendFile(WEEKS, `\n## ${week}\n${summary}\n`);
    console.log(`compacted week ${week}`);
  }

  const keepContent = keepDays.map(({ entries }) => entries.join("\n")).join("\n");
  await writeFile(DAYS, `# Journal jours (J-7 a J-${KEEP_DAILY_DAYS})\n${keepContent}\n`);
}

await compactRecent();
await compactDaysToWeeks();
console.log("done");
