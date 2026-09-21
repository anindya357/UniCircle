"""Authenticated CUET department and current-faculty directory."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.schemas import ApiResponse
from app.core.auth import AuthIdentity, get_current_user
from app.core.errors import AppError
from app.db.models import Department, FacultyDirectoryEntry
from app.db.session import get_db
from app.modules.directory.cuet_profile import (
    fetch_cuet_profile,
    public_profile_fields,
    slug_from_profile_url,
)
from app.modules.directory.schemas import DepartmentOut, FacultyOut, FacultyProfileOut

router = APIRouter(tags=["directory"])
Db = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[AuthIdentity, Depends(get_current_user)]


def _department_or_404(db: Session, code: str) -> Department:
    department = db.scalar(
        select(Department)
        .options(selectinload(Department.faculty))
        .where(Department.code == code)
    )
    if department is None:
        raise AppError(
            status_code=404,
            code="department_not_found",
            message="Department not found.",
        )
    return department


@router.get("/departments", response_model=ApiResponse[list[DepartmentOut]])
def list_departments(db: Db, _user: CurrentUser) -> ApiResponse[list[DepartmentOut]]:
    departments = db.scalars(
        select(Department)
        .options(selectinload(Department.faculty))
        .order_by(Department.sort_order, Department.code)
    ).all()
    return ApiResponse(
        data=[DepartmentOut.model_validate(item) for item in departments]
    )


@router.get("/departments/{code}", response_model=ApiResponse[DepartmentOut])
def get_department(
    code: Annotated[str, Path(pattern=r"^[a-z]{2,32}$")],
    db: Db,
    _user: CurrentUser,
) -> ApiResponse[DepartmentOut]:
    return ApiResponse(data=DepartmentOut.model_validate(_department_or_404(db, code)))


@router.get("/departments/{code}/faculty", response_model=ApiResponse[list[FacultyOut]])
def list_department_faculty(
    code: Annotated[str, Path(pattern=r"^[a-z]{2,32}$")],
    db: Db,
    _user: CurrentUser,
) -> ApiResponse[list[FacultyOut]]:
    department = _department_or_404(db, code)
    return ApiResponse(
        data=[FacultyOut.model_validate(item) for item in department.faculty]
    )


@router.get("/faculty/{entry_id}", response_model=ApiResponse[FacultyOut])
def get_faculty(
    entry_id: Annotated[
        str, Path(min_length=3, max_length=64, pattern=r"^[a-z]+-[0-9]+$")
    ],
    db: Db,
    _user: CurrentUser,
) -> ApiResponse[FacultyOut]:
    faculty = db.get(FacultyDirectoryEntry, entry_id)
    if faculty is None:
        raise AppError(
            status_code=404,
            code="faculty_not_found",
            message="Faculty entry not found.",
        )
    return ApiResponse(data=FacultyOut.model_validate(faculty))


@router.get(
    "/faculty/{entry_id}/profile", response_model=ApiResponse[FacultyProfileOut]
)
def get_faculty_profile(
    entry_id: Annotated[
        str, Path(min_length=3, max_length=64, pattern=r"^[a-z]+-[0-9]+$")
    ],
    db: Db,
    _user: CurrentUser,
) -> ApiResponse[FacultyProfileOut]:
    faculty = db.get(FacultyDirectoryEntry, entry_id)
    if faculty is None:
        raise AppError(
            status_code=404,
            code="faculty_not_found",
            message="Faculty entry not found.",
        )
    details: dict = {}
    slug = slug_from_profile_url(faculty.profile_url)
    source = fetch_cuet_profile(slug) if slug else None
    if (
        source is not None
        and source.get("id") == faculty.source_id
        and source.get("admin_type") == "faculty_member"
    ):
        details = public_profile_fields(source)
    result = FacultyProfileOut.model_validate(
        {
            **FacultyOut.model_validate(faculty).model_dump(),
            "department_name": faculty.department.name,
            "source_status": "current" if details else "unavailable",
            **details,
        }
    )
    return ApiResponse(data=result)
