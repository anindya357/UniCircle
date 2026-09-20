import type { GeneralSessionUser } from "@/features/auth/types/session-user";
import type { UpdateProfileInput } from "@/features/profile/types/profile";
import type { ProfileService } from "@/services/contracts/profile-service";
import { ServiceError } from "@/services/errors/service-error";

export class ApiProfileService implements ProfileService {
  async updateProfile(input: UpdateProfileInput): Promise<GeneralSessionUser> {
    const csrf = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith("unicircle_csrf="))
      ?.slice("unicircle_csrf=".length);
    let response: Response;
    try {
      response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrf ? decodeURIComponent(csrf) : "",
        },
        body: JSON.stringify(input),
        credentials: "same-origin",
        cache: "no-store",
      });
    } catch (error) {
      throw new ServiceError("Cannot reach the profile service.", "network", {
        cause: error,
      });
    }
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.data) {
      throw new ServiceError(
        result?.error?.message ?? "Profile update failed.",
        response.status === 409 ? "conflict" : "unknown",
      );
    }
    return {
      ...result.data,
      department: result.data.department ?? "",
      phone: result.data.phone ?? "",
      bio: result.data.bio ?? "",
    };
  }
}
