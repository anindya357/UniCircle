"""FastAPI foundation contract checks."""

from fastapi.testclient import TestClient

from app.core.config import LOCAL_DATABASE_URL, Settings
from app.core.errors import AppError
from app.main import create_app


def make_client(*, raise_server_exceptions: bool = True) -> TestClient:
    app = create_app(make_test_settings())
    return TestClient(app, raise_server_exceptions=raise_server_exceptions)


def make_test_settings() -> Settings:
    return Settings(
        app_env="development",
        frontend_url="http://localhost:3000",
        database_url=LOCAL_DATABASE_URL,
        _env_file=None,
    )


def test_health_response_is_data_envelope() -> None:
    with make_client() as client:
        response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"data": {"status": "ok", "service": "unicircle-api"}}


def test_openapi_documents_health() -> None:
    with make_client() as client:
        response = client.get("/api/v1/openapi.json")

    assert response.status_code == 200
    assert "/health" in response.json()["paths"]


def test_cors_allows_configured_frontend_origin() -> None:
    with make_client() as client:
        response = client.options(
            "/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_cors_rejects_unlisted_origin() -> None:
    with make_client() as client:
        response = client.options(
            "/health",
            headers={
                "Origin": "https://untrusted.example",
                "Access-Control-Request-Method": "GET",
            },
        )

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


def test_unknown_route_uses_error_envelope() -> None:
    with make_client() as client:
        response = client.get("/missing")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"


def test_validation_error_uses_error_envelope() -> None:
    app = create_app(make_test_settings())

    @app.get("/test-number/{number}")
    def number_route(number: int) -> dict[str, int]:
        return {"number": number}

    with TestClient(app) as client:
        response = client.get("/test-number/not-a-number")

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
    assert response.json()["error"]["details"][0]["field"] == "path.number"


def test_application_error_uses_error_envelope() -> None:
    app = create_app(make_test_settings())

    @app.get("/test-conflict")
    def conflict_route() -> None:
        raise AppError(status_code=409, code="conflict", message="Already exists.")

    with TestClient(app) as client:
        response = client.get("/test-conflict")

    assert response.status_code == 409
    assert response.json() == {
        "error": {"code": "conflict", "message": "Already exists."}
    }


def test_unexpected_error_hides_exception_detail() -> None:
    app = create_app(make_test_settings())

    @app.get("/test-crash")
    def crash_route() -> None:
        raise RuntimeError("private-internal-detail")

    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get("/test-crash")

    assert response.status_code == 500
    assert response.json() == {
        "error": {
            "code": "internal_error",
            "message": "An unexpected error occurred.",
        }
    }
