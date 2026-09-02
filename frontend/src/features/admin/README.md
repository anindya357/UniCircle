# Admin feature

The Admin workspace is a role-protected frontend prototype for the responsibilities
defined in the project workflow:

- Transport schedules, recurring service windows, routes, and drivers.
- Campus news, updates, announcements, drafts, and publication state.
- Reported community posts with resolve and remove-post actions.

All mutations use the typed `AdminService` mock. The future FastAPI implementation
must apply server-side Admin authorization to every mapped operation; the frontend
role guard is only a user-experience boundary.
