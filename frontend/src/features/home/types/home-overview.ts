import type { EntityId } from "@/types/common";

export type HomeFact = Readonly<{
  id: EntityId;
  value: string;
  label: string;
}>;

export type HomeHistoryEvent = Readonly<{
  id: EntityId;
  year: string;
  title: string;
  description: string;
}>;

export type HomeFeatureCard = Readonly<{
  id: EntityId;
  marker: string;
  title: string;
  description: string;
}>;

export type HomeGalleryImage = Readonly<{
  id: EntityId;
  src: string;
  alt: string;
  caption: string;
}>;

export type HomeVideo = Readonly<{
  title: string;
  description: string;
  src: string;
  poster: string;
  fallbackLabel: string;
}>;

export type HomeSource = Readonly<{
  label: string;
  url: string;
}>;

export type HomeOverview = Readonly<{
  hero: Readonly<{
    eyebrow: string;
    title: string;
    description: string;
  }>;
  facts: readonly HomeFact[];
  introduction: Readonly<{
    title: string;
    paragraphs: readonly string[];
  }>;
  history: readonly HomeHistoryEvent[];
  achievements: readonly HomeFeatureCard[];
  facilities: readonly HomeFeatureCard[];
  gallery: readonly HomeGalleryImage[];
  video: HomeVideo;
  sources: readonly HomeSource[];
}>;
