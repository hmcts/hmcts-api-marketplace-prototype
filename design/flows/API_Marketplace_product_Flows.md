# API Marketplace Product Flows

```mermaid
stateDiagram-v2
    direction LR

    %% ===== Browse the Marketplace =====
    state "Visitor (not logged in)" as Visitor {
        [*] --> MarketplaceHome
        MarketplaceHome: Marketplace Home
        BrowseCatalogue: Browse API Catalogue
        BrowseGuidance: Browse Guidance
        AccessDocs: Access Documentation
        HelpSupport: Help & Support
        PublishAPIEntry: Publish API
        APIProducerStandards: API producer standards

        MarketplaceHome --> BrowseCatalogue
        MarketplaceHome --> BrowseGuidance
        MarketplaceHome --> AccessDocs
        MarketplaceHome --> HelpSupport
        MarketplaceHome --> PublishAPIEntry

        BrowseGuidance --> [*]
        AccessDocs --> [*]
        HelpSupport --> [*]

        PublishAPIEntry --> APIProducerStandards
    }

    %% ===== Request new API =====
    state "Consumer (Request new API)" as ReqNew_Consumer {
        LoginGateNew: Log in / Register
        SubmittedNew: Submitted
        MoreInfoNew1: More Info Needed
        MoreInfoNew2: More Info Needed
        DeclinedNew: Declined
    }

    state "Marketplace Team (Request new API)" as ReqNew_MT {
        InReviewNewMT: In Review
    }

    state "Producer (Request new API)" as ReqNew_Producer {
        InReviewNewProducer: In Review
        ApprovedToBuild: Approved to build
    }

    %% ===== Publish API =====
    state "Producer (Publish API)" as Publish_Producer {
        LoginGatePublish: Log in / Register
        Draft: Draft
        ProducerNotified: Producer notified (it's live)
        OngoingMaintenance: Ongoing API documentation & maintenance
    }

    state "Marketplace Team (Publish API)" as Publish_MT {
        InReviewPublish: In Review
    }

    state "System (Publish API)" as Publish_Sys {
        Listed: Listed
    }

    state "Consumer (Publish API)" as Publish_Consumer {
        ConsumerNotifiedListed: Consumer notified (new API is listed)
    }

    %% ===== Request API access =====
    state "Consumer (Request API access)" as ReqAccess_Consumer {
        LoginGateAccess: Log in / Register
        CreateApplication: Create Application (for the Try it now environment)
        TestTryItNow: Test via Try it now
        RequestProd: Requests Prod access
        ProvidesInfoConsumer: Provides further information (about the data, to help DAP's review)
        NotifyDecisionConsumer: Notify of decision
    }

    state "DAP (Request API access)" as ReqAccess_DAP {
        NotifiedDAP: Notified
        InReviewAccess: In Review (checks terms & conditions, reviews who + why)
        ApprovedDeclinedAccess: Approved / Declined
        NotifyDecisionDAP: Notify of decision
    }

    state "Producer (Request API access)" as ReqAccess_Producer {
        NotifiedProducer: Notified
        ProvidesInfoProducer: Provides further information (about the data, to help DAP's review)
    }

    state "System (Request API access)" as ReqAccess_Sys {
        IssueTryItNowCreds: Issue Try it now credentials (automatic, no review needed)
        NotifyProdRequest: Notify of Prod request
    }

    state "API Marketplace Team (Request API access)" as ReqAccess_Team {
        NotifiedTeam: Notified
        NotifyDecisionTeam: Notify of decision
        IssueProdCreds: If approved, issue Prod credentials / keys
    }

    %% ----- Request new API transitions -----
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

    %% ----- Publish API transitions -----
    LoginGatePublish --> Draft
    Draft --> InReviewPublish: submits for review
    InReviewPublish --> Draft: doesn't meet standards
    InReviewPublish --> Listed: meets publish standards
    Listed --> ProducerNotified: System notifies Producer
    ProducerNotified --> [*]
    Listed --> OngoingMaintenance: continues in a separate flow
    Listed --> ConsumerNotifiedListed: System notifies Consumer, if API was requested
    ConsumerNotifiedListed --> [*]

    %% ----- Request API access transitions -----
    LoginGateAccess --> CreateApplication
    CreateApplication --> IssueTryItNowCreds: creates application
    IssueTryItNowCreds --> TestTryItNow: credentials ready
    TestTryItNow --> RequestProd
    RequestProd --> NotifyProdRequest: same application

    NotifyProdRequest --> NotifiedDAP
    NotifyProdRequest --> NotifiedProducer
    NotifyProdRequest --> NotifiedTeam

    NotifiedDAP --> InReviewAccess
    InReviewAccess --> ProvidesInfoConsumer: more info needed (Consumer)
    ProvidesInfoConsumer --> InReviewAccess: responds
    InReviewAccess --> ProvidesInfoProducer: more info needed (Producer)
    ProvidesInfoProducer --> InReviewAccess: responds
    InReviewAccess --> ApprovedDeclinedAccess

    ApprovedDeclinedAccess --> NotifyDecisionDAP
    NotifyDecisionDAP --> NotifyDecisionConsumer
    NotifyDecisionDAP --> NotifyDecisionTeam

    NotifyDecisionConsumer --> [*]
    NotifyDecisionTeam --> IssueProdCreds: if approved
    IssueProdCreds --> [*]

    %% ----- Links between the four flows -----
    BrowseCatalogue --> LoginGateNew: continues at login gate
    HelpSupport --> LoginGateNew: continues at login gate
    APIProducerStandards --> LoginGatePublish: continues at login gate
    BrowseCatalogue --> LoginGateAccess: continues at login gate, Try it now is the first step
    ApprovedToBuild --> Draft: continues as Draft
    Listed --> LoginGateAccess: now discoverable, Consumer requests access

    %% ===== MVP status overlay (end-of-October MVP; basis: repo read 27 Oct 2026 + Jira story-sheet Release column) =====
    %% built = working in the product | partial = core exists | offline = by hand, outside the product | Phase 2 = not built
    classDef mvpBuilt fill:#E1EAE4,stroke:#3F6355,stroke-width:2px,color:#232733
    classDef mvpPartial fill:#F2E8D5,stroke:#8C6A22,stroke-width:2px,color:#232733
    classDef mvpOffline fill:#E3E8F0,stroke:#233A5E,stroke-width:2px,color:#232733
    classDef mvpPhase2 fill:#FFFFFF,stroke:#6B7180,stroke-width:1.5px,stroke-dasharray:4 3,color:#6B7180

    class MarketplaceHome,BrowseCatalogue,BrowseGuidance,AccessDocs,HelpSupport,APIProducerStandards,LoginGateAccess,CreateApplication,IssueTryItNowCreds,TestTryItNow,RequestProd mvpBuilt
    class NotifyProdRequest,NotifiedDAP,NotifiedProducer,NotifiedTeam mvpPartial
    class InReviewAccess,ApprovedDeclinedAccess,IssueProdCreds mvpOffline
    class PublishAPIEntry,LoginGateNew,SubmittedNew,MoreInfoNew1,MoreInfoNew2,DeclinedNew,InReviewNewMT,InReviewNewProducer,ApprovedToBuild,LoginGatePublish,Draft,InReviewPublish,Listed,ProducerNotified,OngoingMaintenance,ConsumerNotifiedListed,ProvidesInfoConsumer,ProvidesInfoProducer,NotifyDecisionConsumer,NotifyDecisionDAP,NotifyDecisionTeam mvpPhase2
```

**MVP status** (end-of-October MVP; basis: a read of the web-api-marketplace and service-api-marketplace repositories on 27 Oct 2026 and the Release column in the Jira story spreadsheets, not a test of a deployed environment). The flow itself is the target design and is unchanged; only the shading is new.

| Shading | Meaning |
|---|---|
| Green | Built: working in the product |
| Amber | Partial: the core behaviour exists, some of it does not |
| Blue | Offline: happens, but by hand outside the product |
| White, dashed grey outline | Phase 2: not built. Which Phase 2 items get delivered is for the team to decide, so these will change |

At MVP the Browse the Marketplace flow and the first half of Request API access (application, Try it now credentials, one production request per application) are built or partly built. DAP's review and decision and the production credentials happen offline by hand. Request new API, Publish API and the information-request and decision-notification steps are Phase 2.
