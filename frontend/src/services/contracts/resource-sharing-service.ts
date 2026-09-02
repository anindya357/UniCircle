import type { ResourceSharingSnapshot } from "@/features/resources/types/resource-sharing";

export interface ResourceSharingService {
  getSnapshot(): Promise<ResourceSharingSnapshot>;
}
