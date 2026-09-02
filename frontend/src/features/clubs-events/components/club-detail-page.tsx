"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";

import { AppShell } from "@/components/shared/app-shell";
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

type ClubDetailPageProps = Readonly<{
  club: CampusClub;
  events: readonly CampusEvent[];
}>;

const eventSections = [
  { status: "ongoing", label: "Happening now" },
  { status: "upcoming", label: "Coming up" },
  { status: "finished", label: "Recently finished" },
] as const satisfies readonly { status: EventStatus; label: string }[];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ClubDetailPage({ club, events }: ClubDetailPageProps) {
  const [attendance, setAttendance] = useState<
    Readonly<Record<string, AttendanceStatus>>
  >({});
  const accentStyle = { "--club-accent": club.accent } as CSSProperties;

  function changeAttendance(eventId: string, status: AttendanceStatus) {
    setAttendance((current) => ({
      ...current,
      [eventId]: current[eventId] === status ? "none" : status,
    }));
  }

  return (
    <AppShell className={styles.pageShell}>
      <Link className={styles.backLink} href={routes.clubs}>
        <span aria-hidden="true">←</span> All clubs
      </Link>

      <section
        aria-labelledby="club-detail-title"
        className={styles.clubDetailHero}
        style={accentStyle}
      >
        <div className={styles.clubIdentity}>
          <span aria-hidden="true">{club.shortName}</span>
          <div>
            <p>{club.category}</p>
            <h1 id="club-detail-title">{club.name}</h1>
          </div>
        </div>

        <div className={styles.clubDetailIntro}>
          <p className={styles.clubTagline}>{club.tagline}</p>
          <p className={styles.clubDescription}>{club.description}</p>
        </div>

        <dl className={styles.clubMetrics}>
          <div>
            <dt>Community</dt>
            <dd>{club.memberCount} members</dd>
          </div>
          <div>
            <dt>Listed events</dt>
            <dd>{events.length} this season</dd>
          </div>
        </dl>
      </section>

      <HubNavigation activeView="clubs" />

      <div className={styles.clubDetailContent} style={accentStyle}>
        <div className={styles.clubDetailsGrid}>
          <section aria-labelledby="activities-title">
            <div className={styles.subsectionHeading}>
              <span>What they do</span>
              <h2 id="activities-title">Regular activities</h2>
            </div>
            <ol className={styles.activityList}>
              {club.activities.map((activity, index) => (
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
              <h2 id="leadership-title">Club leadership</h2>
            </div>
            <div className={styles.leaderList}>
              {club.leaders.map((member) => (
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
              <h2 id="club-events-title">Events from {club.shortName}</h2>
            </div>
            <p>{events.length} event listings connected to this club.</p>
          </div>

          <div className={styles.clubEventSections}>
            {eventSections.map((section) => {
              const sectionEvents = events.filter(
                (event) => event.status === section.status,
              );

              return (
                <section className={styles.clubEventSection} key={section.status}>
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
                          clubName={club.name}
                          compact
                          event={event}
                          key={event.id}
                          onAttendanceChange={changeAttendance}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
