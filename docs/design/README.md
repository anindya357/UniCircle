# UniCircle design documents

This index collects UniCircle's architecture and design references. The activity,
deployment, data-centred architecture, class, component, and API documents are
implementation-aligned references. Earlier HLD/LLD and some workflow diagrams
retain planned behavior; check their status notes and current source before
treating them as implementation evidence.

The [API design](api_desing.md) is an implementation-aligned reference. Older diagrams may still describe planned contracts; consult the API catalogue and current source when integrating implemented endpoints.

| Artifact | Purpose |
| --- | --- |
| [HLD](HLD.md) | System architecture, runtime components, trust boundaries, deployment shape |
| [LLD](LLD.md) | Module responsibilities, planned API surface, state transitions, transaction rules |
| [API design](api_desing.md) | Implemented API catalogue, BFF mappings, permissions, contracts, examples, and error/retry rules |
| [ERD](ERD.md) | Logical entities, relationships, constraints, authentication/session storage |
| [Class diagrams](Class_Diagram.md) | Implemented domain classes, cardinalities, service dependencies, and protocol implementations |
| [Component diagrams](Component_Diagram.md) | Frontend/backend boundaries, feature modules, RAG components, and notification jobs |
| [UML activity diagrams](Activity_Diagram.md) | Registration and verification, membership recruitment/review, and RAG request decisions and failure paths |
| [UML deployment diagram](Deployment_Diagram.md) | Vercel service runtimes, Neon storage, external providers, operator jobs, and local Compose alternative |
| [Data-centred architectural model](Data_Centred_Architectural_Model.md) | Shared PostgreSQL repository, module ownership, transactions, and data-access boundaries |
| [Document flow diagram](Document_Flow_Diagram.md) | Forms, review records, notifications, and development artifact handoffs |
| [Data flow diagrams](Data_Flow_Diagram.md) | System context, processes, stores, and authentication data movement |
| [Sequence diagrams](Sequence_Diagram.md) | Order and failure branches for authentication, club/event, chat, notifications, RAG |
| [Use-case diagrams](Use_Case_Diagram.md) | Actors, capabilities, preconditions, and permission boundaries |
| [RAG source policy](RAG_Knowledge_Source_Policy.md) | Approved CUET sources, crawl limits, refresh rules, vector storage, and prompt safety |

The [project context](../../UniCircle_AI_Project_Context.md) and [feature plan](../../UniCircle_Feature_Wise_Implementation_TODO.md) define product behavior and build order. Review migrations and Pydantic/OpenAPI contracts against these designs when changing a feature. Update affected diagrams with implementation changes.

The current deployment uses a Next.js same-origin BFF and private FastAPI service
on Vercel, Neon PostgreSQL, short-lived JWTs plus revocable sessions, configured
SMTP, and static Home media. Cloud RAG uses bundled FastEmbed embeddings and Groq
chat; local Ollama is an optional provider. RAG refresh is an explicit operation
against the appropriate database/provider namespace. Membership and news
notifications are written in business transactions; event lifecycle notifications
use an idempotent CLI job. There is no implemented outbox. Scheduling, backup and
retention policies must be configured and verified separately; see the
[deployment runbook](../deployment/README.md).
