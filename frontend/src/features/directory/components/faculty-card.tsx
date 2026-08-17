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

      <ul className={styles.expertiseList} aria-label={member.name + " expertise"}>
        {member.expertise.map((area) => (
          <li key={area}>{area}</li>
        ))}
      </ul>

      <dl className={styles.contactList}>
        <div>
          <dt>Email</dt>
          <dd>
            <a href={"mailto:" + member.email}>{member.email}</a>
          </dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{member.phone}</dd>
        </div>
        <div>
          <dt>Office</dt>
          <dd>{member.office}</dd>
        </div>
      </dl>
    </article>
  );
}
