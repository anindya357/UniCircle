# UniCircle backend foundation

Phases 6.1–6.3 provide the FastAPI and database foundation. Phase 7 includes
Authentication Feature 1, the Department and Faculty Directory, Campus Explorer,
Club & Event Hub, Resource Sharing + Chat, Transport, Community Forum, Campus
News & Announcements, and the Campus AI Assistant/RAG backend.

Backend Feature 2 is intentionally static: the public Home page reads reviewed
content from `frontend/src/features/home/content`, with media shipped from
`frontend/public/media/home`. It has no Home database tables, seed, or FastAPI
endpoint, and no Admin editing API unless a future CMS decision changes the design.

## Python setup

Use Python 3.12 or newer. From `backend/`:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python -m pip install -e '.[dev]'
.\.venv\Scripts\python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

On Windows, after the virtual environment is set up, you can use `.\run`
from `backend/` as the short start command. It always uses this project's
Python 3.12 virtual environment, even if your global `uvicorn` uses Python 3.10.

On macOS/Linux, use `python3.12 -m venv .venv` and `.venv/bin/python`.
`GET /health` is the unversioned liveness endpoint; auth routes live under
`/api/v1/auth` and profile updates at `/api/v1/users/me`. OpenAPI JSON is at
`/api/v1/openapi.json` and interactive docs
at `/docs`. The health check does not require a database connection.

## Configuration

The app reads environment variables, with optional ignored `.env` files in
the repository root and `backend/` (the backend file takes precedence). Copy
the root `.env.example` to `.env` and set a real `DATABASE_URL` as needed. Never
commit actual credentials. `APP_ENV` is `development`, `testing`, or
`production`; testing and production require an explicit non-default database
URL. `FRONTEND_URL` controls the allowed CORS origin. Development also permits
the equivalent localhost/127.0.0.1 origin at the same port. There is no wildcard
CORS origin.

The Phase 6.3 security services need a distinct `JWT_SECRET` and `OTP_PEPPER`,
each at least 32 bytes. Authentication and OTP operations fail closed when
their keys are absent; production startup additionally requires SMTP settings.
Configure `JWT_ISSUER`, `JWT_AUDIENCE`, and `JWT_ACCESS_TOKEN_MINUTES` consistently
across deployments. SMTP supports `starttls` or `ssl` only. Never use real
mailbox credentials in committed files or test fixtures.

The current-user dependency verifies the JWT, checks its unrevoked database
session, then loads the latest active, verified account and role. Roles inside
tokens are never trusted. OTP challenges and login throttles are stored in the
database; the in-memory stores under `tests/` are test fixtures only. Registration
fails closed if SMTP is not configured. Real SMTP delivery must be validated
with the selected provider before production use.

The default development URL is
`postgresql+psycopg://unicircle_dev@localhost:5432/unicircle_dev`. On a local
PostgreSQL installation that trusts local connections, create a dedicated role
and database once (run as a PostgreSQL administrator):

```powershell
createuser -U postgres unicircle_dev
createdb -U postgres -O unicircle_dev unicircle_dev
```

If your PostgreSQL installation requires a password, set one for this
development role and put the matching URL in your ignored `.env`. Do not use
the passwordless example for a remotely accessible server. The role owns only
its development database; do not reuse it for testing or production.

## Database and migrations

Run from `backend/` with the configured environment:

```powershell
.\.venv\Scripts\python -m alembic history
.\.venv\Scripts\python -m alembic upgrade head
.\.venv\Scripts\python -m alembic current
```

The reviewed first revision (`20260920_0001`) is intentionally empty. Revision
`20260921_0002` creates authentication tables; `20260921_0003` creates the
department and faculty directory tables. Both can be applied with the command
above. After migrating, load the reviewed CUET snapshot from `backend/`:

```powershell
.\.venv\Scripts\python -m app.modules.directory.seed
```

The seed is idempotent. It contains 12 CUET departments and 292 current-faculty
listings retrieved on 21 September 2026 from the public CUET department pages
and their underlying API. It is a snapshot, not a live sync; recheck CUET before
relying on it as current. Missing fields remain null. No faculty login accounts
are created. A person listed in multiple departments has one directory entry
per department. The read-only directory routes require an authenticated account:
`GET /api/v1/departments`, `GET /api/v1/departments/{code}`,
`GET /api/v1/departments/{code}/faculty`, `GET /api/v1/faculty/{entry_id}`,
and `GET /api/v1/faculty/{entry_id}/profile`. The profile route fetches that
faculty member's public CUET details on demand, returns only an explicit
allowlist of academic/contact fields, and falls back to the saved listing when
CUET is unavailable. CUET's private response fields are never exposed.

Campus Explorer uses reviewed OpenStreetMap data for CUET's Raozan campus.
Revision `20260921_0004` adds `campus_locations`; after upgrading, seed it with:

