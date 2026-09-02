# Notifications feature

Owns the notification dropdown, full-page list, typed notification model, timestamp
formatting, and mock read-state behavior. A provider in the authenticated shell keeps
the navbar dropdown and notification page synchronized. The components depend on the
notification service contract so the mock implementation can later be replaced by
the authenticated API.

Mock campus Update and Announcement notifications are derived from the Feature 9 news
dataset, keeping their title, summary, timestamp, and detail link synchronized.
