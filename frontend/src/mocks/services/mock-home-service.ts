import type { HomeOverview } from "@/features/home/types/home-overview";
import { delay } from "@/lib/delay";
import { mockHomeOverview } from "@/mocks/data/home-overview";
import type { HomeService } from "@/services/contracts/home-service";

const mockLatencyMilliseconds = 80;

export class MockHomeService implements HomeService {
  async getOverview(): Promise<HomeOverview> {
    await delay(mockLatencyMilliseconds);
    return mockHomeOverview;
  }
}
