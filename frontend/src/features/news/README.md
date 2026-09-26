# News and announcements feature

Feature 9 provides the `/news` information stream and `/news/[newsId]` detail pages.

- `NewsService` returns typed News, Update, and Announcement records newest first.
- The serial list shows publication time, summary, publisher, audience, and content type.
- Each item links to a readable detail view with its full Admin-authored content.
- The page includes a no-data state and responsive layouts without nested scrolling.
- Published Update and Announcement records generate persistent, recipient-scoped
  notifications that link to their detail pages.

The authenticated FastAPI API supplies list/detail data. Only published records are
visible here; creation, editing, deletion, and publication are App Admin operations.
