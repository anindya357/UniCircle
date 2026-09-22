# UniCircle frontend

This directory contains the Next.js App Router frontend. It is TypeScript-first and organized by feature so UI, domain types, and feature-specific behavior stay together.

## Setup

Requires Node.js 20.19 or newer.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.
Set `BACKEND_API_URL` in that local file to the server-side FastAPI origin.
Authentication requires the backend database migration, JWT/OTP secrets, and
working SMTP credentials. No JWT or password belongs in a `NEXT_PUBLIC_*` value.

## Commands

```bash
npm run dev          # local development server
npm run check        # formatting, lint, and type checking
npm run build        # production build
npm run format       # apply Prettier formatting
```

## Architecture

- `src/app` owns routes, layouts, and framework-level loading/error UI.
- `src/features` owns feature-specific components and types.
- `src/components/ui` contains genuinely reusable presentation primitives.
- `src/components/shared` contains application-wide composition components.
- `src/services/contracts` defines interfaces implemented by real authentication,
  club/event, directory, and campus adapters, plus mock services for remaining features.
- `src/mocks` contains typed mock repositories, services, and data for features
  not yet connected to their backend.
- `src/features/home/content` contains the reviewed static Home content; the
  public Home route reads it directly because it has no API or CMS.
- `src/config` owns public environment access and route constants.

Other route components call service interfaces through `src/services`; they do
not import mock data directly. The auth adapters call same-origin BFF handlers,
which keep tokens out of browser JavaScript.

The club and event pages use the FastAPI club/event endpoints through a
same-origin `/api/club-events/*` handler. The club workspace appears only for
students mapped as admins of that club; the backend independently enforces
authorization for all changes. Admins can edit club details, add/remove other
verified student admins by student ID, and create, edit, or delete club events.
The ten initial clubs are seeded by the backend, and new events appear here
only after a Club Admin creates them. The event-notification dropdown remains
a separate integration step.
