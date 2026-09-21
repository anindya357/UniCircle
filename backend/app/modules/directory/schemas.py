"""Public, read-only directory response shapes."""

from pydantic import BaseModel, ConfigDict


class FacultyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    department_code: str
    name: str
    designation: str | None
    email: str | None
    phone: str | None
    office: str | None
    profile_url: str | None


class DepartmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    name: str
    description: str | None
    office_email: str | None
    phone: str | None
    address: str | None
    source_url: str
    faculty: list[FacultyOut]
