import { delay } from "@/lib/delay";
import { mockForumSnapshot } from "@/mocks/data/forum";
import type { ForumService } from "@/services/contracts/forum-service";
import type { ForumComment, ForumPost } from "@/features/forum/types/forum";

const mockLatencyMilliseconds = 180;

export class MockForumService implements ForumService {
  async getSnapshot() {
    await delay(mockLatencyMilliseconds);
    return mockForumSnapshot;
  }

  async createPost(body: string): Promise<ForumPost> {
    return {
      id: `forum-post-${Date.now()}`,
      author: mockForumSnapshot.currentUser,
      body,
      createdAt: new Date().toISOString(),
      comments: [],
      isReportedByCurrentUser: false,
    };
  }

  async createComment(postId: string, body: string): Promise<ForumComment> {
    return {
      id: `forum-comment-${Date.now()}`,
      postId,
      author: mockForumSnapshot.currentUser,
      body,
      createdAt: new Date().toISOString(),
    };
  }

  async reportPost(_postId: string, _reason: string): Promise<void> {
    void _postId;
    void _reason;
  }
}
