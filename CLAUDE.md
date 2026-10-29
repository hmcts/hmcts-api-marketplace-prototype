# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

The design and prototyping repo for **phase 2 of the HMCTS API Marketplace**. `main` is a static port of
the MVP front end from [`hmcts/web-api-marketplace`](https://github.com/hmcts/web-api-marketplace) (the
real service), with everything the backend does faked in the browser. Phase 2 changes are designed and
prototyped here from that baseline, for demonstration and discussion. Nothing here goes to production.

Published at <https://hmcts.github.io/hmcts-api-marketplace-prototype/> — GitHub Pages serves `docs/`
from `main`. The repo is **public**.

## Read before designing

- [`design/mvp-handover.md`](design/mvp-handover.md) — what the MVP does, the decisions behind it, the
  constraints, and a glossary. Start here.
- [`design/phase-2-candidates.md`](design/phase-2-candidates.md) — what is parked or marked Phase 2.
  **Not an agreed scope**: ask before treating any item as decided, and log decisions there.
- [`design/flows/`](design/flows/) — product flow diagrams coloured by MVP status.

## Build and run

```bash
npm install
npm run build          # renders src/views into docs/ (wipes docs/ first)
npm run check:links
python3 -m http.server 3100 --directory docs
```

`.claude/launch.json` has a `prototype` config for the same server.

## How it fits together

- Pages: `src/views/**` (Nunjucks + GOV.UK Frontend macros), copied from the real service. Keep them close
  to the real templates so a phase 2 change can be carried back.
- Every page needs an entry in `scripts/routes.json` or it is not rendered.
- `scripts/build.mjs` renders each route once, **at build time, with no data**. Root-relative links are
  rewritten to relative ones so the site works under the Pages subdirectory.
- Anything that depends on the user's data (applications, keys, requests) is filled in by client-side code
  in `src/assets/javascripts/` (`store.js` fakes the backend in `localStorage`; `applications.js` drives the
  pages). A template branch that needs server data (e.g. `{% if applicationItems.length %}`) never renders
  in the static build unless the JS supplies it.
- Copy for translated pages: `src/locales/en/`. Styles: `src/assets/scss/`. Seed APIs: `src/data/apis.json`.
- `docs/` is generated output — edit `src/` and rebuild; don't hand-edit `docs/`.

## Rules

- No real data, secrets, client IDs or keys. Anything shown must be made up. No network calls to any
  backend, including the old `hmcts-api-marketplace-auth.onrender.com`.
- GOV.UK Design System and the service's own wording ("Try it now", "production credentials",
  "application", "Going live", "My requests"). See section 5 of the handover.
- One branch and one PR per change. Don't commit, push or merge without being asked, and keep each change
  to what was asked.
- Design material goes in `design/`, never `docs/` (public site).
