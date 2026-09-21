# UniCircle backend foundation

Phases 6.1–6.3 provide the FastAPI and database foundation. Phase 7 now includes
Authentication Feature 1: persisted General Users, OTP challenges, revocable
sessions, App Admin login/provisioning, and profile updates. Other feature APIs
and domain tables remain future work.

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
