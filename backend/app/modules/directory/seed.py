"""Idempotent import of the reviewed CUET public-directory snapshot."""

import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.db.models import Department, FacultyDirectoryEntry
from app.db.session import get_session_factory

SNAPSHOT = Path(__file__).with_name("cuet_directory.json")


def seed_directory(db: Session) -> tuple[int, int]:
    snapshot = json.loads(SNAPSHOT.read_text(encoding="utf-8"))
    department_count = 0
    faculty_count = 0
    for item in snapshot["departments"]:
        department = db.get(Department, item["code"])
        if department is None:
            department = Department(code=item["code"])
            db.add(department)
        for field in (
            "name",
            "description",
            "office_email",
            "phone",
            "address",
            "source_url",
            "sort_order",
        ):
            setattr(department, field, item[field])
        department_count += 1
        for entry in item["faculty"]:
            faculty = db.get(FacultyDirectoryEntry, entry["id"])
            if faculty is None:
                faculty = FacultyDirectoryEntry(id=entry["id"])
                db.add(faculty)
            faculty.department_code = item["code"]
            for field in (
                "source_id",
                "name",
                "designation",
                "email",
                "phone",
                "office",
                "profile_url",
                "sort_order",
            ):
                setattr(faculty, field, entry[field])
            faculty_count += 1
    db.commit()
    return department_count, faculty_count


if __name__ == "__main__":
    with get_session_factory()() as session:
        departments, faculty = seed_directory(session)
    print(f"Seeded {departments} departments and {faculty} faculty listings.")
