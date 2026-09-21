"""Campus map and location response models."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, computed_field


class CampusMapOut(BaseModel):
    name: str
    source_url: str
    tile_url: str
    attribution: str
    center: tuple[float, float]
    bounds: tuple[tuple[float, float], tuple[float, float]]
    boundary: list[tuple[float, float]]


class CampusLocationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    short_name: str
    category: Literal[
        "Landmark", "Recreation", "Student life", "Academic", "Service", "Residence"
    ]
    address: str
    description: str
    details: str
    latitude: float
    longitude: float
    osm_type: Literal["node", "way"]
    osm_id: int
    image_url: str | None

    @computed_field
    @property
    def source_url(self) -> str:
        return f"https://www.openstreetmap.org/{self.osm_type}/{self.osm_id}"
