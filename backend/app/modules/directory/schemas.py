"""Public, read-only directory response shapes."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


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


class ProfileEntryOut(BaseModel):
    title: str
    subtitle: str | None = None
    period: str | None = None
    description: str | None = None
    url: str | None = None


class FacultyProfileOut(FacultyOut):
    department_name: str
    source_status: Literal["current", "unavailable"]
    avatar_url: str | None = None
    biography: str | None = None
    research_interests: str | None = None
    education_overview: str | None = None
    additional_information: str | None = None
    personal_website: str | None = None
    education: list[ProfileEntryOut] = Field(default_factory=list)
    experience: list[ProfileEntryOut] = Field(default_factory=list)
    supervisions: list[ProfileEntryOut] = Field(default_factory=list)
    publications: list[ProfileEntryOut] = Field(default_factory=list)
    research: list[ProfileEntryOut] = Field(default_factory=list)
    courses: list[ProfileEntryOut] = Field(default_factory=list)
    awards: list[ProfileEntryOut] = Field(default_factory=list)
    social_links: list[ProfileEntryOut] = Field(default_factory=list)


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
