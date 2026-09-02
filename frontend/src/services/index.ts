import { MockAuthService } from "@/mocks/services/mock-auth-service";
import { MockCampusAssistantService } from "@/mocks/services/mock-campus-assistant-service";
import { MockClubEventService } from "@/mocks/services/mock-club-event-service";
import { MockDirectoryService } from "@/mocks/services/mock-directory-service";
import { MockForumService } from "@/mocks/services/mock-forum-service";
import { MockHomeService } from "@/mocks/services/mock-home-service";
import { MockNotificationService } from "@/mocks/services/mock-notification-service";
import { MockNewsService } from "@/mocks/services/mock-news-service";
import { MockResourceSharingService } from "@/mocks/services/mock-resource-sharing-service";
import { MockSessionService } from "@/mocks/services/mock-session-service";
import { MockTransportService } from "@/mocks/services/mock-transport-service";
import type { AuthService } from "@/services/contracts/auth-service";
import type { CampusAssistantService } from "@/services/contracts/campus-assistant-service";
import type { ClubEventService } from "@/services/contracts/club-event-service";
import type { DirectoryService } from "@/services/contracts/directory-service";
import type { ForumService } from "@/services/contracts/forum-service";
import type { HomeService } from "@/services/contracts/home-service";
import type { NotificationService } from "@/services/contracts/notification-service";
import type { NewsService } from "@/services/contracts/news-service";
import type { ResourceSharingService } from "@/services/contracts/resource-sharing-service";
import type { SessionService } from "@/services/contracts/session-service";
import type { TransportService } from "@/services/contracts/transport-service";

export const authService: AuthService = new MockAuthService();
export const campusAssistantService: CampusAssistantService =
  new MockCampusAssistantService();
export const clubEventService: ClubEventService = new MockClubEventService();
export const directoryService: DirectoryService = new MockDirectoryService();
export const forumService: ForumService = new MockForumService();
export const homeService: HomeService = new MockHomeService();
export const notificationService: NotificationService = new MockNotificationService();
export const newsService: NewsService = new MockNewsService();
export const resourceSharingService: ResourceSharingService =
  new MockResourceSharingService();
export const sessionService: SessionService = new MockSessionService();
export const transportService: TransportService = new MockTransportService();
