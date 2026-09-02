"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { LoadingState } from "@/components/ui/feedback/loading-state";
import { routes } from "@/config/routes";
import { AuthenticatedUserProvider } from "@/features/auth/context/authenticated-user-context";
import type { SessionUser } from "@/features/auth/types/session-user";
import { NotificationProvider } from "@/features/notifications/hooks/use-notifications";
import type { AppNotification } from "@/features/notifications/types/notification";
import { Navbar } from "@/features/shell/components/navbar";
import { sessionService } from "@/services";

type AuthenticatedShellProps = Readonly<{
  children: ReactNode;
  initialNotifications: readonly AppNotification[];
}>;

export function AuthenticatedShell({
  children,
  initialNotifications,
}: AuthenticatedShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    let isCurrent = true;

    void sessionService.getCurrentUser().then((currentUser) => {
      if (!isCurrent) {
        return;
      }

      setUser(currentUser);

      if (!currentUser) {
        router.replace(routes.auth.login);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [router]);

  const isAdminRoute =
    pathname === routes.admin || pathname.startsWith(`${routes.admin}/`);
  const isUnauthorizedAdminRoute =
    user !== null && user !== undefined && isAdminRoute && user.role !== "admin";

  useEffect(() => {
    if (isUnauthorizedAdminRoute) {
      router.replace(routes.home);
    }
  }, [isUnauthorizedAdminRoute, router]);

  if (!user || isUnauthorizedAdminRoute) {
    return (
      <main className="app-shell" id="main-content">
        <LoadingState label="Checking your UniCircle session" />
      </main>
    );
  }

  return (
    <AuthenticatedUserProvider initialUser={user}>
      <NotificationProvider initialNotifications={initialNotifications}>
        <Navbar />
        {children}
      </NotificationProvider>
    </AuthenticatedUserProvider>
  );
}
