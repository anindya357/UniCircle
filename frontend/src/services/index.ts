import { ApiAdminService } from "@/services/api/api-admin-service";
import { MockCampusAssistantService } from "@/mocks/services/mock-campus-assistant-service";
import { ApiClubEventService } from "@/services/api/api-club-event-service";
import { MockForumService } from "@/mocks/services/mock-forum-service";
import { MockNotificationService } from "@/mocks/services/mock-notification-service";
import { MockNewsService } from "@/mocks/services/mock-news-service";
import { ApiResourceSharingService } from "@/services/api/api-resource-sharing-service";
import { ApiAuthService } from "@/services/api/api-auth-service";
import { ApiCampusExplorerService } from "@/services/api/api-campus-explorer-service";
import { ApiDirectoryService } from "@/services/api/api-directory-service";
import { ApiProfileService } from "@/services/api/api-profile-service";
import { ApiSessionService } from "@/services/api/api-session-service";
import { ApiTransportService } from "@/services/api/api-transport-service";
import type { AdminService } from "@/services/contracts/admin-service";
import type { AuthService } from "@/services/contracts/auth-service";
import type { CampusAssistantService } from "@/services/contracts/campus-assistant-service";
import type { CampusExplorerService } from "@/services/contracts/campus-explorer-service";
import type { ClubEventService } from "@/services/contracts/club-event-service";
import type { DirectoryService } from "@/services/contracts/directory-service";
import type { ForumService } from "@/services/contracts/forum-service";
import type { NotificationService } from "@/services/contracts/notification-service";
import type { NewsService } from "@/services/contracts/news-service";
import type { ProfileService } from "@/services/contracts/profile-service";
import type { ResourceSharingService } from "@/services/contracts/resource-sharing-service";
import type { SessionService } from "@/services/contracts/session-service";
import type { TransportService } from "@/services/contracts/transport-service";

export const adminService: AdminService = new ApiAdminService();
export const authService: AuthService = new ApiAuthService();
export const campusAssistantService: CampusAssistantService =
  new MockCampusAssistantService();
export const campusExplorerService: CampusExplorerService =
  new ApiCampusExplorerService();
export const clubEventService: ClubEventService = new ApiClubEventService();
export const directoryService: DirectoryService = new ApiDirectoryService();
export const forumService: ForumService = new MockForumService();
export const notificationService: NotificationService = new MockNotificationService();
export const newsService: NewsService = new MockNewsService();
export const profileService: ProfileService = new ApiProfileService();
export const resourceSharingService: ResourceSharingService =
  new ApiResourceSharingService();
export const sessionService: SessionService = new ApiSessionService();
export const transportService: TransportService = new ApiTransportService();
