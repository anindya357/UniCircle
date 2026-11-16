import { notFound } from "next/navigation";
import { cookies } from "next/headers";

import { AdminPage } from "@/features/admin/components/admin-page";
import { requireServerSessionUser } from "@/features/auth/lib/server-session";
import { CampusAssistantPage } from "@/features/assistant/components/campus-assistant-page";
import { ClubEventHub } from "@/features/clubs-events/components/club-event-hub";
import { ForumPage } from "@/features/forum/components/forum-page";
import { NewsPage } from "@/features/news/components/news-page";
import { FeaturePlaceholder } from "@/features/shell/components/feature-placeholder";
import { featurePages, getFeaturePage } from "@/features/shell/config/feature-pages";
import { TransportPage } from "@/features/transport/components/transport-page";
import { adminService, forumService, newsService, transportService } from "@/services";

type FeaturePageProps = Readonly<{
  params: Promise<{ feature: string }>;
}>;

export function generateStaticParams() {
  return featurePages
    .filter(({ slug }) => !["directory", "campus-explorer"].includes(slug))
    .map(({ slug }) => ({ feature: slug }));
}

export default async function FeaturePage({ params }: FeaturePageProps) {
  const user = await requireServerSessionUser();
  const { feature } = await params;
  const content = getFeaturePage(feature);

  if (!content) {
    notFound();
  }

  if (feature === "clubs" || feature === "events") {
    return <ClubEventHub view={feature} />;
  }

  if (feature === "transport") {
    const token = (await cookies()).get("unicircle_session")?.value;
    const snapshot = await transportService.getSnapshot(token);

    return <TransportPage snapshot={snapshot} />;
  }

  if (feature === "forum") {
    const token = (await cookies()).get("unicircle_session")?.value;
    const snapshot = await forumService.getSnapshot(token);

    return <ForumPage initialSnapshot={snapshot} />;
  }

  if (feature === "news") {
    const token = (await cookies()).get("unicircle_session")?.value;
    const items = await newsService.listItems(token);

    return <NewsPage items={items} />;
  }

  if (feature === "assistant") {
    return <CampusAssistantPage />;
  }

  if (feature === "admin") {
    if (user.role !== "admin") notFound();
    const token = (await cookies()).get("unicircle_session")?.value;
    const snapshot = await adminService.getSnapshot(token);

    return <AdminPage initialSnapshot={snapshot} />;
  }

  return <FeaturePlaceholder content={content} />;
}
