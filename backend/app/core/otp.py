"""Email-verification OTP policy and orchestration, independent of storage."""

import hashlib
import hmac
import secrets
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from enum import StrEnum
from typing import Annotated, Protocol

from fastapi import Depends

from app.core.config import Settings, get_settings
from app.core.email import VerificationEmailSender, get_verification_email_sender
from app.core.errors import AppError
from app.core.validation import normalize_cuet_email


@dataclass(frozen=True)
class OtpChallenge:
    id: str
    recipient: str
    purpose: str
    digest: str
    issued_at: datetime
    expires_at: datetime
    attempts_remaining: int


class OtpCheckResult(StrEnum):
    VERIFIED = "verified"
    INVALID = "invalid"
    EXPIRED = "expired"
    RATE_LIMITED = "rate_limited"
    MISSING = "missing"


class OtpStore(Protocol):
    """Operations must be atomic across workers; Phase 7 supplies a DB adapter."""

    def put_if_allowed(
        self, challenge: OtpChallenge, *, cooldown: timedelta
    ) -> bool: ...

    def check_and_consume(
        self, recipient: str, purpose: str, digest: str, *, now: datetime
    ) -> OtpCheckResult: ...

    def discard(self, challenge_id: str) -> None: ...


class OtpCooldownError(Exception):
    """A verification email was requested too recently."""


def digests_match(expected: str, candidate: str) -> bool:
    """Use this while holding the store's lock or database row lock."""
    return hmac.compare_digest(expected, candidate)


class OtpService:
    PURPOSE = "email_verification"

    def __init__(
        self,
        *,
        store: OtpStore,
        sender: VerificationEmailSender,
        settings: Settings,
    ) -> None:
        self.store = store
        self.sender = sender
        self.settings = settings

    def issue_email_verification(self, email: str) -> datetime:
        recipient = normalize_cuet_email(email)
        key = self.settings.require_otp_key()
        now = datetime.now(UTC)
        code = f"{secrets.randbelow(1_000_000):06d}"
        challenge = OtpChallenge(
            id=secrets.token_urlsafe(18),
            recipient=recipient,
            purpose=self.PURPOSE,
            digest=self._digest(key, recipient, code),
            issued_at=now,
            expires_at=now + timedelta(minutes=self.settings.otp_expiry_minutes),
            attempts_remaining=self.settings.otp_max_attempts,
        )
        if not self.store.put_if_allowed(
            challenge,
            cooldown=timedelta(seconds=self.settings.otp_resend_cooldown_seconds),
        ):
            raise OtpCooldownError("Please wait before requesting another code")
        try:
            self.sender.send_verification_code(
                recipient, code, self.settings.otp_expiry_minutes
            )
        except Exception:
            self.store.discard(challenge.id)
            raise
        return challenge.expires_at

    def verify_email(self, email: str, code: str) -> OtpCheckResult:
        recipient = normalize_cuet_email(email)
        digest = self._digest(self.settings.require_otp_key(), recipient, code.strip())
        return self.store.check_and_consume(
            recipient, self.PURPOSE, digest, now=datetime.now(UTC)
        )

    @classmethod
    def _digest(cls, key: bytes, recipient: str, code: str) -> str:
        message = f"{cls.PURPOSE}:{recipient}:{code}".encode()
        return hmac.new(key, message, hashlib.sha256).hexdigest()


def get_otp_store() -> OtpStore:
    raise AppError(
        status_code=503,
        code="otp_store_unavailable",
        message="Email verification storage is not configured yet.",
    )


def get_otp_service(
    store: Annotated[OtpStore, Depends(get_otp_store)],
    sender: Annotated[VerificationEmailSender, Depends(get_verification_email_sender)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> OtpService:
    return OtpService(store=store, sender=sender, settings=settings)
