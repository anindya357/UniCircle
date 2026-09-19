import type { ReactNode } from "react";

import { AuthenticatedShell } from "@/features/auth/components/authenticated-shell";
import { clubEventService, notificationService } from "@/services";

type AuthenticatedLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const [notifications, clubEventSnapshot] = await Promise.all([
    notificationService.list(),
    clubEventService.getSnapshot(),
  ]);

  return (
    <AuthenticatedShell
      initialClubEventSnapshot={clubEventSnapshot}
      initialNotifications={notifications}
    >
      {children}
    </AuthenticatedShell>
  );
}