```powershell
.\.venv\Scripts\python -m app.modules.campus.seed
```

The seed is idempotent and contains 24 named places, all checked against the
mapped CUET boundary (OSM way 681604170). The protected read endpoints are
`GET /api/v1/campus/map`, `GET /api/v1/campus/locations`, and
`GET /api/v1/campus/locations/{location_id}`. The map response includes the
boundary and attributed tile URL; locations include coordinates and their OSM
source links. This is a reviewed snapshot, not a live OSM sync or route planner.
No campus Admin editing API is enabled.

## Club & Event Hub

Revision `ddcf224a1d10` adds club membership/admin, club-creation request,
event, interest, registration, and event-notification tables. Apply migrations
before starting the backend. To create the ten existing clubs and assign the
sole active, verified student as their initial admin, run once from `backend/`:

```powershell
.\.venv\Scripts\python -m app.modules.clubs.seed
```

The seed is idempotent. It refuses to guess if there is not exactly one eligible
student; pass `--student-id UUID` to select one explicitly. It does not create
demo events, fake members, or fake leaders. Future students are not automatically
made admins. Club Admins may add another verified student admin, but cannot
remove the last admin. App Admins review club-creation requests; approval
atomically creates a club and grants the requester initial admin access.

Revision `7b6f0c2d91aa` adds the membership-recruitment workflow. Recruitment is
closed by default. A mapped Club Admin must save valid bKash and Nagad numbers
before opening it. The fee is fixed at BDT 200 by both API validation and a
database check constraint. A student can submit one request per club; approval
creates the membership and a persistent unread notification in one transaction.
Only that club's admins may view, approve, or remove pending requests.

Protected endpoints are under `/api/v1`: `GET /clubs`, `GET /clubs/{id}`,
`GET /clubs/{id}/members`, `GET /clubs/{id}/events`, `GET /events`,
`GET /events/{id}`, `PUT /events/{id}/interest`, `POST /events/{id}/registrations`,
and `GET /notifications/me`. Students use `/clubs/requests`,
`/clubs/requests/mine`, and `/clubs/{id}/membership-requests`; App Admins use
`/admin/club-requests` and
`/admin/club-requests/{id}/review`. Club Admins use `/clubs/administered`,
`PUT /clubs/{id}`, `/clubs/{id}/admins`, `/clubs/{id}/membership-settings`,
and the membership-review and club/event write routes. The
OpenAPI page at `/docs` shows request/response details. Registration records
and payment review are visible only to that club's admins or App Admins.
Public event responses expose counts, not participant details. Paid submissions
start as `pending_review`; a transaction ID alone never confirms payment.

Event status is derived from UTC start/end times. To create start/finish
notifications, run this idempotent job every minute with an external scheduler
(for example Windows Task Scheduler or cron):

```powershell
.\.venv\Scripts\python -m app.modules.clubs.notifications
```

The job notifies interested, going, or registered users. A unique constraint
prevents duplicate state notifications. No in-process scheduler is started by
the API. The frontend club/event pages and global notification UI use the live
API.

## Resource sharing and chat

Revision `667afe78e4cf` adds opt-in resource profiles/categories, resource
requests, accepted-request conversations, and messages. Apply migrations before
using `/resources` or `/chat`. No demo students or requests are seeded. A student
appears in discovery only after saving a discoverable profile with at least one
resource category. Email, phone, and home address are never returned by the
discovery endpoint. A single registered student cannot send a request to
themselves; register and verify another student account to test both sides.

Authenticated General Users can use `GET/PATCH /api/v1/resource-profile/me`,
`GET /api/v1/users/discover`, `POST /api/v1/resource-requests`,
`GET /api/v1/resource-requests/mine`, and
`POST /api/v1/resource-requests/{id}/decision`. Only the recipient can accept or
reject. Acceptance creates one conversation; only its two participants may list
it, fetch messages, or send messages through `/api/v1/conversations` and
`/api/v1/conversations/{id}/messages`. Discovery, requests, and conversations
are paginated; message history supports `before_id` and `after_id` cursors.
The frontend refreshes these REST endpoints periodically. Chat messages are
server-readable; this is **not** cryptographic end-to-end encryption. Use TLS
outside local development.

## Community discussion forum

Revision `9e4a2b1c7d30` adds text-only forum posts, comments, and moderation
reports. General Users can list/create posts, list/add comments, and report a
post through `/api/v1/forum/posts`. Each user can report a post only once.
Image/video fields and reaction data are rejected or unsupported by design.

App Admin moderation is under `/api/v1/admin/forum/reports`. Dismissing a report
keeps the post visible. Removing a reported post soft-removes it, hides its
comments from every General User endpoint, and retains the post/report audit
record. All moderation permissions are enforced by FastAPI, not by the UI.

## Campus news and announcements

