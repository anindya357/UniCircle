# UniCircle

UniCircle is a smart digital campus platform for Chittagong University of Engineering & Technology (CUET). It will bring campus information, clubs and events, resource sharing, transport, community discussions, announcements, notifications, and a campus-focused AI assistant into one application.

## Current status

The project is being implemented incrementally from the approved project context and feature-wise plan. The current repository foundation separates the Next.js frontend, FastAPI backend, documentation, scripts, and deployment assets so each layer can evolve without mixing responsibilities.

## Planned technology stack

- Frontend: Next.js, React, and TypeScript
- Backend: FastAPI and Python
- Database: PostgreSQL with SQLAlchemy and Alembic
- Authentication: JWT and email OTP verification
- AI assistant: LangChain-based retrieval-augmented generation
- Delivery: Docker, Docker Compose, and GitHub Actions

## Repository structure

```text
.
|-- frontend/              # Next.js application
|-- backend/               # FastAPI application (added in the backend phase)
|-- docs/
|   |-- api/               # API contracts and reference material
|   |-- design/            # Approved architecture and design artifacts
|   |-- deployment/        # Deployment and operations documentation
|   |-- development/       # Contributor workflow and environment guidance
|   `-- testing/           # Test strategy and reports
|-- docker/                # Docker support files added during Dockerization
|-- scripts/               # Repeatable development and maintenance scripts
|-- .github/               # Pull-request and issue templates; workflows later
|-- compose.yaml           # Compose scaffold, populated during Dockerization
`-- .env.example           # Documented environment-variable template
```

## Prerequisites

- Node.js 20.19 or newer and npm
- Python 3.12 or newer (required when backend development starts)
- PostgreSQL (required when backend development starts)
- Git

## Local setup

1. Clone the repository.
2. Copy `.env.example` to `.env` for the future full-stack runtime. Never commit `.env`.
3. Copy `frontend/.env.example` to `frontend/.env.local` for the browser-safe frontend configuration.
4. Install and run the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Open `http://localhost:3000`.

Backend and full-stack Docker commands will be documented when those phases are implemented.

## Quality checks

From `frontend/`, run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

## Project references

- [AI project context](./UniCircle_AI_Project_Context.md)
- [Feature-wise implementation plan](./UniCircle_Feature_Wise_Implementation_TODO.md)
- [Environment configuration](./docs/development/environment.md)
- [Git workflow](./docs/development/git-workflow.md)

## Security

Do not commit real passwords, tokens, OTP values, database credentials, SMTP credentials, or AI-provider keys. Browser-visible variables must use the `NEXT_PUBLIC_` prefix and must never contain secrets.
