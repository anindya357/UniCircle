import type {
  AttendanceStatus,
  CampusClub,
  CampusEvent,
  CampusEventInput,
  ClubCreationRequest,
  ClubCreationRequestInput,
  ClubEventSnapshot,
  ClubProfileInput,
  ClubRequestStatus,
  EventRegistration,
  EventRegistrationInput,
  RegisteredStudent,
} from "@/features/clubs-events/types/club-event";

export interface ClubEventService {
  getSnapshot(token?: string, role?: string): Promise<ClubEventSnapshot>;
  listClubs(): Promise<readonly CampusClub[]>;
  listEvents(): Promise<readonly CampusEvent[]>;
  submitClubRequest(
    input: ClubCreationRequestInput,
    requester: RegisteredStudent,
  ): Promise<ClubCreationRequest>;
  reviewClubRequest(
    request: ClubCreationRequest,
    status: Exclude<ClubRequestStatus, "pending">,
  ): Promise<{ request: ClubCreationRequest; club?: CampusClub }>;
  saveClub(input: ClubProfileInput, current: CampusClub): Promise<CampusClub>;
  setClubAdmins(club: CampusClub, adminUserIds: readonly string[]): Promise<CampusClub>;
  saveEvent(
    input: CampusEventInput,
    clubId: string,
    current?: CampusEvent,
  ): Promise<CampusEvent>;
  deleteEvent(eventId: string): Promise<void>;
  setInterest(eventId: string, status: AttendanceStatus): Promise<CampusEvent>;
  registerForEvent(
    eventId: string,
    userId: string,
    input: EventRegistrationInput,
  ): Promise<EventRegistration>;
}
