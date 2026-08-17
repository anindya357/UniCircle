# Authentication feature

The frontend authentication flow is implemented against typed mock services so the
complete UI can be reviewed before the backend exists.

- `/register` collects first name, last name, home address, username, role, and the
  corresponding Student/Teacher/Staff ID. It validates all required fields, the exact
  `@cuet.ac.bd` domain, and password strength.
- `/verify-otp` demonstrates verification, invalid/expired code feedback, and resend
  cooldown behavior.
- `/login` creates a General User mock session and redirects to Home.
- `/admin/login` creates a separate Admin mock session and redirects to the Admin page.
- Authenticated routes read a non-sensitive mock profile from `sessionStorage`; the
  Admin route additionally requires the `admin` role.

This storage is explicitly a frontend preview, not the production authentication
strategy. Passwords and OTP values are discarded after each mock request and are
never persisted. The backend phase will replace these services and define secure
token/session handling.
