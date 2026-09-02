import { delay } from "@/lib/delay";
import { mockForumSnapshot } from "@/mocks/data/forum";
import type { ForumService } from "@/services/contracts/forum-service";

const mockLatencyMilliseconds = 180;

export class MockForumService implements ForumService {
  async getSnapshot() {
    await delay(mockLatencyMilliseconds);
    return mockForumSnapshot;
  }
}
