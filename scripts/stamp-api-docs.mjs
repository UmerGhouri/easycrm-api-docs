#!/usr/bin/env node
/**
 * Puts last_update and custom_edit_url onto the pages generated from the OpenAPI spec.
 *
 * Those pages are written by the plugin at build time, so git knows nothing about them.
 * Without a stamp Docusaurus falls back to running git against THIS repo, which reports the
 * date the site was built rather than the date the API changed. The honest date is when the
 * spec last changed, which scripts/fetch-docs.mjs recorded in .spec-meta.json.
 *
 * Single known folder, because this site renders a single spec (see api-specs.js). The
 * internal docs site walks every repo folder instead.
 *
 * Run after `docusaurus gen-api-docs`, before the build. `npm run gen-api` does both.
 */
import fs from "node:fs";
import path from "node:path";

const API_DIR = path.resolve("docs", "api");
const metaPath = path.join(API_DIR, ".spec-meta.json");

if (!fs.existsSync(metaPath)) {
  console.log("No .spec-meta.json - nothing to stamp. (Run the fetch first.)");
  process.exit(0);
}

const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
let stamped = 0;

for (const file of fs.readdirSync(API_DIR)) {
  if (!file.endsWith(".mdx")) continue;
  const full = path.join(API_DIR, file);
  const raw = fs.readFileSync(full, "utf8");
  if (!raw.startsWith("---\n")) continue;
  const end = raw.indexOf("\n---", 4);
  if (end === -1) continue;
  const front = raw.slice(4, end);
  if (/^last_update:/m.test(front)) continue;

  // The plugin writes custom_edit_url: null to hide the Edit button. Point it at the spec
  // instead, because editing the spec is exactly how you change these pages.
  const cleaned = front.replace(/^custom_edit_url:.*$/m, "").replace(/\n{2,}/g, "\n");
  const stamp =
    `last_update:\n  date: ${meta.date}\n  author: ${meta.author}\n` +
    `custom_edit_url: ${meta.editUrl}`;
  fs.writeFileSync(full, `---\n${cleaned}\n${stamp}\n---${raw.slice(end + 4)}`);
  stamped++;
}

console.log(`Stamped ${stamped} generated endpoint page(s).`);
