from __future__ import annotations

import json

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from api.core.auth import get_current_user
from api.core.nexreel.repository import (
    execute,
    fetch_all,
    fetch_one,
    save_one,
    serialize_media,
    serialize_media_tv,
    serialize_media_tv_season,
    normalize_vote,
    to_bool,
    to_number,
    to_array,
)
from api.dependencies import get_db
from api.routers._helpers import get_media_for_user

router = APIRouter(prefix="/v1", tags=["Media"])


def _create_all_season_rows(db: Session, *, user_id: str, media_id: str, media_type: str, number_seasons: int, number_of_episodes: int, runtime_seasons: list) -> None:
    """Insert a seen row for every season (1..number_seasons)."""
    for s in range(1, number_seasons + 1):
        exists = fetch_one(
            db,
            "SELECT 1 AS x FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id AND season = :season",
            {"media_id": media_id, "user_id": user_id, "season": str(s)},
        )
        if exists:
            continue
        runtime = runtime_seasons[s] if s < len(runtime_seasons) else None
        save_one(
            db,
            'INSERT INTO media_tv_seasons (user_id, media_id, media_type, season, number_seasons, number_of_episodes, seen_complete, runtime, "like", seen, vote) '
            "VALUES (:user_id, :media_id, :media_type, :season, :number_seasons, :number_of_episodes, true, :runtime, false, true, -1) RETURNING *",
            {
                "user_id": user_id,
                "media_id": media_id,
                "media_type": media_type,
                "season": str(s),
                "number_seasons": number_seasons,
                "number_of_episodes": number_of_episodes,
                "runtime": runtime,
            },
            serialize_media_tv_season,
        )


