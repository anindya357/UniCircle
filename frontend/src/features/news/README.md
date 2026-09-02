# News and announcements feature

Feature 9 provides the `/news` information stream and `/news/[newsId]` detail pages.

- `NewsService` returns typed News, Update, and Announcement records newest first.
- The serial list shows publication time, summary, publisher, audience, and content type.
- Each item links to a readable detail view with full prototype content.
- The page includes a no-data state and responsive layouts without nested scrolling.
- Mock Update and Announcement records automatically generate matching notification
  records that link to their detail pages.

The content is intentionally marked as prototype information. A later Admin/backend
feature will replace mock insertion with authorized publishing.
