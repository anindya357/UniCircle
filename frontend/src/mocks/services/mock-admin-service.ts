import type {
  AdminAnnouncement,
  AdminAnnouncementInput,
  AdminCommunityReport,
  AdminDriverInput,
  AdminRouteInput,
  AdminScheduleInput,
  PublishStatus,
  ReportStatus,
} from "@/features/admin/types/admin";
import { delay } from "@/lib/delay";
import { mockAdminSnapshot } from "@/mocks/data/admin";
import type { AdminService } from "@/services/contracts/admin-service";

const mockLatencyMilliseconds = 420;

function createId(prefix: string) {
  return `${prefix}-${Date.now()}`;
}

export class MockAdminService implements AdminService {
  async getSnapshot() {
    await delay(160);
    return mockAdminSnapshot;
  }

  async saveSchedule(input: AdminScheduleInput, id?: string) {
    await delay(mockLatencyMilliseconds);
    return { id: id ?? createId("schedule"), ...input };
  }

  async deleteSchedule(_id: string) {
    void _id;
    await delay(mockLatencyMilliseconds);
  }

  async saveRoute(input: AdminRouteInput, id?: string) {
    await delay(mockLatencyMilliseconds);
    return {
      id: id ?? createId("route"),
      name: input.name.trim(),
      stops: input.stops
        .split(",")
        .map((stop) => stop.trim())
        .filter(Boolean),
    };
  }

  async deleteRoute(_id: string) {
    void _id;
    await delay(mockLatencyMilliseconds);
  }

  async saveDriver(input: AdminDriverInput, id?: string) {
    await delay(mockLatencyMilliseconds);
    return { id: id ?? createId("driver"), ...input };
  }

  async deleteDriver(_id: string) {
    void _id;
    await delay(mockLatencyMilliseconds);
  }

  async saveAnnouncement(input: AdminAnnouncementInput, id?: string) {
    await delay(mockLatencyMilliseconds);
    return {
      id: id ?? createId("announcement"),
      ...input,
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteAnnouncement(_id: string) {
    void _id;
    await delay(mockLatencyMilliseconds);
  }

  async setAnnouncementStatus(announcement: AdminAnnouncement, status: PublishStatus) {
    await delay(mockLatencyMilliseconds);
    return { ...announcement, status, updatedAt: new Date().toISOString() };
  }

  async setReportStatus(report: AdminCommunityReport, status: ReportStatus) {
    await delay(mockLatencyMilliseconds);
    return { ...report, status };
  }
}
