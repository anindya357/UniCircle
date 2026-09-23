import type { TransportSnapshot } from "@/features/transport/types/transport";
import type { TransportService } from "@/services/contracts/transport-service";
import { ServiceError } from "@/services/errors/service-error";

export class ApiTransportService implements TransportService {
  async getSnapshot(token?: string): Promise<TransportSnapshot> {
    const url = token
      ? new URL(
          "/api/v1/transport/snapshot?days=31",
          process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000",
        )
      : "/api/transport/transport/snapshot?days=31";
    try {
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: token ? undefined : "same-origin",
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.data) {
        throw new ServiceError(
          result?.error?.message ?? "Transport information could not be loaded.",
          response.status === 401 ? "unauthorized" : "unknown",
        );
      }
      return result.data as TransportSnapshot;
    } catch (cause) {
      if (cause instanceof ServiceError) throw cause;
      throw new ServiceError("Cannot reach the transport service.", "network", {
        cause,
      });
    }
  }
}
