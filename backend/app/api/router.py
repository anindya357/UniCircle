"""Add feature routers here in Phase 7 under the stable /api/v1 prefix."""

from fastapi import APIRouter

from app.modules.auth.router import profile_router
from app.modules.auth.router import router as auth_router
from app.modules.campus.router import router as campus_router
from app.modules.directory.router import router as directory_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(directory_router)
api_router.include_router(campus_router)
