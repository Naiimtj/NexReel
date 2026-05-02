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
    serialize_media_tv,
    serialize_media_tv_episode,
    serialize_media_tv_season,
    normalize_vote,
    to_bool,
    to_number,
    to_array,
)
from api.dependencies import get_db
from api.routers._helpers import create_missing_tv_seasons

router = APIRouter(prefix="/v1", tags=["TV Shows"])


@router.post("/seasons/{media_id}")
def season_create(media_id: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    exists = fetch_one(
        db,
        "SELECT * FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id AND season = :season",
        {"media_id": media_id, "user_id": current_user["id"], "season": str(payload.get("season"))},
        serialize_media_tv_season,
    )
    if exists:
        raise HTTPException(status_code=404, detail="Season already exists")
    media_type = payload.get("media_type") or "tv"
    number_seasons = to_number(payload.get("number_seasons"), 0)
    number_of_episodes = to_number(payload.get("number_of_episodes"), 0)
    runtime_seasons = to_array(payload.get("runtime_seasons"))
    vote = normalize_vote(payload.get("vote"))
    save_one(
        db,
        'INSERT INTO media_tv_seasons (user_id, media_id, media_type, season, number_seasons, number_of_episodes, seen_complete, runtime, "like", seen, pending, vote) VALUES (:user_id, :media_id, :media_type, :season, :number_seasons, :number_of_episodes, false, :runtime, :like, :seen, :pending, :vote) RETURNING *',
        {
            "user_id": current_user["id"],
            "media_id": media_id,
            "media_type": media_type,
            "season": str(payload.get("season")),
            "number_seasons": number_seasons,
            "number_of_episodes": number_of_episodes,
            "runtime": to_number(payload.get("runtime")),
            "like": to_bool(payload.get("like"), False),
            "seen": to_bool(payload.get("seen"), False),
            "pending": to_bool(payload.get("pending"), True),
            "vote": vote,
        },
        serialize_media_tv_season,
    )
    parent_tv = fetch_one(
        db,
        "SELECT * FROM media_tv WHERE media_id = :media_id AND user_id = :user_id",
        {"media_id": media_id, "user_id": current_user["id"]},
        serialize_media_tv,
    )
    if not parent_tv:
        return save_one(
            db,
            'INSERT INTO media_tv (user_id, media_id, media_type, "like", seen, pending, seen_complete, "repeat", runtime, number_seasons, number_of_episodes, runtime_seen, runtime_seasons, vote) VALUES (:user_id, :media_id, :media_type, false, false, true, false, false, :runtime, :number_seasons, :number_of_episodes, :runtime_seen, CAST(:runtime_seasons AS jsonb), :vote) RETURNING *',
            {
                "user_id": current_user["id"],
                "media_id": media_id,
                "media_type": media_type,
                "runtime": to_number(payload.get("runtime")),
                "number_seasons": number_seasons,
                "number_of_episodes": number_of_episodes,
                "runtime_seen": to_number(payload.get("runtime_seen"), 0),
                "runtime_seasons": json.dumps(runtime_seasons),
                "vote": vote,
            },
            serialize_media_tv,
        )
    updated_tv = save_one(
        db,
        "UPDATE media_tv SET pending = true, seen = false, seen_complete = false, runtime_seen = :runtime_seen, updated_at = NOW() WHERE media_id = :media_id AND user_id = :user_id RETURNING *",
        {
            "media_id": media_id,
            "user_id": current_user["id"],
            "runtime_seen": to_number(payload.get("runtime_seen"), parent_tv.get("runtime_seen") or 0),
        },
        serialize_media_tv,
    )
    create_missing_tv_seasons(
        db,
        media_id=media_id,
        user_id=current_user["id"],
        media_type=media_type,
        number_seasons=number_seasons or parent_tv["number_seasons"] or 0,
        number_of_episodes=number_of_episodes or parent_tv["number_of_episodes"] or 0,
        runtime_seasons=runtime_seasons or parent_tv["runtime_seasons"],
        like=False,
        seen=False,
        pending=True,
        vote=vote,
    )
    return updated_tv


@router.get("/seasons/{media_id}/{season}")
def season_detail(media_id: str, season: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    media = fetch_one(
        db,
        "SELECT * FROM media_tv WHERE media_id = :media_id AND user_id = :user_id",
        {"media_id": media_id, "user_id": current_user["id"]},
        serialize_media_tv,
    )
    if media and media["seen"]:
        result = dict(media)
        result["season"] = season
        result["runtime"] = media["runtime_seasons"][int(season)] if int(season) < len(media["runtime_seasons"]) else None
        result.pop("runtime_seen", None)
        return result
    season_row = fetch_one(
        db,
        "SELECT * FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id AND season = :season",
        {"media_id": media_id, "user_id": current_user["id"], "season": season},
        serialize_media_tv_season,
    )
    if not season_row:
        return {"result": False}
    return season_row


@router.get("/seasons/{media_id}")
def season_list(media_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return fetch_all(
        db,
        "SELECT * FROM media_tv_seasons WHERE user_id = :user_id AND media_id = :media_id ORDER BY season ASC",
        {"user_id": current_user["id"], "media_id": media_id},
        serialize_media_tv_season,
    )


@router.patch("/seasons/{media_id}/{season}")
def season_update(media_id: str, season: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    season_row = fetch_one(
        db,
        "SELECT * FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id AND season = :season",
        {"media_id": media_id, "user_id": current_user["id"], "season": season},
        serialize_media_tv_season,
    )
    if not season_row:
        raise HTTPException(status_code=404, detail="Media or Season not found")
    updated = save_one(
        db,
        'UPDATE media_tv_seasons SET "like" = :like, seen = :seen, pending = :pending, runtime = :runtime, vote = :vote, updated_at = NOW() WHERE media_id = :media_id AND user_id = :user_id AND season = :season RETURNING *',
        {
            "media_id": media_id,
            "user_id": current_user["id"],
            "season": season,
            "like": to_bool(payload.get("like"), season_row["like"]),
            "seen": to_bool(payload.get("seen"), season_row["seen"]),
            "pending": to_bool(payload.get("pending"), season_row["pending"]),
            "runtime": to_number(payload.get("runtime"), season_row["runtime"]),
            "vote": normalize_vote(payload.get("vote"), season_row["vote"]),
        },
        serialize_media_tv_season,
    )
    number_seasons = updated["number_seasons"] or 0
    if number_seasons > 0:
        all_seasons = fetch_all(
            db,
            "SELECT * FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id",
            {"media_id": media_id, "user_id": current_user["id"]},
            serialize_media_tv_season,
        )
        parent_tv = fetch_one(
            db,
            "SELECT * FROM media_tv WHERE media_id = :media_id AND user_id = :user_id",
            {"media_id": media_id, "user_id": current_user["id"]},
            serialize_media_tv,
        )
        if parent_tv:
            seasons_seen = sum(1 for s in all_seasons if s["seen"])
            if seasons_seen >= number_seasons:
                runtime_seasons = parent_tv["runtime_seasons"]
                have_special = number_seasons == len(runtime_seasons)
                start = 1 if have_special else 0
                total_runtime = sum(
                    (runtime_seasons[i] or 0)
                    for i in range(start, len(runtime_seasons))
                    if isinstance(runtime_seasons[i], (int, float))
                )
                save_one(
                    db,
                    "UPDATE media_tv SET seen = true, pending = false, seen_complete = true, runtime_seen = :runtime_seen, updated_at = NOW() WHERE media_id = :media_id AND user_id = :user_id RETURNING *",
                    {"media_id": media_id, "user_id": current_user["id"], "runtime_seen": total_runtime},
                    serialize_media_tv,
                )
                execute(
                    db,
                    "DELETE FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id",
                    {"media_id": media_id, "user_id": current_user["id"]},
                )
            else:
                runtime_seen_val = to_number(payload.get("runtime_seen"), parent_tv.get("runtime_seen") or 0)
                save_one(
                    db,
                    "UPDATE media_tv SET pending = true, seen = false, seen_complete = false, runtime_seen = :runtime_seen, updated_at = NOW() WHERE media_id = :media_id AND user_id = :user_id RETURNING *",
                    {"media_id": media_id, "user_id": current_user["id"], "runtime_seen": runtime_seen_val},
                    serialize_media_tv,
                )
    return updated


@router.post("/episodes/{media_id}/{season}/{episode}")
def episode_create(media_id: str, season: str, episode: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    exists = fetch_one(
        db,
        "SELECT * FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id AND season = :season AND episode = :episode",
        {"media_id": media_id, "user_id": current_user["id"], "season": season, "episode": episode},
        serialize_media_tv_episode,
    )
    if exists:
        raise HTTPException(status_code=404, detail="Media is exist")
    return save_one(
        db,
        'INSERT INTO media_tv_episodes (user_id, media_id, media_type, season, episode, number_seasons, number_of_episodes, episode_external_id, "like", seen, pending, runtime, vote) VALUES (:user_id, :media_id, :media_type, :season, :episode, :number_seasons, :number_of_episodes, :episode_external_id, :like, :seen, :pending, :runtime, :vote) RETURNING *',
        {
            "user_id": current_user["id"],
            "media_id": media_id,
            "media_type": payload.get("media_type") or "tv",
            "season": int(season),
            "episode": int(episode),
            "number_seasons": to_number(payload.get("number_seasons"), 0),
            "number_of_episodes": to_number(payload.get("number_of_episodes"), 0),
            "episode_external_id": payload.get("idEpisode") or "",
            "like": to_bool(payload.get("like"), False),
            "seen": to_bool(payload.get("seenComplete") or payload.get("seen"), False),
            "pending": to_bool(payload.get("pending"), True),
            "runtime": to_number(payload.get("runtime")),
            "vote": normalize_vote(payload.get("vote")),
        },
        serialize_media_tv_episode,
    )


@router.get("/episodes/{media_id}/{season}/{episode}")
def episode_detail(media_id: str, season: str, episode: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    media = fetch_one(
        db,
        "SELECT * FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id AND season = :season AND episode = :episode",
        {"media_id": media_id, "user_id": current_user["id"], "season": season, "episode": episode},
        serialize_media_tv_episode,
    )
    return media or {"result": False}


@router.get("/episodes/{media_id}/{season}")
def episode_list(media_id: str, season: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return fetch_all(
        db,
        "SELECT * FROM media_tv_episodes WHERE user_id = :user_id AND media_id = :media_id AND season = :season ORDER BY episode ASC",
        {"user_id": current_user["id"], "media_id": media_id, "season": season},
        serialize_media_tv_episode,
    )


@router.patch("/episodes/{media_id}/{season}/{episode}")
def episode_update(media_id: str, season: str, episode: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    media = fetch_one(
        db,
        "SELECT * FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id AND season = :season AND episode = :episode",
        {"media_id": media_id, "user_id": current_user["id"], "season": season, "episode": episode},
        serialize_media_tv_episode,
    )
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    return save_one(
        db,
        'UPDATE media_tv_episodes SET "like" = :like, seen = :seen, pending = :pending, vote = :vote, updated_at = NOW() WHERE id = :id RETURNING *',
        {
            "id": media["id"],
            "like": to_bool(payload.get("like"), media["like"]),
            "seen": to_bool(payload.get("seen"), media["seen"]),
            "pending": to_bool(payload.get("pending"), media["pending"]),
            "vote": normalize_vote(payload.get("vote"), media["vote"]),
        },
        serialize_media_tv_episode,
    )


@router.delete("/episodes/{media_id}/{season}/{episode}")
def episode_delete(media_id: str, season: str, episode: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    media = fetch_one(
        db,
        "SELECT * FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id AND season = :season AND episode = :episode",
        {"media_id": media_id, "user_id": current_user["id"], "season": season, "episode": episode},
        serialize_media_tv_episode,
    )
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    save_one(db, "DELETE FROM media_tv_episodes WHERE id = :id RETURNING *", {"id": media["id"]}, serialize_media_tv_episode)
    return {"result": True}
