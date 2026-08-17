import type { ReactNode } from "react";

import { Navbar } from "@/features/shell/components/navbar";
import { notificationService, sessionService } from "@/services";

type AuthenticatedLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const [user, notifications] = await Promise.all([
    sessionService.getCurrentUser(),
    notificationService.list(),
  ]);

  return (
    <>
      <Navbar user={user} initialNotifications={notifications} />
      {children}
    </>
  );
}
