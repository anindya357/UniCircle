import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { NewsDetailPage } from "@/features/news/components/news-detail-page";
import { requireServerSessionUser } from "@/features/auth/lib/server-session";
import { newsService } from "@/services";

type NewsDetailsRouteProps = Readonly<{
  params: Promise<{ newsId: string }>;
}>;

export async function generateMetadata({
  params,
}: NewsDetailsRouteProps): Promise<Metadata> {
  const { newsId } = await params;
  const token = (await cookies()).get("unicircle_session")?.value;
  const item = token
    ? await newsService.getItem(newsId, token).catch(() => null)
    : null;

  return {
    title: item?.title ?? "Campus news item not found",
    description: item?.summary,
  };
}

export default async function NewsDetailsRoute({ params }: NewsDetailsRouteProps) {
  await requireServerSessionUser();
  const { newsId } = await params;
  const token = (await cookies()).get("unicircle_session")?.value;
  const item = token
    ? await newsService.getItem(newsId, token).catch(() => null)
    : null;

  if (!item) {
    notFound();
  }

  return <NewsDetailPage item={item} />;
}
