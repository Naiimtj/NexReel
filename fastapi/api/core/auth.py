"""Authentication helpers for the NexReel FastAPI backend."""

from __future__ import annotations

import hashlib
import hmac
import os
import secrets

import bcrypt as _bcrypt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session

from api.config.env import settings
from api.core.nexreel.repository import fetch_one, serialize_user
from api.dependencies import get_db

PBKDF2_ITERATIONS = 600_000
DEFAULT_ROLE = 200
ADMIN_ROLE = 999
SUPERADMIN_ROLE = 9999

_admin_key = APIKeyHeader(name="X-Admin-Password", auto_error=False)
_user_token_key = APIKeyHeader(name="X-User-Token", auto_error=False)


def generate_api_token() -> str:
    """Return a cryptographically secure random token."""
    return secrets.token_urlsafe(32)


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
    return f"{salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        if stored_hash.startswith(("$2b$", "$2a$", "$2y$")):
            return _bcrypt.checkpw(password.encode(), stored_hash.encode())
        salt_hex, digest_hex = stored_hash.split("$", 1)
        salt = bytes.fromhex(salt_hex)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
        return hmac.compare_digest(digest.hex(), digest_hex)
    except Exception:
        return False


def login_user(request: Request, user_id: str) -> None:
    request.session["user_id"] = user_id


def logout_user(request: Request) -> None:
    request.session.clear()


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    api_token: str | None = Depends(_user_token_key),
) -> dict:
    # 1. Try X-User-Token header first (stateless, no session required)
    if api_token:
        user = fetch_one(
            db,
            "SELECT * FROM users WHERE api_token = :token",
            {"token": api_token},
            serialize_user,
        )
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user

    # 2. Fall back to session cookie
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    user = fetch_one(
        db,
        "SELECT * FROM users WHERE id = :user_id",
        {"user_id": user_id},
        serialize_user,
    )
    if not user:
        request.session.clear()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return user


def require_admin_or_owner(current_user: dict, owner_id: str | None = None) -> None:
    if current_user["role"] in (ADMIN_ROLE, SUPERADMIN_ROLE):
        return
    if owner_id and current_user["id"] == owner_id:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")


def require_admin_password(password: str | None = Depends(_admin_key)) -> None:
    if password is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin password required")
    if not hmac.compare_digest(password, settings.BACKUP_ADMIN_PASSWORD):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
