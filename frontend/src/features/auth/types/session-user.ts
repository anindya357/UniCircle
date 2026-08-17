import type { EntityId, UserRole } from "@/types/common";

export type SessionUser = Readonly<{
  id: EntityId;
  displayName: string;
  username: string;
  email: string;
  role: UserRole;
  universityId: string;
}>;
