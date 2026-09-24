import { validateCuetEmail } from "@/features/auth/lib/auth-validation";
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
  MembershipRequest,
  MembershipRequestInput,
  MembershipSettingsInput,
  RegisteredStudent,
} from "@/features/clubs-events/types/club-event";
import { delay } from "@/lib/delay";
import {
  mockCampusClubs,
  mockCampusEvents,
  mockClubCreationRequests,
  mockEventRegistrations,
  mockRegisteredStudents,
} from "@/mocks/data/clubs-events";
import type { ClubEventService } from "@/services/contracts/club-event-service";

const mockLatencyMilliseconds = 150;

export class MockClubEventService implements ClubEventService {
  async setInterest(eventId: string, status: AttendanceStatus): Promise<CampusEvent> {
    const event = mockCampusEvents.find((item) => item.id === eventId);
    if (!event) throw new Error("Event not found.");
    return { ...event, myInterest: status };
  }
  async getSnapshot(): Promise<ClubEventSnapshot> {
    await delay(mockLatencyMilliseconds);
    return {
      clubs: mockCampusClubs,
      events: mockCampusEvents,
      students: mockRegisteredStudents,
      clubRequests: mockClubCreationRequests,
      registrations: mockEventRegistrations,
    };
  }

  async listClubs(): Promise<readonly CampusClub[]> {
    await delay(mockLatencyMilliseconds);
    return mockCampusClubs;
  }

  async listEvents(): Promise<readonly CampusEvent[]> {
    await delay(mockLatencyMilliseconds);
    return mockCampusEvents;
  }

  async submitClubRequest(
    input: ClubCreationRequestInput,
    requester: RegisteredStudent,
  ): Promise<ClubCreationRequest> {
    await delay(mockLatencyMilliseconds);
    return {
      id: `club-request-${Date.now()}`,
      requestedByUserId: requester.userId,
      requestedByName: requester.name,
      requestedByStudentId: requester.studentId,
      name: input.name.trim(),
      shortName: input.shortName.trim().toUpperCase(),
      category: input.category.trim(),
      tagline: input.tagline.trim(),
      description: input.description.trim(),
      purpose: input.purpose.trim(),
      activities: splitActivities(input.activities),
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
  }

  async reviewClubRequest(
    request: ClubCreationRequest,
    status: Exclude<ClubRequestStatus, "pending">,
  ): Promise<{ request: ClubCreationRequest; club?: CampusClub }> {
    await delay(mockLatencyMilliseconds);
    const reviewedRequest = {
      ...request,
      status,
      reviewedAt: new Date().toISOString(),
    } satisfies ClubCreationRequest;

    if (status === "rejected") return { request: reviewedRequest };

    return {
      request: reviewedRequest,
      club: {
        id: `${slugify(request.name)}-${Date.now()}`,
        shortName: request.shortName,
        name: request.name,
        category: request.category,
        tagline: request.tagline,
        description: request.description,
        memberCount: 1,
        accent: "#0d6a45",
        activities: request.activities,
        leaders: [],
        adminUserIds: [request.requestedByUserId],
      },
    };
  }

  async saveClub(input: ClubProfileInput, current: CampusClub): Promise<CampusClub> {
    await delay(mockLatencyMilliseconds);
    return {
      ...current,
      ...input,
      name: input.name.trim(),
      shortName: input.shortName.trim().toUpperCase(),
      category: input.category.trim(),
      tagline: input.tagline.trim(),
      description: input.description.trim(),
      activities: splitActivities(input.activities),
    };
  }

  async setClubAdmins(
    club: CampusClub,
    adminUserIds: readonly string[],
  ): Promise<CampusClub> {
    await delay(mockLatencyMilliseconds);
    return { ...club, adminUserIds: [...new Set(adminUserIds)] };
  }

  async updateMembershipSettings(
    clubId: string,
    input: MembershipSettingsInput,
  ): Promise<CampusClub> {
    const club = mockCampusClubs.find((item) => item.id === clubId);
    if (!club) throw new Error("Club not found.");
    return {
      ...club,
      membershipRecruitment: {
        open: input.open,
        fee: 200,
        bkashNumber: input.bkashNumber || undefined,
        nagadNumber: input.nagadNumber || undefined,
      },
    };
  }

  async submitMembershipRequest(
    clubId: string,
    input: MembershipRequestInput,
  ): Promise<MembershipRequest> {
    return {
      ...input,
      id: `membership-${Date.now()}`,
      clubId,
      userId: "mock-user",
      fee: 200,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
  }

  async listMembershipRequests(_clubId: string): Promise<readonly MembershipRequest[]> {
    void _clubId;
    return [];
  }

  async approveMembershipRequest(
    clubId: string,
    _requestId: string,
  ): Promise<{ request: MembershipRequest; club: CampusClub }> {
    void clubId;
    void _requestId;
    throw new Error("No mock membership request is available.");
  }

  async removeMembershipRequest(_clubId: string, _requestId: string): Promise<void> {
    void _clubId;
    void _requestId;
  }

  async saveEvent(
    input: CampusEventInput,
    clubId: string,
    current?: CampusEvent,
  ): Promise<CampusEvent> {
    await delay(mockLatencyMilliseconds);
    if (!input.title.trim() || !input.summary.trim() || !input.location.trim()) {
      throw new Error("Add an event title, summary, and venue.");
    }
    if (
      !input.startsAt ||
      !input.endsAt ||
      Date.parse(input.endsAt) <= Date.parse(input.startsAt)
    ) {
      throw new Error("The event end time must be after its start time.");
    }
    if (input.registration.enabled && input.registration.isPaid) {
      if (
        !input.registration.feeAmount ||
        input.registration.feeAmount <= 0 ||
        !input.registration.bkashNumber?.trim()
      ) {
        throw new Error("Paid registration requires a fee and bKash number.");
      }
    }
    return {
      ...input,
      title: input.title.trim(),
      category: input.category.trim(),
      summary: input.summary.trim(),
      location: input.location.trim(),
      startsAt: normalizeCampusDate(input.startsAt),
      endsAt: normalizeCampusDate(input.endsAt),
      registration: input.registration.enabled
        ? input.registration.isPaid
          ? {
              ...input.registration,
              bkashNumber: input.registration.bkashNumber?.trim(),
            }
          : { enabled: true, isPaid: false }
        : { enabled: false, isPaid: false },
      id: current?.id ?? `event-${Date.now()}`,
      clubId,
      attendeeCount: current?.attendeeCount ?? 0,
      registeredCount: current?.registeredCount ?? 0,
    };
  }

  async deleteEvent(_eventId: string): Promise<void> {
    void _eventId;
    await delay(mockLatencyMilliseconds);
  }

  async registerForEvent(
    eventId: string,
    userId: string,
    input: EventRegistrationInput,
  ): Promise<EventRegistration> {
    await delay(mockLatencyMilliseconds);
    if (!input.name.trim() || !input.studentId.trim() || !input.department.trim()) {
      throw new Error("Complete your name, student ID, and department.");
    }
    const emailError = validateCuetEmail(input.email);
    if (emailError) {
      throw new Error(emailError);
    }
    return {
      ...input,
      name: input.name.trim(),
      email: input.email.trim(),
      studentId: input.studentId.trim(),
      department: input.department.trim(),
      bkashTransactionId: input.bkashTransactionId?.trim() || undefined,
      id: `registration-${Date.now()}`,
      eventId,
      userId,
      registeredAt: new Date().toISOString(),
    };
  }
}

function normalizeCampusDate(value: string): string {
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}:00+06:00`;
}

function splitActivities(value: string): readonly string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
