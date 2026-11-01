# UniCircle class diagrams

Status: implementation-aligned reference, reviewed **1 November 2026**.

These views show the principal persisted classes and selected service contracts
in the current project. They are split by feature to keep the rendered diagrams
readable. Repeated `User` and `Club` boxes refer to the same classes, not copies.
See the [ERD](ERD.md) for the relational design and the
[API design](api_desing.md) for request/response contracts.

## Notation and scope

- Attributes use Python-side names, not necessarily JSON response names. `+`
  identifies a public class member; it does not grant API access to that member.
- Associations show foreign-key or runtime dependencies. They do not imply that
  every association has a SQLAlchemy `relationship()` property.
- Quoted multiplicities describe related instances: `1`, `0..1`, and `0..*`.
  `..|>` denotes structural implementation of a Python protocol.
- ORM classes inherit `Base`; many also inherit `TimestampMixin`. Those repeated
  base classes, timestamps, indexes, validators, and some secondary fields are
  omitted. No entity CRUD methods are invented where routers own the behavior.
- Role checks and state-transition rules remain service/router responsibilities;
  not every invariant can be inferred from a class association.

## 1. Accounts, sessions, and email challenges

Source: [ORM models](../../backend/app/db/models.py),
[authentication service](../../backend/app/modules/auth/service.py), and
[email-code flows](../../backend/app/modules/auth/email_flows.py).

```mermaid
classDiagram
    direction LR
    class User {
        +UUID id
        +str role
        +str username
        +str admin_id
        +str email
        +str university_id
        +str password_hash
        +datetime verified_at
        +bool is_active
    }
    class AuthSession {
        +UUID id
        +UUID user_id
        +str jti_digest
        +datetime expires_at
        +datetime revoked_at
    }
    class OtpChallengeRecord {
        +str id
        +UUID user_id
        +str recipient_email
        +str purpose
        +str digest
        +int attempts_remaining
        +datetime expires_at
        +datetime consumed_at
    }
    class AuthRateLimit {
        +UUID id
        +str scope
        +str key_digest
        +datetime window_started_at
        +int attempt_count
    }
    User "1" --> "0..*" AuthSession : owns
    User "1" --> "0..*" OtpChallengeRecord : receives challenges
```

`student`, `teacher`, `staff`, and `admin` are values of `User.role`, not ORM
subclasses. General Users require username/email/university ID and profile fields;
App Admins instead have a provisioned `admin_id`. Nullable fields are omitted or
null as appropriate for the role. `verified_at`, `revoked_at`, and `consumed_at`
can also be null. Rate-limit buckets intentionally use digests rather than a
foreign key to an account, allowing throttling of unknown identifiers too.

Password-recovery codes and single-use grants reuse `OtpChallengeRecord` with
different purposes. There is no separate reset-token entity or refresh-token
class. Normal login is password-only; registration requires email verification.

## 2. Club ownership, recruitment, and approval

Source: [club models](../../backend/app/db/models.py) and
[club governance routes](../../backend/app/modules/clubs/router.py).

```mermaid
classDiagram
    direction TB
    class User {
        +UUID id
        +str role
    }
    class Club {
        +str id
        +str name
        +str description
        +bool membership_recruitment_open
        +int membership_fee
        +str membership_bkash_number
        +str membership_nagad_number
    }
    class ClubAdmin {
        +str club_id
        +UUID user_id
        +datetime appointed_at
    }
    class ClubMember {
        +str club_id
        +UUID user_id
        +datetime joined_at
    }
    class ClubCreationRequest {
        +UUID id
        +UUID requester_id
        +str name
        +str purpose
        +str status
        +UUID reviewer_id
        +str approved_club_id
    }
    class ClubMembershipRequest {
        +UUID id
        +str club_id
        +UUID user_id
        +str motivation
        +str payment_method
        +str transaction_id
        +int fee
        +str status
        +UUID reviewer_id
    }
    User "1" --> "0..*" ClubAdmin : student appointments
    Club "1" --> "0..*" ClubAdmin : administered through
    User "1" --> "0..*" ClubMember : memberships
    Club "1" --> "0..*" ClubMember : has members
    User "1" --> "0..*" ClubCreationRequest : submits
    User "0..1" --> "0..*" ClubCreationRequest : App Admin reviews
    ClubCreationRequest "0..*" --> "0..1" Club : approved_club_id
    Club "1" --> "0..*" ClubMembershipRequest : receives applications
    User "1" --> "0..*" ClubMembershipRequest : applies
    User "0..1" --> "0..*" ClubMembershipRequest : club admin reviews
```

