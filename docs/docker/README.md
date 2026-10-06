# Local Docker setup — Phases 10.2 and 10.3

Run commands from the repository root with Docker Desktop in Linux-container
mode. Docker's data remains in the previously configured D-drive location.
Frontend/backend images are runnable individually. `compose.yaml` currently
starts only PostgreSQL; full application Compose wiring is Phase 10.4.

## PostgreSQL development environment

```powershell
Copy-Item .env.compose.example .env.compose
```

Edit the ignored `.env.compose` and replace `POSTGRES_PASSWORD` with a new random
password used **only for this local database**. Leave the distinct development
database/user defaults or set your own. The committed example is a placeholder,
not a working secret. Do not copy production database credentials into this file.
Then start the database:

```powershell
docker compose --env-file .env.compose up --detach --wait postgres
docker compose --env-file .env.compose ps
```

The service uses pinned PostgreSQL 16 Alpine, SCRAM host authentication, the named
`unicircle_postgres_data` volume, and `pg_isready` health checks. It publishes only
`127.0.0.1:55432`, so other machines cannot connect through that binding. Set
`POSTGRES_PORT` if that port is occupied. Existing host/project databases are not
changed. This is a new empty database; reviewed Alembic migrations and feature
seeds must be applied explicitly before using the application.

Connection hosts depend on where the client runs:

| Client                                                   | Database host          | Port                         |
| -------------------------------------------------------- | ---------------------- | ---------------------------- |
| Backend running natively on this laptop                  | `127.0.0.1`            | `55432` (or `POSTGRES_PORT`) |
| Separate Docker Desktop backend using the published port | `host.docker.internal` | `55432`                      |
| Future backend sharing the Compose network               | `postgres`             | `5432`                       |

Use `postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE` for the backend's
runtime `DATABASE_URL`, with the matching values from `.env.compose`. URL-encode
reserved characters in username/password. Do not set this URL in frontend
environment files. For a local-only random password without URI delimiters:

```powershell
[guid]::NewGuid().ToString('N')
```

The backend container's default startup waits for an authenticated database
query before starting Uvicorn, with bounded retries and safe logs. Configure
`DATABASE_STARTUP_TIMEOUT_SECONDS` and `DATABASE_STARTUP_RETRY_SECONDS` at runtime
if needed. A standalone `python -m app.db.wait` command is available in the image.
Database readiness does not replace schema migrations. In Phase 10.4, Compose
backend dependency wiring will also use `condition: service_healthy`, following
[Docker's startup-order guidance](https://docs.docker.com/compose/how-tos/startup-order/).

Stop the database while preserving its data:

```powershell
docker compose --env-file .env.compose down
```

Normal shutdown/removal preserves the named volume. Do not add `--volumes`
unless you explicitly intend to erase this local database. Changing the initial
username/password/database environment values does not modify an already
initialized volume; use PostgreSQL administration to change credentials.
The development database account is not a production account. Production needs
separate runtime secrets, permissions, backups, and a reviewed hosting topology.

## Images and repeatable verification

```powershell
docker build --tag unicircle-frontend:phase10.2 ./frontend
docker build --tag unicircle-backend:phase10.3 ./backend
powershell -ExecutionPolicy Bypass -File backend/scripts/verify_docker.ps1 -Image unicircle-backend:phase10.3
powershell -ExecutionPolicy Bypass -File scripts/verify_postgres_docker.ps1
```

The PostgreSQL check uses a unique temporary Compose project, random test
credentials, and a random loopback port. It verifies database health, rejected
bad passwords, named-volume persistence after container recreation, backend
waiting while PostgreSQL is stopped, recovery when it starts, and graceful API
shutdown. It removes only its own test containers/network/volume in `finally`,
then restores process environment values. Real project data is never used.

Frontend runtime and desktop/mobile browser-check commands are in
[frontend/README.md](../../frontend/README.md); backend runtime, readiness,
migration, and seed commands are in [backend/README.md](../../backend/README.md).
