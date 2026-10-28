# HMCTS API Marketplace — prototypes

Prototypes built for demonstration and discussion.

Nothing here is production code, and none of it will progress to a production environment. No real
data, no secrets. The earlier marketplace prototype is on the `main-old` branch.

## Where it is published

<https://hmcts.github.io/hmcts-api-marketplace-prototype/>

GitHub Pages serves `docs/` from `main`. A push to `main` rebuilds the site on its own, but
changing the Pages source branch does not — if the site is stale after a settings change, ask for
a build:

```bash
gh api -X POST repos/hmcts/hmcts-api-marketplace-prototype/pages/builds
```

Check what is actually deployed, rather than assuming the latest commit is live:

```bash
gh api repos/hmcts/hmcts-api-marketplace-prototype/pages/builds/latest --jq '{status, commit}'
```

The previous marketplace site is on the `main-old` branch. Pointing Pages back at it is a
settings change, not a revert.

## This prototype

A static build of the HMCTS API Marketplace front end, ported from `web-api-marketplace`. The views
are the real service's Nunjucks templates; everything the real service gets from a backend is faked
in the browser instead.

```bash
npm install
npm run build     # renders src/views into docs/
```

Then serve `docs/` — for example `python3 -m http.server 3100 --directory docs`.

**What is faked.** There is no server and no network call. Sign-in puts a fixed example user
(John Doe) in `localStorage` rather than going to Microsoft Entra — the same user the real service
uses for `BYPASS_ENTRA=true`. Applications, their client IDs, secrets and subscription keys are
generated in the browser and stored in `localStorage`; clearing site data resets the prototype.
The API list in the "add an application" journey is seeded from `src/data/apis.json`.

**Layout.** Pages are in `src/views/`, copy for the few translated pages in `src/locales/en/`,
styles in `src/assets/scss/`, and the client-side code that stands in for the backend in
`src/assets/javascripts/`. A new page needs an entry in `scripts/routes.json` or it will not be
rendered.
