import type { ReactNode } from "react";

import { AuthenticatedShell } from "@/features/auth/components/authenticated-shell";
import { notificationService } from "@/services";

type AuthenticatedLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const notifications = await notificationService.list();

  return (
    <AuthenticatedShell initialNotifications={notifications}>
      {children}
    </AuthenticatedShell>
  );
}
