# Environment configuration

UniCircle uses separate development, testing, and production configuration. The committed `.env.example` is the inventory of supported variables; actual `.env` files are ignored by Git.

## Variable ownership

| Variable | Owner | Browser-visible | Purpose |
| --- | --- | --- | --- |
| `APP_ENV` | Backend/runtime | No | Selects development, testing, or production behavior. |
| `FRONTEND_URL` | Backend/runtime | No | Canonical frontend origin for links and CORS configuration. |
| `BACKEND_URL` | Runtime | No | Canonical backend origin for server-side integration. |
| `NEXT_PUBLIC_API_URL` | Frontend | Yes | Public API base URL used by browser code. It must never contain credentials. |
| `DATABASE_URL` | Backend | No | PostgreSQL connection string. |
| `JWT_SECRET` | Backend | No | Signs/verifies authentication tokens. |
| `SMTP_HOST` | Backend | No | SMTP server hostname. |
| `SMTP_PORT` | Backend | No | SMTP server port. |
| `SMTP_USERNAME` | Backend | No | SMTP account identifier. |
| `SMTP_PASSWORD` | Backend | No | SMTP credential. |
| `SMTP_FROM_EMAIL` | Backend | No | Sender address for OTP messages. |
| `OPENAI_API_KEY` | Backend | No | AI-provider credential for the later RAG implementation. |

## Environment rules

- Development uses local services and developer-specific `.env` values.
- Testing uses isolated credentials and databases; it must not reuse development or production data.
- Production values come from the chosen platform's secret manager, not files committed to Git or baked into images.
- Only variables deliberately prefixed with `NEXT_PUBLIC_` may be read by browser code.
- Add vector-store or object-storage variables only after those technologies are approved.

