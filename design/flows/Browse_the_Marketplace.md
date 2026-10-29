# Browse the Marketplace

```mermaid
stateDiagram-v2
    direction LR

    state "Visitor (not logged in)" as Visitor {
        [*] --> MarketplaceHome
        MarketplaceHome: Marketplace Home
        BrowseCatalogue: Browse API Catalogue
        BrowseGuidance: Browse Guidance
        AccessDocs: Access Documentation
        HelpSupport: Help & Support
        PublishAPI: Publish API
        APIProducerStandards: API producer standards

        MarketplaceHome --> BrowseCatalogue
        MarketplaceHome --> BrowseGuidance
        MarketplaceHome --> AccessDocs
        MarketplaceHome --> HelpSupport
        MarketplaceHome --> PublishAPI

        BrowseGuidance --> [*]
        AccessDocs --> [*]
        HelpSupport --> [*]

        PublishAPI --> APIProducerStandards
    }

    RequestNewAPI: Request new API
    RequestAPIAccess: Request API access (Try it now is the first step)
    APIForPublication: API for publication

    BrowseCatalogue --> RequestNewAPI: continues at login gate, see Request_new_API.md
    HelpSupport --> RequestNewAPI: continues at login gate, see Request_new_API.md
    BrowseCatalogue --> RequestAPIAccess: continues at login gate, see Request_API_access.md
    APIProducerStandards --> APIForPublication

    RequestNewAPI --> [*]
    RequestAPIAccess --> [*]: continues at login gate, see Request_API_access.md
    APIForPublication --> [*]: continues at login gate, see Publish_API.md

    %% ===== MVP status overlay (end-of-October MVP; basis: repo read 27 Oct 2026 + Jira story-sheet Release column) =====
    %% built = working in the product | partial = core exists | offline = by hand, outside the product | Phase 2 = not built
    classDef mvpBuilt fill:#E1EAE4,stroke:#3F6355,stroke-width:2px,color:#232733
    classDef mvpPartial fill:#F2E8D5,stroke:#8C6A22,stroke-width:2px,color:#232733
    classDef mvpOffline fill:#E3E8F0,stroke:#233A5E,stroke-width:2px,color:#232733
    classDef mvpPhase2 fill:#FFFFFF,stroke:#6B7180,stroke-width:1.5px,stroke-dasharray:4 3,color:#6B7180

    class MarketplaceHome,BrowseCatalogue,BrowseGuidance,AccessDocs,HelpSupport,APIProducerStandards,RequestAPIAccess mvpBuilt
    class PublishAPI,APIForPublication,RequestNewAPI mvpPhase2
```

**MVP status** (end-of-October MVP; basis: a read of the web-api-marketplace and service-api-marketplace repositories on 27 Oct 2026 and the Release column in the Jira story spreadsheets, not a test of a deployed environment). The flow itself is the target design and is unchanged; only the shading is new.

| Shading | Meaning |
|---|---|
| Green | Built: working in the product |
| Amber | Partial: the core behaviour exists, some of it does not |
| Blue | Offline: happens, but by hand outside the product |
| White, dashed grey outline | Phase 2: not built. Which Phase 2 items get delivered is for the team to decide, so these will change |

At MVP the home page, catalogue (A to Z, no search or filters, two APIs seeded), guidance, documentation, help (static) and producer standards are built. The route into Request API access exists; the Publish API and Request new API routes do not.
