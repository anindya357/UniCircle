import { delay } from "@/lib/delay";
import { mockResourceSharingSnapshot } from "@/mocks/data/resource-sharing";
import type { ResourceSharingService } from "@/services/contracts/resource-sharing-service";

const mockLatencyMilliseconds = 180;

export class MockResourceSharingService implements ResourceSharingService {
  async getSnapshot() {
    await delay(mockLatencyMilliseconds);
    return mockResourceSharingSnapshot;
  }
}
