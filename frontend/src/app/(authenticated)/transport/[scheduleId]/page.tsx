import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { ScheduleDetailPage } from "@/features/transport/components/schedule-detail-page";
import { requireServerSessionUser } from "@/features/auth/lib/server-session";
import { transportService } from "@/services";

type ScheduleDetailsRouteProps = Readonly<{
  params: Promise<{ scheduleId: string }>;
}>;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: ScheduleDetailsRouteProps): Promise<Metadata> {
  const token = (await cookies()).get("unicircle_session")?.value;
  const [{ scheduleId }, snapshot] = await Promise.all([
    params,
    transportService.getSnapshot(token),
  ]);
  const trip = snapshot.trips.find((item) => item.id === scheduleId);

  return {
    title: trip ? `${trip.title} assignments` : "Transport schedule not found",
    description: trip
      ? `Assigned buses and drivers for the ${trip.origin} to ${trip.destination} schedule.`
      : undefined,
  };
}

export default async function ScheduleDetailsRoute({
  params,
}: ScheduleDetailsRouteProps) {
  await requireServerSessionUser();
  const token = (await cookies()).get("unicircle_session")?.value;
  const [{ scheduleId }, snapshot] = await Promise.all([
    params,
    transportService.getSnapshot(token),
  ]);
  const trip = snapshot.trips.find((item) => item.id === scheduleId);

  if (!trip) {
    notFound();
  }

  return (
    <ScheduleDetailPage
      buses={snapshot.buses}
      drivers={snapshot.drivers}
      routes={snapshot.routes}
      trip={trip}
    />
  );
}
