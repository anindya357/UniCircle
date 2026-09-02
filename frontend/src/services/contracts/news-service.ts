import type { CampusNewsItem } from "@/features/news/types/campus-news";

export interface NewsService {
  listItems(): Promise<readonly CampusNewsItem[]>;
}
