"""Protected CUET transport directory and App Admin maintenance APIs."""

import re
import uuid
from collections import defaultdict
from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.schemas import ApiResponse
from app.core.auth import AuthIdentity, get_current_admin, get_current_user
from app.core.errors import AppError
from app.db.models import BusDriver, TransportBus, TransportRoute, TransportSchedule
from app.db.session import get_db
from app.modules.transport.schemas import BusIn, DriverIn, RouteIn, ScheduleIn

router = APIRouter(tags=["transport"])
Db = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[AuthIdentity, Depends(get_current_user)]
CurrentAdmin = Annotated[AuthIdentity, Depends(get_current_admin)]


def fail(status: int, code: str, message: str) -> None:
    raise AppError(status_code=status, code=code, message=message)


def slug(value: str) -> str:
    result = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return result or str(uuid.uuid4())


def route_data(item: TransportRoute) -> dict:
    return {
        "id": item.id,
        "name": item.name,
        "outboundStops": item.outbound_stops,
        "returnStops": item.return_stops,
        "isActive": item.is_active,
    }


def bus_data(item: TransportBus, primary_driver_id: uuid.UUID | None = None) -> dict:
    return {
        "id": item.id,
        "name": item.name,
        "type": item.bus_type,
        "registration": item.registration,
        "driverId": str(primary_driver_id) if primary_driver_id else "",
        "isActive": item.is_active,
    }


def driver_data(item: BusDriver, bus: TransportBus | None = None) -> dict:
    return {
        "id": str(item.id),
        "name": item.name,
        "phone": item.phone,
        "emergencyContact": "+880 31 714920",
        "driverClass": item.driver_class,
        "assignedBusId": item.assigned_bus_id,
        "assignedBusName": bus.name if bus else None,
        "sourceRow": item.source_row,
        "isActive": item.is_active,
    }


def schedule_data(
    item: TransportSchedule,
    bus: TransportBus | None = None,
) -> dict:
    return {
        "id": str(item.id),
        "title": item.title,
        "serviceDate": item.service_date.isoformat(),
        "startTime": item.start_time.strftime("%H:%M"),
        "endTime": item.end_time.strftime("%H:%M"),
        "direction": item.direction,
        "origin": item.origin,
        "destination": item.destination,
        "routeId": item.route_id,
        "busId": item.bus_id,
        "busName": bus.name if bus else item.bus_id,
        "driverId": str(item.driver_id),
        "recurrence": item.recurrence,
        "recurrenceUntil": (
            item.recurrence_until.isoformat() if item.recurrence_until else None
        ),
        "isActive": item.is_active,
    }


def occurs(item: TransportSchedule, target: date) -> bool:
    if not item.is_active or target < item.service_date:
        return False
    if item.recurrence_until and target > item.recurrence_until:
        return False
    delta = (target - item.service_date).days
    if item.recurrence == "once":
        return delta == 0
    if item.recurrence == "daily":
        return True
    if item.recurrence == "weekly":
        return delta % 7 == 0
    return target.day == item.service_date.day


def active_templates(db: Session) -> list[TransportSchedule]:
    return list(
        db.scalars(
            select(TransportSchedule)
            .where(TransportSchedule.is_active.is_(True))
            .order_by(
                TransportSchedule.start_time,
                TransportSchedule.title,
                TransportSchedule.bus_id,
            )
        ).all()
    )


