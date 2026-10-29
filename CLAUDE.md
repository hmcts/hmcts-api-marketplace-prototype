# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

The design and prototyping repo for **phase 2 of the HMCTS API Marketplace**. `main` is a static port of
the MVP front end from [`hmcts/web-api-marketplace`](https://github.com/hmcts/web-api-marketplace) (the
real service), with everything the backend does faked in the browser. Phase 2 changes are designed and
prototyped here from that baseline, for demonstration and discussion. Nothing here goes to production.

Published at <https://hmcts.github.io/hmcts-api-marketplace-prototype/> — GitHub Pages serves `docs/`
from `main`. The repo is **public**.

## The real product is the baseline

What is built lives in two repos. They are the source of truth for the current product, not this repo
and not the handover:

- [`hmcts/web-api-marketplace`](https://github.com/hmcts/web-api-marketplace): the front end. Default
  branch `master`. Views in `src/main/views/`, which `src/views/` here was copied from.
- [`hmcts/service-api-marketplace`](https://github.com/hmcts/service-api-marketplace): the backend. Default
  branch `master`. What it stores, emails and enforces (limits, one production request per application).

Read them alongside; don't link them in (no submodules, no shared packages). Local clone paths are in
`CLAUDE.local.md`.

**Ported from:** `web-api-marketplace` `master` at `1a792f3` (28 October 2026). PR #79 didn't record
the commit; it was matched by comparing the views. Of the 51 views in both repos, 39 were identical; the
other 12 were changed to fake the backend (PR #79 lists them). Update this line whenever the prototype is
re-synced.

**Before prototyping a change,** compare the pages involved with the same files on `web-api-marketplace`
`master`. If the real service has moved on, bring the prototype's pages up to date first, as a separate
change, so the design starts from what is live. Keep the views close to the real ones so a phase 2 change
can be carried back.

## Read before designing

- [`design/mvp-handover.md`](design/mvp-handover.md) — what the MVP does, the decisions behind it, the
  constraints, and a glossary. A snapshot of the code on 29 October 2026; check the code when it matters.
- **The design documents are not kept in this repo.** The flow diagrams, journeys, personas, Build
  Readiness, Gap Analysis, decisions log, open questions, Phase 2 drafts and the Jira-import user stories
  keep changing, so read them where they live, each time, rather than copying them here or into memory.
  Where they are is listed in `CLAUDE.local.md` (local to Aman's machine, not committed: the links are
  private). If that file is missing, ask Aman for the sources.
- **Phase 2 scope is not decided.** The team decides which Phase 2 items get delivered. Don't treat a
  Phase 2 draft or candidate as agreed.

## Build and run

```bash
npm install
npm run build          # renders src/views into docs/ (wipes docs/ first)
npm run check:links
python3 -m http.server 3100 --directory docs
```

`.claude/launch.json` has a `prototype` config for the same server.

## How it fits together

- Pages: `src/views/**` (Nunjucks + GOV.UK Frontend macros), copied from the real service (see above).
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
- Design notes for this repo go in `design/`, never `docs/` (the public site, wiped on every build). The
  repo is public: no meeting notes, colleagues' names or private links.
