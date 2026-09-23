"""Idempotent CUET transport seed reviewed from the supplied driver PDF."""

import uuid
from datetime import date, time
from random import Random

from sqlalchemy.orm import Session

from app.db.models import BusDriver, TransportBus, TransportRoute, TransportSchedule
from app.db.session import get_session_factory

DRIVER_NAMESPACE = uuid.UUID("13be4dde-25df-46d9-8aee-9b8f85ebf735")
SCHEDULE_NAMESPACE = uuid.UUID("4b6aa8ae-36cb-4320-b90a-8c08cd12daf7")

DRIVERS = (
    (7, "Md. Khorshed Alam", "01672735883", "heavy"),
    (8, "Md. Barkat Ullah", "01713109928", "heavy"),
    (9, "Md. Abdur Rahim", "01818222017", "heavy"),
    (10, "Prabhat Barua", "01673346402", "heavy"),
    (11, "Ananda Barua", "01835191686", "heavy"),
    (12, "Ranjan Mitra", "01866182872", "heavy"),
    (13, "Md. Hosen", "01814980547", "heavy"),
    (14, "Md. Ibrahim Hosen", "01819617529", "heavy"),
    (15, "Mithu Barua", "01812827542", "heavy"),
    (16, "Md. Akbar Hosen", "01869298841", "heavy"),
    (17, "Ratan De", "01818562267", "heavy"),
    (18, "Md. Zahedul Islam", "01819542054", "heavy"),
    (19, "Md. Helal Uddin", "01970076556", "heavy"),
    (20, "Suman Das", "01818136557", "heavy"),
    (21, "Md. Mohiuddin", "01823823586", "light"),
    (22, "Md. Harun", "01838257030", "light"),
    (23, "Md. Hasan", "01842385555", "light"),
    (24, "Md. Sahab Uddin", "01819084569", "light"),
    (25, "Md. Jahangir Alam", "01812075496", "light"),
    (26, "Md. Nazim Uddin", "01815698013", "light"),
    (27, "Mohammad Ali", "01831420794", "light"),
    (28, "Md. Abdul Sobhan", "01818909409", "light"),
    (29, "Md. Moin Uddin (Shanku)", "01813164896", "light"),
    (30, "Md. Al-Amin", "01814479574", "light"),
    (31, "Md. Rashed", "01828909585", "light"),
)

BUSES = (
    ("tista", "Tista", "student"),
    ("gomoti", "Gomoti", "student"),
    ("podma", "Podma", "student"),
    ("surma", "Surma", "student"),
    ("jamuna", "Jamuna", "student"),
    ("sangu", "Sangu", "student"),
    ("ichamoti", "Ichamoti", "student"),
    ("buriganga", "Buriganga", "student"),
    ("halda", "Halda", "student"),
    ("meghna", "Meghna", "student"),
    ("brtc-1", "BRTC-1", "teacher"),
    ("brtc-2", "BRTC-2", "teacher"),
    ("brtc-3", "BRTC-3", "staff"),
    ("brtc-4", "BRTC-4", "staff"),
    ("kortoa", "Kortoa", "teacher"),
    ("chitra", "Chitra", "staff"),
    ("brahmaputra", "Brahmaputra", "student"),
    ("kopotakkho", "Kopotakkho", "student"),
    ("dhanshiri", "Dhanshiri", "staff"),
    ("dhaleshwari", "Dhaleshwari", "teacher"),
)

ROUTES = (
    (
        "regular-route",
        "Regular route",
        [
            "Bottoli Rail Station",
            "GEC",
            "Muradpur",
            "Bahaddarhat",
            "Rastar Matha",
            "CUET",
        ],
    ),
    (
        "chawkbazar-route",
        "Chawkbazar route",
        [
            "Bottoli Rail Station",
            "Kotowali",
            "Chawkbazar",
            "Bahaddarhat",
            "Rastar Matha",
            "CUET",
        ],
    ),
    (
        "rastar-matha-loop",
        "Rastar Matha return loop",
        ["CUET", "Rastar Matha", "CUET"],
    ),
)

