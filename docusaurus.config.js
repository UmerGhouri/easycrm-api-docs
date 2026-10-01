// Docusaurus 3.x
//
// CommonJS on purpose. Do not add "type": "module" to package.json and do not switch this
// file to `export default`. With type:module the production build compiles and then dies in
// server-side rendering with "require.resolveWeak is not a function", because the server
// bundle is CommonJS and Node reads it as ESM. The .mjs scripts are unaffected: they are ESM
// by their own extension.
//
// The customer-facing EasyCRM API documentation. One repo, one spec - see scripts/fetch-docs.mjs
// for why this does not reuse the internal site's multi-repo sync.
const { apiConfig } = require("./scripts/api-specs.js");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "EasyCRM API Documentation",
  tagline: "Read your portal data from another system",
  favicon: "img/favicon.svg",

  // url is the ORIGIN; baseUrl is the path under it.
  //
  // Until a custom domain is attached this is a GitHub Pages PROJECT site, served from
  // /<repo>/ - so baseUrl must be "/easycrm-api-docs/" or every asset resolves one directory
  // too high and the site 404s. On a custom domain the site is served at the root, so it
  // becomes "/". Both are repo VARIABLES and the workflow passes them, so moving to the
  // customer's domain is a settings change rather than a commit.
  url: process.env.DOCS_SITE_URL || "https://hussnain-utechhub.github.io",
  baseUrl: process.env.DOCS_BASE_URL || "/easycrm-api-docs/",
  organizationName: "hussnain-utechhub",
  projectName: "easycrm-api-docs",

  // Deliberately indexable, unlike the internal site. These pages are meant to be found by
  // the customers who have to integrate against them, so there is no noIndex here and the
  // sitemap below is on. Nothing in docs/api-integration/ names a credential or an internal
  // host - it describes a public, authenticated API.

  // Fail the build on a broken internal link. Worth it: dead links are how documentation
  // quietly stops being trustworthy, and a customer cannot work around one.
  onBrokenLinks: "throw",

  future: { v4: { removeLegacyPostBuildHeadAttribute: true }, faster: true },

  markdown: {
    // Parse .md as CommonMark, .mdx as MDX. The default runs everything through MDX, which
    // reads an angle bracket in prose - a generic type, an HTML-looking example - as a JSX
    // tag and fails the build. We use no JSX in docs, so this costs nothing.
    format: "detect",
    hooks: { onBrokenMarkdownLinks: "warn" },
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",            // docs ARE the site; there is no separate home page
          sidebarPath: "./sidebars.js",
          // Required by the OpenAPI theme: ApiItem mounts the state the generated endpoint
          // pages need. Without it they render as empty panels with a console error.
          docItemComponent: "@theme/ApiItem",
          // No editUrl here on purpose. scripts/fetch-docs.mjs stamps custom_edit_url into
          // every page, pointing at the repo the file actually came from - EasyCRM for the
          // documentation, this repo for the landing page.
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false,
        theme: { customCss: "./src/css/custom.css" },
        // On, because this site is meant to be found. Needs `url` to be right to be useful.
        sitemap: { changefreq: "weekly", priority: 0.5 },
      }),
    ],
  ],

  // Turns docs/api/openapi.yaml into endpoint pages with request and response samples.
  plugins: [
    ["docusaurus-plugin-openapi-docs", { id: "api", docsPluginId: "default", config: apiConfig() }],
  ],

  themes: [
    "docusaurus-theme-openapi-docs",
    [
      // Search is built at build time and ships with the site, so it needs no third-party
      // crawler and keeps working whatever the hosting.
      "@easyops-cn/docusaurus-search-local",
      { hashed: true, indexBlog: false, docsRouteBasePath: "/", highlightSearchTermsOnTargetPage: true },
    ],
  ],

  themeConfig: {
    // Which code samples the endpoint pages offer. Without this the theme shows all 21 of
    // its languages. Order here is the order of the tabs, and the first is the default.
    languageTabs: [
      { language: "curl", logoClass: "curl", variant: "cURL" },
      { language: "http", logoClass: "http", variant: "HTTP" },
      { language: "python", logoClass: "python", variant: "Requests" },
      { language: "javascript", logoClass: "javascript", variant: "Fetch" },
      { language: "nodejs", logoClass: "nodejs", variant: "Axios" },
      { language: "php", logoClass: "php", variant: "cURL" },
    ],
    navbar: {
      title: "EasyCRM API",
      items: [{ type: "docSidebar", sidebarId: "main", position: "left", label: "Documentation" }],
    },
    footer: {
      style: "dark",
      copyright: `EasyCRM API Documentation · last built ${new Date().getFullYear()}`,
    },
    colorMode: { respectPrefersColorScheme: true },
  },
};

module.exports = config;
