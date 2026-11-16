import { requireServerSessionUser } from "@/features/auth/lib/server-session";
import { ClubMembersPage } from "@/features/clubs-events/components/club-members-page";

export default async function ClubMembersRoute({
  params,
}: Readonly<{ params: Promise<{ clubId: string }> }>) {
  await requireServerSessionUser();
  const { clubId } = await params;
  return <ClubMembersPage key={clubId} clubId={clubId} />;
}
