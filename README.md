# HMCTS API Marketplace — prototypes

Prototypes built for demonstration and discussion.

Nothing here is production code, and none of it will progress to a production environment. No real
data, no secrets. The earlier marketplace prototype is on the `main-old` branch.

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
