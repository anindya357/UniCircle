import type { Metadata } from "next";

import { AppShell } from "@/components/shared/app-shell";
import { NotificationList } from "@/features/notifications/components/notification-list";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsPage() {
  return (
    <AppShell>
      <header className="page-heading">
        <p className="eyebrow">Your activity</p>
        <h1>Notifications</h1>
        <p>Follow event activity and important campus announcements in one place.</p>
      </header>
      <NotificationList />
    </AppShell>
  );
}
