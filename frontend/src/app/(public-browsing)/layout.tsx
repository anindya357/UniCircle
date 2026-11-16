import type { ReactNode } from "react";

import AuthenticatedLayout from "@/app/(authenticated)/layout";
import { getServerSessionUser } from "@/features/auth/lib/server-session";
import { PublicNavbar } from "@/features/shell/components/public-navbar";

export default async function PublicBrowsingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const user = await getServerSessionUser().catch(() => null);
  if (user) return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
  return (
    <>
      <PublicNavbar />
      {children}
    </>
  );
}
