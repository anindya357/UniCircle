import type { AppNotification } from "@/features/notifications/types/notification";
import { delay } from "@/lib/delay";
import { mockNotifications } from "@/mocks/data/notifications";
import type { NotificationService } from "@/services/contracts/notification-service";
import type { EntityId } from "@/types/common";

const mockLatencyMilliseconds = 50;

export class MockNotificationService implements NotificationService {
  private readonly readNotificationIds = new Set<EntityId>();

  async list(): Promise<readonly AppNotification[]> {
    await delay(mockLatencyMilliseconds);
    return mockNotifications.map((notification) => ({
      ...notification,
      isRead: notification.isRead || this.readNotificationIds.has(notification.id),
    }));
  }

  async markAsRead(id: EntityId): Promise<void> {
    await delay(mockLatencyMilliseconds);
    this.readNotificationIds.add(id);
  }

  async markAllAsRead(): Promise<void> {
    await delay(mockLatencyMilliseconds);
    mockNotifications.forEach((notification) =>
      this.readNotificationIds.add(notification.id),
    );
  }
}
