/**
 * The OpenAPI spec this site renders.
 *
 * The internal docs site scans every repo folder for a spec, because it never knows which
 * repos it will carry. This site carries one, fetched by scripts/fetch-docs.mjs into a known
 * place, so there is nothing to discover - naming it is clearer than searching for it.
 *
 * Returns an empty config when the spec is absent, so `npm run gen-api` is a no-op on a
 * checkout where the fetch has not run yet rather than an error.
 */
const fs = require("node:fs");
const path = require("node:path");

// Relative to the site root on purpose: the plugin writes specPath straight into the
// generated frontmatter, and an absolute path there becomes a link that only works on the
// machine that built it.
const SPEC = "docs/api/openapi.yaml";
const OUTPUT_DIR = "docs/api";

function hasSpec() {
  return fs.existsSync(path.resolve(__dirname, "..", SPEC));
}

function apiConfig() {
  if (!hasSpec()) return {};
  return {
    easycrm: {
      specPath: SPEC,
      outputDir: OUTPUT_DIR,
      hideSendButton: true,   // a static site has no server to send a live request to
      downloadUrl: undefined,
      sidebarOptions: { groupPathsBy: "tag", categoryLinkSource: "tag" },
    },
  };
}

module.exports = { hasSpec, apiConfig, SPEC, OUTPUT_DIR };
