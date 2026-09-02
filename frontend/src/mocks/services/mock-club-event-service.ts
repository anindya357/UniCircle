import type { CampusClub, CampusEvent } from "@/features/clubs-events/types/club-event";
import { delay } from "@/lib/delay";
import { mockCampusClubs, mockCampusEvents } from "@/mocks/data/clubs-events";
import type { ClubEventService } from "@/services/contracts/club-event-service";

const mockLatencyMilliseconds = 150;

export class MockClubEventService implements ClubEventService {
  async listClubs(): Promise<readonly CampusClub[]> {
    await delay(mockLatencyMilliseconds);
    return mockCampusClubs;
  }

  async listEvents(): Promise<readonly CampusEvent[]> {
    await delay(mockLatencyMilliseconds);
    return mockCampusEvents;
  }
}
