import type { ReactNode } from "react";

import { ResourceSharingProvider } from "@/features/resources/context/resource-sharing-context";
import { resourceSharingService } from "@/services";

type ResourceSharingLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function ResourceSharingLayout({
  children,
}: ResourceSharingLayoutProps) {
  const snapshot = await resourceSharingService.getSnapshot();

  return (
    <ResourceSharingProvider initialSnapshot={snapshot}>
      {children}
    </ResourceSharingProvider>
  );
}
