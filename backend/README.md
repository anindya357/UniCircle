# UniCircle backend foundation

Phase 6.1/6.2 provides a FastAPI app, a PostgreSQL connection, SQLAlchemy 2
metadata and sessions, and Alembic migration tooling. It does **not** implement
feature APIs or domain tables; those depend on the approved ERD in Phase 7.

## Python setup

Use Python 3.12 or newer. From `backend/`:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python -m pip install -e '.[dev]'
.\.venv\Scripts\python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

On macOS/Linux, use `python3.12 -m venv .venv` and `.venv/bin/python`.
`GET /health` is the unversioned liveness endpoint; feature routes will live
under `/api/v1`. OpenAPI JSON is at `/api/v1/openapi.json` and interactive docs
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

The reviewed first revision (`20260920_0001`) is intentionally empty. It
establishes migration history without inventing tables before the ERD is
approved. Future feature work should add ORM models, import them from
`app/db/models.py`, generate a candidate revision with
`alembic revision --autogenerate -m "description"`, then **review and edit**
its operations, constraints, indexes, nullability, data migrations, and
rollback behavior before applying it. Do not use `Base.metadata.create_all()`
for application schema management. Use separate development/test databases.

`Base` supplies a stable constraint naming convention. `TimestampMixin` is
opt-in for future models; no primary-key type or domain relationship is chosen
until the approved ERD is available. The request-scoped `get_db` dependency
closes sessions; future feature services own transaction commits and rollbacks.

There are no development seed rows yet because there are no domain tables.
When Phase 7 defines those tables, add explicit, idempotent development-only
seed commands using approved sample content; never seed production implicitly
at app startup or in a schema migration.

## Quality checks

```powershell
.\.venv\Scripts\python -m pytest
.\.venv\Scripts\python -m ruff check app tests migrations
.\.venv\Scripts\python -m ruff format --check app tests migrations
```
