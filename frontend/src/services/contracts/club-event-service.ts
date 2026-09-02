import type { CampusClub, CampusEvent } from "@/features/clubs-events/types/club-event";

export interface ClubEventService {
  listClubs(): Promise<readonly CampusClub[]>;
  listEvents(): Promise<readonly CampusEvent[]>;
}
