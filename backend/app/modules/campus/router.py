"""Protected, read-only CUET Raozan campus map and point APIs."""

from typing import Annotated

from fastapi import APIRouter, Depends, Path
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.schemas import ApiResponse
from app.core.auth import AuthIdentity, get_current_user
from app.core.errors import AppError
from app.db.models import CampusLocation
from app.db.session import get_db
from app.modules.campus.map_data import map_response, within_campus
from app.modules.campus.schemas import CampusLocationOut, CampusMapOut

router = APIRouter(prefix="/campus", tags=["campus"])
Db = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[AuthIdentity, Depends(get_current_user)]


@router.get("/map", response_model=ApiResponse[CampusMapOut])
def get_campus_map(_user: CurrentUser) -> ApiResponse[CampusMapOut]:
    return ApiResponse(data=CampusMapOut.model_validate(map_response()))


@router.get("/locations", response_model=ApiResponse[list[CampusLocationOut]])
def list_campus_locations(
    db: Db, _user: CurrentUser
) -> ApiResponse[list[CampusLocationOut]]:
    locations = db.scalars(
        select(CampusLocation).order_by(CampusLocation.sort_order, CampusLocation.id)
    ).all()
    return ApiResponse(
        data=[
            CampusLocationOut.model_validate(item)
            for item in locations
            if within_campus(item.latitude, item.longitude)
        ]
    )


@router.get("/locations/{location_id}", response_model=ApiResponse[CampusLocationOut])
def get_campus_location(
    location_id: Annotated[
        str, Path(min_length=2, max_length=64, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    ],
    db: Db,
    _user: CurrentUser,
) -> ApiResponse[CampusLocationOut]:
    location = db.get(CampusLocation, location_id)
    if location is None or not within_campus(location.latitude, location.longitude):
        raise AppError(
            status_code=404,
            code="campus_location_not_found",
            message="Campus location not found.",
        )
    return ApiResponse(data=CampusLocationOut.model_validate(location))
