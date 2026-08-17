import { MockAuthService } from "@/mocks/services/mock-auth-service";
import { MockDirectoryService } from "@/mocks/services/mock-directory-service";
import { MockHomeService } from "@/mocks/services/mock-home-service";
import { MockNotificationService } from "@/mocks/services/mock-notification-service";
import { MockSessionService } from "@/mocks/services/mock-session-service";
import type { AuthService } from "@/services/contracts/auth-service";
import type { DirectoryService } from "@/services/contracts/directory-service";
import type { HomeService } from "@/services/contracts/home-service";
import type { NotificationService } from "@/services/contracts/notification-service";
import type { SessionService } from "@/services/contracts/session-service";

export const authService: AuthService = new MockAuthService();
export const directoryService: DirectoryService = new MockDirectoryService();
export const homeService: HomeService = new MockHomeService();
export const notificationService: NotificationService = new MockNotificationService();
export const sessionService: SessionService = new MockSessionService();