Revision `4f7a2c8d1b90` adds persisted campus news, updates, announcements, and
recipient-scoped publication notifications. Authenticated users read only
published items through `GET /api/v1/news` and `GET /api/v1/news/{id}`; results
are newest first. App Admin CRUD and draft/publish controls are under
`/api/v1/admin/news` and are protected server-side.

Publishing an update or announcement creates one notification for every active,
verified General User in the same transaction. A database uniqueness constraint
prevents duplicate recipient/item rows. Plain news does not fan out. Moving an
item back to draft removes its notifications and hides it from General Users.
Notification links point to the live news detail route and use the existing
owner-scoped read and mark-all-read endpoints. The news list/detail pages and
Admin publishing workspace now use these APIs rather than prototype data.

## Campus AI Assistant / RAG

Revision `a18d6c9e4f20` adds approved knowledge sources, embedded chunks, and
privacy-minimal query audits. Apply the migration, configure a backend-only
`OPENAI_API_KEY`, then build the initial public CUET snapshot from `backend/`:

```powershell
.\.venv\Scripts\python -m app.modules.assistant.ingest --max-pages 500
```

The crawler starts at `https://cuet.ac.bd/`, follows only explicitly allowed
HTTPS hosts, respects crawl limits and `robots.txt`, excludes portals/assets,
uses LangChain `WebBaseLoader` for HTML and `PyPDFLoader` for PDFs, and stores
source URL/title/date metadata. Re-run the same command for an incremental
refresh; unchanged content hashes are not re-embedded. Review
`docs/design/RAG_Knowledge_Source_Policy.md` before adding any CUET subdomain.

Authenticated users ask through `POST /api/v1/assistant/ask`. The service
retrieves relevant chunks, sends only those public excerpts and the question to
OpenAI, returns official source links, and emits a no-context response when
retrieval confidence is insufficient. Per-user fixed-window limits and output
limits control cost. `GET /api/v1/admin/assistant/knowledge` reports corpus
counts to App Admins. Browser requests use the same-origin Next.js proxy; the
OpenAI key is never returned to or read by browser JavaScript.

## Transport

Revision `0363e1e5ad21` adds transport routes, buses, drivers, and recurring
schedule assignments. After applying migrations, load the reviewed CUET data:

```powershell
.\.venv\Scripts\python -m app.modules.transport.seed
```

The idempotent seed contains the 20 supplied bus names, the regular,
Chawkbazar, and Rastar Matha routes, and four daily service windows. It imports
only PDF rows 7-31 because those 25 records are designated drivers; rows 1-6
are officials/staff and rows 32-46 are helpers, security, or office staff.
Names are transliterated to English and phone numbers retain the PDF digits.
Every driver receives a deterministic, repeatable bus allocation. The source
PDF itself is not copied into the repository.

Authenticated users read `GET /api/v1/transport/snapshot`, `/transport/dates`,
`/transport/schedules?service_date=YYYY-MM-DD`, and `/transport/drivers`.
Normal APIs reject past dates. App Admin writes are under
`/api/v1/admin/transport`: routes, buses, drivers, and schedules support create,
update, and guarded delete operations. Recurrence supports once, daily, weekly,
and monthly templates with an optional end date. The Admin transport UI uses
these APIs; the announcement and report sections use their respective live APIs.

Future feature work should add ORM models, import them from
`app/db/models.py`, generate a candidate revision with
`alembic revision --autogenerate -m "description"`, then **review and edit**
its operations, constraints, indexes, nullability, data migrations, and
rollback behavior before applying it. Do not use `Base.metadata.create_all()`
for application schema management. Use separate development/test databases.

`Base` supplies a stable constraint naming convention. `TimestampMixin` is
opt-in for future models; no primary-key type or domain relationship is chosen
until the approved ERD is available. The request-scoped `get_db` dependency
closes sessions; future feature services own transaction commits and rollbacks.

No passwords or Admin accounts are seeded. To create an App Admin after applying
the migration, run this interactive command from `backend/`:

```powershell
.\.venv\Scripts\python -m app.modules.auth.provision_admin --admin-id YOUR_ADMIN_ID
```

It prompts twice for a password without putting it in shell history. Public
registration cannot create Admins. Existing General Users register with a CUET
email at `@cuet.ac.bd` or `@student.cuet.ac.bd`, verify the emailed code, then
sign in. If mail delivery fails after the pending account is saved, use the
resend-code flow when SMTP is working.

The FastAPI login responses contain JWTs for the trusted Next.js BFF only. The
BFF places them in HttpOnly cookies and strips them from browser-facing JSON.
Sessions expire after `JWT_ACCESS_TOKEN_MINUTES`; there is no refresh token.

## Quality checks

```powershell
.\.venv\Scripts\python -m pytest
.\.venv\Scripts\python -m ruff check app tests migrations
.\.venv\Scripts\python -m ruff format --check app tests migrations
```
