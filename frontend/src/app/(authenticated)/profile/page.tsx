import { ProfilePage } from "@/features/profile/components/profile-page";
import { requireServerSessionUser } from "@/features/auth/lib/server-session";

export default async function UserProfileRoute() {
  await requireServerSessionUser();
  return <ProfilePage />;
}
