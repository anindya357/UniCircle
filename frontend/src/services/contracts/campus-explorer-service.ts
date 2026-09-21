import type { CampusExplorerSnapshot } from "@/features/campus-explorer/types/campus-location";

export interface CampusExplorerService {
  getSnapshot(): Promise<CampusExplorerSnapshot>;
}
