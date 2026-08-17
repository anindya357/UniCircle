import type { HomeOverview } from "@/features/home/types/home-overview";

export interface HomeService {
  getOverview(): Promise<HomeOverview>;
}
