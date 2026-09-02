"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

import { AppShell } from "@/components/shared/app-shell";
import { EmptyState } from "@/components/ui/feedback/empty-state";
import { routes } from "@/config/routes";
import type {
  AttendanceStatus,
  CampusClub,
  CampusEvent,
  EventStatus,
} from "@/features/clubs-events/types/club-event";

import styles from "./club-event-hub.module.css";
import { EventCard } from "./event-card";
import { HubNavigation } from "./hub-navigation";

type HubView = "clubs" | "events";
type EventFilter = "all" | EventStatus;

type ClubEventHubProps = Readonly<{
  view: HubView;
  clubs: readonly CampusClub[];
  events: readonly CampusEvent[];
}>;

const eventFilters = [
  { id: "all", label: "All events" },
  { id: "ongoing", label: "Ongoing" },
  { id: "upcoming", label: "Upcoming" },
  { id: "finished", label: "Finished" },
] as const satisfies readonly { id: EventFilter; label: string }[];

export function ClubEventHub({ view, clubs, events }: ClubEventHubProps) {
  const [attendance, setAttendance] = useState<
    Readonly<Record<string, AttendanceStatus>>
  >({});
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");

  const clubNames = useMemo(
    () => new Map(clubs.map((club) => [club.id, club.name])),
    [clubs],
  );

  const filteredEvents = useMemo(
    () =>
      eventFilter === "all"
        ? events
        : events.filter((event) => event.status === eventFilter),
    [eventFilter, events],
  );

  const eventCounts = useMemo(
    () => ({
      all: events.length,
      ongoing: events.filter((event) => event.status === "ongoing").length,
      upcoming: events.filter((event) => event.status === "upcoming").length,
      finished: events.filter((event) => event.status === "finished").length,
    }),
    [events],
  );

  function changeAttendance(eventId: string, status: AttendanceStatus) {
    setAttendance((current) => ({
      ...current,
      [eventId]: current[eventId] === status ? "none" : status,
    }));
  }

  return (
    <AppShell className={styles.pageShell}>
      <section className={styles.hero} aria-labelledby="club-event-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>CUET student life</p>
          <h1 id="club-event-title">
            Find your circle. <span>Make campus count.</span>
          </h1>
          <p>
            Meet the student communities building, debating, creating, and competing
            across CUET—then keep every event you care about within reach.
          </p>
          <div className={styles.previewNotice}>
            <span aria-hidden="true">i</span>
            Prototype club, member, event, and attendance data
          </div>
        </div>

        <div className={styles.heroStats} aria-label="Club and event summary">
          <div>
            <strong>{clubs.length}</strong>
            <span>clubs to explore</span>
          </div>
          <div>
            <strong>{eventCounts.ongoing}</strong>
            <span>happening now</span>
          </div>
          <div>
            <strong>{eventCounts.upcoming}</strong>
            <span>coming up</span>
          </div>
        </div>
      </section>

      <HubNavigation activeView={view} />

      {view === "clubs" ? (
        <ClubDirectory clubs={clubs} />
      ) : (
        <CampusEventDirectory
          attendance={attendance}
          clubNames={clubNames}
          eventCounts={eventCounts}
          eventFilter={eventFilter}
          events={filteredEvents}
          onAttendanceChange={changeAttendance}
          onFilterChange={setEventFilter}
        />
      )}
    </AppShell>
  );
}

type ClubDirectoryProps = Readonly<{
  clubs: readonly CampusClub[];
}>;

function ClubDirectory({ clubs }: ClubDirectoryProps) {
  return (
    <section className={styles.clubDirectory} aria-labelledby="club-directory-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>Club directory</p>
          <h2 id="club-directory-title">Choose a campus community</h2>
        </div>
        <p>
          Open any club to see its purpose, leadership, regular activities, and upcoming
          event calendar.
        </p>
      </div>

      {clubs.length === 0 ? (
        <EmptyState
          title="No clubs available"
          description="CUET club profiles will appear here when club data is available."
        />
      ) : (
        <div className={styles.clubTabs} aria-label="CUET clubs">
          {clubs.map((club, index) => (
            <Link
              className={styles.clubTab}
              href={`${routes.clubs}/${club.id}`}
              key={club.id}
              style={{ "--club-accent": club.accent } as CSSProperties}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{club.shortName}</strong>
              <h3>{club.name}</h3>
              <p>{club.tagline}</p>
              <b>
                View club <span aria-hidden="true">→</span>
              </b>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

type CampusEventDirectoryProps = Readonly<{
  attendance: Readonly<Record<string, AttendanceStatus>>;
  clubNames: ReadonlyMap<string, string>;
  eventCounts: Readonly<Record<EventFilter, number>>;
  eventFilter: EventFilter;
  events: readonly CampusEvent[];
  onAttendanceChange: (eventId: string, status: AttendanceStatus) => void;
  onFilterChange: (filter: EventFilter) => void;
}>;

function CampusEventDirectory({
  attendance,
  clubNames,
  eventCounts,
  eventFilter,
  events,
  onAttendanceChange,
  onFilterChange,
}: CampusEventDirectoryProps) {
  return (
    <section className={styles.eventDirectory} aria-labelledby="event-directory-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>Campus-wide calendar</p>
          <h2 id="event-directory-title">What is happening at CUET</h2>
        </div>
        <p>
          Browse every listed event and mark the ones you are interested in or plan to
          attend.
        </p>
      </div>

      <div className={styles.eventFilters} aria-label="Filter events">
        {eventFilters.map((filter) => (
          <button
            aria-pressed={eventFilter === filter.id}
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            type="button"
          >
            <span>{filter.label}</span>
            <strong>{eventCounts[filter.id]}</strong>
          </button>
        ))}
      </div>

      <p className={styles.resultsSummary} aria-live="polite">
        Showing {events.length} {events.length === 1 ? "event" : "events"}
      </p>

      {events.length === 0 ? (
        <EmptyState
          title="No events in this view"
          description="Choose another status to explore the rest of the campus event calendar."
        />
      ) : (
        <div className={styles.eventGrid}>
          {events.map((event) => (
            <EventCard
              attendance={attendance[event.id] ?? "none"}
              clubName={clubNames.get(event.clubId) ?? "CUET student club"}
              event={event}
              key={event.id}
              onAttendanceChange={onAttendanceChange}
            />
          ))}
        </div>
      )}
    </section>
  );
}
