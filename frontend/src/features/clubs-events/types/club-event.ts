export type EventStatus = "ongoing" | "upcoming" | "finished";

export type AttendanceStatus = "none" | "interested" | "going";

export type ClubMember = Readonly<{
  id: string;
  name: string;
  role: string;
  department: string;
}>;

export type CampusClub = Readonly<{
  id: string;
  shortName: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  memberCount: number;
  accent: string;
  activities: readonly string[];
  leaders: readonly ClubMember[];
}>;

export type CampusEvent = Readonly<{
  id: string;
  clubId: string;
  title: string;
  category: string;
  summary: string;
  location: string;
  startsAt: string;
  endsAt: string;
  status: EventStatus;
  attendeeCount: number;
}>;
