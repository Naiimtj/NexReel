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

router = APIRouter(prefix="/v1", tags=["TV Shows"])

# ---------------------------------------------------------------------------
# SQL constants
# ---------------------------------------------------------------------------
_SQL_SEASON = "SELECT * FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id AND season = :season"
_SQL_PARENT = "SELECT * FROM media_tv WHERE media_id = :media_id AND user_id = :user_id"
_SQL_EPISODE = "SELECT * FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id AND season = :season AND episode = :episode"


# ---------------------------------------------------------------------------
# Helpers — keep parent media_tv consistent with child rows
# ---------------------------------------------------------------------------

def _ensure_parent_tv(db: Session, *, user_id: str, media_id: str, payload: dict) -> dict:
    """Return existing media_tv row or create one as pending."""
    parent = fetch_one(db, _SQL_PARENT, {"media_id": media_id, "user_id": user_id}, serialize_media_tv)
    if parent:
        return parent
    media_type = payload.get("media_type") or "tv"
    runtime_seasons = to_array(payload.get("runtime_seasons"))
    return save_one(
        db,
        'INSERT INTO media_tv (user_id, media_id, media_type, "like", seen, pending, seen_complete, "repeat", runtime, number_seasons, number_of_episodes, runtime_seen, runtime_seasons, vote) '
        "VALUES (:user_id, :media_id, :media_type, false, false, true, false, false, :runtime, :number_seasons, :number_of_episodes, 0, CAST(:runtime_seasons AS jsonb), -1) RETURNING *",
        {
            "user_id": user_id,
            "media_id": media_id,
            "media_type": media_type,
            "runtime": to_number(payload.get("runtime")),
            "number_seasons": to_number(payload.get("number_seasons"), 0),
            "number_of_episodes": to_number(payload.get("number_of_episodes"), 0),
            "runtime_seasons": json.dumps(runtime_seasons),
        },
        serialize_media_tv,
    )


def _sync_parent_after_season_change(db: Session, *, user_id: str, media_id: str) -> None:
    """Recalculate parent media_tv state after a season row is added/removed.

    Rules:
    - All seasons seen → parent seen=true, pending=false, delete season rows.
    - Some seasons/episodes seen → parent pending=true, seen=false.
    - Nothing tracked → delete parent + children.
    """
    parent = fetch_one(db, _SQL_PARENT, {"media_id": media_id, "user_id": user_id}, serialize_media_tv)
    if not parent:
        return
    number_seasons = parent["number_seasons"] or 0
    if number_seasons <= 0:
        return

    all_seasons = fetch_all(
        db,
        "SELECT * FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id",
        {"media_id": media_id, "user_id": user_id},
        serialize_media_tv_season,
    )
    seasons_seen = sum(1 for s in all_seasons if s["seen"])

    if seasons_seen >= number_seasons:
        # All seasons seen → mark parent fully seen, clean up season rows
        runtime_seasons = parent["runtime_seasons"]
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
            {"media_id": media_id, "user_id": user_id, "runtime_seen": total_runtime},
            serialize_media_tv,
        )
        execute(db, "DELETE FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id", {"media_id": media_id, "user_id": user_id})
        execute(db, "DELETE FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id", {"media_id": media_id, "user_id": user_id})
        return

    has_any_season = len(all_seasons) > 0
    all_episodes = fetch_all(
        db,
        "SELECT * FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id",
        {"media_id": media_id, "user_id": user_id},
        serialize_media_tv_episode,
    )
    has_any_episode = len(all_episodes) > 0

    if has_any_season or has_any_episode:
        # Use runtime_seasons from parent (correct total per season)
        runtime_seasons_arr = parent.get("runtime_seasons") or []
        runtime_seen = 0
        for s in all_seasons:
            if s["seen"]:
                season_idx = int(s.get("season", 0))
                if 0 <= season_idx < len(runtime_seasons_arr):
                    val = runtime_seasons_arr[season_idx]
                    runtime_seen += val if isinstance(val, (int, float)) else 0
                else:
                    # Fallback: number_of_episodes * parent per-episode runtime
                    per_ep = parent.get("runtime") or 0
                    runtime_seen += (s.get("number_of_episodes") or 0) * per_ep
        # Individual episodes: each row stores its per-episode runtime
        runtime_seen += sum(e.get("runtime") or 0 for e in all_episodes)
        save_one(
            db,
            "UPDATE media_tv SET pending = true, seen = false, seen_complete = false, runtime_seen = :runtime_seen, updated_at = NOW() WHERE media_id = :media_id AND user_id = :user_id RETURNING *",
            {"media_id": media_id, "user_id": user_id, "runtime_seen": runtime_seen},
            serialize_media_tv,
        )
    else:
        # Nothing tracked → clean up everything
        execute(db, "DELETE FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id", {"media_id": media_id, "user_id": user_id})
        execute(db, "DELETE FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id", {"media_id": media_id, "user_id": user_id})
        execute(db, "DELETE FROM media_tv WHERE media_id = :media_id AND user_id = :user_id", {"media_id": media_id, "user_id": user_id})


