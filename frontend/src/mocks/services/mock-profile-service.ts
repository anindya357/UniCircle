import type { UpdateProfileInput } from "@/features/profile/types/profile";
import { delay } from "@/lib/delay";
import { readMockSession, writeMockSession } from "@/mocks/storage/mock-session-store";
import type { ProfileService } from "@/services/contracts/profile-service";
import { ServiceError } from "@/services/errors/service-error";

const mockLatencyMilliseconds = 550;

export class MockProfileService implements ProfileService {
  async updateProfile(input: UpdateProfileInput) {
    await delay(mockLatencyMilliseconds);

    const currentUser = readMockSession();
    if (!currentUser) {
      throw new ServiceError(
        "Your session has expired. Please sign in again.",
        "unauthorized",
      );
    }

    if (input.username.trim().toLowerCase() === "existing.user") {
      throw new ServiceError("That username is already in use.", "conflict");
    }

    const updatedUser = {
      ...currentUser,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      displayName: `${input.firstName.trim()} ${input.lastName.trim()}`,
      username: input.username.trim().toLowerCase(),
      department: input.department.trim(),
      phone: input.phone.trim(),
      homeAddress: input.homeAddress.trim(),
      bio: input.bio.trim(),
    };

    writeMockSession(updatedUser);
    return updatedUser;
  }
}