def _delete_all_children(db: Session, *, user_id: str, media_id: str) -> None:
    """Remove all season and episode rows for a TV show."""
    execute(db, "DELETE FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id", {"media_id": media_id, "user_id": user_id})
    execute(db, "DELETE FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id", {"media_id": media_id, "user_id": user_id})


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("/medias")
def media_list(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    movies = fetch_all(db, "SELECT * FROM media WHERE user_id = :user_id ORDER BY created_at DESC", {"user_id": current_user["id"]}, serialize_media)
    tv = fetch_all(db, "SELECT * FROM media_tv WHERE user_id = :user_id ORDER BY created_at DESC", {"user_id": current_user["id"]}, serialize_media_tv)
    return movies + tv


@router.get("/medias/{media_type}/{media_id}")
def media_detail(media_type: str, media_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    media = get_media_for_user(db, current_user["id"], media_id)
    if not media:
        return {}
    if media.get("media_type") == "tv":
        seasons = fetch_all(
            db,
            "SELECT * FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id ORDER BY season ASC",
            {"media_id": media_id, "user_id": current_user["id"]},
            serialize_media_tv_season,
        )
        payload = dict(media)
        payload["seasons"] = seasons
        return payload
    return media


@router.post("/medias/{media_type}")
def media_create(media_type: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    raw_media_id = payload.get("mediaId")
    if raw_media_id is None:
        raise HTTPException(status_code=400, detail="mediaId is required")
    media_id = str(raw_media_id)
    existing = get_media_for_user(db, current_user["id"], media_id)
    if existing:
        raise HTTPException(status_code=409, detail="Media already exists")

    seen = to_bool(payload.get("seen"), False)
    pending = to_bool(payload.get("pending"), not seen)
    like = to_bool(payload.get("like"), False)
    vote = normalize_vote(payload.get("vote"))
    if vote >= 0:
        seen = True
        pending = False
    if seen:
        pending = False

    if media_type == "tv":
        runtime_seasons = to_array(payload.get("runtime_seasons"))
        number_seasons = to_number(payload.get("number_seasons"), 0)
        number_of_episodes = to_number(payload.get("number_of_episodes"), 0)

        created = save_one(
            db,
            'INSERT INTO media_tv (user_id, media_id, media_type, "like", seen, pending, seen_complete, "repeat", runtime, number_seasons, number_of_episodes, runtime_seen, runtime_seasons, vote) '
            "VALUES (:user_id, :media_id, :media_type, :like, :seen, :pending, :seen_complete, false, :runtime, :number_seasons, :number_of_episodes, :runtime_seen, CAST(:runtime_seasons AS jsonb), :vote) RETURNING *",
            {
                "user_id": current_user["id"],
                "media_id": media_id,
                "media_type": media_type,
                "like": like,
                "seen": seen,
                "pending": pending,
                "seen_complete": seen,
                "runtime": to_number(payload.get("runtime")),
                "number_seasons": number_seasons,
                "number_of_episodes": number_of_episodes,
                "runtime_seen": to_number(payload.get("runtime_seen"), 0),
                "runtime_seasons": json.dumps(runtime_seasons),
                "vote": vote,
            },
            serialize_media_tv,
        )
        # If marked as seen → create all season rows
        if seen and number_seasons:
            _create_all_season_rows(
                db,
                user_id=current_user["id"],
                media_id=media_id,
                media_type=media_type,
                number_seasons=number_seasons,
                number_of_episodes=number_of_episodes,
                runtime_seasons=runtime_seasons,
            )
        return created

    return save_one(
        db,
        'INSERT INTO media (user_id, media_id, media_type, "like", seen, pending, "repeat", runtime, vote) VALUES (:user_id, :media_id, :media_type, :like, :seen, :pending, false, :runtime, :vote) RETURNING *',
        {
            "user_id": current_user["id"],
            "media_id": media_id,
            "media_type": media_type,
            "like": like,
            "seen": seen,
            "pending": pending,
            "runtime": to_number(payload.get("runtime")),
            "vote": vote,
        },
        serialize_media,
    )


@router.patch("/medias/{media_type}/{media_id}")
def media_update(media_type: str, media_id: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    media = get_media_for_user(db, current_user["id"], media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    seen = media["seen"] if payload.get("seen") is None else to_bool(payload.get("seen"), media["seen"])
    pending = media["pending"] if payload.get("pending") is None else to_bool(payload.get("pending"), media["pending"])
    vote = media["vote"] if payload.get("vote") is None else normalize_vote(payload.get("vote"), media["vote"])
    if vote >= 0:
        seen = True
        pending = False
    # Mutual exclusion based on what the payload explicitly requests
    if payload.get("seen") is not None and seen:
        pending = False
    elif payload.get("pending") is not None and pending:
        seen = False
    like = payload.get("like") if payload.get("like") is not None else media["like"]
    repeat = to_bool(payload.get("repeat"), media.get("repeat", False)) and seen and not pending

    if media.get("media_type") == "tv":
        user_id = current_user["id"]
        was_seen = media["seen"]

        updated_tv = save_one(
            db,
            'UPDATE media_tv SET "like" = :like, seen = :seen, pending = :pending, "repeat" = :repeat, vote = :vote, runtime_seen = :runtime_seen, seen_complete = :seen_complete, updated_at = NOW() WHERE media_id = :media_id AND user_id = :user_id RETURNING *',
            {
                "media_id": media_id,
                "user_id": user_id,
                "like": like,
                "seen": seen,
                "pending": pending,
                "repeat": repeat,
                "vote": vote,
                "runtime_seen": to_number(payload.get("runtime_seen"), media.get("runtime_seen", 0)),
                "seen_complete": seen,
            },
            serialize_media_tv,
        )

        if seen and not was_seen:
            # Newly marked seen → create all season rows, delete episode rows
            number_seasons = media.get("number_seasons") or 0
            execute(db, "DELETE FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id", {"media_id": media_id, "user_id": user_id})
            if number_seasons:
                _create_all_season_rows(
                    db,
                    user_id=user_id,
                    media_id=media_id,
                    media_type="tv",
                    number_seasons=number_seasons,
                    number_of_episodes=media.get("number_of_episodes") or 0,
                    runtime_seasons=media.get("runtime_seasons") or [],
                )
        elif not seen and pending:
            # Pending (not seen) → remove all children
            _delete_all_children(db, user_id=user_id, media_id=media_id)
        elif not seen and not pending:
            # Neither seen nor pending → delete everything
            _delete_all_children(db, user_id=user_id, media_id=media_id)
            execute(db, "DELETE FROM media_tv WHERE media_id = :media_id AND user_id = :user_id", {"media_id": media_id, "user_id": user_id})
            return {"result": True}

        return updated_tv

    return save_one(
        db,
        'UPDATE media SET "like" = :like, seen = :seen, pending = :pending, "repeat" = :repeat, vote = :vote, updated_at = NOW() WHERE media_id = :media_id AND user_id = :user_id RETURNING *',
        {
            "media_id": media_id,
            "user_id": current_user["id"],
            "like": like,
            "seen": seen,
            "pending": pending,
            "repeat": repeat,
            "vote": vote,
        },
        serialize_media,
    )


@router.delete("/medias/{media_id}")
def media_delete(media_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    media = get_media_for_user(db, current_user["id"], media_id)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    if media.get("media_type") == "tv":
        execute(db, "DELETE FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id", {"media_id": media_id, "user_id": current_user["id"]})
        execute(db, "DELETE FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id", {"media_id": media_id, "user_id": current_user["id"]})
        save_one(db, "DELETE FROM media_tv WHERE media_id = :media_id AND user_id = :user_id RETURNING *", {"media_id": media_id, "user_id": current_user["id"]}, serialize_media_tv)
    else:
        save_one(db, "DELETE FROM media WHERE media_id = :media_id AND user_id = :user_id RETURNING *", {"media_id": media_id, "user_id": current_user["id"]}, serialize_media)
    return {"result": True}
