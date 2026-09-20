import type {
  GeneralSessionUser,
  SessionUser,
} from "@/features/auth/types/session-user";

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
      !storedUser.role ||
      (storedUser.role !== "admin" &&
        (!("username" in storedUser) || !("email" in storedUser)))
    ) {
      window.sessionStorage.removeItem(mockSessionStorageKey);
      return null;
    }

    if (storedUser.role === "admin") return storedUser as SessionUser;

    const general = storedUser as Partial<GeneralSessionUser>;
    const nameParts = storedUser.displayName.trim().split(/\s+/);
    const firstName = general.firstName ?? nameParts[0] ?? "CUET";
    const lastName = general.lastName ?? (nameParts.slice(1).join(" ") || "User");

    return {
      ...storedUser,
      firstName,
      lastName,
      department: general.department ?? "Computer Science & Engineering",
      phone: general.phone ?? "",
      homeAddress: general.homeAddress ?? "Chattogram, Bangladesh",
      bio: general.bio ?? "",
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
