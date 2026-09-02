import type { EntityId } from "@/types/common";

export type CampusNewsType = "news" | "update" | "announcement";

export type CampusNewsItem = Readonly<{
  id: EntityId;
  type: CampusNewsType;
  title: string;
  summary: string;
  content: readonly string[];
  publishedAt: string;
  publishedBy: string;
  audience: string;
}>;
