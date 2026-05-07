"""Shared helpers used across multiple NexReel routers."""

from __future__ import annotations

from typing import Any

from fastapi import Request
from starlette.datastructures import UploadFile as StarletteUploadFile
from sqlalchemy.orm import Session

from api.core.nexreel.repository import (
    fetch_one,
)

DEFAULT_AVATAR = (
    "https://res.cloudinary.com/dznwlaen6/image/upload/v1699548563/nexreel/default/default.webp"
)
DEFAULT_PLAYLIST_IMAGE = (
    "https://res.cloudinary.com/dznwlaen6/image/upload/v1698741021/nexreel/default/List_Media.webp"
)
DEFAULT_FORUM_IMAGE = DEFAULT_PLAYLIST_IMAGE


async def parse_form(request: Request) -> tuple[dict[str, Any], dict[str, StarletteUploadFile]]:
    form = await request.form()
    data: dict[str, Any] = {}
    files: dict[str, StarletteUploadFile] = {}
    for key in form.keys():
        values = form.getlist(key)
        if not values:
            continue
        if len(values) == 1:
            value = values[0]
            if isinstance(value, StarletteUploadFile):
                files[key] = value
            else:
                data[key] = value
        else:
            normalized: list[Any] = []
            for value in values:
                if isinstance(value, StarletteUploadFile):
                    files[key] = value
                else:
                    normalized.append(value)
            data[key] = normalized
    return data, files


def get_media_for_user(db: Session, user_id: str, media_id: str) -> dict[str, Any] | None:
    from api.core.nexreel.repository import serialize_media, serialize_media_tv

    media_id = str(media_id)
    media = fetch_one(
        db,
        "SELECT * FROM media WHERE media_id = :media_id AND user_id = :user_id",
        {"media_id": media_id, "user_id": user_id},
        serialize_media,
    )
    if media:
        return media
    return fetch_one(
        db,
        "SELECT * FROM media_tv WHERE media_id = :media_id AND user_id = :user_id",
        {"media_id": media_id, "user_id": user_id},
        serialize_media_tv,
    )