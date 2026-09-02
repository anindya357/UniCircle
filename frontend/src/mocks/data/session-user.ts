import type { SessionUser } from "@/features/auth/types/session-user";

export const mockSessionUser = {
  id: "user-anika-001",
  firstName: "Anika",
  lastName: "Rahman",
  displayName: "Anika Rahman",
  username: "anika.rahman",
  email: "anika.rahman@cuet.ac.bd",
  role: "student",
  universityId: "2004001",
  department: "Computer Science & Engineering",
  phone: "+880 1712-345678",
  homeAddress: "Chattogram, Bangladesh",
  bio: "CSE student interested in software engineering, campus communities, and collaborative learning.",
  memberSince: "2026-01-15T10:00:00+06:00",
} as const satisfies SessionUser;
