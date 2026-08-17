import type { AppNotification } from "@/features/notifications/types/notification";

export const mockNotifications = [
  {
    id: "notification-event-started",
    type: "event-started",
    title: "Programming contest has started",
    message:
      "The CUET Inter-University Programming Contest is now underway at the CSE building.",
    createdAt: "2026-08-17T14:30:00+06:00",
    isRead: false,
    href: "/events",
  },
  {
    id: "notification-announcement",
    type: "campus-announcement",
    title: "Academic calendar update",
    message: "A revised academic calendar has been published for the current term.",
    createdAt: "2026-08-17T10:15:00+06:00",
    isRead: false,
    href: "/news",
  },
  {
    id: "notification-campus-update",
    type: "campus-update",
    title: "Central library hours extended",
    message: "The central library will remain open until 9:00 PM on weekdays.",
    createdAt: "2026-08-16T16:45:00+06:00",
    isRead: true,
    href: "/news",
  },
  {
    id: "notification-event-finished",
    type: "event-finished",
    title: "Robotics workshop has finished",
    message:
      "The Robotics Society workshop has concluded. Event details remain available in the event hub.",
    createdAt: "2026-08-15T18:00:00+06:00",
    isRead: true,
    href: "/events",
  },
] as const satisfies readonly AppNotification[];
