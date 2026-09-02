import type { Metadata } from "next";

import { ResourceHubPage } from "@/features/resources/components/resource-hub-page";

export const metadata: Metadata = {
  title: "Resource sharing",
  description: "Request and share everyday resources with the CUET community.",
};

export default function ResourcesPage() {
  return <ResourceHubPage />;
}
