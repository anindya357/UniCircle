"""Validation schemas for Admin-authored campus information."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

NewsKind = Literal["news", "update", "announcement"]
PublishStatus = Literal["draft", "published"]


class Input(BaseModel):
    model_config = ConfigDict(extra="forbid")


class NewsItemIn(Input):
    type: NewsKind
    title: str = Field(min_length=1, max_length=200)
    summary: str = Field(min_length=1, max_length=600)
    content: list[str] = Field(min_length=1, max_length=20)
    audience: str = Field(min_length=1, max_length=160)
    status: PublishStatus = "draft"

    @field_validator("title", "summary", "audience")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Value must not be blank")
        return value

    @field_validator("content")
    @classmethod
    def normalize_content(cls, value: list[str]) -> list[str]:
        paragraphs = [paragraph.strip() for paragraph in value if paragraph.strip()]
        if not paragraphs:
            raise ValueError("At least one content paragraph is required")
        if any(len(paragraph) > 4000 for paragraph in paragraphs):
            raise ValueError("A content paragraph must be at most 4000 characters")
        return paragraphs


class PublishStatusIn(Input):
    status: PublishStatus
