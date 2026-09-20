import type { ReactNode } from "react";

import { AuthenticatedShell } from "@/features/auth/components/authenticated-shell";
import { requireServerSessionUser } from "@/features/auth/lib/server-session";
import { clubEventService, notificationService } from "@/services";

type AuthenticatedLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const user = await requireServerSessionUser();
  const [notifications, clubEventSnapshot] = await Promise.all([
    notificationService.list(),
    clubEventService.getSnapshot(),
  ]);

  return (
    <AuthenticatedShell
      initialUser={user}
      initialClubEventSnapshot={clubEventSnapshot}
      initialNotifications={notifications}
    >
      {children}
    </AuthenticatedShell>
  );
}
