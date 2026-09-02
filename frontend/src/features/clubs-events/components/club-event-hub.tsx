"use client";

import { useMemo, useState, type CSSProperties } from "react";

import { AppShell } from "@/components/shared/app-shell";
import { EmptyState } from "@/components/ui/feedback/empty-state";
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

const eventSections = [
  { status: "ongoing", label: "Happening now" },
  { status: "upcoming", label: "Coming up" },
  { status: "finished", label: "Recently finished" },
] as const satisfies readonly { status: EventStatus; label: string }[];

const eventFilters = [
  { id: "all", label: "All events" },
  { id: "ongoing", label: "Ongoing" },
  { id: "upcoming", label: "Upcoming" },
  { id: "finished", label: "Finished" },
] as const satisfies readonly { id: EventFilter; label: string }[];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ClubEventHub({ view, clubs, events }: ClubEventHubProps) {
  const [selectedClubId, setSelectedClubId] = useState(clubs[0]?.id ?? "");
  const [attendance, setAttendance] = useState<
    Readonly<Record<string, AttendanceStatus>>
  >({});
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");

  const selectedClub = clubs.find((club) => club.id === selectedClubId) ?? clubs[0];

  const eventsByClub = useMemo(() => {
    const grouped = new Map<string, CampusEvent[]>();

    for (const event of events) {
      const current = grouped.get(event.clubId) ?? [];
      current.push(event);
      grouped.set(event.clubId, current);
    }

    return grouped;
  }, [events]);

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
        <ClubDirectory
          attendance={attendance}
          clubs={clubs}
          eventsByClub={eventsByClub}
          onAttendanceChange={changeAttendance}
          onClubSelect={setSelectedClubId}
          selectedClub={selectedClub}
        />
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
  attendance: Readonly<Record<string, AttendanceStatus>>;
  clubs: readonly CampusClub[];
  eventsByClub: ReadonlyMap<string, readonly CampusEvent[]>;
  onAttendanceChange: (eventId: string, status: AttendanceStatus) => void;
  onClubSelect: (clubId: string) => void;
  selectedClub: CampusClub | undefined;
}>;

function ClubDirectory({
  attendance,
  clubs,
  eventsByClub,
  onAttendanceChange,
  onClubSelect,
  selectedClub,
}: ClubDirectoryProps) {
  if (!selectedClub) {
    return (
      <EmptyState
        title="No clubs available"
        description="CUET club profiles will appear here when club data is available."
      />
    );
  }

  const selectedClubEvents = eventsByClub.get(selectedClub.id) ?? [];
  const accentStyle = {
    "--club-accent": selectedClub.accent,
  } as CSSProperties;

  return (
    <div className={styles.clubDirectory}>
      <section className={styles.sectionHeading}>
        <div>
          <p className={styles.eyebrow}>Club directory</p>
          <h2>Choose a campus community</h2>
        </div>
        <p>
          Select a club to see its purpose, leadership, regular activities, and event
          calendar.
        </p>
      </section>

      <div className={styles.clubTabs} role="tablist" aria-label="CUET clubs">
        {clubs.map((club, index) => {
          const isSelected = club.id === selectedClub.id;

          return (
            <button
              aria-controls="selected-club-panel"
              aria-selected={isSelected}
              className={styles.clubTab}
              key={club.id}
              onClick={() => onClubSelect(club.id)}
              role="tab"
              style={{ "--club-accent": club.accent } as CSSProperties}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{club.shortName}</strong>
              <small>{club.name}</small>
            </button>
          );
        })}
      </div>

      <section
        aria-label={`${selectedClub.name} details`}
        className={styles.clubPanel}
        id="selected-club-panel"
        role="tabpanel"
        style={accentStyle}
      >
        <div className={styles.clubOverview}>
          <div className={styles.clubIdentity}>
            <span aria-hidden="true">{selectedClub.shortName}</span>
            <div>
              <p>{selectedClub.category}</p>
              <h2>{selectedClub.name}</h2>
            </div>
          </div>

          <p className={styles.clubTagline}>{selectedClub.tagline}</p>
          <p className={styles.clubDescription}>{selectedClub.description}</p>

          <dl className={styles.clubMetrics}>
            <div>
              <dt>Community</dt>
              <dd>{selectedClub.memberCount} members</dd>
            </div>
            <div>
              <dt>Listed events</dt>
              <dd>{selectedClubEvents.length} this season</dd>
            </div>
          </dl>
        </div>

        <div className={styles.clubDetailsGrid}>
          <section aria-labelledby="activities-title">
            <div className={styles.subsectionHeading}>
              <span>What they do</span>
              <h3 id="activities-title">Regular activities</h3>
            </div>
            <ol className={styles.activityList}>
              {selectedClub.activities.map((activity, index) => (
                <li key={activity}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {activity}
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="leadership-title">
            <div className={styles.subsectionHeading}>
              <span>Member information</span>
              <h3 id="leadership-title">Club leadership</h3>
            </div>
            <div className={styles.leaderList}>
              {selectedClub.leaders.map((member) => (
                <article key={member.id}>
                  <span aria-hidden="true">{getInitials(member.name)}</span>
                  <div>
                    <strong>{member.name}</strong>
                    <p>{member.role}</p>
                    <small>{member.department}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className={styles.clubEvents} aria-labelledby="club-events-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Club calendar</p>
              <h2 id="club-events-title">Events from {selectedClub.shortName}</h2>
            </div>
            <p>{selectedClubEvents.length} event listings connected to this club.</p>
          </div>

          <div className={styles.clubEventSections}>
            {eventSections.map((section) => {
              const sectionEvents = selectedClubEvents.filter(
                (event) => event.status === section.status,
              );

              return (
                <section key={section.status} className={styles.clubEventSection}>
                  <div className={styles.eventGroupHeading}>
                    <h3>{section.label}</h3>
                    <span>{sectionEvents.length}</span>
                  </div>
                  {sectionEvents.length === 0 ? (
                    <p className={styles.inlineEmpty}>
                      No {section.label.toLowerCase()} events for this club.
                    </p>
                  ) : (
                    <div className={styles.compactEventGrid}>
                      {sectionEvents.map((event) => (
                        <EventCard
                          attendance={attendance[event.id] ?? "none"}
                          clubName={selectedClub.name}
                          compact
                          event={event}
                          key={event.id}
                          onAttendanceChange={onAttendanceChange}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </section>
      </section>
    </div>
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
