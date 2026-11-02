# UniCircle UML activity diagrams

Status: implementation-aligned reference, reviewed **2 November 2026**.

These activity views use GitHub-compatible Mermaid: filled circles are initial
nodes, double circles are activity finals, rounded rectangles are actions, and
diamonds are decisions or merges. Edge labels express guards. Subgraphs group
responsibilities; arrows express control flow, not network topology.

## 1. Registration, email verification, and login

```mermaid
flowchart TB
    Start((" ")) --> Open("Open public Home and select Create account")
    subgraph Browser["Visitor / Next.js account screens"]
        Open --> Fill("Complete CUET registration form")
        Fill --> Submit("Submit through same-origin BFF")
        FormError("Display validation or account-conflict error") --> Fill
        OtpScreen("Display OTP screen on mobile or desktop")
        Code("Enter verification code")
        Choice{"Retry, resend, or exit?"}
        Wait("Wait for resend cooldown")
        Login("Enter login credentials")
        LoginError("Display login error") --> Login
        Home("Open authenticated Home and navigation")
    end
    subgraph Backend["FastAPI auth and SMTP"]
        Valid{"Valid registration and available identity?"}
        Save("Persist pending account and hashed OTP challenge")
        Mail("Attempt verification email through configured SMTP")
        Delivered{"SMTP delivery accepted?"}
        DeliveryError("Return delivery failure; offer resend or retry")
        Verify{"Code valid, unexpired, and within attempt limit?"}
        Activate("Mark email verified and consume challenge")
        Resend{"Resend permitted?"}
        Replace("Replace challenge and attempt SMTP delivery")
        CheckLogin{"Credentials valid and account verified and active?"}
        Session("Persist revocable session and issue JWT")
    end
    Submit --> Valid
    Valid -->|"No"| FormError
    Valid -->|"Yes"| Save --> Mail --> Delivered
    Delivered -->|"No"| DeliveryError --> Choice
    Delivered -->|"Yes"| OtpScreen --> Code --> Verify
    Verify -->|"No: show safe verification error"| Choice
    Choice -->|"Retry code"| Code
    Choice -->|"Resend"| Resend
    Choice -->|"Exit"| Finish(((" ")))
    Resend -->|"No"| Wait --> Choice
    Resend -->|"Yes"| Replace --> Delivered
    Verify -->|"Yes"| Activate --> Login
    Login --> CheckLogin
    CheckLogin -->|"No"| LoginError
    CheckLogin -->|"Yes"| Session --> Cookie("BFF sets HttpOnly session cookie")
    Cookie --> Home --> Finish
    classDef initial fill:#173c32,stroke:#173c32,color:#173c32
    classDef final fill:#173c32,stroke:#173c32,color:#173c32
    class Start initial
    class Finish final
```

Sign-up starts verification; successful login starts a session. A failed email
delivery must not be presented as successful verification. The backend enforces
CUET email policy, expiry, resend cooldown, attempt limits, and account uniqueness.
The browser receives an HttpOnly cookie rather than a JavaScript-readable JWT.
Password recovery is a separate flow: request email code → verify code → receive
a restricted reset grant → set a new password and revoke existing sessions → log
in again. See the [sequence diagrams](Sequence_Diagram.md) for recovery details.

Sources: [auth routes](../../backend/app/modules/auth/router.py),
[auth service](../../backend/app/modules/auth/service.py),
[email-code flows](../../backend/app/modules/auth/email_flows.py), and
[authentication frontend](../../frontend/src/features/auth).

## 2. Club membership recruitment and review

