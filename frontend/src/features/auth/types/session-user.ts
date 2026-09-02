import type { EntityId, UserRole } from "@/types/common";

export type SessionUser = Readonly<{
  id: EntityId;
  firstName: string;
  lastName: string;
  displayName: string;
  username: string;
  email: string;
  role: UserRole;
  universityId: string;
  department: string;
  phone: string;
  homeAddress: string;
  bio: string;
  memberSince: string;
}>;
