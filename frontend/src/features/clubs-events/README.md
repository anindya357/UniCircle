# Clubs and events feature

Feature 5 provides two connected authenticated views:

- `/clubs` displays the complete club directory as rectangular navigation cards.
- `/clubs/[clubId]` gives each club its own page with club information, leadership,
  activities, and events grouped by lifecycle state.
- `/events` provides a campus-wide event feed with status filters and local
  `Interested`/`Going` prototype state.

The route reads typed club and event records through `ClubEventService`. The mock
implementation can be replaced with a backend service without changing the UI.
Event-start and event-finish notification records deep-link from the global
notification interface to matching event cards. All club information is prototype
content until backend-managed club records are available.
