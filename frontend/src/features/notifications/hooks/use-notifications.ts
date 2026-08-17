"use client";

import { useMemo, useState } from "react";

import type { AppNotification } from "@/features/notifications/types/notification";
import { notificationService } from "@/services";
import type { EntityId } from "@/types/common";

export function useNotifications(initialNotifications: readonly AppNotification[]) {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    ...initialNotifications,
  ]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  function markAsRead(id: EntityId) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      ),
    );
    void notificationService.markAsRead(id);
  }

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true })),
    );
    void notificationService.markAllAsRead();
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
