import type { ForumSnapshot } from "@/features/forum/types/forum";

export interface ForumService {
  getSnapshot(): Promise<ForumSnapshot>;
}
