import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ClubDetailPage } from "@/features/clubs-events/components/club-detail-page";
import { clubEventService } from "@/services";

type ClubDetailsRouteProps = Readonly<{
  params: Promise<{ clubId: string }>;
}>;

export async function generateStaticParams() {
  const clubs = await clubEventService.listClubs();

  return clubs.map((club) => ({ clubId: club.id }));
}

export async function generateMetadata({
  params,
}: ClubDetailsRouteProps): Promise<Metadata> {
  const [{ clubId }, clubs] = await Promise.all([params, clubEventService.listClubs()]);
  const club = clubs.find((item) => item.id === clubId);

  return {
    title: club?.name ?? "Club not found",
    description: club?.tagline,
  };
}

export default async function ClubDetailsRoute({ params }: ClubDetailsRouteProps) {
  const [{ clubId }, clubs, events] = await Promise.all([
    params,
    clubEventService.listClubs(),
    clubEventService.listEvents(),
  ]);
  const club = clubs.find((item) => item.id === clubId);

  if (!club) {
    notFound();
  }

  return (
    <ClubDetailPage
      club={club}
      events={events.filter((event) => event.clubId === club.id)}
    />
  );
}
