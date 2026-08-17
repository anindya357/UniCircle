"use client";

import { useMemo, useRef, useState } from "react";

import { AppShell } from "@/components/shared/app-shell";
import { EmptyState } from "@/components/ui/feedback/empty-state";
import { ErrorState } from "@/components/ui/feedback/error-state";
import { LoadingState } from "@/components/ui/feedback/loading-state";
import { useDirectory } from "@/features/directory/hooks/use-directory";
import type { DepartmentCode } from "@/features/directory/types/directory";

import { DepartmentNavigation } from "./department-navigation";
import styles from "./directory-page.module.css";
import { FacultyCard } from "./faculty-card";

export function DirectoryPage() {
  const { departments, isLoading, error, retry } = useDirectory();
  const [selectedId, setSelectedId] = useState<DepartmentCode>("cse");
  const [query, setQuery] = useState("");
  const departmentPanelRef = useRef<HTMLDivElement>(null);

  const selectedDepartment =
    departments.find((department) => department.id === selectedId) ?? departments[0];

  const totalFaculty = useMemo(
    () =>
      departments.reduce((total, department) => total + department.faculty.length, 0),
    [departments],
  );

  const filteredFaculty = useMemo(() => {
    if (!selectedDepartment) return [];

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return selectedDepartment.faculty;

    return selectedDepartment.faculty.filter((member) =>
      [member.name, member.designation, ...member.expertise].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [query, selectedDepartment]);

  function selectDepartment(id: DepartmentCode) {
    setSelectedId(id);
    setQuery("");

    window.requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      departmentPanelRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  return (
    <AppShell>
      <section className={styles.hero} aria-labelledby="directory-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>CUET academic directory</p>
          <h1 id="directory-title">
            Find the people shaping <span>what comes next.</span>
          </h1>
          <p>
            Move between departments, understand their academic focus, and find faculty
            contact details in one thoughtfully organized place.
          </p>
          <div className={styles.previewNotice}>
            <span aria-hidden="true">i</span>
            CSE names and roles are verified · remaining profiles are prototype data
          </div>
        </div>

        <div className={styles.heroSummary} aria-label="Directory summary">
          <span className={styles.summaryLabel}>Academic network</span>
          <strong>{isLoading ? "—" : departments.length}</strong>
          <p>engineering, planning, and design departments</p>
          <div className={styles.summaryFooter}>
            <span>{isLoading ? "—" : totalFaculty} directory profiles</span>
            <span>One connected campus</span>
          </div>
        </div>
      </section>

      {isLoading ? <LoadingState label="Loading the department directory" /> : null}

      {!isLoading && error ? (
        <ErrorState title="Directory unavailable" description={error} onRetry={retry} />
      ) : null}

      {!isLoading && !error && departments.length === 0 ? (
        <EmptyState
          title="No departments available"
          description="Department records will appear here when directory data is available."
        />
      ) : null}

      {!isLoading && !error && selectedDepartment ? (
        <div className={styles.directoryLayout}>
          <DepartmentNavigation
            departments={departments}
            selectedId={selectedDepartment.id}
            onSelect={selectDepartment}
          />

          <div
            className={styles.departmentPanel}
            ref={departmentPanelRef}
            id="department-panel"
            role="tabpanel"
            aria-labelledby={"department-tab-" + selectedDepartment.id}
          >
            <section className={styles.departmentOverview}>
              <div className={styles.departmentTitleRow}>
                <span className={styles.departmentMonogram} aria-hidden="true">
                  {selectedDepartment.shortName}
                </span>
                <div>
                  <p>{selectedDepartment.academicArea}</p>
                  <h2>{selectedDepartment.name}</h2>
                </div>
              </div>

              <p className={styles.departmentDescription}>
                {selectedDepartment.description}
              </p>

              <div className={styles.departmentMeta}>
                <div>
                  <span>Department office</span>
                  <strong>{selectedDepartment.location}</strong>
                </div>
                <div>
                  <span>General enquiries</span>
                  <a href={"mailto:" + selectedDepartment.officeEmail}>
                    {selectedDepartment.officeEmail}
                  </a>
                </div>
              </div>

              <div className={styles.focusBlock}>
                <span>Areas of focus</span>
                <ul>
                  {selectedDepartment.focusAreas.map((area) => (
                    <li key={area}>{area}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className={styles.facultySection} aria-labelledby="faculty-title">
              <div className={styles.facultyToolbar}>
                <div>
                  <p className={styles.eyebrow}>People and expertise</p>
                  <h2 id="faculty-title">Faculty directory</h2>
                  <span>
                    {selectedDepartment.faculty.length} directory profile
                    {selectedDepartment.faculty.length === 1 ? "" : "s"}
                  </span>
                </div>

                {selectedDepartment.faculty.length > 0 ? (
                  <label className={styles.searchField}>
                    <span>Search this department</span>
                    <input
                      type="search"
                      value={query}
                      placeholder="Name, role, or expertise"
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </label>
                ) : null}
              </div>

              {selectedDepartment.faculty.length === 0 ? (
                <EmptyState
                  title="Faculty profiles are being prepared"
                  description={
                    "No mock faculty records are available for " +
                    selectedDepartment.shortName +
                    " yet. The department information remains available above."
                  }
                />
              ) : filteredFaculty.length === 0 ? (
                <EmptyState
                  title="No matching faculty"
                  description={
                    "Try a different name, role, or area of expertise in " +
                    selectedDepartment.shortName +
                    "."
                  }
                />
              ) : (
                <div className={styles.facultyGrid}>
                  {filteredFaculty.map((member) => (
                    <FacultyCard
                      key={member.id}
                      member={member}
                      departmentCode={selectedDepartment.shortName}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
