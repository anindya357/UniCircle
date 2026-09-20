# UniCircle design documents

These project-owner-requested, **working** designs guide Phase 7. They describe intended behavior; they do not mean the tables, endpoints, worker, or AI integration are already implemented.

| Artifact | Purpose |
| --- | --- |
| [HLD](HLD.md) | System architecture, runtime components, trust boundaries, deployment shape |
| [LLD](LLD.md) | Module responsibilities, planned API surface, state transitions, transaction rules |
| [ERD](ERD.md) | Logical entities, relationships, constraints, authentication/session storage |
| [Document flow diagram](Document_Flow_Diagram.md) | Forms, review records, notifications, and development artifact handoffs |
| [Data flow diagrams](Data_Flow_Diagram.md) | System context, processes, stores, and authentication data movement |
| [Sequence diagrams](Sequence_Diagram.md) | Order and failure branches for authentication, club/event, chat, notifications, RAG |
| [Use-case diagrams](Use_Case_Diagram.md) | Actors, capabilities, preconditions, and permission boundaries |

The [project context](../../UniCircle_AI_Project_Context.md) and [feature plan](../../UniCircle_Feature_Wise_Implementation_TODO.md) define product behavior and build order. Review each feature's detailed migration and Pydantic/OpenAPI contracts against these designs before implementation. If a design choice is deliberately changed, update the affected diagrams and tests in the same feature cycle. Provider choices for hosting, SMTP, vector storage, and embedding model remain open; do not silently fill them with demo dependencies.

The working defaults are a Next.js same-origin BFF, short-lived JWT plus revocable database session, PostgreSQL-backed outbox for notifications, REST refresh/polling for chat, and static Home content. Inputs still needed before those integrations go live include real environment secrets, an SMTP provider, an approved CUET source allowlist, vector/embedding provider choices, retention rules, and production hosting/network details. These open inputs do not block building the reviewed authentication and relational feature migrations first.
