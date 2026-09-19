import { ClubDetailRoute } from "@/features/clubs-events/components/club-detail-page";

type ClubDetailsRouteProps = Readonly<{
  params: Promise<{ clubId: string }>;
}>;

export default async function ClubDetailsRoute({ params }: ClubDetailsRouteProps) {
  const { clubId } = await params;
  return <ClubDetailRoute clubId={clubId} />;
}