def snapshot(db: Session, start: date, days: int) -> dict:
    templates = active_templates(db)
    dates = [start + timedelta(days=index) for index in range(days)]
    available = [day for day in dates if any(occurs(item, day) for item in templates)]
    buses = list(
        db.scalars(select(TransportBus).where(TransportBus.is_active.is_(True)))
    )
    drivers = list(db.scalars(select(BusDriver).where(BusDriver.is_active.is_(True))))
    routes = list(
        db.scalars(select(TransportRoute).where(TransportRoute.is_active.is_(True)))
    )
    primary_driver: dict[str, uuid.UUID] = {}
    for driver in drivers:
        if driver.assigned_bus_id:
            primary_driver.setdefault(driver.assigned_bus_id, driver.id)
    trips: list[dict] = []
    for day in available:
        groups: dict[tuple, list[TransportSchedule]] = defaultdict(list)
        for item in templates:
            if occurs(item, day):
                groups[
                    (
                        item.title,
                        item.start_time,
                        item.end_time,
                        item.direction,
                        item.origin,
                        item.destination,
                    )
                ].append(item)
        for key, rows in groups.items():
            title, start_time, end_time, direction, origin, destination = key
            route_groups: dict[str, list[TransportSchedule]] = defaultdict(list)
            for row in rows:
                route_groups[row.route_id].append(row)
            identity = "|".join(
                [day.isoformat(), title, start_time.isoformat(), end_time.isoformat()]
            )
            trips.append(
                {
                    "id": str(uuid.uuid5(uuid.NAMESPACE_URL, f"unicircle:{identity}")),
                    "date": day.isoformat(),
                    "startTime": start_time.strftime("%H:%M"),
                    "endTime": end_time.strftime("%H:%M"),
                    "title": title,
                    "direction": direction,
                    "origin": origin,
                    "destination": destination,
                    "assignments": [
                        {
                            "routeId": route_id,
                            "busIds": [row.bus_id for row in assigned],
                            "driverIds": [str(row.driver_id) for row in assigned],
                        }
                        for route_id, assigned in route_groups.items()
                    ],
                }
            )
    trips.sort(key=lambda item: (item["date"], item["startTime"], item["title"]))
    buses_by_id = {item.id: item for item in buses}
    return {
        "referenceDate": start.isoformat(),
        "availableDates": [item.isoformat() for item in available],
        "buses": [bus_data(item, primary_driver.get(item.id)) for item in buses],
        "drivers": [
            driver_data(item, buses_by_id.get(item.assigned_bus_id)) for item in drivers
        ],
        "routes": [route_data(item) for item in routes],
        "trips": trips,
    }


@router.get("/transport/snapshot", response_model=ApiResponse[dict])
def get_transport_snapshot(
    db: Db,
    _user: CurrentUser,
    start_date: date | None = None,
    days: Annotated[int, Query(ge=1, le=62)] = 31,
) -> ApiResponse[dict]:
    today = date.today()
    start = start_date or today
    if start < today:
        fail(422, "past_schedule_not_available", "Past schedules are not available.")
    return ApiResponse(data=snapshot(db, start, days))


@router.get("/transport/dates", response_model=ApiResponse[list[str]])
def transport_dates(
    db: Db, _user: CurrentUser, days: Annotated[int, Query(ge=1, le=62)] = 31
) -> ApiResponse[list[str]]:
    result = snapshot(db, date.today(), days)
    return ApiResponse(data=result["availableDates"])


@router.get("/transport/schedules", response_model=ApiResponse[list[dict]])
def schedules_for_date(
    service_date: date, db: Db, _user: CurrentUser
) -> ApiResponse[list[dict]]:
    if service_date < date.today():
        fail(422, "past_schedule_not_available", "Past schedules are not available.")
    result = snapshot(db, service_date, 1)
    return ApiResponse(data=result["trips"])


@router.get("/transport/drivers", response_model=ApiResponse[list[dict]])
def list_drivers(db: Db, _user: CurrentUser) -> ApiResponse[list[dict]]:
    buses = {item.id: item for item in db.scalars(select(TransportBus)).all()}
    items = db.scalars(
        select(BusDriver)
        .where(BusDriver.is_active.is_(True))
        .order_by(BusDriver.source_row, BusDriver.name)
    ).all()
    return ApiResponse(
        data=[driver_data(item, buses.get(item.assigned_bus_id)) for item in items]
    )


@router.get("/admin/transport", response_model=ApiResponse[dict])
def admin_transport(db: Db, _admin: CurrentAdmin) -> ApiResponse[dict]:
    buses = list(db.scalars(select(TransportBus).order_by(TransportBus.name)))
    buses_by_id = {item.id: item for item in buses}
    drivers = list(
        db.scalars(select(BusDriver).order_by(BusDriver.source_row, BusDriver.name))
    )
    routes = list(db.scalars(select(TransportRoute).order_by(TransportRoute.name)))
    schedules = list(
        db.scalars(
            select(TransportSchedule).order_by(
                TransportSchedule.start_time, TransportSchedule.bus_id
            )
        )
    )
    return ApiResponse(
        data={
            "routes": [route_data(item) for item in routes],
            "buses": [bus_data(item) for item in buses],
            "drivers": [
                driver_data(item, buses_by_id.get(item.assigned_bus_id))
                for item in drivers
            ],
            "schedules": [
                schedule_data(item, buses_by_id.get(item.bus_id)) for item in schedules
            ],
        }
    )