SLOTS = (
    (
        "morning-campus",
        "Morning campus arrival",
        time(7),
        time(8, 20),
        "to-campus",
        "Bottoli Rail Station",
        "CUET",
        11,
        0,
    ),
    (
        "midday-loop",
        "Midday city return",
        time(13, 30),
        time(15),
        "round-trip",
        "CUET",
        "Rastar Matha and return",
        4,
        11,
    ),
    (
        "afternoon-city",
        "Afternoon city departure",
        time(16, 15),
        time(17, 45),
        "from-campus",
        "CUET",
        "Bottoli Rail Station",
        11,
        3,
    ),
    (
        "night-campus",
        "Night campus return",
        time(20, 30),
        time(22),
        "to-campus",
        "Bottoli Rail Station",
        "CUET",
        11,
        6,
    ),
)


def seed_transport(db: Session) -> dict[str, int]:
    for route_id, name, outbound in ROUTES:
        item = db.get(TransportRoute, route_id) or TransportRoute(id=route_id)
        item.name = name
        item.outbound_stops = outbound
        item.return_stops = list(reversed(outbound))
        item.is_active = True
        db.add(item)
    for index, (bus_id, name, bus_type) in enumerate(BUSES, start=1):
        item = db.get(TransportBus, bus_id) or TransportBus(id=bus_id)
        item.name = name
        item.bus_type = bus_type
        item.registration = f"CUET-{index:02d}"
        item.is_active = True
        db.add(item)
    db.flush()

    bus_ids = [item[0] for item in BUSES]
    bus_order = bus_ids.copy()
    Random(20260923).shuffle(bus_order)
    drivers: list[BusDriver] = []
    for index, (source_row, name, phone, driver_class) in enumerate(DRIVERS):
        item_id = uuid.uuid5(DRIVER_NAMESPACE, str(source_row))
        item = db.get(BusDriver, item_id) or BusDriver(id=item_id)
        item.source_row = source_row
        item.name = name
        item.phone = phone
        item.driver_class = driver_class
        item.assigned_bus_id = bus_order[index % len(bus_order)]
        item.is_active = True
        db.add(item)
        drivers.append(item)
    db.flush()

    primary_by_bus: dict[str, BusDriver] = {}
    for driver in drivers:
        primary_by_bus.setdefault(driver.assigned_bus_id, driver)
    service_start = date.today()
    for (
        slot_id,
        title,
        start,
        end,
        direction,
        origin,
        destination,
        count,
        offset,
    ) in SLOTS:
        rotated = bus_ids[offset:] + bus_ids[:offset]
        for position, bus_id in enumerate(rotated[:count]):
            schedule_id = uuid.uuid5(SCHEDULE_NAMESPACE, f"{slot_id}:{bus_id}")
            item = db.get(TransportSchedule, schedule_id) or TransportSchedule(
                id=schedule_id
            )
            item.title = title
            item.service_date = service_start
            item.start_time = start
            item.end_time = end
            item.direction = direction
            item.origin = origin
            item.destination = destination
            item.route_id = (
                "rastar-matha-loop"
                if slot_id == "midday-loop"
                else "regular-route"
                if position < 9
                else "chawkbazar-route"
            )
            item.bus_id = bus_id
            item.driver_id = primary_by_bus[bus_id].id
            item.recurrence = "daily"
            item.recurrence_until = None
            item.is_active = True
            db.add(item)
    db.commit()
    return {
        "routes": len(ROUTES),
        "buses": len(BUSES),
        "drivers": len(DRIVERS),
        "schedules": sum(item[7] for item in SLOTS),
    }


if __name__ == "__main__":
    with get_session_factory()() as session:
        counts = seed_transport(session)
    print("Seeded CUET transport:", counts)