`ClubAdmin` and `ClubMember` have composite club/user keys. One student can
administer several clubs and one club can have several admins. Club-admin
appointments are restricted to active verified students, also create membership,
and must preserve a final admin. App Admin is not automatically a Club Admin.

Approval of a club-creation request creates the club and its initial admin/member
atomically. `approved_club_id` and reviewer fields are nullable while pending.
The diagram shows the FK's cardinality, not an additional database uniqueness
constraint. Membership recruitment charges the server-controlled Tk 200 fee;
submission does not itself approve membership or verify a payment.

## 3. Club events and participation

```mermaid
classDiagram
    direction LR
    class Club {
        +str id
        +str name
    }
    class User {
        +UUID id
        +str role
    }
    class ClubEvent {
        +UUID id
        +str club_id
        +str title
        +datetime starts_at
        +datetime ends_at
        +bool registration_enabled
        +datetime registration_closes_at
        +bool is_paid
        +int fee
        +str bkash_number
    }
    class EventInterest {
        +UUID event_id
        +UUID user_id
        +str status
    }
    class EventRegistration {
        +UUID id
        +UUID event_id
        +UUID user_id
        +str participant_name
        +str email
        +str student_id
        +str department_name
        +str bkash_trx_id
        +str payment_status
    }
    Club "1" --> "0..*" ClubEvent : owns
    ClubEvent "1" --> "0..*" EventInterest : interest records
    User "1" --> "0..*" EventInterest : interested or going
    ClubEvent "1" --> "0..*" EventRegistration : registrations
    User "1" --> "0..*" EventRegistration : registers
```

The event/user registration pair is unique. Interest/Going and registration are
separate records. Registration can be disabled, free, or paid; a transaction ID
is required only for paid registration. Payment review is a human-authorized
action, not an integration that confirms bKash transfers automatically.
Event status is derived from its dates, not a persisted `status` attribute.

## 4. Departments, campus places, and transport

```mermaid
classDiagram
    direction TB
    class Department {
        +str code
        +str name
        +str description
        +str source_url
    }
    class FacultyDirectoryEntry {
        +str id
        +str department_code
        +str name
        +str designation
        +str email
        +str phone
        +str profile_url
    }
    class CampusLocation {
        +str id
        +str name
        +str category
        +float latitude
        +float longitude
        +str description
    }
    class TransportRoute {
        +str id
        +str name
        +list outbound_stops
        +list return_stops
        +bool is_active
    }
    class TransportBus {
        +str id
        +str name
        +str bus_type
        +str registration
        +bool is_active
    }
    class BusDriver {
        +UUID id
        +str name
        +str phone
        +str driver_class
        +str assigned_bus_id
    }
    class TransportSchedule {
        +UUID id
        +date service_date
        +time start_time
        +time end_time
        +str route_id
        +str bus_id
        +UUID driver_id
        +str recurrence
        +date recurrence_until
    }
    Department "1" --> "0..*" FacultyDirectoryEntry : lists
    BusDriver "0..*" --> "0..1" TransportBus : default assignment
    TransportRoute "1" --> "0..*" TransportSchedule : route for
    TransportBus "1" --> "0..*" TransportSchedule : bus for
    BusDriver "1" --> "0..*" TransportSchedule : driver for
```

Faculty contacts can be null. A faculty listing is not a `User` account and has
no account FK. `User.department_name` is a profile string, not a department FK.
`CampusLocation` is independent: route stops are JSON strings, not FKs to map
locations. Bus defaults and per-schedule assignments are different relationships.
Schedules are recurrence templates expanded into dated trips on reads, not a
separate persisted class for every occurrence. Map bounds/boundary come from
campus configuration rather than a `CampusMap` database class.

## 5. Resource discovery and participant-only chat

```mermaid
classDiagram
    direction TB
    class User {
        +UUID id
    }
    class ResourceProfile {
        +UUID user_id
        +bool is_discoverable
        +str level
        +str hall
        +str availability_note
    }
    class ResourceProfileCategory {
        +UUID user_id
        +str category
    }
    class ResourceRequest {
        +UUID id
        +UUID requester_id
        +UUID recipient_id
        +str category
        +str resource_name
        +str description
        +str status
    }
    class Conversation {
        +UUID id
        +UUID resource_request_id
        +datetime last_activity_at
    }
    class Message {
        +UUID id
        +UUID conversation_id
        +UUID sender_id
        +str body
        +datetime sent_at
    }
    User "1" --> "0..1" ResourceProfile : optional opt-in profile
    ResourceProfile "1" --> "0..*" ResourceProfileCategory : offers categories
    User "1" --> "0..*" ResourceRequest : requester
    User "1" --> "0..*" ResourceRequest : recipient
    ResourceRequest "1" --> "0..1" Conversation : acceptance opens
    Conversation "1" --> "0..*" Message : contains
    User "1" --> "0..*" Message : sends
```

