import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ScheduleDetailPage } from "@/features/transport/components/schedule-detail-page";
import { transportService } from "@/services";

type ScheduleDetailsRouteProps = Readonly<{
  params: Promise<{ scheduleId: string }>;
}>;

export async function generateStaticParams() {
  const snapshot = await transportService.getSnapshot();

  return snapshot.trips.map((trip) => ({ scheduleId: trip.id }));
}

export async function generateMetadata({
  params,
}: ScheduleDetailsRouteProps): Promise<Metadata> {
  const [{ scheduleId }, snapshot] = await Promise.all([
    params,
    transportService.getSnapshot(),
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
  const [{ scheduleId }, snapshot] = await Promise.all([
    params,
    transportService.getSnapshot(),
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
