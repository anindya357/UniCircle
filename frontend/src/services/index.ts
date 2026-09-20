import { MockAdminService } from "@/mocks/services/mock-admin-service";
import { MockCampusAssistantService } from "@/mocks/services/mock-campus-assistant-service";
import { MockClubEventService } from "@/mocks/services/mock-club-event-service";
import { MockDirectoryService } from "@/mocks/services/mock-directory-service";
import { MockForumService } from "@/mocks/services/mock-forum-service";
import { MockNotificationService } from "@/mocks/services/mock-notification-service";
import { MockNewsService } from "@/mocks/services/mock-news-service";
import { MockResourceSharingService } from "@/mocks/services/mock-resource-sharing-service";
import { ApiAuthService } from "@/services/api/api-auth-service";
import { ApiProfileService } from "@/services/api/api-profile-service";
import { ApiSessionService } from "@/services/api/api-session-service";
import { MockTransportService } from "@/mocks/services/mock-transport-service";
import type { AdminService } from "@/services/contracts/admin-service";
import type { AuthService } from "@/services/contracts/auth-service";
import type { CampusAssistantService } from "@/services/contracts/campus-assistant-service";
import type { ClubEventService } from "@/services/contracts/club-event-service";
import type { DirectoryService } from "@/services/contracts/directory-service";
import type { ForumService } from "@/services/contracts/forum-service";
import type { NotificationService } from "@/services/contracts/notification-service";
import type { NewsService } from "@/services/contracts/news-service";
import type { ProfileService } from "@/services/contracts/profile-service";
import type { ResourceSharingService } from "@/services/contracts/resource-sharing-service";
import type { SessionService } from "@/services/contracts/session-service";
import type { TransportService } from "@/services/contracts/transport-service";

export const adminService: AdminService = new MockAdminService();
export const authService: AuthService = new ApiAuthService();
export const campusAssistantService: CampusAssistantService =
  new MockCampusAssistantService();
export const clubEventService: ClubEventService = new MockClubEventService();
export const directoryService: DirectoryService = new MockDirectoryService();
export const forumService: ForumService = new MockForumService();
export const notificationService: NotificationService = new MockNotificationService();
export const newsService: NewsService = new MockNewsService();
export const profileService: ProfileService = new ApiProfileService();
export const resourceSharingService: ResourceSharingService =
  new MockResourceSharingService();
export const sessionService: SessionService = new ApiSessionService();
export const transportService: TransportService = new MockTransportService();
