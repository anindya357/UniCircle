"""Shared input normalization; feature-specific rules belong to their modules."""

from email_validator import EmailNotValidError, validate_email


def normalize_cuet_email(value: str) -> str:
    try:
        normalized = validate_email(value.strip(), check_deliverability=False)
    except EmailNotValidError as exc:
        raise ValueError("Enter a valid CUET email address") from exc
    if normalized.domain.lower() != "cuet.ac.bd":
        raise ValueError("A cuet.ac.bd email address is required")
    return normalized.normalized.lower()


def require_nonblank(value: str, *, field: str, max_length: int) -> str:
    normalized = value.strip()
    if not normalized or len(normalized) > max_length:
        raise ValueError(f"{field} must contain 1 to {max_length} characters")
    return normalized