def commit(db: Session, duplicate_message: str) -> None:
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        fail(409, "transport_conflict", duplicate_message)
        raise exc


def route_or_404(db: Session, item_id: str) -> TransportRoute:
    item = db.get(TransportRoute, item_id)
    if item is None:
        fail(404, "route_not_found", "Transport route not found.")
    return item


def bus_or_404(db: Session, item_id: str) -> TransportBus:
    item = db.get(TransportBus, item_id)
    if item is None:
        fail(404, "bus_not_found", "Transport bus not found.")
    return item


def driver_or_404(db: Session, item_id: uuid.UUID) -> BusDriver:
    item = db.get(BusDriver, item_id)
    if item is None:
        fail(404, "driver_not_found", "Bus driver not found.")
    return item


def schedule_or_404(db: Session, item_id: uuid.UUID) -> TransportSchedule:
    item = db.get(TransportSchedule, item_id)
    if item is None:
        fail(404, "schedule_not_found", "Transport schedule not found.")
    return item


def update_route(item: TransportRoute, body: RouteIn) -> None:
    item.name = body.name
    item.outbound_stops = body.outbound_stops
    item.return_stops = body.return_stops
    item.is_active = body.is_active


@router.post(
    "/admin/transport/routes", response_model=ApiResponse[dict], status_code=201
)
def create_route(body: RouteIn, db: Db, _admin: CurrentAdmin) -> ApiResponse[dict]:
    item = TransportRoute(id=body.id or slug(body.name))
    update_route(item, body)
    db.add(item)
    commit(db, "A route with this name or identifier already exists.")
    return ApiResponse(data=route_data(item))


@router.put("/admin/transport/routes/{item_id}", response_model=ApiResponse[dict])
def update_route_endpoint(
    item_id: str, body: RouteIn, db: Db, _admin: CurrentAdmin
) -> ApiResponse[dict]:
    item = route_or_404(db, item_id)
    update_route(item, body)
    commit(db, "A route with this name already exists.")
    return ApiResponse(data=route_data(item))


@router.delete("/admin/transport/routes/{item_id}", status_code=204)
def delete_route(item_id: str, db: Db, _admin: CurrentAdmin) -> None:
    item = route_or_404(db, item_id)
    if db.scalar(
        select(func.count())
        .select_from(TransportSchedule)
        .where(TransportSchedule.route_id == item_id)
    ):
        fail(409, "route_in_use", "Remove assigned schedules before this route.")
    db.delete(item)
    db.commit()


def update_bus(item: TransportBus, body: BusIn) -> None:
    item.name = body.name
    item.bus_type = body.bus_type
    item.registration = body.registration
    item.is_active = body.is_active


@router.post(
    "/admin/transport/buses", response_model=ApiResponse[dict], status_code=201
)
def create_bus(body: BusIn, db: Db, _admin: CurrentAdmin) -> ApiResponse[dict]:
    item = TransportBus(id=body.id or slug(body.name))
    update_bus(item, body)
    db.add(item)
    commit(db, "A bus with this name, registration, or identifier already exists.")
    return ApiResponse(data=bus_data(item))


@router.put("/admin/transport/buses/{item_id}", response_model=ApiResponse[dict])
def update_bus_endpoint(
    item_id: str, body: BusIn, db: Db, _admin: CurrentAdmin
) -> ApiResponse[dict]:
    item = bus_or_404(db, item_id)
    update_bus(item, body)
    commit(db, "A bus with this name or registration already exists.")
    return ApiResponse(data=bus_data(item))


