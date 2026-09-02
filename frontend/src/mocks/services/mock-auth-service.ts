import type {
  AdminLoginInput,
  AuthenticationResult,
  GeneralLoginInput,
  OtpVerificationInput,
  RegistrationInput,
  RegistrationResult,
} from "@/features/auth/types/auth";
import type { SessionUser } from "@/features/auth/types/session-user";
import { delay } from "@/lib/delay";
import { mockSessionUser } from "@/mocks/data/session-user";
import { writeMockSession } from "@/mocks/storage/mock-session-store";
import type { AuthService } from "@/services/contracts/auth-service";
import { ServiceError } from "@/services/errors/service-error";

const mockLatencyMilliseconds = 650;

const mockAdminUser = {
  id: "admin-unicircle-001",
  firstName: "UniCircle",
  lastName: "Admin",
  displayName: "UniCircle Admin",
  username: "admin",
  email: "admin@cuet.ac.bd",
  role: "admin",
  universityId: "ADMIN-001",
  department: "University Administration",
  phone: "+880 31-714946",
  homeAddress: "CUET Campus, Raozan, Chattogram",
  bio: "UniCircle application administrator.",
  memberSince: "2026-01-01T09:00:00+06:00",
} as const satisfies SessionUser;

export class MockAuthService implements AuthService {
  async register(input: RegistrationInput): Promise<RegistrationResult> {
    await delay(mockLatencyMilliseconds);

    if (
      input.username.trim().toLowerCase() === "existing.user" ||
      input.email.trim().toLowerCase() === "existing@cuet.ac.bd"
    ) {
      throw new ServiceError(
        "An account already exists with that username or email.",
        "conflict",
      );
    }

    return { email: input.email.trim().toLowerCase() };
  }

  async verifyOtp(input: OtpVerificationInput): Promise<void> {
    await delay(mockLatencyMilliseconds);

    if (input.otp === "999999") {
      throw new ServiceError(
        "This verification code has expired. Request a new code.",
        "expired-otp",
      );
    }

    if (input.otp === "000000") {
      throw new ServiceError("The verification code is incorrect.", "invalid-otp");
    }
  }

  async resendOtp(_email: string): Promise<void> {
    void _email;
    await delay(mockLatencyMilliseconds);
  }

  async loginGeneral(input: GeneralLoginInput): Promise<AuthenticationResult> {
    await delay(mockLatencyMilliseconds);

    if (
      input.identifier.trim().toLowerCase() === "invalid" ||
      input.password === "wrong-password"
    ) {
      throw new ServiceError(
        "The username/email or password is incorrect.",
        "invalid-credentials",
      );
    }

    writeMockSession(mockSessionUser);
    return { user: mockSessionUser };
  }

  async loginAdmin(input: AdminLoginInput): Promise<AuthenticationResult> {
    await delay(mockLatencyMilliseconds);

    if (
      input.adminId.trim().toLowerCase() === "invalid" ||
      input.password === "wrong-password"
    ) {
      throw new ServiceError(
        "The Admin ID or password is incorrect.",
        "invalid-credentials",
      );
    }

    writeMockSession(mockAdminUser);
    return { user: mockAdminUser };
  }
}
