"""Reviewed OpenStreetMap snapshot for CUET's Raozan campus only."""

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

SNAPSHOT = Path(__file__).with_name("cuet_campus.json")


@lru_cache(maxsize=1)
def campus_snapshot() -> dict[str, Any]:
    return json.loads(SNAPSHOT.read_text(encoding="utf-8"))


def within_campus(latitude: float, longitude: float) -> bool:
    """Ray-cast against the mapped CUET campus footprint, not a broad bbox."""
    ring = campus_snapshot()["map"]["boundary"]
    inside = False
    for start, end in zip(ring[:-1], ring[1:], strict=True):
        lat_a, lon_a = start
        lat_b, lon_b = end
        if (lat_a > latitude) != (lat_b > latitude):
            crossing = lon_a + (latitude - lat_a) * (lon_b - lon_a) / (lat_b - lat_a)
            if longitude < crossing:
                inside = not inside
    return inside


def map_response() -> dict[str, Any]:
    data = campus_snapshot()["map"]
    boundary = data["boundary"]
    latitudes = [point[0] for point in boundary]
    longitudes = [point[1] for point in boundary]
    south, north = min(latitudes), max(latitudes)
    west, east = min(longitudes), max(longitudes)
    return {
        **data,
        "center": [(south + north) / 2, (west + east) / 2],
        "bounds": [[south, west], [north, east]],
    }
