import type { AppNotification } from "@/features/notifications/types/notification";
import { mockCampusNews } from "@/mocks/data/news";

const mockEventNotifications = [
  {
    id: "notification-event-started",
    type: "event-started",
    title: "Inter-University Programming Contest has started",
    message:
      "The CUET Inter-University Programming Contest is now underway at the CSE building.",
    createdAt: "2026-09-02T09:00:00+06:00",
    isRead: false,
    href: "/events#event-inter-university-programming-contest",
  },
  {
    id: "notification-event-finished",
    type: "event-finished",
    title: "Robotics Systems Workshop has finished",
    message:
      "The Andromeda Space and Robotics Research Org workshop has concluded. Event details remain available in the event hub.",
    createdAt: "2026-08-28T17:30:00+06:00",
    isRead: true,
    href: "/events#event-robotics-workshop",
  },
] as const satisfies readonly AppNotification[];

const initiallyReadNewsIds = new Set([
  "freshers-orientation-schedule",
  "water-supply-maintenance",
]);

const mockNewsNotifications: readonly AppNotification[] = mockCampusNews
  .filter((item) => item.type === "update" || item.type === "announcement")
  .map((item) => ({
    id: `notification-news-${item.id}`,
    type: item.type === "announcement" ? "campus-announcement" : "campus-update",
    title: item.title,
    message: item.summary,
    createdAt: item.publishedAt,
    isRead: initiallyReadNewsIds.has(item.id),
    href: `/news/${item.id}`,
  }));

export const mockNotifications = [
  ...mockEventNotifications,
  ...mockNewsNotifications,
].toSorted(
  (first, second) =>
    new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
);
