# EasyCRM API Documentation

The customer-facing documentation site for the EasyCRM portal API, at
**https://umerghouri.github.io/easycrm-api-docs/** until a custom domain is attached.

The repo is owned by `UmerGhouri` (the EasyCRM owner); the original developer is a collaborator.
The look is the client's own design, recorded in [DESIGN.md](./DESIGN.md).

## Where the content actually lives

**Not here.** Every page except the landing page is pulled from `EasyCRM/docs/` at build time:

| Source (in the EasyCRM repo) | Appears at |
|---|---|
| `docs/api-integration/` | `/api-integration/…` |
| `docs/api/openapi.yaml` | `/api/` (generated endpoint pages) |
| — | `/` comes from `content/index.md`, in THIS repo |

So the API documentation is edited in the repo that ships the API, and this site rebuilds.
Editing it here would just be overwritten on the next build.

## Why this is separate from the internal docs site

The internal site pulls `docs/` from **every** repo it can see, which is right for an internal
hub and wrong for a customer's domain: a repo that adds a `docs/` folder next year would appear
on it. `scripts/fetch-docs.mjs` instead names the two folders it will fetch and nothing else,
so new content cannot arrive here by accident.

It also means this site's token only needs read access to one private repo, not to all of them.

## Setup

1. Repo variable `DOCS_ORG` = `UmerGhouri`, `DOCS_REPO` = `EasyCRM` (our repo, where every
   developer release is merged - never the developer's own fork, so the public site cannot
   depend on access he controls).
2. Repo secret `DOCS_DEPLOY_KEY` = the private half of a **read-only deploy key** added to
   `UmerGhouri/EasyCRM` (Settings, Deploy keys). Scoped to that one repo and tied to no
   person. To rotate: `ssh-keygen -t ed25519 -N "" -f k`, `gh repo deploy-key add k.pub -R
   UmerGhouri/EasyCRM`, `gh secret set DOCS_DEPLOY_KEY -R UmerGhouri/easycrm-api-docs < k`,
   delete the old key, delete the local files. A fine-grained PAT in `DOCS_SYNC_TOKEN`
   still works as a fallback when no deploy key is set.
3. Settings → Pages → Source: **GitHub Actions**.
4. Repo variable `PUBLISH_TARGET` = `github-pages`. Nothing is published until this is set.

### Moving to a custom domain

Two variables, no code change:

- `DOCS_SITE_URL` = `https://docs.example.com`
- `DOCS_BASE_URL` = `/`  ← **required**: a custom domain serves at the root, and leaving the
  default `/easycrm-api-docs/` makes every asset resolve one directory too high and the site 404s.

Then Settings → Pages → Custom domain, and tick Enforce HTTPS once the certificate is issued.

## Running it locally

```bash
export DOCS_TOKEN=$(gh auth token)   # any token that can read UmerGhouri/EasyCRM
npm install
npm start
```

Search only works in a production build (`npm run build && npm run serve`) — the index is
generated at build time, so the dev server has none and every query returns "No results".
