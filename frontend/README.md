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
- `src/services/contracts` defines interfaces implemented by real authentication
  adapters and mock services for the remaining features.
- `src/mocks` contains typed mock repositories, services, and data.
- `src/config` owns public environment access and route constants.

Route components call service interfaces through `src/services`; they do not
import mock data directly. The auth adapters call same-origin BFF handlers,
which keep tokens out of browser JavaScript.
