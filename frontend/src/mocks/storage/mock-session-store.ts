import type { SessionUser } from "@/features/auth/types/session-user";

const mockSessionStorageKey = "unicircle.mock.session";

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && "sessionStorage" in window;
}

export function readMockSession(): SessionUser | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  const storedSession = window.sessionStorage.getItem(mockSessionStorageKey);

  if (!storedSession) {
    return null;
  }

  try {
    const storedUser = JSON.parse(storedSession) as Partial<SessionUser>;

    if (
      !storedUser.id ||
      !storedUser.displayName ||
      !storedUser.username ||
      !storedUser.email ||
      !storedUser.role ||
      !storedUser.universityId
    ) {
      window.sessionStorage.removeItem(mockSessionStorageKey);
      return null;
    }

    const nameParts = storedUser.displayName.trim().split(/\s+/);
    const firstName = storedUser.firstName ?? nameParts[0] ?? "CUET";
    const lastName = storedUser.lastName ?? (nameParts.slice(1).join(" ") || "User");

    return {
      ...storedUser,
      firstName,
      lastName,
      department:
        storedUser.department ??
        (storedUser.role === "admin"
          ? "University Administration"
          : "Computer Science & Engineering"),
      phone: storedUser.phone ?? "",
      homeAddress: storedUser.homeAddress ?? "Chattogram, Bangladesh",
      bio: storedUser.bio ?? "",
      memberSince: storedUser.memberSince ?? "2026-01-15T10:00:00+06:00",
    } as SessionUser;
  } catch {
    window.sessionStorage.removeItem(mockSessionStorageKey);
    return null;
  }
}

export function writeMockSession(user: SessionUser): void {
  if (canUseSessionStorage()) {
    window.sessionStorage.setItem(mockSessionStorageKey, JSON.stringify(user));
  }
}

export function clearMockSession(): void {
  if (canUseSessionStorage()) {
    window.sessionStorage.removeItem(mockSessionStorageKey);
  }
}
