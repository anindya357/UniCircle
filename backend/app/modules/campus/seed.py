"""Idempotent import of reviewed CUET campus map points."""

from sqlalchemy.orm import Session

from app.db.models import CampusLocation
from app.db.session import get_session_factory
from app.modules.campus.map_data import campus_snapshot, within_campus


def seed_campus(db: Session) -> int:
    items = campus_snapshot()["locations"]
    for sort_order, item in enumerate(items):
        if not within_campus(item["latitude"], item["longitude"]):
            raise ValueError(f"Campus point is outside CUET: {item['id']}")
        location = db.get(CampusLocation, item["id"])
        if location is None:
            location = CampusLocation(id=item["id"])
            db.add(location)
        for field in (
            "name",
            "short_name",
            "category",
            "address",
            "description",
            "details",
            "latitude",
            "longitude",
            "osm_type",
            "osm_id",
        ):
            setattr(location, field, item[field])
        location.image_url = item.get("image_url")
        location.sort_order = sort_order
    db.commit()
    return len(items)


if __name__ == "__main__":
    with get_session_factory()() as session:
        count = seed_campus(session)
    print(f"Seeded {count} CUET campus locations.")
