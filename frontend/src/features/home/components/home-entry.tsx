"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/shared/app-shell";
import { AuthenticatedUserProvider } from "@/features/auth/context/authenticated-user-context";
import type { SessionUser } from "@/features/auth/types/session-user";
import { HomePageContent } from "@/features/home/components/home-page";
import type { HomeOverview } from "@/features/home/types/home-overview";
import { NotificationProvider } from "@/features/notifications/hooks/use-notifications";
import type { AppNotification } from "@/features/notifications/types/notification";
import { PublicNavbar } from "@/features/shell/components/public-navbar";
import { Navbar } from "@/features/shell/components/navbar";
import { sessionService } from "@/services";

export function HomeEntry({
  overview,
  notifications,
}: Readonly<{
  overview: HomeOverview;
  notifications: readonly AppNotification[];
}>) {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    let isCurrent = true;
    void sessionService
      .getCurrentUser()
      .then((currentUser) => {
        if (isCurrent) setUser(currentUser);
      })
      .catch(() => {
        if (isCurrent) setUser(null);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  if (user) {
    return (
      <AuthenticatedUserProvider initialUser={user}>
        <NotificationProvider initialNotifications={notifications}>
          <Navbar />
          <AppShell>
            <HomePageContent authenticated overview={overview} />
          </AppShell>
        </NotificationProvider>
      </AuthenticatedUserProvider>
    );
  }

  return (
    <>
      <PublicNavbar loading={user === undefined} />
      <AppShell>
        <HomePageContent authenticated={false} overview={overview} />
      </AppShell>
    </>
  );
}