Only the recipient can accept/reject a request. Acceptance creates at most one
conversation, using the requester's and recipient's identities as participants;
there is no separate conversation-membership class. Participants alone can read
or send messages. Discovery is opt-in. Chat uses bounded REST history/polling,
not WebSockets, and does not claim end-to-end encryption.

## 6. Community, publishing, notifications, and audit

```mermaid
classDiagram
    direction TB
    class User {
        +UUID id
        +str role
    }
    class ForumPost {
        +UUID id
        +UUID author_id
        +str body
        +datetime removed_at
        +UUID removed_by_user_id
    }
    class ForumComment {
        +UUID id
        +UUID post_id
        +UUID author_id
        +str body
    }
    class ForumReport {
        +UUID id
        +UUID post_id
        +UUID reporter_id
        +str reason
        +str status
        +UUID reviewer_id
    }
    class CampusNewsItem {
        +UUID id
        +UUID author_id
        +str kind
        +str title
        +list content
        +str status
        +datetime published_at
    }
    class Notification {
        +UUID id
        +UUID recipient_id
        +str type
        +str message
        +str related_object_type
        +str related_object_id
        +str dedupe_key
        +datetime read_at
    }
    class AdminAuditLog {
        +UUID id
        +UUID actor_id
        +str action
        +str target_type
        +str target_id
        +dict details
    }
    User "1" --> "0..*" ForumPost : authors
    ForumPost "1" --> "0..*" ForumComment : comments
    User "1" --> "0..*" ForumComment : authors
    ForumPost "1" --> "0..*" ForumReport : reports
    User "1" --> "0..*" ForumReport : reporter
    User "0..1" --> "0..*" ForumReport : App Admin reviewer
    User "1" --> "0..*" CampusNewsItem : App Admin author
    User "1" --> "0..*" Notification : recipient
    User "1" --> "0..*" AdminAuditLog : App Admin actor
```

Report uniqueness is enforced per post/reporter. Moderation soft-removes a post;
reviewer/removal fields can be null. Normal news reads return published items only.
Notifications deduplicate on recipient/key. Their related-object strings, and
audit target strings, are polymorphic references rather than SQL foreign keys.

`EventNotification`, `CampusNewsNotification`, and `ClubMembershipNotification`
also remain mapped in the repository as feature-specific notification tables.
They are omitted from this principal-class view: the current shared inbox and
feature publishers use `Notification`. No implemented `Outbox` class is assumed.

## 7. RAG knowledge and query records

```mermaid
classDiagram
    direction LR
    class User {
        +UUID id
    }
    class RagSource {
        +UUID id
        +str url
        +str title
        +str content_hash
        +str status
        +datetime crawled_at
        +dict source_metadata
    }
    class RagChunk {
        +UUID id
        +UUID source_id
        +int chunk_index
        +str content
        +str content_hash
        +list embedding
    }
    class RagQueryAudit {
        +UUID id
        +UUID user_id
        +str question_hash
        +str status
        +int source_count
        +datetime created_at
    }
    class RetrievedChunk {
        +RagChunk chunk
        +RagSource source
        +float score
    }
    RagSource "1" *-- "0..*" RagChunk : owns indexed chunks
    User "1" --> "0..*" RagQueryAudit : query safeguards
    RetrievedChunk --> RagChunk : ranked evidence
    RetrievedChunk --> RagSource : eligibility metadata
```

`RetrievedChunk` is a runtime dataclass, not a database table. Chunk embeddings
are stored as JSON numeric arrays in PostgreSQL; a dedicated vector database is
not required by this implementation. Query audits store a question hash, not a
chat transcript. Bundled Markdown/TXT knowledge is an ingestion input, not a
separate ORM entity. Source/chunk positions are unique within each source.

## 8. Implemented service and protocol boundaries

These are selected actual classes, not a claim that every feature has its own
service/repository class. Many feature routers operate directly on a SQLAlchemy
session. Protocol realization below is structural Python typing.

