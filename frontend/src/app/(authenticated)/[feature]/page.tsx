import { notFound } from "next/navigation";

import { AdminPage } from "@/features/admin/components/admin-page";
import { CampusAssistantPage } from "@/features/assistant/components/campus-assistant-page";
import { CampusExplorerPage } from "@/features/campus-explorer/components/campus-explorer-page";
import { ClubEventHub } from "@/features/clubs-events/components/club-event-hub";
import { DirectoryPage } from "@/features/directory/components/directory-page";
import { ForumPage } from "@/features/forum/components/forum-page";
import { NewsPage } from "@/features/news/components/news-page";
import { FeaturePlaceholder } from "@/features/shell/components/feature-placeholder";
import { featurePages, getFeaturePage } from "@/features/shell/config/feature-pages";
import { TransportPage } from "@/features/transport/components/transport-page";
import {
  adminService,
  clubEventService,
  forumService,
  newsService,
  transportService,
} from "@/services";

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

  if (feature === "transport") {
    const snapshot = await transportService.getSnapshot();

    return <TransportPage snapshot={snapshot} />;
  }

  if (feature === "forum") {
    const snapshot = await forumService.getSnapshot();

    return <ForumPage initialSnapshot={snapshot} />;
  }

  if (feature === "news") {
    const items = await newsService.listItems();

    return <NewsPage items={items} />;
  }

  if (feature === "assistant") {
    return <CampusAssistantPage />;
  }

  if (feature === "admin") {
    const snapshot = await adminService.getSnapshot();

    return <AdminPage initialSnapshot={snapshot} />;
  }

  return <FeaturePlaceholder content={content} />;
}
