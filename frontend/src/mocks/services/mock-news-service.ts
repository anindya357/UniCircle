import { delay } from "@/lib/delay";
import { mockCampusNews } from "@/mocks/data/news";
import type { NewsService } from "@/services/contracts/news-service";

const mockLatencyMilliseconds = 160;

export class MockNewsService implements NewsService {
  async listItems() {
    await delay(mockLatencyMilliseconds);

    return mockCampusNews.toSorted(
      (first, second) =>
        new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime(),
    );
  }
}
