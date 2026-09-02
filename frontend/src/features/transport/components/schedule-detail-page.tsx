import Link from "next/link";

import { AppShell } from "@/components/shared/app-shell";
import {
  formatTransportFullDate,
  formatTransportTime,
} from "@/features/transport/lib/format-transport-date";
import type {
  BusDriver,
  BusType,
  TransportBus,
  TransportRoute,
  TransportTrip,
} from "@/features/transport/types/transport";

import styles from "./transport-page.module.css";

type ScheduleDetailPageProps = Readonly<{
  trip: TransportTrip;
  buses: readonly TransportBus[];
  drivers: readonly BusDriver[];
  routes: readonly TransportRoute[];
}>;

const busTypeLabels = {
  student: "Student Bus",
  teacher: "Teacher Bus",
  staff: "Staff Bus",
} as const satisfies Record<BusType, string>;

export function ScheduleDetailPage({
  trip,
  buses,
  drivers,
  routes,
}: ScheduleDetailPageProps) {
  const busesById = new Map(buses.map((bus) => [bus.id, bus]));
  const driversById = new Map(drivers.map((driver) => [driver.id, driver]));
  const routesById = new Map(routes.map((route) => [route.id, route]));
  const busCount = trip.assignments.reduce(
    (total, assignment) => total + assignment.busIds.length,
    0,
  );

  return (
    <AppShell className={styles.detailPageShell}>
      <Link className={styles.detailBackLink} href="/transport">
        <span aria-hidden="true">←</span>
        Back to transport schedule
      </Link>

      <section className={styles.detailHero} aria-labelledby="schedule-detail-title">
        <div className={styles.detailHeroCopy}>
          <p>{formatTransportFullDate(trip.date)}</p>
          <h1 id="schedule-detail-title">{trip.title}</h1>
          <div className={styles.detailTime}>
            <span>{formatTransportTime(trip.date, trip.startTime)}</span>
            <b aria-hidden="true">—</b>
            <span>{formatTransportTime(trip.date, trip.endTime)}</span>
          </div>
          <div className={styles.detailJourney}>
            <div>
              <span>Departure</span>
              <strong>{trip.origin}</strong>
            </div>
            <b aria-hidden="true">→</b>
            <div>
              <span>Destination</span>
              <strong>{trip.destination}</strong>
            </div>
          </div>
        </div>

        <aside className={styles.detailHeroStats} aria-label="Assignment summary">
          <div>
            <strong>{String(busCount).padStart(2, "0")}</strong>
            <span>assigned buses</span>
          </div>
          <div>
            <strong>{String(trip.assignments.length).padStart(2, "0")}</strong>
            <span>route groups</span>
          </div>
        </aside>
      </section>

      <section className={styles.detailAssignments} aria-labelledby="assignments-title">
        <header className={styles.detailSectionHeading}>
          <div>
            <p>Schedule assignments</p>
            <h2 id="assignments-title">Buses and drivers for this run</h2>
          </div>
          <p>
            Every assignment below belongs only to the selected schedule. Driver phone
            numbers and fleet IDs are prototype information until backend integration.
          </p>
        </header>

        <div className={styles.detailRouteList}>
          {trip.assignments.map((assignment) => {
            const route = routesById.get(assignment.routeId);
            const stops =
              trip.direction === "from-campus"
                ? route?.returnStops
                : route?.outboundStops;

            return (
              <article className={styles.detailRouteCard} key={assignment.routeId}>
                <header>
                  <div>
                    <span>Route assignment</span>
                    <h3>{route?.name ?? "Route details pending"}</h3>
                  </div>
                  <strong>
                    {assignment.busIds.length}{" "}
                    {assignment.busIds.length === 1 ? "bus" : "buses"}
                  </strong>
                </header>

                {stops ? (
                  <div className={styles.detailStops} aria-label="Route stops">
                    {stops.map((stop, index) => (
                      <span key={`${assignment.routeId}-${stop}`}>
                        {stop}
                        {index < stops.length - 1 ? <b aria-hidden="true">→</b> : null}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className={styles.detailBusHeader} aria-hidden="true">
                  <span>No.</span>
                  <span>Bus and fleet ID</span>
                  <span>Service type</span>
                  <span>Driver and contact</span>
                </div>
                <ol className={styles.detailBusList}>
                  {assignment.busIds.map((busId, index) => {
                    const bus = busesById.get(busId);
                    const driver = bus ? driversById.get(bus.driverId) : undefined;

                    return (
                      <li className={styles.detailBusRow} key={busId}>
                        <span className={styles.detailBusNumber}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className={styles.detailBusIdentity}>
                          <small>Bus and fleet ID</small>
                          <strong>{bus?.name ?? "Bus assignment pending"}</strong>
                          <span>{bus?.registration ?? "Fleet ID pending"}</span>
                        </div>
                        <div className={styles.detailBusType} data-bus-type={bus?.type}>
                          <small>Service type</small>
                          <strong>
                            {bus ? busTypeLabels[bus.type] : "Not assigned"}
                          </strong>
                        </div>
                        <div className={styles.detailDriver}>
                          <small>Driver and contact</small>
                          <strong>{driver?.name ?? "Driver pending"}</strong>
                          {driver ? (
                            <a href={`tel:${driver.phone.replaceAll(" ", "")}`}>
                              {driver.phone}
                            </a>
                          ) : (
                            <span>Contact pending</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </article>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
