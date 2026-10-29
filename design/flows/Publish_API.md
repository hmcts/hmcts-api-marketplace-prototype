# Publish API

```mermaid
stateDiagram-v2
    direction LR

    state "Producer" as Publish_Producer {
        [*] --> LoginGatePublish
        LoginGatePublish: Log in / Register
        Draft: Draft
        ProducerNotified: Producer notified (it's live)
        OngoingMaintenance: Ongoing API documentation & maintenance
    }

    state "Marketplace Team" as Publish_MT {
        InReviewPublish: In Review
    }

    state "System" as Publish_Sys {
        Listed: Listed
    }

    state "Consumer" as Publish_Consumer {
        ConsumerNotifiedListed: Consumer notified (new API is listed)
    }

    RequestAPIAccessEntry: Request API access (Create Application)

    LoginGatePublish --> Draft
    Draft --> InReviewPublish: submits for review
    InReviewPublish --> Draft: doesn't meet standards
    InReviewPublish --> Listed: meets publish standards
    Listed --> ProducerNotified: System notifies Producer
    ProducerNotified --> [*]
    Listed --> OngoingMaintenance: continues in a separate flow
    Listed --> ConsumerNotifiedListed: System notifies Consumer, if API was requested
    ConsumerNotifiedListed --> [*]

    Listed --> RequestAPIAccessEntry: now discoverable, Consumer requests access, see Request_API_access.md
    RequestAPIAccessEntry --> [*]

    %% ===== MVP status overlay (end-of-October MVP; basis: repo read 27 Oct 2026 + Jira story-sheet Release column) =====
    %% built = working in the product | partial = core exists | offline = by hand, outside the product | Phase 2 = not built
    classDef mvpBuilt fill:#E1EAE4,stroke:#3F6355,stroke-width:2px,color:#232733
    classDef mvpPartial fill:#F2E8D5,stroke:#8C6A22,stroke-width:2px,color:#232733
    classDef mvpOffline fill:#E3E8F0,stroke:#233A5E,stroke-width:2px,color:#232733
    classDef mvpPhase2 fill:#FFFFFF,stroke:#6B7180,stroke-width:1.5px,stroke-dasharray:4 3,color:#6B7180

    class LoginGatePublish,Draft,InReviewPublish,Listed,ProducerNotified,OngoingMaintenance,ConsumerNotifiedListed,RequestAPIAccessEntry mvpPhase2
```

**MVP status** (end-of-October MVP; basis: a read of the web-api-marketplace and service-api-marketplace repositories on 27 Oct 2026 and the Release column in the Jira story spreadsheets, not a test of a deployed environment). The flow itself is the target design and is unchanged; only the shading is new.

| Shading | Meaning |
|---|---|
| Green | Built: working in the product |
| Amber | Partial: the core behaviour exists, some of it does not |
| Blue | Offline: happens, but by hand outside the product |
| White, dashed grey outline | Phase 2: not built. Which Phase 2 items get delivered is for the team to decide, so these will change |

At MVP there is no Publish API flow. Producers add a GitHub docs workflow and email the Marketplace team.
