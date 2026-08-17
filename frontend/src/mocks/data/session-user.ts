import type { SessionUser } from "@/features/auth/types/session-user";

export const mockSessionUser = {
  id: "user-anika-001",
  displayName: "Anika Rahman",
  username: "anika.rahman",
  email: "anika.rahman@cuet.ac.bd",
  role: "student",
  universityId: "2004001",
} as const satisfies SessionUser;