def _check_season_complete(db: Session, *, user_id: str, media_id: str, season: int, number_of_episodes: int) -> None:
    """If all episodes of a season are seen, create the season row (mark seen)."""
    eps = fetch_all(
        db,
        "SELECT * FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id AND season = :season",
        {"media_id": media_id, "user_id": user_id, "season": season},
        serialize_media_tv_episode,
    )
    if number_of_episodes > 0 and len(eps) >= number_of_episodes:
        existing = fetch_one(
            db, _SQL_SEASON,
            {"media_id": media_id, "user_id": user_id, "season": str(season)},
            serialize_media_tv_season,
        )
        if not existing:
            parent = fetch_one(db, _SQL_PARENT, {"media_id": media_id, "user_id": user_id}, serialize_media_tv)
            save_one(
                db,
                'INSERT INTO media_tv_seasons (user_id, media_id, media_type, season, number_seasons, number_of_episodes, seen_complete, runtime, "like", seen, vote) '
                "VALUES (:user_id, :media_id, :media_type, :season, :number_seasons, :number_of_episodes, true, :runtime, false, true, -1) RETURNING *",
                {
                    "user_id": user_id,
                    "media_id": media_id,
                    "media_type": "tv",
                    "season": str(season),
                    "number_seasons": parent["number_seasons"] if parent else 0,
                    "number_of_episodes": number_of_episodes,
                    "runtime": sum(e.get("runtime") or 0 for e in eps),
                },
                serialize_media_tv_season,
            )
        elif not existing["seen"]:
            save_one(
                db,
                "UPDATE media_tv_seasons SET seen = true, seen_complete = true, updated_at = NOW() WHERE media_id = :media_id AND user_id = :user_id AND season = :season RETURNING *",
                {"media_id": media_id, "user_id": user_id, "season": str(season)},
                serialize_media_tv_season,
            )

        # Season is now seen → episode rows are redundant
        execute(db, "DELETE FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id AND season = :season", {"media_id": media_id, "user_id": user_id, "season": season})


# ---------------------------------------------------------------------------
# Season endpoints
# ---------------------------------------------------------------------------

