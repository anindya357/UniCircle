import { notFound } from "next/navigation";

import { CampusExplorerPage } from "@/features/campus-explorer/components/campus-explorer-page";
import { ClubEventHub } from "@/features/clubs-events/components/club-event-hub";
import { DirectoryPage } from "@/features/directory/components/directory-page";
import { FeaturePlaceholder } from "@/features/shell/components/feature-placeholder";
import { featurePages, getFeaturePage } from "@/features/shell/config/feature-pages";
import { clubEventService } from "@/services";

type FeaturePageProps = Readonly<{
  params: Promise<{ feature: string }>;
}>;

export function generateStaticParams() {
  return featurePages.map(({ slug }) => ({ feature: slug }));
}

export default async function FeaturePage({ params }: FeaturePageProps) {
  const { feature } = await params;
  const content = getFeaturePage(feature);

  if (!content) {
    notFound();
  }

  if (feature === "directory") {
    return <DirectoryPage />;
  }

  if (feature === "campus-explorer") {
    return <CampusExplorerPage />;
  }

  if (feature === "clubs" || feature === "events") {
    const [clubs, events] = await Promise.all([
      clubEventService.listClubs(),
      clubEventService.listEvents(),
    ]);

    return <ClubEventHub clubs={clubs} events={events} view={feature} />;
  }

  return <FeaturePlaceholder content={content} />;
}
