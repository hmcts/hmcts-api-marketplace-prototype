# API Marketplace MVP: handover for phase 2 design and prototyping

Written 29 October 2026 by the Claude session that has been working on `web-api-marketplace` with
Aman Singh. It covers what the MVP does, why, and what is open. It is built from the code, the
READMEs, merged and open PRs, and what Aman told me in conversation.

**How to read it.** Where I am sure, I say so plainly. Anything marked **Unsure** is a gap in what
I know, not a finding. I have not been told what "phase 2" contains, so section 4 lists what was
parked, not an agreed phase 2 scope.

Contents: [1 Product](#1-the-product-in-brief) · [2 Journeys](#2-what-the-mvp-does-today) ·
[3 Decisions](#3-key-decisions-and-why) · [4 Gaps and open questions](#4-known-gaps-open-questions-and-parked-work) ·
[5 Constraints](#5-constraints-a-prototype-must-respect) · [6 Glossary](#6-glossary)

---

## 1. The product in brief

**Purpose.** The HMCTS API Marketplace is where teams find HMCTS APIs, try them, and ask for
production access. It does not build, own or run the APIs it lists. The API's own team does that
(`hmcts-api-marketplace` README: "we don't build APIs, we connect you to them").

**What the MVP covers.** Consumers browse a catalogue, sign in, create an *application*, get
sandbox ("Try it now") credentials with no review, then request production credentials for that
application. A review panel decides production requests, and people issue production credentials by
hand.

### Users and roles

| Role | Who | What they do in the MVP |
|---|---|---|
| **Consumer** | A team in HMCTS Digital and Technology Solutions, a justice-sector partner or an approved third party | Browses, creates applications, tests in sandbox, asks for production credentials. This is the only role the service supports end to end. |
| **Producer** | A team that owns and publishes an API | **Switched off in the web app.** Producers publish by emailing the Marketplace Team (PRs [67](https://github.com/hmcts/web-api-marketplace/pull/67), [70](https://github.com/hmcts/web-api-marketplace/pull/70), [72](https://github.com/hmcts/web-api-marketplace/pull/72), [73](https://github.com/hmcts/web-api-marketplace/pull/73)). The catalogue is fed from the `amp-catalog` repo. |
| **Data Access Panel (DAP)** | The HMCTS panel that reviews production requests | Gets an email per request. Decides offline. **Unsure** who sits on it. |
| **Information Asset Owner (IAO)** | Owner of the data an API exposes | Is a recipient of the review email (backend log: "reviewed by" a configured list). **Unsure** exactly how they take part. |
| **Marketplace Team** | The team running the marketplace | Receives the review email, issues production credentials by hand, is the contact address `APIMarketplace@hmcts.net`. |

There is no admin or reviewer interface. The panel works from email.

### Repos

| Repo | What it is |
|---|---|
| [`hmcts/web-api-marketplace`](https://github.com/hmcts/web-api-marketplace) | The public front end and the thing this prototype ports. Express 5, TypeScript, Nunjucks, GOV.UK Frontend. Signs the user in with Entra, renders the catalogue, calls the backend. Deployed to CNP (AKS) by Jenkins and Flux. Local clone: `/Users/AmanSingh/IdeaProjects/web-api-marketplace`. |
| [`hmcts/service-api-marketplace`](https://github.com/hmcts/service-api-marketplace) | The backend (Spring Boot, Java 25, Postgres). Stores users, applications and production requests. Registers Entra applications, creates APIM subscription keys, sends review emails through GOV.UK Notify. Its API is documented in `MARKETPLACE-API.md`, `ENTRA-APP-REGISTRATIONS.md` and `APIM-SUBSCRIPTION-KEYS.md` in that repo. |
| [`hmcts/amp-catalog`](https://github.com/hmcts/amp-catalog) | Source of the API list. The front end reads `docs/apis.json` from `main` (via `raw.githubusercontent.com`, PR [166](https://github.com/hmcts/web-api-marketplace/pull/166)). Each API's own docs site publishes an OpenAPI spec at `hmcts.github.io/<api>/openapi-spec.yml`. |
| `hmcts/cnp-flux-config` | Where the deployed configuration lives (`apps/apim/...`). I have only read about it in the READMEs. **Unsure** of details. |
| `hmcts/external-entra-id` | Where the Entra tenant and the app registration are managed. Same caveat. |
| [`hmcts/hmcts-api-marketplace`](https://github.com/hmcts/hmcts-api-marketplace) | The **old static prototype and GitHub Pages site**. Its `CLAUDE.md` describes a frozen live site, a "v2" GOV.UK Prototype Kit rebuild, and ADRs 0001 to 0005 in `design/adr/`. Local clone beside the others. I have not worked in it, so **Unsure** of its current state. |
| [`hmcts/hmcts-api-marketplace-prototype`](https://github.com/hmcts/hmcts-api-marketplace-prototype) | **This repo.** A static port of the web app's front end. No backend. |

**Naming.** The product code moved from `apim` to `amp` (AMP-1244, PR [141](https://github.com/hmcts/web-api-marketplace/pull/141)).
Some chart, vault and image names still say `apim`. The README table is partly stale on this
(PR [149](https://github.com/hmcts/web-api-marketplace/pull/149) is open to fix the docs).

---

## 2. What the MVP does today

Status key: **Built** works end to end in the real service. **Partly** works with a stand-in or a
known limit. **By hand** is done offline by people.

| Journey | Status |
|---|---|
| Browse the catalogue and read an API's page | Built (two APIs only) |
| Sign in, create an account, sign out | Built in sandbox. Off in AAT and demo. |
| Local sign-in without Entra (`BYPASS_ENTRA`) | Built, development only |
| Create, view, change and delete an application | Built |
| Try it now credentials and keys | Built (sandbox) |
| Client secret handling | Built |
| Production credentials request | Built to submission. Review and issuing **by hand**. |
| My requests and account page | Built |
| Content pages | Built, trimmed down |
| Emails to the requester | Not built |

### 2.1 Browse the catalogue

- **Routes:** `/api-catalogue` (list and search) and `/api-catalogue/:api` (detail). Anyone can browse
  without signing in.
- **Only two APIs are listed:** Scheduling and Listing Court Schedule (`api-cp-crime-schedulingandlisting-courtschedule`, short code `slc`) and Refdata Court Hearing Courthouses (`api-cp-refdata-courthearing-courthouses`, `rcc`). A config list (`catalogue.listedApis`, env `CATALOGUE_LISTED_APIS`) filters the feed. An API outside the list is "not found".
- **Detail page order** (PR [138](https://github.com/hmcts/web-api-marketplace/pull/138)): heading, "What does this API do?" with the description, "Use this API" with a green **Add to a new application** button, "About this API" summary, then Documentation. The "Request access to this API" text link was removed (Aman: "we will keep the green button").
- **Description** is the full text from the API's OpenAPI spec, with the feed's short description as a fallback (PR [137](https://github.com/hmcts/web-api-marketplace/pull/137)).
- **Owning team is hard-coded** to "Crime - Scheduling and Listing" for both APIs (`OWNING_TEAM` in `ApiCatalogueController.ts`). The feed's team is a GitHub team slug (`api-marketplace`), not an owner. The real owner of the reference-data API may differ. The "Maintained by" line was removed from the list page.
- The catalogue search hint still says "or team". That is a leftover.

### 2.2 Sign-in

- **Entra External ID** (a Microsoft customer identity service) handles sign-in, account creation, email confirmation and password reset. No password reaches the marketplace. It uses an OpenID Connect authorisation-code flow with PKCE, a `state` and a `nonce`, and verifies the ID token's signature, issuer, audience and expiry (README "Signing in", PR [79](https://github.com/hmcts/web-api-marketplace/pull/79)).
- After sign-in the web app posts the user's Entra object id, email and name to the backend `POST /session`, which creates or updates the user. If the backend cannot be reached, sign-in says it is unavailable and no session starts. Every sign-in lands on `/account` (PR [94](https://github.com/hmcts/web-api-marketplace/pull/94)).
- Entra holds a **single display name**, not first and last. The account page's Name row shows it.
- **Create an account** is `/sign-in?prompt=create`. `/register` still exists but is going away (see section 5).
- **Where it is on:** sandbox only. AAT and demo have `ENTRA_ENABLED=false`, so sign-in says it is unavailable there (README "Outstanding", PR [156](https://github.com/hmcts/web-api-marketplace/pull/156)). Previews have it off because Entra takes no wildcard redirect URIs.
- **`BYPASS_ENTRA=true`** (PR [115](https://github.com/hmcts/web-api-marketplace/pull/115), AMP-1288) skips Entra and signs in as a fixed user, John Doe (`john.doe@example.com`). It needs `NODE_ENV=development`, refuses to run otherwise, and still needs a backend running because the user is saved there. This is what the prototype imitates.

### 2.3 Applications

An **application** is the unit a consumer works with: one Entra app registration (Client ID and
secret) plus an APIM subscription key per API.

- **Routes:** `/account/applications` (list), `/new/...` (create), `/:id`, `/:id/apis` (change APIs), `/:id/apis/:api` (view a key), `/:id/client-secret` (regenerate), `/:id/delete`.
- Created for real through the backend, which talks to Entra and APIM (AMP-1103, PRs [99](https://github.com/hmcts/web-api-marketplace/pull/99), [101](https://github.com/hmcts/web-api-marketplace/pull/101), [104](https://github.com/hmcts/web-api-marketplace/pull/104), [124](https://github.com/hmcts/web-api-marketplace/pull/124)).
- Creating takes several seconds (Entra registration is about 2 to 7 seconds on its own, plus about 0.7 seconds per API). PR [147](https://github.com/hmcts/web-api-marketplace/pull/147) (open) disables the button and says "Creating your application. This can take up to a minute..."
- **Application page** shows the Client ID, the APIs with their keys, the "How to get an access token and call an API" panel (curl commands, shown for Scheduling and Listing only), and a **Going live** link to the production credentials form with the application preselected (`?application=<id>`).
- **Limit of 5 applications per user** is built in the backend (PR [173](https://github.com/hmcts/service-api-marketplace/pull/173), open) and the web app (PR [155](https://github.com/hmcts/web-api-marketplace/pull/155), open). Neither is merged yet, so it is not live. At the limit the "Add new application" button is replaced by text that says "You can have up to 5 applications. Delete an application you no longer need before you add another."
- The subscription key header name is shown to users (AMP-1319, PR [140](https://github.com/hmcts/web-api-marketplace/pull/140)). The gateway address per environment is PR [139](https://github.com/hmcts/web-api-marketplace/pull/139) (open).

### 2.4 Try it now and sandbox credentials

- **Try it now** means sandbox, issued automatically with **no review**. There is no environment choice in the journey any more (AMP-1247, PR [63](https://github.com/hmcts/web-api-marketplace/pull/63)).
- Each API maps to a "try it now" product in APIM (`tryItNowProductId`, gateway path `amp/try/<short code>`). The backend `GET /products` lists them, seeded with `slc` and `rcc` only.
- The old "request access to an API" (subscribe) journey is **retired**: you add an API to an application instead. `Request_API_access.md` in the old repo's `design/flows/` is the earlier design.

### 2.5 Production credentials request

Route `/account/production-credentials` (`ProductionCredentialsController`). It asks for:

1. **Which application is going live?** A radio per application you own.
2. **Organisation or team name.**
3. **When do you plan to go live?** A day, month and year date. It must be a real date in the future.
4. **Expected call volume in production:** Low (under 1,000 calls a day), Medium (1,000 to 100,000) or High.
5. **Data request:** a long answer on how the data will be used, for each API selected in the application, any combination with other data, and why it is needed.
6. **Proposed outputs:** a long answer on outputs, what they aim to achieve, and how and where they will be shared.

Then **check answers**, then a **confirmation page** with a reference like `PCR-XXXXXXXX`.

- Stored in the **backend** (AMP-1288, PR [120](https://github.com/hmcts/web-api-marketplace/pull/120)). Listed under **My requests** on the account page, each linking to a read-only view.
- **Nothing is issued by the system.** The backend says so in its code and docs: client ids, secrets, keys and publisher ids "are still created by hand offline; the Data Access Panel decides".
- On submit the backend emails the Panel, the IAO and the marketplace team through GOV.UK Notify. **The requester is deliberately not a recipient.** The requester's own address goes into the email body in backend PR [168](https://github.com/hmcts/service-api-marketplace/pull/168) (AMP-1352, open).
- **One production request per application** (backend, merged; `409` on a second). The web side, PR [150](https://github.com/hmcts/web-api-marketplace/pull/150) (open), shows "You have asked for production credentials for this application. View production request PCR-..." and drops that application from the form's radios.
- **Users cannot delete a request** (PR [146](https://github.com/hmcts/web-api-marketplace/pull/146)). The backend still has a delete call that the web app no longer uses.
- The question set was trimmed in stages (PRs [118](https://github.com/hmcts/web-api-marketplace/pull/118), [119](https://github.com/hmcts/web-api-marketplace/pull/119), [123](https://github.com/hmcts/web-api-marketplace/pull/123)). I removed fields on Aman's instruction. I do not have the reasons from the panel's side.
- **Answer length is 2,000 characters** for both long answers. The backend limit (AMP-1103, backend PR [166](https://github.com/hmcts/service-api-marketplace/pull/166)) is merged. Web PR [169](https://github.com/hmcts/web-api-marketplace/pull/169) raises the form's limit from 1,000 to match, and is open. Both fields are required and use the GOV.UK character count.

### 2.6 Client secret handling

- The client secret is shown **once**, on the page after an application is created. Entra returns it once and cannot read it back, so a lost secret means regenerating it (`/:id/client-secret`).
- Subscription keys are the opposite: always recoverable from APIM, so the key page can show them again.
- The backend answers `404`, not `403`, for someone else's application, so it never confirms that an application exists (`MARKETPLACE-API.md`).

### 2.7 Account

- `/account` shows the user's name and email, a **My requests** list (reference, type, submitted, status), and links to applications. A "what you can do next" section was removed then brought back in a short form. The "Your developer account" section on the home page for signed-in users was removed.
- The earlier "Account type / I am registering as" role field was dropped (AMP-1284, PR [93](https://github.com/hmcts/web-api-marketplace/pull/93)).

### 2.8 Content pages

Served from `ContentController` as fixed routes. Currently routed: `/get-started`, `/documentation`,
`/documentation/consumer-guidance`, `/documentation/producer-guidance`, `/documentation/producer-standards`,
`/help`, `/privacy`. The home page, cookies and accessibility statement have their own controllers.

- **Get started** is a numbered consumer path: browse the catalogue (no account needed), sign in or create an account, create an application for Try it now, test with dummy data, request production credentials, the Data Access Panel reviews, approved credentials are issued by the Marketplace Team. **Consumer guidance** repeats the same steps and adds a Terms of use section.
- Pages taken off the site for now (files kept, routes removed): the data governance standards page (PR [127](https://github.com/hmcts/web-api-marketplace/pull/127)), and a set of unreachable pages (PR [129](https://github.com/hmcts/web-api-marketplace/pull/129)).
- **Producers** are told to publish by email to the Marketplace Team (PRs 70, 71, 97).

---

## 3. Key decisions and why

| Decision | Why | Where |
|---|---|---|
| **Entra External ID for developer accounts**, no local passwords | No passwords in the service. Entra does account creation, verification and reset. Local accounts were stand-ins. | AMP-1267/1284, PRs 79, 91 to 94. PR [88](https://github.com/hmcts/web-api-marketplace/pull/88) (open) deletes the local sign-in code. |
| **Developer accounts ADR** | An ADR on the accounts approach exists on branch `docs/adr-developer-accounts`, unmerged. I have not read it closely. **Unsure** of its status. | branch only |
| **Backend is the system of record** for users, applications, requests | The front end only had stand-ins at first. Everything now goes through `service-api-marketplace`. | PRs 99, 104, 120 |
| **Applications register through the backend, which talks to Entra and APIM** | One Entra app registration per application and one APIM subscription key per API give a consumer a Client ID, secret and key. | AMP-1103, `ENTRA-APP-REGISTRATIONS.md`, `APIM-SUBSCRIPTION-KEYS.md` |
| **Ownership is carried in the subscription name**, prefixed `amp-user001-` | Nothing about an APIM subscription is kept in the database, and the APIM instance is shared with SPS. | backend `APIM-SUBSCRIPTION-KEYS.md` |
| **`404` not `403` for someone else's data** | A 403 would confirm that it exists. | backend `MARKETPLACE-API.md` |
| **Production credentials are requested through an application** | Aman: production access is requested from the same application tested in Try it now. There is no separate form or email route. | PRs 111, 118 to 123 |
| **One production request per application** | A second is a duplicate ask, not a second thing being asked for. | backend PR 163, web PR 150 |
| **Production issuance stays manual** | The panel decides and people create credentials. The system records the ask. | backend docs |
| **Users cannot delete their requests** | The section is where production requests are shown. Deleting them was removed on Aman's decision. | PR 146 (also PR 121, a removal of My requests that Aman reversed) |
| **Answers capped at 2,000 characters** | The team agreed it. The backend and the form must match, or the form refuses what the backend would accept. | backend PR 166, web PR 169 |
| **Max 5 applications per user** | I do not have the stated reason. The backend checks before it calls Entra, so a refused request uses no app registration. Configurable (`APPLICATIONS_MAX_PER_USER`). | AMP-1307, PRs 155, 173 (open) |
| **No environment choice** | Try it now is sandbox only. | AMP-1247, PR 63 |
| **Content migrated into the service** from the old GitHub Pages site | One place, GOV.UK templates. | AMP-1247, PRs 54, 55 |
| **Producer publishing is by email**, not a journey | Switched off while the process settles. | PRs 67 to 73 |
| **Data governance standards page off the site** | Aman asked, for now. Links to it were reworded. | PR 127 |
| **Move from `apim` to `amp`** | Product naming. | AMP-1244, PRs 141, 148, 154, 156 |
| **Node 22.23.4 pinned** and vulnerable-dependency audit | Platform requirement. | AMP-1328, PRs 144, 145 |

**Accessibility and GOV.UK conformance.** The web app uses GOV.UK Frontend 5.14 components and a
phase banner. It has an accessibility statement page, a cookie banner and `src/test/routes/links.ts`
(a crawl that fails the build on any broken internal link). It also has a Jest a11y config and Playwright
tests. Aman asked me to check that the green button matches GOV.UK styling and that text sizes are
consistent. **Unsure** whether a formal audit of the web app has been done. The old repo has a
conformance audit of the old site (`design/audit/`).

---

## 4. Known gaps, open questions and parked work

### Things Aman parked or is waiting on

- **Pre-filling the two long production answers** with the names of the APIs in the chosen application. The need is real: DAP want an answer to both questions **for each API** in the application. I proposed pre-filling one block per API (server side, with a small script to update untouched boxes when the application radio changes). **Aman is discussing it with the team.** The 2,000-character limit is now decided. Still open: whether to require text under each API's name, how check-answers shows it, and the alternative of a **separate pair of boxes per API**. Nothing is built. This is the clearest candidate for prototyping.
- **Catalogue only lists two APIs.** More come in "as each is confirmed against the instance" (backend docs).
- **Owning team** needs a real source (`OWNING_TEAM` is a constant).
- **Backend repo and local running**: working locally now (Colima, Postgres, `ENTRA_BYPASS=true ./gradlew bootRun`).

### In flight (open PRs, not live)

[web 169](https://github.com/hmcts/web-api-marketplace/pull/169) 2,000 characters · [web 155](https://github.com/hmcts/web-api-marketplace/pull/155) and [backend 173](https://github.com/hmcts/service-api-marketplace/pull/173) application limit · [web 150](https://github.com/hmcts/web-api-marketplace/pull/150) one request per application · [web 147](https://github.com/hmcts/web-api-marketplace/pull/147) "creating" message · [web 139](https://github.com/hmcts/web-api-marketplace/pull/139) gateway per environment · [web 167](https://github.com/hmcts/web-api-marketplace/pull/167) stop defaulting to the abandoned app registration · [backend 168](https://github.com/hmcts/service-api-marketplace/pull/168) requester email on the review email · [backend 154](https://github.com/hmcts/service-api-marketplace/pull/154) retry the role grant · [web 88](https://github.com/hmcts/web-api-marketplace/pull/88) remove local sign-in.

### Gaps and tech debt (from the README "Outstanding" list and my own notes)

- **No emails to the requester.** The backend emails the reviewers only. The web app has a Notify stand-in (`services/Notify.ts`) for a "production request received" email, and it sends nothing (the log says "GOV.UK Notify is not connected"). **Unsure** whether any requester email is planned. The `notify.showEmailsOnPage` config and a README line about an on-screen email preview are leftovers: the preview component was deleted.
- **No feedback survey.** The phase banner links to `#`.
- **No analytics or RUM.** The GTM and Dynatrace identifiers are empty on purpose.
- **App Insights is stubbed** (`APPLICATIONINSIGHTS_ENABLED: 'false'`).
- **Entra is off in AAT and demo.** Needs a tenant, registration and redirect URIs.
- **No consumer-facing status** for a production request beyond its stored status. **Unsure** what statuses the backend uses beyond `SUBMITTED`.
- **The reference-data API's page and example calls**: the curl panel exists for Scheduling and Listing only.
- **README is partly stale.** The "stand-ins" section still says production requests are stored locally, which changed in PR 120.
- **Backend `delete production request` and `delete application`** exist. Only application delete is used by the web app.
- **Production environment** has no gateway address for the example calls yet ("prod, for now").
- **Cookie preferences cookie name**: PRs 162, 165, 166 and 168 renamed, reverted and renamed it again. Check the final value in code before copying.

### "Later", "phase 2" or "post-MVP" signals

I never recorded a document that says "phase 2". What I can point to:

- The **old repo's design docs** describe "Phase 1 vertical slice" and a consumer/producer detailed design against the product owner's MoSCoW requirements (`design/specs/2026-09-11-consumer-producer-detailed-design.md`, `design/plans/`). **Unsure** how those map to your phase 2.
- **Producer journeys** (publish an API, request a new API, producer onboarding) were switched off, not deleted. The old repo's `design/flows/Publish_API.md` and `Request_new_API.md` hold the earlier flows.
- **Producer onboarding and publish guidance** overlap a lot. Aman asked to move them under Documentation and rename the pages (PRs 77, 78, 97).
- The **Data Access Panel step is manual**. A reviewer-facing interface was not discussed.
- Per-API answers on the production form (above).

### What stakeholders asked for

Only what reached me through Aman. I did not speak to stakeholders. The requests I know of: per-API answers to both questions (from the panel's needs), the 2,000-character limit, the contact address `APIMarketplace@hmcts.net`, trimming the production questions, and fewer pages on the site.

---

## 5. Constraints a prototype must respect

### Design system and content style

- **GOV.UK Design System and GOV.UK Frontend** components. The service is a GOV.UK-styled service. The old repo's ADR 0001 records the branding decision and the interim licence non-conformance.
- **Email contact is exactly `APIMarketplace@hmcts.net`**, used as the link text of a `mailto:` link (GOV.UK style guide: show the address, not "email us"). Where a page says "contact the API Marketplace", that is the link. (From Aman's instructions.)
- **Use the service's own wording:** "Try it now", "production credentials", "application", "Add to a new application", "Going live", "My requests". Question labels on the form are long sentences. Do not rename them without asking.
- **Steps are numbered lists** that match between Get started and Consumer guidance. They must stay aligned. Aman prefers short paragraphs to heavy lists and edited copy to be tighter. Aman has repeatedly removed explanatory text.
- **Do not describe production access as an email or a separate form.** It is requested from the application you tested.
- Keep one font size within a block of body text. Use the GOV.UK green button for the primary action.

### Hosting and security

- **The prototype is on GitHub Pages and is not production code.** Its README says it will not progress to production, has no real data and no secrets. The old repo's ADR 0004 notes that Pages cannot set security response headers.
- **Never put real secrets, client IDs or keys in the prototype.** Keys the prototype shows must be made up, as the backend's `ENTRA_BYPASS` ones are.
- **The real service** runs on CNP (AKS) with workload identity and Key Vault, HTTPS in development with a self-signed certificate, rate limiting and `helmet`. A prototype need not reproduce these but should not suggest weaker behaviour (for example showing a secret again after the first view).
- **Do not add calls to the old unsanctioned auth backend** (`hmcts-api-marketplace-auth.onrender.com`). The old repo's ADR 0003 forbids it.

### Things Aman told me not to do

- **Do not edit `/register` or local accounts.** The Entra flow replaces them. Aman discarded in-progress edits for that reason (13 October 2026). (Saved in my memory as `register-page-to-be-replaced-by-entra`.)
- **Keep the prototype and the web app as separate repos.**
- **One branch and one PR per change.** Aman reviews locally before anything is committed. Nothing is merged or enabled for auto-merge without Aman's say. Each step (pull, install, restart, delete a branch) is a separate approval.
- **Do not expand the work beyond what was asked.** When Aman asks for a page change, change that page only.

### Practical notes for working locally

- Web app: `BYPASS_ENTRA=true corepack yarn start:dev` (Node 22 or newer), served over HTTPS at `https://localhost:3344`.
- Backend: `docker-compose up -d db`, then `ENTRA_BYPASS=true ./gradlew bootRun` with `JAVA_HOME=/opt/homebrew/opt/openjdk@25`. Colima is the Docker engine on this machine.
- The catalogue needs `raw.githubusercontent.com`. Earlier in October, `hmcts.github.io` was unreachable from Aman's network (connection reset), which is what PR 166 worked around.

---

## 6. Glossary

| Term | Meaning |
|---|---|
| **AMP** | API Marketplace. Product code after the move from `apim`. |
| **APIM** | Azure API Management, the gateway that fronts the APIs and issues subscription keys. The sandbox instance is `sps-api-mgmt-sbox`, shared with SPS. |
| **Application** | A consumer's registration: an Entra app registration (Client ID and secret) plus one APIM subscription key per API. |
| **Client ID / Client secret** | Entra credentials an application uses to get a token. The secret is shown once. |
| **Subscription key** | An APIM key for one API, always recoverable. |
| **Try it now** | Sandbox access, issued automatically with no review. |
| **Production credentials** | The live equivalents, requested through an application, reviewed by the DAP and issued by hand. |
| **PCR-XXXXXXXX** | Reference minted for each production credentials request. |
| **DAP** | Data Access Panel, which reviews production requests. |
| **IAO** | Information Asset Owner, the owner of the data an API exposes. |
| **DSA** | Data Sharing Agreement, needed where personal data is shared. |
| **Producer / Consumer** | The team that owns and publishes an API / a team that uses it. |
| **Marketplace Team** | The team running the marketplace. Contact `APIMarketplace@hmcts.net`. |
| **Entra External ID** | Microsoft's customer identity service. Handles developer accounts. |
| **OIDC / PKCE / `oid`** | OpenID Connect sign-in flow, the proof key that protects the code exchange, and the Entra user's object id. |
| **`BYPASS_ENTRA` / `ENTRA_BYPASS`** | Development switches that fake Entra in the web app and backend respectively. |
| **SLC** | Scheduling and Listing Court Schedule API. Short code `slc`. |
| **RCC** | Refdata Court Hearing Courthouses API. Short code `rcc`. |
| **Short code** | The key for an API in the backend. It is the APIM path segment after `amp/`. |
| **Notify** | GOV.UK Notify, which sends the review emails. |
| **CNP / CFT / AKS** | Cloud Native Platform, the HMCTS hosting platform; CFT, the cluster group the service deploys to (I am not sure of the expansion); Azure Kubernetes Service. |
| **Flux** | The GitOps tool that deploys charts from `cnp-flux-config`. |
| **sbox / AAT / demo / prod** | Environments: sandbox, test, demo and live. |
| **OpenAPI spec** | The machine-readable description of an API, published on each API's docs site. |
| **ADR** | Architecture decision record. |
| **AMP-nnnn** | Jira ticket keys, at `https://tools.hmcts.net/jira/browse/AMP-nnnn`. |
