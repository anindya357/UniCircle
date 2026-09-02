import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NewsDetailPage } from "@/features/news/components/news-detail-page";
import { newsService } from "@/services";

type NewsDetailsRouteProps = Readonly<{
  params: Promise<{ newsId: string }>;
}>;

export async function generateStaticParams() {
  const items = await newsService.listItems();

  return items.map((item) => ({ newsId: item.id }));
}

export async function generateMetadata({
  params,
}: NewsDetailsRouteProps): Promise<Metadata> {
  const [{ newsId }, items] = await Promise.all([params, newsService.listItems()]);
  const item = items.find((candidate) => candidate.id === newsId);

  return {
    title: item?.title ?? "Campus news item not found",
    description: item?.summary,
  };
}

export default async function NewsDetailsRoute({ params }: NewsDetailsRouteProps) {
  const [{ newsId }, items] = await Promise.all([params, newsService.listItems()]);
  const item = items.find((candidate) => candidate.id === newsId);

  if (!item) {
    notFound();
  }

  return <NewsDetailPage item={item} />;
}
