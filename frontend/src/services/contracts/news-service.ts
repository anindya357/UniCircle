import type { CampusNewsItem } from "@/features/news/types/campus-news";

export interface NewsService {
  listItems(token?: string): Promise<readonly CampusNewsItem[]>;
  getItem(id: string, token?: string): Promise<CampusNewsItem>;
}
