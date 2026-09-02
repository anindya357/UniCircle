import type { CampusNewsType } from "@/features/news/types/campus-news";

export type AdminSectionId = "overview" | "transport" | "announcements" | "reports";
export type ScheduleRecurrence = "once" | "weekly" | "monthly";
export type PublishStatus = "draft" | "published";
export type ReportStatus = "open" | "resolved" | "post-removed";

export type AdminRoute = Readonly<{
  id: string;
  name: string;
  stops: readonly string[];
}>;

export type AdminDriver = Readonly<{
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
}>;

export type AdminSchedule = Readonly<{
  id: string;
  title: string;
  serviceDate: string;
  startTime: string;
  endTime: string;
  routeId: string;
  driverId: string;
  busName: string;
  recurrence: ScheduleRecurrence;
}>;

export type AdminAnnouncement = Readonly<{
  id: string;
  type: CampusNewsType;
  title: string;
  summary: string;
  audience: string;
  status: PublishStatus;
  updatedAt: string;
}>;

export type AdminCommunityReport = Readonly<{
  id: string;
  postId: string;
  authorName: string;
  reportedBy: string;
  reason: string;
  postBody: string;
  reportedAt: string;
  status: ReportStatus;
}>;

export type AdminSnapshot = Readonly<{
  routes: readonly AdminRoute[];
  drivers: readonly AdminDriver[];
  schedules: readonly AdminSchedule[];
  announcements: readonly AdminAnnouncement[];
  reports: readonly AdminCommunityReport[];
}>;

export type AdminRouteInput = Omit<AdminRoute, "id" | "stops"> & {
  stops: string;
};

export type AdminDriverInput = Omit<AdminDriver, "id">;

export type AdminScheduleInput = Omit<AdminSchedule, "id">;

export type AdminAnnouncementInput = Omit<AdminAnnouncement, "id" | "updatedAt">;
