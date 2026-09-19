import { EventDetailRoute } from "@/features/clubs-events/components/event-detail-route";

export default async function EventDetailPage({
  params,
}: Readonly<{ params: Promise<{ eventId: string }> }>) {
  const { eventId } = await params;
  return <EventDetailRoute eventId={eventId} />;
}
