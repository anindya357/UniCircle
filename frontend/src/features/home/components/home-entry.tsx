"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/shared/app-shell";
import { routes } from "@/config/routes";
import { AuthenticatedUserProvider } from "@/features/auth/context/authenticated-user-context";
import type { SessionUser } from "@/features/auth/types/session-user";
import { HomePageContent } from "@/features/home/components/home-page";
import type { HomeOverview } from "@/features/home/types/home-overview";
import { NotificationProvider } from "@/features/notifications/hooks/use-notifications";
import type { AppNotification } from "@/features/notifications/types/notification";
import { Navbar } from "@/features/shell/components/navbar";
import { sessionService } from "@/services";

import styles from "./home-entry.module.css";

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
      <header className={styles.publicHeader} data-session-loading={user === undefined}>
        <Link className={styles.brand} href={routes.home} aria-label="UniCircle home">
          <span aria-hidden="true">U</span>
          <span>
            <strong>UniCircle</strong>
            <small>CUET digital campus</small>
          </span>
        </Link>
        <nav aria-label="Account access">
          <Link href={routes.auth.login}>Login</Link>
          <Link href={routes.auth.register}>Sign up</Link>
        </nav>
      </header>
      <AppShell>
        <HomePageContent authenticated={false} overview={overview} />
      </AppShell>
    </>
  );
}
