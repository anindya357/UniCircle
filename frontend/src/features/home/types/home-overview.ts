import type { EntityId } from "@/types/common";

export type FeatureSummary = Readonly<{
  id: EntityId;
  sequence: number;
  name: string;
  description: string;
}>;

export type HomeOverview = Readonly<{
  platformName: string;
  tagline: string;
  modules: readonly FeatureSummary[];
}>;
