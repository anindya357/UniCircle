import { MockAuthService } from "@/mocks/services/mock-auth-service";
import { MockClubEventService } from "@/mocks/services/mock-club-event-service";
import { MockDirectoryService } from "@/mocks/services/mock-directory-service";
import { MockHomeService } from "@/mocks/services/mock-home-service";
import { MockNotificationService } from "@/mocks/services/mock-notification-service";
import { MockResourceSharingService } from "@/mocks/services/mock-resource-sharing-service";
import { MockSessionService } from "@/mocks/services/mock-session-service";
import type { AuthService } from "@/services/contracts/auth-service";
import type { ClubEventService } from "@/services/contracts/club-event-service";
import type { DirectoryService } from "@/services/contracts/directory-service";
import type { HomeService } from "@/services/contracts/home-service";
import type { NotificationService } from "@/services/contracts/notification-service";
import type { ResourceSharingService } from "@/services/contracts/resource-sharing-service";
import type { SessionService } from "@/services/contracts/session-service";

export const authService: AuthService = new MockAuthService();
export const clubEventService: ClubEventService = new MockClubEventService();
export const directoryService: DirectoryService = new MockDirectoryService();
export const homeService: HomeService = new MockHomeService();
export const notificationService: NotificationService = new MockNotificationService();
export const resourceSharingService: ResourceSharingService =
  new MockResourceSharingService();
export const sessionService: SessionService = new MockSessionService();
