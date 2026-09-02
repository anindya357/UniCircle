"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/shared/app-shell";
import { EmptyState } from "@/components/ui/feedback/empty-state";
import { ScheduleCard } from "@/features/transport/components/schedule-card";
import {
  formatTransportDate,
  formatTransportDay,
  formatTransportFullDate,
} from "@/features/transport/lib/format-transport-date";
import type { BusType, TransportSnapshot } from "@/features/transport/types/transport";

import styles from "./transport-page.module.css";

type TransportPageProps = Readonly<{
  snapshot: TransportSnapshot;
}>;

type TransportView = "schedule" | "drivers";
type BusTypeFilter = "all" | BusType;

const busTypeLabels = {
  student: "Student Bus",
  teacher: "Teacher Bus",
  staff: "Staff Bus",
} as const satisfies Record<BusType, string>;

export function TransportPage({ snapshot }: TransportPageProps) {
  const futureDates = useMemo(
    () => snapshot.availableDates.filter((date) => date >= snapshot.referenceDate),
    [snapshot.availableDates, snapshot.referenceDate],
  );
  const [view, setView] = useState<TransportView>("schedule");
  const [selectedDate, setSelectedDate] = useState(
    futureDates.includes(snapshot.referenceDate)
      ? snapshot.referenceDate
      : (futureDates[0] ?? ""),
  );
  const [driverQuery, setDriverQuery] = useState("");
  const [busTypeFilter, setBusTypeFilter] = useState<BusTypeFilter>("all");

  const busesById = useMemo(
    () => new Map(snapshot.buses.map((bus) => [bus.id, bus])),
    [snapshot.buses],
  );
  const driversById = useMemo(
    () => new Map(snapshot.drivers.map((driver) => [driver.id, driver])),
    [snapshot.drivers],
  );
  const busesByDriverId = useMemo(
    () => new Map(snapshot.buses.map((bus) => [bus.driverId, bus])),
    [snapshot.buses],
  );
  const routesById = useMemo(
    () => new Map(snapshot.routes.map((route) => [route.id, route])),
    [snapshot.routes],
  );
  const selectedTrips = useMemo(
    () => snapshot.trips.filter((trip) => trip.date === selectedDate),
    [selectedDate, snapshot.trips],
  );
  const filteredDrivers = useMemo(() => {
    const normalizedQuery = driverQuery.trim().toLowerCase();

    return snapshot.drivers.filter((driver) => {
      const bus = busesByDriverId.get(driver.id);
      const matchesType = busTypeFilter === "all" || bus?.type === busTypeFilter;
      const matchesQuery =
        !normalizedQuery ||
        [driver.name, driver.phone, bus?.name ?? ""].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );

      return matchesType && matchesQuery;
    });
  }, [busTypeFilter, busesByDriverId, driverQuery, snapshot.drivers]);

  const scheduledBusCount = selectedTrips.reduce(
    (total, trip) =>
      total +
      trip.assignments.reduce(
        (assignmentTotal, assignment) => assignmentTotal + assignment.busIds.length,
        0,
      ),
    0,
  );

  return (
    <AppShell className={styles.pageShell}>
      <section className={styles.hero} aria-labelledby="transport-title">
        <div className={styles.heroCopy}>
          <p>CUET transport network</p>
          <h1 id="transport-title">
            Plan the ride. <span>Keep the day moving.</span>
          </h1>
          <p>
            Explore daily campus bus windows, understand both city routes, and find the
            right driver contact before you travel.
          </p>
          <div className={styles.prototypeNotice}>
            <span aria-hidden="true">i</span>
            Routine structure follows the supplied reference · assignments and contacts
            are prototype data
          </div>
        </div>

        <div className={styles.heroStats} aria-label="Transport summary">
          <div>
            <strong>04</strong>
            <span>daily schedule windows</span>
          </div>
          <div>
            <strong>{snapshot.buses.length}</strong>
            <span>buses in directory</span>
          </div>
          <div>
            <strong>02</strong>
            <span>station route variants</span>
          </div>
        </div>
      </section>

      <nav className={styles.transportTabs} aria-label="Transport sections">
        <button
          aria-pressed={view === "schedule"}
          onClick={() => setView("schedule")}
          type="button"
        >
          <span>01</span>
          <strong>Bus schedule</strong>
          <small>Choose a day and inspect all four runs</small>
        </button>
        <button
          aria-pressed={view === "drivers"}
          onClick={() => setView("drivers")}
          type="button"
        >
          <span>02</span>
          <strong>Bus Drivers</strong>
          <small>Names, assigned buses, and contacts</small>
        </button>
      </nav>

      {view === "schedule" ? (
        <section className={styles.scheduleSection} aria-labelledby="schedule-title">
          <div className={styles.sectionHeading}>
            <div>
              <p>Selected-day routine</p>
              <h2 id="schedule-title">Choose when you travel</h2>
            </div>
            <p>
              Only the current date and future dates are available. Friday and Saturday
              demonstrate the no-schedule state in this prototype.
            </p>
          </div>

          {futureDates.length === 0 ? (
            <EmptyState
              title="No future schedules available"
              description="New transport dates will appear when the next routine is published."
            />
          ) : (
            <>
              <div className={styles.dateSelector} aria-label="Choose schedule date">
                {futureDates.map((date) => (
                  <button
                    aria-pressed={date === selectedDate}
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    type="button"
                  >
                    <span>{formatTransportDay(date)}</span>
                    <strong>{formatTransportDate(date)}</strong>
                    {date === snapshot.referenceDate ? <small>Today</small> : null}
                  </button>
                ))}
              </div>

              <div className={styles.selectedDaySummary} aria-live="polite">
                <div>
                  <span>Selected schedule</span>
                  <h3>{formatTransportFullDate(selectedDate)}</h3>
                </div>
                <div>
                  <strong>{selectedTrips.length}</strong>
                  <span>time windows</span>
                </div>
                <div>
                  <strong>{scheduledBusCount}</strong>
                  <span>total assignments</span>
                </div>
              </div>

              {selectedTrips.length === 0 ? (
                <EmptyState
                  title="No bus schedule for this day"
                  description="No regular transport service is listed for the selected date. Choose another current or future day."
                />
              ) : (
                <div className={styles.scheduleGrid}>
                  {selectedTrips.map((trip, index) => (
                    <ScheduleCard
                      busesById={busesById}
                      driversById={driversById}
                      key={trip.id}
                      routesById={routesById}
                      sequence={index + 1}
                      trip={trip}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      ) : (
        <section className={styles.driverSection} aria-labelledby="drivers-title">
          <div className={styles.sectionHeading}>
            <div>
              <p>Transport contacts</p>
              <h2 id="drivers-title">Bus Drivers</h2>
            </div>
            <p>
              Search the prototype directory by driver, phone number, or assigned bus
              and filter by service type.
            </p>
          </div>

          <div className={styles.driverFilters}>
            <label>
              <span>Search drivers</span>
              <input
                onChange={(event) => setDriverQuery(event.target.value)}
                placeholder="Driver, phone number, or bus"
                type="search"
                value={driverQuery}
              />
            </label>
            <label>
              <span>Bus type</span>
              <select
                onChange={(event) =>
                  setBusTypeFilter(event.target.value as BusTypeFilter)
                }
                value={busTypeFilter}
              >
                <option value="all">All bus types</option>
                <option value="student">Student Bus</option>
                <option value="teacher">Teacher Bus</option>
                <option value="staff">Staff Bus</option>
              </select>
            </label>
          </div>

          {filteredDrivers.length === 0 ? (
            <EmptyState
              title="No matching drivers"
              description="Try another driver name, bus name, phone number, or bus type."
            />
          ) : (
            <div className={styles.driverGrid}>
              {filteredDrivers.map((driver) => {
                const bus = busesByDriverId.get(driver.id);

                return (
                  <article className={styles.driverCard} key={driver.id}>
                    <header>
                      <span aria-hidden="true">
                        {driver.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <div>
                        <p>{bus ? busTypeLabels[bus.type] : "Transport service"}</p>
                        <h3>{driver.name}</h3>
                      </div>
                    </header>
                    <dl>
                      <div>
                        <dt>Assigned bus</dt>
                        <dd>{bus?.name ?? "Pending"}</dd>
                      </div>
                      <div>
                        <dt>Fleet ID</dt>
                        <dd>{bus?.registration ?? "Pending"}</dd>
                      </div>
                    </dl>
                    <footer>
                      <a href={`tel:${driver.phone.replaceAll(" ", "")}`}>
                        <span>Driver mobile</span>
                        <strong>{driver.phone}</strong>
                      </a>
                      <a href={`tel:${driver.emergencyContact.replaceAll(" ", "")}`}>
                        <span>Transport control</span>
                        <strong>{driver.emergencyContact}</strong>
                      </a>
                    </footer>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}
