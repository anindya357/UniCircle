"""Validated transport Admin request bodies."""

import re
import uuid
from datetime import date, time
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

BusType = Literal["student", "teacher", "staff"]
Direction = Literal["to-campus", "from-campus", "round-trip"]
Recurrence = Literal["once", "daily", "weekly", "monthly"]


class Input(BaseModel):
    model_config = ConfigDict(extra="forbid")


class RouteIn(Input):
    id: str | None = Field(default=None, min_length=2, max_length=80)
    name: str = Field(min_length=2, max_length=160)
    outbound_stops: list[str] = Field(min_length=2, max_length=30)
    return_stops: list[str] = Field(min_length=2, max_length=30)
    is_active: bool = True

    @field_validator("name")
    @classmethod
    def trim_name(cls, value: str) -> str:
        return value.strip()

    @field_validator("outbound_stops", "return_stops")
    @classmethod
    def clean_stops(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values if value.strip()]
        if len(cleaned) < 2:
            raise ValueError("A route requires at least two stops")
        return cleaned


class BusIn(Input):
    id: str | None = Field(default=None, min_length=2, max_length=80)
    name: str = Field(min_length=2, max_length=100)
    bus_type: BusType
    registration: str = Field(min_length=2, max_length=80)
    is_active: bool = True

    @field_validator("name", "registration")
    @classmethod
    def trim(cls, value: str) -> str:
        return value.strip()


class DriverIn(Input):
    name: str = Field(min_length=2, max_length=160)
    phone: str = Field(min_length=11, max_length=24)
    driver_class: Literal["heavy", "light"] = "heavy"
    assigned_bus_id: str | None = Field(default=None, max_length=80)
    is_active: bool = True

    @field_validator("name", "phone")
    @classmethod
    def trim(cls, value: str) -> str:
        return value.strip()

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, value: str) -> str:
        digits = re.sub(r"\D", "", value)
        if len(digits) not in (11, 13):
            raise ValueError("Enter an 11-digit Bangladesh mobile number")
        return value


class ScheduleIn(Input):
    title: str = Field(min_length=2, max_length=180)
    service_date: date
    start_time: time
    end_time: time
    direction: Direction
    origin: str = Field(min_length=2, max_length=180)
    destination: str = Field(min_length=2, max_length=180)
    route_id: str = Field(min_length=2, max_length=80)
    bus_id: str = Field(min_length=2, max_length=80)
    driver_id: uuid.UUID
    recurrence: Recurrence = "once"
    recurrence_until: date | None = None
    is_active: bool = True

    @field_validator("title", "origin", "destination")
    @classmethod
    def trim(cls, value: str) -> str:
        return value.strip()

    @model_validator(mode="after")
    def valid_window(self) -> "ScheduleIn":
        if self.end_time <= self.start_time:
            raise ValueError("End time must be after start time")
        if self.recurrence_until and self.recurrence_until < self.service_date:
            raise ValueError("Recurrence end cannot precede the first service date")
        return self
