import Link from "next/link";

import type {
  TransportRoute,
  TransportTrip,
} from "@/features/transport/types/transport";
import { formatTransportTime } from "@/features/transport/lib/format-transport-date";

import styles from "./transport-page.module.css";

type ScheduleCardProps = Readonly<{
  trip: TransportTrip;
  sequence: number;
  routesById: ReadonlyMap<string, TransportRoute>;
}>;

export function ScheduleCard({ trip, sequence, routesById }: ScheduleCardProps) {
  const busCount = trip.assignments.reduce(
    (total, assignment) => total + assignment.busIds.length,
    0,
  );

  return (
    <article className={styles.scheduleCard}>
      <header>
        <span>{String(sequence).padStart(2, "0")}</span>
        <div>
          <p>{trip.title}</p>
          <h3>
            {formatTransportTime(trip.date, trip.startTime)} —{" "}
            {formatTransportTime(trip.date, trip.endTime)}
          </h3>
        </div>
        <strong>{busCount} buses</strong>
      </header>

      <div className={styles.tripDirection}>
        <div>
          <span>From</span>
          <strong>{trip.origin}</strong>
        </div>
        <b aria-hidden="true">→</b>
        <div>
          <span>To</span>
          <strong>{trip.destination}</strong>
        </div>
      </div>

      <div className={styles.routeSummaries}>
        {trip.assignments.map((assignment) => {
          const route = routesById.get(assignment.routeId);
          if (!route) return null;

          const stops =
            trip.direction === "from-campus" ? route.returnStops : route.outboundStops;

          return (
            <div key={assignment.routeId}>
              <div>
                <strong>{route.name}</strong>
                <span>{assignment.busIds.length} buses</span>
              </div>
              <p>{stops.join(" → ")}</p>
            </div>
          );
        })}
      </div>

      <Link className={styles.assignmentTab} href={`/transport/${trip.id}`}>
        <span>
          <small>Schedule assignments</small>
          <strong>View assigned buses and drivers</strong>
        </span>
        <b aria-hidden="true">→</b>
      </Link>
    </article>
  );
}