@router.delete("/admin/transport/buses/{item_id}", status_code=204)
def delete_bus(item_id: str, db: Db, _admin: CurrentAdmin) -> None:
    item = bus_or_404(db, item_id)
    references = db.scalar(
        select(func.count())
        .select_from(TransportSchedule)
        .where(TransportSchedule.bus_id == item_id)
    )
    assigned = db.scalar(
        select(func.count())
        .select_from(BusDriver)
        .where(BusDriver.assigned_bus_id == item_id)
    )
    if references or assigned:
        fail(409, "bus_in_use", "Remove schedules and driver assignments first.")
    db.delete(item)
    db.commit()


def update_driver(item: BusDriver, body: DriverIn, db: Session) -> None:
    if body.assigned_bus_id:
        bus_or_404(db, body.assigned_bus_id)
    item.name = body.name
    item.phone = body.phone
    item.driver_class = body.driver_class
    item.assigned_bus_id = body.assigned_bus_id
    item.is_active = body.is_active


@router.post(
    "/admin/transport/drivers", response_model=ApiResponse[dict], status_code=201
)
def create_driver(body: DriverIn, db: Db, _admin: CurrentAdmin) -> ApiResponse[dict]:
    item = BusDriver()
    update_driver(item, body, db)
    db.add(item)
    commit(db, "A driver with this phone number already exists.")
    return ApiResponse(
        data=driver_data(item, db.get(TransportBus, item.assigned_bus_id))
    )


@router.put("/admin/transport/drivers/{item_id}", response_model=ApiResponse[dict])
def update_driver_endpoint(
    item_id: uuid.UUID, body: DriverIn, db: Db, _admin: CurrentAdmin
) -> ApiResponse[dict]:
    item = driver_or_404(db, item_id)
    update_driver(item, body, db)
    commit(db, "A driver with this phone number already exists.")
    return ApiResponse(
        data=driver_data(item, db.get(TransportBus, item.assigned_bus_id))
    )


@router.delete("/admin/transport/drivers/{item_id}", status_code=204)
def delete_driver(item_id: uuid.UUID, db: Db, _admin: CurrentAdmin) -> None:
    item = driver_or_404(db, item_id)
    if db.scalar(
        select(func.count())
        .select_from(TransportSchedule)
        .where(TransportSchedule.driver_id == item_id)
    ):
        fail(409, "driver_in_use", "Remove assigned schedules before this driver.")
    db.delete(item)
    db.commit()


def update_schedule(item: TransportSchedule, body: ScheduleIn, db: Session) -> None:
    route_or_404(db, body.route_id)
    bus_or_404(db, body.bus_id)
    driver = driver_or_404(db, body.driver_id)
    item.title = body.title
    item.service_date = body.service_date
    item.start_time = body.start_time
    item.end_time = body.end_time
    item.direction = body.direction
    item.origin = body.origin
    item.destination = body.destination
    item.route_id = body.route_id
    item.bus_id = body.bus_id
    item.driver_id = body.driver_id
    item.recurrence = body.recurrence
    item.recurrence_until = body.recurrence_until
    item.is_active = body.is_active
    driver.assigned_bus_id = body.bus_id


@router.post(
    "/admin/transport/schedules", response_model=ApiResponse[dict], status_code=201
)
def create_schedule(
    body: ScheduleIn, db: Db, _admin: CurrentAdmin
) -> ApiResponse[dict]:
    item = TransportSchedule()
    update_schedule(item, body, db)
    db.add(item)
    commit(db, "This bus already has a schedule at that date and start time.")
    return ApiResponse(data=schedule_data(item, db.get(TransportBus, item.bus_id)))


@router.put("/admin/transport/schedules/{item_id}", response_model=ApiResponse[dict])
def update_schedule_endpoint(
    item_id: uuid.UUID, body: ScheduleIn, db: Db, _admin: CurrentAdmin
) -> ApiResponse[dict]:
    item = schedule_or_404(db, item_id)
    update_schedule(item, body, db)
    commit(db, "This bus already has a schedule at that date and start time.")
    return ApiResponse(data=schedule_data(item, db.get(TransportBus, item.bus_id)))


@router.delete("/admin/transport/schedules/{item_id}", status_code=204)
def delete_schedule(item_id: uuid.UUID, db: Db, _admin: CurrentAdmin) -> None:
    db.delete(schedule_or_404(db, item_id))
    db.commit()
