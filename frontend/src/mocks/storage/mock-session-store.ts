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
    return JSON.parse(storedSession) as SessionUser;
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
