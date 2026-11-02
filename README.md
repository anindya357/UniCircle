# UniCircle

UniCircle is a smart digital campus platform for Chittagong University of Engineering & Technology (CUET). It will bring campus information, clubs and events, resource sharing, transport, community discussions, announcements, notifications, and a campus-focused AI assistant into one application.

## Current status

The repository contains the Next.js frontend, FastAPI backend, authentication and
campus/community features, documentation, automated checks, and deployment
assets. The configured cloud deployment uses Vercel Services and Neon PostgreSQL.
Feature status and remaining work are tracked in the implementation plan.

Visit the current version at the live site: [UniCircle-CUET](https://unicircle-cuet.vercel.app)

## Technology stack

- Frontend: Next.js, React, and TypeScript
- Backend: FastAPI and Python
- Database: PostgreSQL with SQLAlchemy and Alembic
- Authentication: JWT and email OTP verification
- AI assistant: LangChain-based RAG, curated CUET knowledge, bundled FastEmbed embeddings, and Groq chat; optional local Ollama
- Delivery: Vercel Services, Neon PostgreSQL, Docker, Docker Compose, and GitHub Actions

## Repository structure

```text
.
|-- frontend/              # Next.js application
|-- backend/               # FastAPI features, PostgreSQL ORM, and Alembic migrations
|-- docs/
|   |-- api/               # API contracts and reference material
|   |-- design/            # Architecture, UML, repository model, and API design
|   |-- deployment/        # Deployment and operations documentation
|   |-- development/       # Contributor workflow and environment guidance
|   `-- testing/           # Test strategy and reports
|-- docker/                # Docker support files
|-- scripts/               # Repeatable development and maintenance scripts
|-- .github/               # CI/CD workflows, pull-request and issue templates
|-- compose.yaml           # Local production-image stack
|-- vercel.json            # Frontend/backend service deployment and private binding
`-- .env.example           # Documented environment-variable template
```

## Prerequisites

- Node.js 20.19 or newer and npm
- Python 3.12 or newer
- PostgreSQL 17 or compatible server
- Git

## Local setup

1. Clone the repository.
2. Copy `.env.example` to `.env` and configure local runtime values. Never commit `.env`.
3. Copy `frontend/.env.example` to `frontend/.env.local` for the browser-safe frontend configuration.
4. Install and run the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Open `http://localhost:3000`.

The backend setup, local PostgreSQL role/database, and migration commands are in
[backend/README.md](./backend/README.md). Full-stack Docker commands are in
[the Docker guide](./docs/docker/README.md); cloud operations are in
[the deployment runbook](./docs/deployment/README.md).

## Quality checks

From `frontend/`, run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

From `backend/`, after installing `.[dev]`, run:

```bash
python -m pytest
python -m ruff check app tests migrations
python -m ruff format --check app tests migrations
```

## Project references

- [AI project context](./UniCircle_AI_Project_Context.md)
- [Feature-wise implementation plan](./UniCircle_Feature_Wise_Implementation_TODO.md)
- [System design index and diagrams](./docs/design/README.md)
- [UML activity diagrams](./docs/design/Activity_Diagram.md)
- [UML deployment diagram](./docs/design/Deployment_Diagram.md)
- [Data-centred architectural model](./docs/design/Data_Centred_Architectural_Model.md)
- [Environment configuration](./docs/development/environment.md)
- [Git workflow](./docs/development/git-workflow.md)

## Security

Do not commit real passwords, tokens, OTP values, database credentials, SMTP credentials, or AI-provider keys. Browser-visible variables must use the `NEXT_PUBLIC_` prefix and must never contain secrets.
