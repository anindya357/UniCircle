import type { SessionUser } from "@/features/auth/types/session-user";
import { delay } from "@/lib/delay";
import { mockSessionUser } from "@/mocks/data/session-user";
import type { SessionService } from "@/services/contracts/session-service";

const mockLatencyMilliseconds = 60;

export class MockSessionService implements SessionService {
  async getCurrentUser(): Promise<SessionUser> {
    await delay(mockLatencyMilliseconds);
    return mockSessionUser;
  }

  async logout(): Promise<void> {
    await delay(mockLatencyMilliseconds);
  }
}
