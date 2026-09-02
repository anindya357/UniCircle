import type { TransportSnapshot } from "@/features/transport/types/transport";

export interface TransportService {
  getSnapshot(): Promise<TransportSnapshot>;
}