@router.post("/seasons/{media_id}")
def season_create(media_id: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mark a season as seen. Creates media_tv parent if needed."""
    user_id = current_user["id"]
    season_num = str(payload.get("season"))
    exists = fetch_one(db, _SQL_SEASON, {"media_id": media_id, "user_id": user_id, "season": season_num}, serialize_media_tv_season)
    if exists:
        raise HTTPException(status_code=409, detail="Season already exists")

    number_seasons = to_number(payload.get("number_seasons"), 0)
    number_of_episodes = to_number(payload.get("number_of_episodes"), 0)

    _ensure_parent_tv(db, user_id=user_id, media_id=media_id, payload=payload)

    save_one(
        db,
        'INSERT INTO media_tv_seasons (user_id, media_id, media_type, season, number_seasons, number_of_episodes, seen_complete, runtime, "like", seen, vote) '
        "VALUES (:user_id, :media_id, :media_type, :season, :number_seasons, :number_of_episodes, true, :runtime, false, true, :vote) RETURNING *",
        {
            "user_id": user_id,
            "media_id": media_id,
            "media_type": payload.get("media_type") or "tv",
            "season": season_num,
            "number_seasons": number_seasons,
            "number_of_episodes": number_of_episodes,
            "runtime": to_number(payload.get("runtime")),
            "vote": normalize_vote(payload.get("vote")),
        },
        serialize_media_tv_season,
    )

    # Season is seen → individual episode rows are redundant
    execute(db, "DELETE FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id AND season = :season", {"media_id": media_id, "user_id": user_id, "season": int(season_num)})

    _sync_parent_after_season_change(db, user_id=user_id, media_id=media_id)

    return fetch_one(db, _SQL_PARENT, {"media_id": media_id, "user_id": user_id}, serialize_media_tv)


@router.get("/seasons/{media_id}/{season}")
def season_detail(media_id: str, season: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    media = fetch_one(db, _SQL_PARENT, {"media_id": media_id, "user_id": current_user["id"]}, serialize_media_tv)
    if media and media["seen"]:
        result = dict(media)
        result["season"] = season
        result["runtime"] = media["runtime_seasons"][int(season)] if int(season) < len(media["runtime_seasons"]) else None
        result.pop("runtime_seen", None)
        return result
    season_row = fetch_one(db, _SQL_SEASON, {"media_id": media_id, "user_id": current_user["id"], "season": season}, serialize_media_tv_season)
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
    """Toggle season seen state. Unseen → delete season + its episode rows."""
    user_id = current_user["id"]
    season_row = fetch_one(db, _SQL_SEASON, {"media_id": media_id, "user_id": user_id, "season": season}, serialize_media_tv_season)

    seen_val = to_bool(payload.get("seen"), season_row["seen"] if season_row else False)

    if not seen_val:
        # Unseen: delete season row and its episodes
        if season_row:
            execute(db, "DELETE FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id AND season = :season", {"media_id": media_id, "user_id": user_id, "season": season})
            execute(db, "DELETE FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id AND season = :season", {"media_id": media_id, "user_id": user_id, "season": int(season)})
        _sync_parent_after_season_change(db, user_id=user_id, media_id=media_id)
        return {"result": True, "seen": False}

    # Seen: create row if it doesn't exist, or update
    if not season_row:
        number_seasons = to_number(payload.get("number_seasons"), 0)
        number_of_episodes = to_number(payload.get("number_of_episodes"), 0)
        _ensure_parent_tv(db, user_id=user_id, media_id=media_id, payload=payload)
        save_one(
            db,
            'INSERT INTO media_tv_seasons (user_id, media_id, media_type, season, number_seasons, number_of_episodes, seen_complete, runtime, "like", seen, vote) '
            "VALUES (:user_id, :media_id, :media_type, :season, :number_seasons, :number_of_episodes, true, :runtime, false, true, :vote) RETURNING *",
            {
                "user_id": user_id,
                "media_id": media_id,
                "media_type": payload.get("media_type") or "tv",
                "season": season,
                "number_seasons": number_seasons,
                "number_of_episodes": number_of_episodes,
                "runtime": to_number(payload.get("runtime")),
                "vote": normalize_vote(payload.get("vote")),
            },
            serialize_media_tv_season,
        )
    else:
        save_one(
            db,
            'UPDATE media_tv_seasons SET seen = true, seen_complete = true, "like" = :like, runtime = :runtime, vote = :vote, updated_at = NOW() WHERE media_id = :media_id AND user_id = :user_id AND season = :season RETURNING *',
            {
                "media_id": media_id,
                "user_id": user_id,
                "season": season,
                "like": to_bool(payload.get("like"), season_row["like"]),
                "runtime": to_number(payload.get("runtime"), season_row["runtime"]),
                "vote": normalize_vote(payload.get("vote"), season_row["vote"]),
            },
            serialize_media_tv_season,
        )

    # Season is seen → individual episode rows are redundant
    execute(db, "DELETE FROM media_tv_episodes WHERE media_id = :media_id AND user_id = :user_id AND season = :season", {"media_id": media_id, "user_id": user_id, "season": int(season)})

    _sync_parent_after_season_change(db, user_id=user_id, media_id=media_id)
    return fetch_one(db, _SQL_SEASON, {"media_id": media_id, "user_id": user_id, "season": season}, serialize_media_tv_season) or {"result": True, "seen": True}


# ---------------------------------------------------------------------------
# Episode endpoints
# ---------------------------------------------------------------------------

@router.post("/episodes/{media_id}/{season}/{episode}")
def episode_create(media_id: str, season: str, episode: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Mark an episode as seen. Creates media_tv parent if needed."""
    user_id = current_user["id"]
    exists = fetch_one(db, _SQL_EPISODE, {"media_id": media_id, "user_id": user_id, "season": season, "episode": episode}, serialize_media_tv_episode)
    if exists:
        raise HTTPException(status_code=409, detail="Episode already exists")

    _ensure_parent_tv(db, user_id=user_id, media_id=media_id, payload=payload)

    result = save_one(
        db,
        'INSERT INTO media_tv_episodes (user_id, media_id, media_type, season, episode, number_seasons, number_of_episodes, episode_external_id, "like", seen, runtime, vote) '
        "VALUES (:user_id, :media_id, :media_type, :season, :episode, :number_seasons, :number_of_episodes, :episode_external_id, false, true, :runtime, :vote) RETURNING *",
        {
            "user_id": user_id,
            "media_id": media_id,
            "media_type": payload.get("media_type") or "tv",
            "season": int(season),
            "episode": int(episode),
            "number_seasons": to_number(payload.get("number_seasons"), 0),
            "number_of_episodes": to_number(payload.get("number_of_episodes"), 0),
            "episode_external_id": payload.get("idEpisode") or "",
            "runtime": to_number(payload.get("runtime")),
            "vote": normalize_vote(payload.get("vote")),
        },
        serialize_media_tv_episode,
    )

    # Check if all episodes of this season are now seen
    num_eps = to_number(payload.get("number_of_episodes"), 0)
    _check_season_complete(db, user_id=user_id, media_id=media_id, season=int(season), number_of_episodes=num_eps)
    _sync_parent_after_season_change(db, user_id=user_id, media_id=media_id)

    return result


@router.get("/episodes/{media_id}/{season}/{episode}")
def episode_detail(media_id: str, season: str, episode: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user["id"]
    ep_row = fetch_one(db, _SQL_EPISODE, {"media_id": media_id, "user_id": user_id, "season": season, "episode": episode}, serialize_media_tv_episode)
    if ep_row:
        return ep_row

    # No explicit episode row — check if season or parent marks it as seen
    season_row = fetch_one(db, _SQL_SEASON, {"media_id": media_id, "user_id": user_id, "season": season}, serialize_media_tv_season)
    if season_row and season_row["seen"]:
        return {"seen": True, "media_id": media_id, "season": int(season), "episode": int(episode)}

    parent = fetch_one(db, _SQL_PARENT, {"media_id": media_id, "user_id": user_id}, serialize_media_tv)
    if parent and parent["seen"]:
        return {"seen": True, "media_id": media_id, "season": int(season), "episode": int(episode)}

    return {"result": False}


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
    """Toggle episode seen state. Unseen → delete episode row."""
    user_id = current_user["id"]
    media = fetch_one(db, _SQL_EPISODE, {"media_id": media_id, "user_id": user_id, "season": season, "episode": episode}, serialize_media_tv_episode)

    seen_val = to_bool(payload.get("seen"), media["seen"] if media else False)

    if not seen_val:
        # Unseen: delete episode row if it exists
        if media:
            execute(db, "DELETE FROM media_tv_episodes WHERE id = :id", {"id": media["id"]})

        num_eps = to_number(payload.get("number_of_episodes"), 0)
        runtime_per_ep = to_number(payload.get("runtime"), 0)

        # If parent is fully seen (season rows were deleted), explode into seasons first
        parent = fetch_one(db, _SQL_PARENT, {"media_id": media_id, "user_id": user_id}, serialize_media_tv)
        if parent and parent["seen"]:
            n_seasons = parent["number_seasons"] or 0
            runtime_seasons = parent.get("runtime_seasons") or []
            # Mark parent no longer fully seen
            save_one(
                db,
                "UPDATE media_tv SET seen = false, pending = true, seen_complete = false, updated_at = NOW() WHERE media_id = :media_id AND user_id = :user_id RETURNING *",
                {"media_id": media_id, "user_id": user_id},
                serialize_media_tv,
            )
            # Create season rows for all OTHER seasons
            for s in range(1, n_seasons + 1):
                if str(s) == str(season):
                    continue
                s_exists = fetch_one(db, _SQL_SEASON, {"media_id": media_id, "user_id": user_id, "season": str(s)}, serialize_media_tv_season)
                if not s_exists:
                    rt = runtime_seasons[s] if s < len(runtime_seasons) else 0
                    save_one(
                        db,
                        'INSERT INTO media_tv_seasons (user_id, media_id, media_type, season, number_seasons, number_of_episodes, seen_complete, runtime, "like", seen, vote) '
                        "VALUES (:user_id, :media_id, 'tv', :season, :number_seasons, :number_of_episodes, true, :runtime, false, true, -1) RETURNING *",
                        {"user_id": user_id, "media_id": media_id, "season": str(s), "number_seasons": n_seasons, "number_of_episodes": num_eps, "runtime": rt},
                        serialize_media_tv_season,
                    )

        # If the season was marked as seen, explode into individual episode rows
        season_row = fetch_one(db, _SQL_SEASON, {"media_id": media_id, "user_id": user_id, "season": str(season)}, serialize_media_tv_season)
        if season_row and season_row["seen"]:
            ep_num_eps = num_eps or season_row.get("number_of_episodes", 0)
            # Create episode rows for all episodes EXCEPT the one being unmarked
            for ep_num in range(1, ep_num_eps + 1):
                if str(ep_num) == str(episode):
                    continue
                ep_exists = fetch_one(db, _SQL_EPISODE, {"media_id": media_id, "user_id": user_id, "season": season, "episode": str(ep_num)}, serialize_media_tv_episode)
                if not ep_exists:
                    save_one(
                        db,
                        'INSERT INTO media_tv_episodes (user_id, media_id, media_type, season, episode, number_seasons, number_of_episodes, episode_external_id, "like", seen, runtime, vote) '
                        "VALUES (:user_id, :media_id, 'tv', :season, :episode, :number_seasons, :number_of_episodes, '', false, true, :runtime, -1) RETURNING *",
                        {"user_id": user_id, "media_id": media_id, "season": int(season), "episode": ep_num, "number_seasons": season_row.get("number_seasons", 0), "number_of_episodes": ep_num_eps, "runtime": runtime_per_ep},
                        serialize_media_tv_episode,
                    )
            # Delete season row — no longer complete
            execute(db, "DELETE FROM media_tv_seasons WHERE media_id = :media_id AND user_id = :user_id AND season = :season", {"media_id": media_id, "user_id": user_id, "season": str(season)})

        _sync_parent_after_season_change(db, user_id=user_id, media_id=media_id)
        return {"result": True, "seen": False}

    # Seen: create row if it doesn't exist
    if not media:
        _ensure_parent_tv(db, user_id=user_id, media_id=media_id, payload=payload)
        result = save_one(
            db,
            'INSERT INTO media_tv_episodes (user_id, media_id, media_type, season, episode, number_seasons, number_of_episodes, episode_external_id, "like", seen, runtime, vote) '
            "VALUES (:user_id, :media_id, :media_type, :season, :episode, :number_seasons, :number_of_episodes, :episode_external_id, false, true, :runtime, :vote) RETURNING *",
            {
                "user_id": user_id,
                "media_id": media_id,
                "media_type": payload.get("media_type") or "tv",
                "season": int(season),
                "episode": int(episode),
                "number_seasons": to_number(payload.get("number_seasons"), 0),
                "number_of_episodes": to_number(payload.get("number_of_episodes"), 0),
                "episode_external_id": payload.get("idEpisode") or "",
                "runtime": to_number(payload.get("runtime")),
                "vote": normalize_vote(payload.get("vote")),
            },
            serialize_media_tv_episode,
        )
    else:
        result = save_one(
            db,
            'UPDATE media_tv_episodes SET seen = true, "like" = :like, vote = :vote, updated_at = NOW() WHERE id = :id RETURNING *',
            {
                "id": media["id"],
                "like": to_bool(payload.get("like"), media["like"]),
                "vote": normalize_vote(payload.get("vote"), media["vote"]),
            },
            serialize_media_tv_episode,
        )

    num_eps = to_number(payload.get("number_of_episodes"), media.get("number_of_episodes", 0) if media else 0)
    _check_season_complete(db, user_id=user_id, media_id=media_id, season=int(season), number_of_episodes=num_eps)
    _sync_parent_after_season_change(db, user_id=user_id, media_id=media_id)

    return result


@router.delete("/episodes/{media_id}/{season}/{episode}")
def episode_delete(media_id: str, season: str, episode: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user["id"]
    media = fetch_one(db, _SQL_EPISODE, {"media_id": media_id, "user_id": user_id, "season": season, "episode": episode}, serialize_media_tv_episode)
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    execute(db, "DELETE FROM media_tv_episodes WHERE id = :id", {"id": media["id"]})
    _sync_parent_after_season_change(db, user_id=user_id, media_id=media_id)
    return {"result": True}
