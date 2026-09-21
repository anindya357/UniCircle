"""Input validation for club requests, events, and registrations."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.core.validation import normalize_cuet_email, require_nonblank


class Input(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ClubFields(Input):
    name: str = Field(max_length=200)
    short_name: str = Field(max_length=40)
    category: str = Field(max_length=100)
    tagline: str = Field(max_length=240)
    description: str = Field(max_length=2000)
    activities: list[str] = Field(min_length=1, max_length=20)

    @field_validator("name", "short_name", "category", "tagline", "description")
    @classmethod
    def nonempty(cls, value: str) -> str:
        return require_nonblank(value, field="Club field", max_length=2000)

    @field_validator("activities")
    @classmethod
    def valid_activities(cls, values: list[str]) -> list[str]:
        return [
            require_nonblank(value, field="Activity", max_length=200)
            for value in values
        ]


class ClubRequestIn(ClubFields):
    purpose: str = Field(min_length=20, max_length=3000)

    @field_validator("purpose")
    @classmethod
    def valid_purpose(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 20:
            raise ValueError("Purpose must contain at least 20 characters")
        return value


class ClubUpdateIn(ClubFields):
    pass


class ReviewIn(Input):
    decision: Literal["approved", "rejected"]
    note: str | None = Field(default=None, max_length=2000)


class AdminIn(Input):
    user_id: str


class EventIn(Input):
    title: str = Field(min_length=1, max_length=200)
    category: str = Field(min_length=1, max_length=100)
    summary: str = Field(min_length=1, max_length=3000)
    location: str = Field(min_length=1, max_length=250)
    starts_at: datetime
    ends_at: datetime
    registration_enabled: bool = False
    registration_closes_at: datetime | None = None
    is_paid: bool = False
    fee: int = Field(default=0, ge=0)
    bkash_number: str | None = Field(default=None, pattern=r"^01[0-9]{9}$")

    @field_validator("title", "category", "summary", "location")
    @classmethod
    def nonempty(cls, value: str) -> str:
        return value.strip() or (_ for _ in ()).throw(ValueError("Must not be blank"))

    @model_validator(mode="after")
    def valid_event(self) -> "EventIn":
        if self.starts_at.tzinfo is None or self.ends_at.tzinfo is None:
            raise ValueError("Event times must include a timezone")
        if self.ends_at <= self.starts_at:
            raise ValueError("End must be after start")
        if self.registration_closes_at is not None:
            if not self.registration_enabled:
                raise ValueError("Registration close requires an enabled form")
            if (
                self.registration_closes_at.tzinfo is None
                or self.registration_closes_at > self.ends_at
            ):
                raise ValueError(
                    "Registration close must be timezone-aware "
                    "and no later than event end"
                )
        if self.is_paid and (
            not self.registration_enabled or self.fee <= 0 or not self.bkash_number
        ):
            raise ValueError(
                "Paid registration requires an enabled form, "
                "positive fee, and bKash number"
            )
        if not self.is_paid and (self.fee != 0 or self.bkash_number):
            raise ValueError("Free events cannot have a fee or bKash number")
        return self


class InterestIn(Input):
    status: Literal["interested", "going", "none"]


class RegistrationIn(Input):
    participant_name: str = Field(min_length=1, max_length=200)
    email: str
    student_id: str = Field(min_length=1, max_length=64)
    department_name: str = Field(min_length=1, max_length=100)
    bkash_trx_id: str | None = Field(default=None, min_length=4, max_length=100)

    @field_validator("participant_name", "student_id", "department_name")
    @classmethod
    def nonempty(cls, value: str) -> str:
        return value.strip() or (_ for _ in ()).throw(ValueError("Must not be blank"))

    @field_validator("email")
    @classmethod
    def cuet_email(cls, value: str) -> str:
        return normalize_cuet_email(value)


class PaymentReviewIn(Input):
    status: Literal["verified", "rejected"]
