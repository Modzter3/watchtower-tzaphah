#!/usr/bin/env node
/**
 * Build kjv_verses.csv from https://github.com/aruljohn/Bible-kjv (JSON per book).
 *
 * 1. Clone: git clone https://github.com/aruljohn/Bible-kjv.git
 * 2. Run:  node scripts/build-kjv-csv.mjs path/to/Bible-kjv > kjv_verses.csv
 * 3. Supabase → Table Editor → kjv_verses → Import CSV (header matches).
 */

import fs from "node:fs";
import path from "node:path";

function csvCell(s) {
  const t = String(s ?? "");
  if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
  return t;
}

const dir = process.argv[2];
if (!dir || !fs.existsSync(dir)) {
  console.error(
    "Usage: node scripts/build-kjv-csv.mjs <path-to-Bible-kjv-clone>\n\n" +
      "Example:\n" +
      "  git clone https://github.com/aruljohn/Bible-kjv.git .data/Bible-kjv\n" +
      "  node scripts/build-kjv-csv.mjs .data/Bible-kjv > kjv_verses.csv",
  );
  process.exit(1);
}

const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .sort();

if (files.length === 0) {
  console.error("No .json files in", dir);
  process.exit(1);
}

console.log("book,chapter,verse,text");

for (const file of files) {
  const raw = fs.readFileSync(path.join(dir, file), "utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error("Skip invalid JSON:", file);
    continue;
  }

  const book = data.book ?? path.basename(file, ".json");
  const chapters = data.chapters;
  if (!Array.isArray(chapters)) {
    console.error("Skip (no chapters):", file);
    continue;
  }

  for (const ch of chapters) {
    const chapter = parseInt(String(ch.chapter), 10);
    if (Number.isNaN(chapter)) continue;
    const verses = ch.verses;
    if (!Array.isArray(verses)) continue;
    for (const v of verses) {
      const verse = parseInt(String(v.verse), 10);
      if (Number.isNaN(verse)) continue;
      const text = v.text ?? "";
      console.log(
        [csvCell(book), chapter, verse, csvCell(text)].join(","),
      );
    }
  }
}
