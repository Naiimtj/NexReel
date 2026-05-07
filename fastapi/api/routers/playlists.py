from __future__ import annotations

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Body, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from api.core.auth import get_current_user, require_admin_or_owner
from api.core.nexreel.repository import (
    fetch_all,
    fetch_one,
    hydrate_playlist,
    save_one,
    serialize_playlist,
    serialize_playlist_follower,
    to_array,
    to_bool,
)
from api.core.uploads import upload_image
from api.dependencies import get_db
from api.routers._helpers import DEFAULT_PLAYLIST_IMAGE, parse_form

router = APIRouter(prefix="/v1", tags=["Playlists"])


def _get_playlist(db: Session, playlist_id: str):
    playlist = fetch_one(
        db,
        "SELECT * FROM playlists WHERE id = :playlist_id",
        {"playlist_id": playlist_id},
        serialize_playlist,
    )
    return hydrate_playlist(db, playlist)


@router.get("/playlists")
def playlists_list(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    playlists = fetch_all(db, "SELECT * FROM playlists ORDER BY created_at DESC", serializer=serialize_playlist)
    return [hydrate_playlist(db, playlist) for playlist in playlists]


@router.get("/playlists/me")
def playlists_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return fetch_all(
        db,
        "SELECT * FROM playlists WHERE author_id = :author_id ORDER BY created_at DESC",
        {"author_id": current_user["id"]},
        serialize_playlist,
    )


@router.get("/playlists/search")
def playlists_search(title: str = "", current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    playlists = fetch_all(
        db,
        "SELECT * FROM playlists WHERE title ILIKE :title OR tags::text ILIKE :title ORDER BY created_at DESC",
        {"title": f"%{title}%"},
        serialize_playlist,
    )
    hydrated = [hydrate_playlist(db, playlist) for playlist in playlists]
    results = [playlist for playlist in hydrated if playlist["author"] != current_user["id"]]
    return {"results": results}


@router.get("/playlists/{playlist_id}")
def playlist_detail(playlist_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    playlist = _get_playlist(db, playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return playlist


@router.post("/playlists")
async def playlist_create(request: Request, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    data, files = await parse_form(request)
    tags = to_array(data.get("tags[]") or data.get("tags"))
    image_url = await upload_image(files.get("imgPlaylist")) or DEFAULT_PLAYLIST_IMAGE
    return save_one(
        db,
        """
        INSERT INTO playlists (title, description, tags, medias, author_id, img_playlist)
        VALUES (:title, :description, CAST(:tags AS jsonb), '[]'::jsonb, :author_id, :img_playlist)
        RETURNING *
        """,
        {
            "title": data.get("title") or "",
            "description": data.get("description") or None,
            "tags": json.dumps(tags),
            "author_id": current_user["id"],
            "img_playlist": image_url,
        },
        serialize_playlist,
    )


@router.patch("/playlists/{playlist_id}")
async def playlist_update(playlist_id: str, request: Request, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    playlist = fetch_one(db, "SELECT * FROM playlists WHERE id = :playlist_id", {"playlist_id": playlist_id}, serialize_playlist)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    require_admin_or_owner(current_user, playlist["author"])
    data, files = await parse_form(request)
    tags = to_array(data.get("tags[]") or data.get("tags")) or playlist["tags"]
    image_url = await upload_image(files.get("imgPlaylist")) or playlist["imgPlaylist"]
    return save_one(
        db,
        """
        UPDATE playlists
        SET title = :title,
            description = :description,
            tags = CAST(:tags AS jsonb),
            img_playlist = :img_playlist,
            updated_at = NOW()
        WHERE id = :playlist_id
        RETURNING *
        """,
        {
            "playlist_id": playlist_id,
            "title": data.get("title") or playlist["title"],
            "description": data.get("description") if data.get("description") is not None else playlist["description"],
            "tags": json.dumps(tags),
            "img_playlist": image_url,
        },
        serialize_playlist,
    )


@router.delete("/playlists/{playlist_id}")
def playlist_delete(playlist_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    playlist = fetch_one(db, "SELECT * FROM playlists WHERE id = :playlist_id", {"playlist_id": playlist_id}, serialize_playlist)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    require_admin_or_owner(current_user, playlist["author"])
    save_one(db, "DELETE FROM playlists WHERE id = :playlist_id RETURNING *", {"playlist_id": playlist_id}, serialize_playlist)
    return {"result": True}


@router.post("/playlists/{playlist_id}/follow")
def playlist_follow(playlist_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    playlist = fetch_one(db, "SELECT * FROM playlists WHERE id = :playlist_id", {"playlist_id": playlist_id}, serialize_playlist)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    if playlist["author"] == current_user["id"]:
        raise HTTPException(status_code=404, detail="You can't follow your own forum")
    existing = fetch_one(
        db,
        "SELECT * FROM playlist_followers WHERE user_id = :user_id AND playlist_id = :playlist_id",
        {"user_id": current_user["id"], "playlist_id": playlist_id},
        serialize_playlist_follower,
    )
    if existing:
        raise HTTPException(status_code=404, detail="You are already following this playlist")
    return save_one(
        db,
        "INSERT INTO playlist_followers (user_id, playlist_id) VALUES (:user_id, :playlist_id) RETURNING *",
        {"user_id": current_user["id"], "playlist_id": playlist_id},
        serialize_playlist_follower,
    )


@router.get("/playlists/{playlist_id}/follow")
def playlist_follow_detail(playlist_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return fetch_one(
        db,
        "SELECT * FROM playlist_followers WHERE user_id = :user_id AND playlist_id = :playlist_id",
        {"user_id": current_user["id"], "playlist_id": playlist_id},
        serialize_playlist_follower,
    ) or {}


@router.patch("/playlists/{playlist_id}/follow")
def playlist_like(playlist_id: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    updated = save_one(
        db,
        'UPDATE playlist_followers SET "like" = :like, updated_at = NOW() WHERE playlist_id = :playlist_id AND user_id = :user_id RETURNING *',
        {"playlist_id": playlist_id, "user_id": current_user["id"], "like": to_bool(payload.get("like"), False)},
        serialize_playlist_follower,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Like Playlist not found")
    return updated


@router.delete("/playlists/{playlist_id}/follow")
def playlist_unfollow(playlist_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    deleted = save_one(
        db,
        "DELETE FROM playlist_followers WHERE user_id = :user_id AND playlist_id = :playlist_id RETURNING *",
        {"user_id": current_user["id"], "playlist_id": playlist_id},
        serialize_playlist_follower,
    )
    if not deleted:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return {"result": True}


@router.post("/playlists/{playlist_id}/media")
def playlist_media_add(playlist_id: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    playlist = fetch_one(db, "SELECT * FROM playlists WHERE id = :playlist_id", {"playlist_id": playlist_id}, serialize_playlist)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    require_admin_or_owner(current_user, playlist["author"])
    medias = playlist["medias"]
    if any(entry.get("mediaId") == payload.get("mediaId") for entry in medias):
        raise HTTPException(status_code=404, detail="Is in the playlist")
    medias.append(
        {
            "mediaId": payload.get("mediaId"),
            "media_type": payload.get("media_type"),
            "runtime": payload.get("runtime"),
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
    )
    return save_one(
        db,
        "UPDATE playlists SET medias = CAST(:medias AS jsonb), updated_at = NOW() WHERE id = :playlist_id RETURNING *",
        {"playlist_id": playlist_id, "medias": json.dumps(medias)},
        serialize_playlist,
    )


@router.delete("/playlists/{playlist_id}/media")
def playlist_media_delete(playlist_id: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    playlist = fetch_one(db, "SELECT * FROM playlists WHERE id = :playlist_id", {"playlist_id": playlist_id}, serialize_playlist)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    require_admin_or_owner(current_user, playlist["author"])
    media_id = payload.get("mediaIdDelete")
    medias = [entry for entry in playlist["medias"] if entry.get("mediaId") != media_id]
    return save_one(
        db,
        "UPDATE playlists SET medias = CAST(:medias AS jsonb), updated_at = NOW() WHERE id = :playlist_id RETURNING *",
        {"playlist_id": playlist_id, "medias": json.dumps(medias)},
        serialize_playlist,
    )
