"use client";

import { EmptyState } from "@/components/ui/feedback/empty-state";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import type { AppNotification } from "@/features/notifications/types/notification";

import styles from "./notification-list.module.css";

type NotificationListProps = Readonly<{
  initialNotifications: readonly AppNotification[];
}>;

export function NotificationList({ initialNotifications }: NotificationListProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications(initialNotifications);

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="You're all caught up"
        description="Event activity and new campus announcements will appear here."
      />
    );
  }

  return (
    <section className={styles.section} aria-labelledby="notification-list-title">
      <div className={styles.toolbar}>
        <p id="notification-list-title">
          {unreadCount === 0
            ? "No unread notifications"
            : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
        </p>
        <button type="button" onClick={markAllAsRead} disabled={unreadCount === 0}>
          Mark all as read
        </button>
      </div>
      <div className={styles.list}>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
          />
        ))}
      </div>
    </section>
  );
}
