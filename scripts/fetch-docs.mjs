#!/usr/bin/env node
/**
 * Pulls the EasyCRM API documentation into ./docs/ so Docusaurus can build it.
 *
 * This is NOT the multi-repo sync the internal docs site uses, and that is the point. This
 * site faces a customer, so it pulls from ONE repo and only the folders in INCLUDE below.
 * A blocklist would not do: a folder added to EasyCRM/docs/ next year must not land on a
 * customer's domain because nobody remembered to exclude it. Here it simply is not fetched.
 *
 * Flat on purpose. The internal site nests each repo under /<repo>/ because it carries many;
 * this one carries one, so the pages sit at the site root and a customer reads
 * /api-integration/… rather than /EasyCRM/api-integration/….
 *
 * Env:
 *   DOCS_TOKEN      token with READ access to the source repo (required - it is private)
 *   DOCS_ORG        owner of the source repo      (default: hussnain-utechhub)
 *   DOCS_REPO       source repo                   (default: EasyCRM)
 *   DOCS_BRANCH     branch to read docs from      (default: main)
 *   SITE_REPO_URL   this repo, for the landing page's Edit link
 *   GIT_BASE        clone host, for tests         (default: authenticated github.com)
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { rewriteEscapingLinks } from "./rewrite-links.mjs";

// The ONLY folders that reach the customer. Adding one here is a deliberate act.
const INCLUDE = ["docs/api-integration", "docs/api"];

const TOKEN  = process.env.DOCS_TOKEN || process.env.GITHUB_TOKEN;
const ORG    = process.env.DOCS_ORG    || "hussnain-utechhub";
const REPO   = process.env.DOCS_REPO   || "EasyCRM";
const BRANCH = process.env.DOCS_BRANCH || "main";
const SITE_REPO_URL = process.env.SITE_REPO_URL || "https://github.com/hussnain-utechhub/easycrm-api-docs";
const OUT = path.resolve("docs");

if (!TOKEN) { console.error("DOCS_TOKEN is required: the source repo is private."); process.exit(1); }

const base = process.env.GIT_BASE || `https://x-access-token:${TOKEN}@github.com`;
const htmlUrl = `https://github.com/${ORG}/${REPO}`;
const repoRef = { html_url: htmlUrl, default_branch: BRANCH };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "apidocs-"));
const src = path.join(tmp, REPO);
const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: "pipe" });
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};

// Sparse checkout: only the folders above are ever downloaded, so the rest of the source
// repo never reaches the build machine. --filter=blob:none keeps it to one small fetch.
console.log(`Fetching ${INCLUDE.join(" + ")} from ${ORG}/${REPO}@${BRANCH}`);
sh(`git clone --depth 1 --filter=blob:none --sparse --branch ${BRANCH} ${base}/${ORG}/${REPO}.git ${REPO}`, tmp);
sh(`git sparse-checkout set ${INCLUDE.join(" ")}`, src);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// The landing page is written HERE, not pulled. The source repo's docs/index.md introduces
// the internal hub; a customer needs a different first page, and keeping it local means
// editing it never touches the product repo.
const landing = path.resolve("content", "index.md");
if (!fs.existsSync(landing)) { console.error("content/index.md is missing - the site would have no landing page."); process.exit(1); }
fs.copyFileSync(landing, path.join(OUT, "index.md"));

let copied = 0;
for (const inc of INCLUDE) {
  const from = path.join(src, inc);
  if (!fs.existsSync(from)) { console.warn(`  not in the source repo, skipped: ${inc}`); continue; }
  fs.cpSync(from, path.join(OUT, path.basename(inc)), { recursive: true });
  copied++;
}
if (!copied) { console.error("Nothing was fetched. Check DOCS_BRANCH and the token's access."); process.exit(1); }

// ---- stamp every page ----------------------------------------------------------------
// docs/ is generated and gitignored, so git here knows nothing about these files. Without a
// stamp Docusaurus runs git against THIS repo and reports the build date on every page. The
// honest date is when the page last changed in the repo it came from.
function gitLog(cwd, rel) {
  try {
    const out = execSync(`git log -1 --format=%aI%x09%an${rel ? ` -- "${rel}"` : ""}`, { cwd, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
    return out ? out.split("\t") : null;
  } catch { return null; }
}
function injectFrontmatter(raw, date, author, editUrl) {
  const stamp = `last_update:\n  date: ${date}\n  author: ${author}\ncustom_edit_url: ${editUrl}`;
  if (raw.startsWith("---\n")) {
    const end = raw.indexOf("\n---", 4);
    if (end !== -1) {
      const front = raw.slice(4, end);
      // Leave an author's own values alone, in case they were set deliberately.
      if (/^last_update:/m.test(front) || /^custom_edit_url:/m.test(front)) return raw;
      return `---\n${front}\n${stamp}\n---${raw.slice(end + 4)}`;
    }
  }
  return `---\n${stamp}\n---\n\n${raw}`;
}

const srcHead = gitLog(src, null) || [new Date().toISOString(), "EasyCRM"];
const siteHead = gitLog(process.cwd(), "content/index.md") || [new Date().toISOString(), "EasyCRM"];

for (const file of walk(OUT)) {
  if (!/\.mdx?$/.test(file)) continue;
  const relOut = path.relative(OUT, file).split(path.sep).join("/");
  const isLanding = relOut === "index.md";
  const rel = path.posix.join("docs", relOut);
  // Carriage returns are stripped before anything looks at the frontmatter. git may check the
  // source out with CRLF endings - it does on Windows - and a CRLF file fails a test for a bare
  // line feed, so the stamp would be PREPENDED rather than merged, pushing the page's real
  // frontmatter, title and all, into the body as literal text. Stripping also makes the output
  // identical whatever the build machine's git config happens to be.
  const raw = fs.readFileSync(file, "utf8").split(String.fromCharCode(13)).join("");

  // Rewrite links that escape docs/ BEFORE stamping: an unresolvable link fails the build
  // (onBrokenLinks is "throw") whether or not the page got a date.
  let out = isLanding ? raw : rewriteEscapingLinks(raw, rel, repoRef, "docs");

  const [date, author] = isLanding ? siteHead : (gitLog(src, rel) || srcHead);
  const editUrl = isLanding
    ? `${SITE_REPO_URL}/edit/main/content/index.md`
    : `${htmlUrl}/edit/${BRANCH}/${rel}`;
  if (date) out = injectFrontmatter(out, date, author, editUrl);
  if (out !== raw) fs.writeFileSync(file, out);
}

// The endpoint pages are generated at build time, so git knows nothing about them either.
// Record when the SPEC last changed; stamp-api-docs.mjs puts that on each generated page.
const specRel = "docs/api/openapi.yaml";
if (fs.existsSync(path.join(src, specRel))) {
  const log = gitLog(src, specRel);
  if (log) {
    fs.writeFileSync(path.join(OUT, "api", ".spec-meta.json"),
      JSON.stringify({ date: log[0], author: log[1], editUrl: `${htmlUrl}/edit/${BRANCH}/${specRel}` }, null, 2));
  }
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Done. ${walk(OUT).length} files in docs/.`);
