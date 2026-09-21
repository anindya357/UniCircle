import Image from "next/image";
import Link from "next/link";

import { AppShell } from "@/components/shared/app-shell";
import type {
  FacultyProfile,
  ProfileEntry,
} from "@/features/directory/types/faculty-profile";

import styles from "./faculty-profile-page.module.css";

type SectionProps = Readonly<{
  title: string;
  items: readonly ProfileEntry[];
}>;

function ProfileSection({ title, items }: SectionProps) {
  if (items.length === 0) return null;
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      <div className={styles.entryList}>
        {items.map((item, index) => (
          <article className={styles.entry} key={`${title}-${index}-${item.title}`}>
            <div className={styles.entryHeading}>
              <h3>{item.title}</h3>
              {item.period ? <span>{item.period}</span> : null}
            </div>
            {item.subtitle ? <p className={styles.subtitle}>{item.subtitle}</p> : null}
            {item.description ? (
              <p className={styles.entryDescription}>{item.description}</p>
            ) : null}
            {item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                Open resource <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export function FacultyProfilePage({ profile }: Readonly<{ profile: FacultyProfile }>) {
  const initials = profile.name
    .replace(/^(Prof\.|Dr\.)\s*/gi, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const hasAcademicDetails = Boolean(
    profile.biography ||
    profile.researchInterests ||
    profile.educationOverview ||
    profile.additionalInformation ||
    profile.education.length ||
    profile.experience.length ||
    profile.supervisions.length ||
    profile.publications.length ||
    profile.research.length ||
    profile.courses.length ||
    profile.awards.length,
  );

  return (
    <AppShell>
      <div className={styles.page}>
        <Link
          className={styles.backLink}
          href={`/directory?department=${encodeURIComponent(profile.departmentCode)}`}
        >
          <span aria-hidden="true">←</span> Back to departments
        </Link>

        <header className={styles.hero}>
          <div className={styles.avatar}>
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={`Portrait of ${profile.name}`}
                width={180}
                height={180}
                sizes="(max-width: 640px) 104px, 148px"
                unoptimized
              />
            ) : (
              <span aria-hidden="true">{initials}</span>
            )}
          </div>
          <div className={styles.identity}>
            <p className={styles.eyebrow}>{profile.departmentCode} faculty profile</p>
            <h1>{profile.name}</h1>
            <p className={styles.designation}>{profile.designation}</p>
            <p className={styles.department}>{profile.departmentName}</p>
          </div>
        </header>

        <div className={styles.status} role="status">
          {profile.sourceStatus === "current"
            ? "Profile details fetched from CUET's public directory."
            : "CUET's detailed profile is unavailable right now. Directory contact details are shown below."}
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainColumn}>
            {profile.biography ? (
              <section className={styles.section}>
                <h2>About</h2>
                <p className={styles.prose}>{profile.biography}</p>
              </section>
            ) : null}
            {profile.researchInterests ? (
              <section className={styles.section}>
                <h2>Research interests</h2>
                <p className={styles.prose}>{profile.researchInterests}</p>
              </section>
            ) : null}
            {profile.educationOverview ? (
              <section className={styles.section}>
                <h2>Education overview</h2>
                <p className={styles.prose}>{profile.educationOverview}</p>
              </section>
            ) : null}
            <ProfileSection title="Education" items={profile.education} />
            <ProfileSection title="Experience" items={profile.experience} />
            <ProfileSection title="Supervision" items={profile.supervisions} />
            <ProfileSection title="Publications" items={profile.publications} />
            <ProfileSection title="Research" items={profile.research} />
            <ProfileSection title="Courses" items={profile.courses} />
            <ProfileSection title="Awards and achievements" items={profile.awards} />
            {profile.additionalInformation ? (
              <section className={styles.section}>
                <h2>Additional information</h2>
                <p className={styles.prose}>{profile.additionalInformation}</p>
              </section>
            ) : null}
            {!hasAcademicDetails ? (
              <section className={styles.section}>
                <h2>Academic details</h2>
                <p className={styles.prose}>
                  {profile.sourceStatus === "current"
                    ? "Additional biography, research, and education details are not listed in this CUET profile."
                    : "Additional profile details could not be loaded from CUET right now."}
                </p>
              </section>
            ) : null}
          </div>

          <aside className={styles.sidebar} aria-label="Faculty contact information">
            <section className={styles.contactCard}>
              <h2>Contact</h2>
              <dl>
                {profile.email ? (
                  <div>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${profile.email}`}>{profile.email}</a>
                    </dd>
                  </div>
                ) : null}
                {profile.phone ? (
                  <div>
                    <dt>Phone</dt>
                    <dd>{profile.phone}</dd>
                  </div>
                ) : null}
                {profile.office ? (
                  <div>
                    <dt>Office</dt>
                    <dd>{profile.office}</dd>
                  </div>
                ) : null}
                {profile.personalWebsite ? (
                  <div>
                    <dt>Website</dt>
                    <dd>
                      <a
                        href={profile.personalWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Personal website ↗
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
              {!profile.email && !profile.phone && !profile.office ? (
                <p>Contact details are not listed in the public directory.</p>
              ) : null}
            </section>
            {profile.socialLinks.length > 0 ? (
              <section className={styles.contactCard}>
                <h2>Professional links</h2>
                <ul className={styles.linkList}>
                  {profile.socialLinks.map((link) =>
                    link.url ? (
                      <li key={`${link.title}-${link.url}`}>
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          {link.title} <span aria-hidden="true">↗</span>
                        </a>
                      </li>
                    ) : null,
                  )}
                </ul>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
