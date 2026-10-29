# Request new API

```mermaid
stateDiagram-v2
    direction LR

    state "Consumer" as ReqNew_Consumer {
        [*] --> LoginGateNew
        LoginGateNew: Log in / Register
        SubmittedNew: Submitted
        MoreInfoNew1: More Info Needed
        MoreInfoNew2: More Info Needed
        DeclinedNew: Declined
    }

    state "Marketplace Team" as ReqNew_MT {
        InReviewNewMT: In Review
    }

    state "Producer" as ReqNew_Producer {
        InReviewNewProducer: In Review
        ApprovedToBuild: Approved to build
    }

    PublishAPIDraft: Publish API (Draft)

    LoginGateNew --> SubmittedNew
    SubmittedNew --> InReviewNewMT: Marketplace Team review
    InReviewNewMT --> MoreInfoNew1: needs clarification
    MoreInfoNew1 --> InReviewNewMT: responds
    InReviewNewMT --> InReviewNewProducer: hands off to Producer
    InReviewNewMT --> DeclinedNew: not feasible / duplicate
    InReviewNewProducer --> MoreInfoNew2: needs clarification
    MoreInfoNew2 --> InReviewNewProducer: responds
    InReviewNewProducer --> DeclinedNew: not feasible / duplicate (notifies Consumer)
    InReviewNewProducer --> ApprovedToBuild: approved to build
    DeclinedNew --> [*]

    ApprovedToBuild --> PublishAPIDraft: continues as Draft, see Publish_API.md
    PublishAPIDraft --> [*]

    %% ===== MVP status overlay (end-of-October MVP; basis: repo read 27 Oct 2026 + Jira story-sheet Release column) =====
    %% built = working in the product | partial = core exists | offline = by hand, outside the product | Phase 2 = not built
    classDef mvpBuilt fill:#E1EAE4,stroke:#3F6355,stroke-width:2px,color:#232733
    classDef mvpPartial fill:#F2E8D5,stroke:#8C6A22,stroke-width:2px,color:#232733
    classDef mvpOffline fill:#E3E8F0,stroke:#233A5E,stroke-width:2px,color:#232733
    classDef mvpPhase2 fill:#FFFFFF,stroke:#6B7180,stroke-width:1.5px,stroke-dasharray:4 3,color:#6B7180

    class LoginGateNew,SubmittedNew,MoreInfoNew1,MoreInfoNew2,DeclinedNew,InReviewNewMT,InReviewNewProducer,ApprovedToBuild,PublishAPIDraft mvpPhase2
```

**MVP status** (end-of-October MVP; basis: a read of the web-api-marketplace and service-api-marketplace repositories on 27 Oct 2026 and the Release column in the Jira story spreadsheets, not a test of a deployed environment). The flow itself is the target design and is unchanged; only the shading is new.

| Shading | Meaning |
|---|---|
| Green | Built: working in the product |
| Amber | Partial: the core behaviour exists, some of it does not |
| Blue | Offline: happens, but by hand outside the product |
| White, dashed grey outline | Phase 2: not built. Which Phase 2 items get delivered is for the team to decide, so these will change |

At MVP there is no Request new API flow. Suggestions are made today by contacting the team through Help and support.