```mermaid
classDiagram
    direction TB
    class AuthService {
        +register(request, network) str
        +resend(email, network)
        +verify(email, code, network)
        +login(identifier, password, network, admin)
    }
    class EmailCodeFlows {
        +forgot_password(email, network) dict
        +verify(challenge_id, code, purpose, network)
        +reset_password(token, password, network)
    }
    class OtpService {
        +issue_email_verification(email) datetime
        +verify_email(email, code) OtpCheckResult
    }
    class OtpStore {
        <<interface>>
        +put_if_allowed(challenge, cooldown) bool
        +check_and_consume(recipient, purpose, digest, now) OtpCheckResult
        +discard(challenge_id)
    }
    class DatabaseOtpStore
    class VerificationEmailSender {
        <<interface>>
        +send_verification_code(recipient, code, expires_in_minutes)
        +send_auth_code(recipient, code, expires_in_minutes, purpose)
    }
    class SmtpVerificationEmailSender
    AuthService --> OtpService : uses
    EmailCodeFlows --> AuthService : reuses dependencies
    OtpService --> OtpStore : stores challenge
    OtpService --> VerificationEmailSender : sends code
    DatabaseOtpStore ..|> OtpStore : implements
    SmtpVerificationEmailSender ..|> VerificationEmailSender : implements
```

```mermaid
classDiagram
    direction LR
    class NotificationService {
        +publish(draft) NotificationRecord
        +list_mine(user_id, pagination)
        +mark_mine_read(user_id, notification_id)
        +mark_all_mine_read(user_id) int
    }
    class NotificationRepository {
        <<interface>>
        +create_once(draft) NotificationRecord
        +list_for_user(user_id, limit, offset)
        +mark_read(user_id, notification_id, now)
        +mark_all_read(user_id, now) int
    }
    class SqlNotificationRepository
    class NotificationDraft {
        +str user_id
        +str kind
        +str title
        +str body
        +str dedupe_key
    }
    class NotificationRecord {
        +str id
        +datetime created_at
        +datetime read_at
    }
    NotificationService --> NotificationRepository : injected dependency
    SqlNotificationRepository ..|> NotificationRepository : implements
    NotificationRecord --|> NotificationDraft : inherits
    NotificationService ..> NotificationDraft : validates
    NotificationRepository ..> NotificationRecord : returns
```

```mermaid
classDiagram
    direction TB
    class RagAssistantService {
        +ask(user_id, question) dict
    }
    class EmbeddingProvider {
        <<interface>>
        +embed_query(text) list
    }
    class ChatProvider {
        <<interface>>
        +answer(question, context) str
    }
    class FastEmbedProvider {
        +embed_query(text) list
        +embed_documents(texts) list
    }
    class GroqChatProvider {
        +answer(question, context) str
    }
    class OllamaChatProvider {
        +answer(question, context) str
    }
    RagAssistantService --> EmbeddingProvider : injected or configured
    RagAssistantService --> ChatProvider : injected or configured
    FastEmbedProvider ..|> EmbeddingProvider : implements
    GroqChatProvider ..|> ChatProvider : implements
    OllamaChatProvider ..|> ChatProvider : implements
```

The embedding factory also supports LangChain's Ollama embedding adapter.
Configuration selects a chat provider and embedding provider; these alternatives
are not an automatic provider-failover chain. Ingestion needs document embeddings
as well as the query-embedding contract. Answers expose no source/citation list.

### Service source map

| Classes/contracts | Implementation |
| --- | --- |
| `AuthService`, `EmailCodeFlows` | [auth service](../../backend/app/modules/auth/service.py), [recovery flows](../../backend/app/modules/auth/email_flows.py) |
| `OtpService`, `OtpStore`, `DatabaseOtpStore` | [OTP core](../../backend/app/core/otp.py), [SQL persistence](../../backend/app/modules/auth/persistence.py) |
| Email sender protocol and implementation | [SMTP adapter](../../backend/app/core/email.py) |
| Notification service/DTOs/protocol | [notification core](../../backend/app/core/notifications.py) |
| `SqlNotificationRepository` | [SQL adapter](../../backend/app/modules/notifications/repository.py) |
| RAG service/provider contracts | [assistant service](../../backend/app/modules/assistant/service.py) |
| `FastEmbedProvider` | [embedding factory](../../backend/app/modules/assistant/embeddings.py) |

Related view: [component diagrams](Component_Diagram.md).
