import { notFound } from "next/navigation";

import { FeaturePlaceholder } from "@/features/shell/components/feature-placeholder";
import { featurePages, getFeaturePage } from "@/features/shell/config/feature-pages";

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

  return <FeaturePlaceholder content={content} />;
}
