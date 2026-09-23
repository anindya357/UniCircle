import type { TransportSnapshot } from "@/features/transport/types/transport";

export interface TransportService {
  getSnapshot(token?: string): Promise<TransportSnapshot>;
}
