# Phase 2 candidates

**Status: not an agreed scope.** This file collects everything that has been parked, marked "Phase 2" or
left as a known gap at MVP, from three sources. The team decides which of these become phase 2. Update
this file as decisions are made, and record each decision with its date and who made it.

Sources:

- [`mvp-handover.md`](mvp-handover.md): written from the `web-api-marketplace` build history (29 October 2026).
- [`flows/`](flows/): the product flow diagrams, where white nodes with a dashed outline are "Phase 2: not built".
- The v0 roadmap (`archive/v0/roadmap.md` in `hmcts/hmcts-api-marketplace`), which deferred three whole
  capabilities. It predates the flow diagrams and the real service, so treat it as background.

## 1. From the flow diagrams (Phase 2: not built)

| Flow | Phase 2 steps |
|---|---|
| [Request new API](flows/Request_new_API.md) | Sign-in gate, submit a request, Marketplace Team review, producer review, more information from the requester, declined, approved to build |
| [Publish API](flows/Publish_API.md) | Sign-in gate, draft, review, listed, producer notified, consumer notified when listed, ongoing maintenance |
| [Request API access](flows/Request_API_access.md) | More information from the consumer or producer during review, decision sent to consumer, DAP and team |

At MVP the review and decision by DAP and the issuing of production credentials happen **by hand, offline**.
Notifying people about a production request is **partly built** (reviewers are emailed; the requester is not).
Both are candidates to bring into the product.

## 2. Parked or open at MVP (from the handover)

- **Per-API answers on the production credentials form.** DAP want both long answers for each API in the
  application. Options: pre-filled blocks per API in one box, or a separate pair of boxes per API. Open:
  whether text is required under each API, and how check answers shows it. *Clearest prototyping candidate.*
- **Requester emails.** No "request received" or decision email reaches the consumer.
- **Consumer-facing request status** beyond "submitted".
- **A reviewer (DAP) interface**, instead of working from email. Not discussed yet.
- **Producer journeys** (publish, request a new API, onboarding), switched off at MVP; producers email the team.
- **Catalogue growth**: only two APIs are listed; owning team is hard-coded and needs a real source.
- **Feedback survey** (phase banner links to `#`) and **analytics**.

## 3. Deferred in the v0 roadmap

| Capability | Note |
|---|---|
| CAP-10 Usage monitoring and analytics | Needs API gateway instrumentation |
| CAP-11 Developer and business UX | Sandbox, data dictionary, walkthroughs |
| CAP-13 Search and discovery intelligence | Advanced search beyond keywords |

Partial deferrals in the same roadmap: related APIs and full-text schema search (CAP-01), resubmit after
rejection (CAP-05), Slack/Teams and SLA reminders (CAP-07), automated deprecation notices (CAP-08),
self-service credential rotation (CAP-09; regenerating a client secret is now built), data retention
automation (CAP-12), platform announcements and usage reporting (CAP-14).

## Decisions

| Date | Decision | By |
|---|---|---|
| | *None recorded yet* | |
