import type { Department, DepartmentCode } from "@/features/directory/types/directory";

import styles from "./directory-page.module.css";

type DepartmentNavigationProps = Readonly<{
  departments: readonly Department[];
  selectedId: DepartmentCode;
  onSelect: (id: DepartmentCode) => void;
}>;

export function DepartmentNavigation({
  departments,
  selectedId,
  onSelect,
}: DepartmentNavigationProps) {
  return (
    <nav className={styles.departmentNav} aria-label="CUET departments">
      <div className={styles.departmentNavHeader}>
        <span>Browse</span>
        <strong>Departments</strong>
      </div>
      <div
        className={styles.departmentTabs}
        role="tablist"
        aria-orientation="horizontal"
      >
        {departments.map((department, index) => {
          const isSelected = selectedId === department.id;

          return (
            <button
              className={styles.departmentTab}
              id={"department-tab-" + department.id}
              key={department.id}
              type="button"
              role="tab"
              aria-controls="department-panel"
              aria-selected={isSelected}
              onClick={() => onSelect(department.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{department.shortName}</strong>
              <small>{department.name}</small>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
