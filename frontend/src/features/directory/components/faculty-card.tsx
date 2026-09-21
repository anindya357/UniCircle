import type { FacultyMember } from "@/features/directory/types/directory";

import styles from "./directory-page.module.css";

type FacultyCardProps = Readonly<{
  member: FacultyMember;
  departmentCode: string;
}>;

export function FacultyCard({ member, departmentCode }: FacultyCardProps) {
  return (
    <article className={styles.facultyCard}>
      <header className={styles.facultyHeader}>
        <div className={styles.facultyAvatar} aria-hidden="true">
          {member.initials}
        </div>
        <div>
          <span>{departmentCode} faculty</span>
          <h3>{member.name}</h3>
          <p>{member.designation}</p>
        </div>
      </header>

      {member.expertise.length > 0 ? (
        <ul className={styles.expertiseList} aria-label={member.name + " expertise"}>
          {member.expertise.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      ) : null}

      <dl className={styles.contactList}>
        {member.email ? (
          <div>
            <dt>Email</dt>
            <dd>
              <a href={"mailto:" + member.email}>{member.email}</a>
            </dd>
          </div>
        ) : null}
        {member.phone ? (
          <div>
            <dt>Phone</dt>
            <dd>{member.phone}</dd>
          </div>
        ) : null}
        {member.office ? (
          <div>
            <dt>Office</dt>
            <dd>{member.office}</dd>
          </div>
        ) : null}
        {member.profileUrl ? (
          <div>
            <dt>Profile</dt>
            <dd>
              <a href={member.profileUrl} target="_blank" rel="noopener noreferrer">
                Official CUET profile ↗
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
