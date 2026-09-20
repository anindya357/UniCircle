import type { GeneralSessionUser } from "@/features/auth/types/session-user";
import type { UpdateProfileInput } from "@/features/profile/types/profile";

export interface ProfileService {
  updateProfile(input: UpdateProfileInput): Promise<GeneralSessionUser>;
}
