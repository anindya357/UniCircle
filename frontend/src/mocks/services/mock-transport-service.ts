import { delay } from "@/lib/delay";
import { mockTransportSnapshot } from "@/mocks/data/transport";
import type { TransportService } from "@/services/contracts/transport-service";

const mockLatencyMilliseconds = 160;

export class MockTransportService implements TransportService {
  async getSnapshot() {
    await delay(mockLatencyMilliseconds);
    return mockTransportSnapshot;
  }
}
