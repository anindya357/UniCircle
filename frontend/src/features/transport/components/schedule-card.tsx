import type {
  BusDriver,
  TransportBus,
  TransportRoute,
  TransportTrip,
} from "@/features/transport/types/transport";
import { formatTransportTime } from "@/features/transport/lib/format-transport-date";

import styles from "./transport-page.module.css";

type ScheduleCardProps = Readonly<{
  trip: TransportTrip;
  sequence: number;
  busesById: ReadonlyMap<string, TransportBus>;
  driversById: ReadonlyMap<string, BusDriver>;
  routesById: ReadonlyMap<string, TransportRoute>;
}>;

const busTypeLabels = {
  student: "Student Bus",
  teacher: "Teacher Bus",
  staff: "Staff Bus",
} as const satisfies Record<TransportBus["type"], string>;

export function ScheduleCard({
  trip,
  sequence,
  busesById,
  driversById,
  routesById,
}: ScheduleCardProps) {
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

      <details className={styles.assignmentDetails} open={sequence === 1}>
        <summary>View assigned buses and drivers</summary>
        <div className={styles.assignmentGroups}>
          {trip.assignments.map((assignment) => {
            const route = routesById.get(assignment.routeId);

            return (
              <section key={assignment.routeId}>
                <header>
                  <h4>{route?.name ?? "Route"}</h4>
                  <span>{assignment.busIds.length} assigned</span>
                </header>
                <div className={styles.assignmentTable}>
                  <div className={styles.assignmentTableHeader} aria-hidden="true">
                    <span>Bus</span>
                    <span>Type</span>
                    <span>Driver</span>
                  </div>
                  {assignment.busIds.map((busId) => {
                    const bus = busesById.get(busId);
                    const driver = bus ? driversById.get(bus.driverId) : undefined;

                    return (
                      <div className={styles.assignmentRow} key={busId}>
                        <div>
                          <strong>{bus?.name ?? "Bus pending"}</strong>
                          <small>{bus?.registration}</small>
                        </div>
                        <span data-bus-type={bus?.type}>
                          {bus ? busTypeLabels[bus.type] : "Not assigned"}
                        </span>
                        <p>{driver?.name ?? "Driver pending"}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </details>
    </article>
  );
}
