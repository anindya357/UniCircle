import type { SessionUser } from "@/features/auth/types/session-user";
import { delay } from "@/lib/delay";
import { clearMockSession, readMockSession } from "@/mocks/storage/mock-session-store";
import type { SessionService } from "@/services/contracts/session-service";

const mockLatencyMilliseconds = 60;

export class MockSessionService implements SessionService {
  async getCurrentUser(): Promise<SessionUser | null> {
    await delay(mockLatencyMilliseconds);
    return readMockSession();
  }

  async logout(): Promise<void> {
    await delay(mockLatencyMilliseconds);
    clearMockSession();
  }
}