```mermaid
flowchart TB
    Start((" ")) --> Details("Authenticated student opens club details")
    Details --> Member{"Already a club member?"}
    Member -->|"Yes"| Status("Show: You are the member of this club")
    Member -->|"No"| Pending{"Already has a pending request?"}
    Pending -->|"Yes"| PendingStatus("Show pending membership status")
    Pending -->|"No"| Open{"Recruitment open and payment accounts configured?"}
    Open -->|"No"| Closed("Show recruitment unavailable; do not show form")
    Open -->|"Yes"| Form("Show Be a member form, BDT 200 fee, bKash and Nagad numbers")
    Form --> Submit("Student enters required details and payment transaction ID")
    Submit --> Valid{"Server validates student, own identity, club state, and duplicate rules?"}
    Valid -->|"No"| Correct("Display error and retain editable input") --> Form
    Valid -->|"Yes"| Save("Persist pending membership request")
    Save --> Queue("Mapped Club Admin opens See all Membership Requests")
    Queue --> Permission{"Current user administers this club?"}
    Permission -->|"No"| Denied("Reject access")
    Permission -->|"Yes"| Review("Review pending request and payment claim")
    Review --> Decision{"Admin decision"}
    Decision -->|"Leave pending"| PendingStatus
    Decision -->|"Remove"| Delete("Recheck pending state and delete request")
    Decision -->|"Approve"| Lock("Lock request and recheck pending state")
    Lock --> Eligible{"Still pending?"}
    Eligible -->|"No"| Conflict("Return already-reviewed conflict")
    Eligible -->|"Yes"| Atomic("In one transaction: add member, approve request, create deduplicated notification")
    Atomic --> Commit{"Commit succeeds?"}
    Commit -->|"No"| Rollback("Roll back all approval changes; return error")
    Commit -->|"Yes"| Inbox("User receives membership notification in inbox")
    Inbox --> Status
    Status --> Finish(((" ")))
    PendingStatus --> Finish
    Closed --> Finish
    Denied --> Finish
    Delete --> Finish
    Conflict --> Finish
    Rollback --> Finish
    classDef initial fill:#173c32,stroke:#173c32,color:#173c32
    classDef final fill:#173c32,stroke:#173c32,color:#173c32
    class Start initial
    class Finish final
```

Only mapped admins can change recruitment settings or review requests for that
club. One student may administer several clubs, and a club may have several
admins. The standard membership fee is BDT 200. A submitted transaction ID is
a payment claim for manual review; there is no automatic bKash/Nagad payment
verification. Turning recruitment off blocks new submissions; existing pending
requests remain reviewable. Removal deletes a pending request; it is not an
approved-member removal operation. Concurrent review conflicts return errors.

Sources: [club routes](../../backend/app/modules/clubs/router.py),
[shared notifications](../../backend/app/core/notifications.py), and
[club frontend](../../frontend/src/features/clubs-events).

## 3. Campus assistant question and failure handling

```mermaid
flowchart TB
    Start((" ")) --> Ask("User submits campus question")
    Ask --> BFF("BFF forwards authenticated request to FastAPI")
    BFF --> Auth{"Valid session and active account?"}
    Auth -->|"No"| Unauthorized("Return authentication error")
    Auth -->|"Yes"| Rate{"Question passes schema and rate limits?"}
    Rate -->|"No"| Limited("Return validation or rate-limit error")
    Rate -->|"Yes"| Audit("Create minimal question-hash audit record")
    Audit --> Read("Load bounded source and chunk candidates from PostgreSQL")
    Read --> Ready{"Eligible chunks match corpus, pipeline, model, and review dates?"}
    Ready -->|"No"| Rebuild("Record failure; return knowledge-not-ready error")
    Ready -->|"Yes"| Embed("Embed question using configured embedding adapter")
    Embed --> Rank("Rank compatible vectors and controlled exact aliases")
    Rank --> Relevant{"Grounded evidence meets retrieval rules?"}
    Relevant -->|"No"| NoContext("Record not-found; return insufficient-information answer")
    Relevant -->|"Yes"| Prompt("Build prompt from selected public or supplied CUET evidence")
    Prompt --> Model("Request answer from configured Groq or Ollama adapter")
    Model --> Success{"Provider returns usable answer?"}
    Success -->|"No"| Failed("Record failure; return safe service-unavailable error")
    Success -->|"Yes"| Answer("Record answered status; return answer without source cards")
    Embed -.->|"Embedding failure"| Failed
    Unauthorized --> UI("Frontend displays answer or recoverable error")
    Limited --> UI
    Rebuild --> UI
    NoContext --> UI
    Failed --> UI
    Answer --> UI
    UI --> Finish(((" ")))
    classDef initial fill:#173c32,stroke:#173c32,color:#173c32
    classDef final fill:#173c32,stroke:#173c32,color:#173c32
    class Start initial
    class Finish final
```

Dashed flow denotes an exceptional embedding failure. Authentication precedes
retrieval. The chat model is not called for an empty/ineligible index or
insufficient evidence. Audit records contain question hashes and safeguard
metadata, not persisted chat transcripts. A refresh is an explicit operator
activity, separate from this request. Ingestion must finish before a matching
backend revision serves the changed corpus; changing repository files alone
does not refresh Neon vectors.

Sources: [assistant route](../../backend/app/modules/assistant/router.py),
[retrieval and generation](../../backend/app/modules/assistant/service.py),
[index eligibility](../../backend/app/modules/assistant/curated.py), and
[RAG source policy](RAG_Knowledge_Source_Policy.md).
