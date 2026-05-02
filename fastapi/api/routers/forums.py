from __future__ import annotations

import json
from datetime import datetime, timezone

from fastapi import APIRouter, Body, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from api.core.auth import get_current_user, require_admin_or_owner
from api.core.nexreel.repository import (
    execute,
    fetch_all,
    fetch_one,
    hydrate_forum,
    save_one,
    serialize_forum,
    serialize_forum_follower,
    serialize_message,
    to_array,
    to_bool,
)
from api.core.uploads import upload_image
from api.dependencies import get_db
from api.routers._helpers import DEFAULT_FORUM_IMAGE, parse_form

router = APIRouter(prefix="/v1", tags=["Forums"])


def _get_forum(db: Session, forum_id: str):
    forum = fetch_one(
        db,
        "SELECT * FROM forums WHERE id = :forum_id",
        {"forum_id": forum_id},
        serialize_forum,
    )
    return hydrate_forum(db, forum)


@router.get("/forums")
def forums_list(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    forums = fetch_all(db, "SELECT * FROM forums ORDER BY created_at DESC", serializer=serialize_forum)
    return [hydrate_forum(db, forum) for forum in forums]


@router.get("/forums/{forum_id}")
def forum_detail(forum_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    forum = _get_forum(db, forum_id)
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")
    return forum


@router.post("/forums")
async def forum_create(request: Request, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    data, files = await parse_form(request)
    tags = to_array(data.get("tags[]") or data.get("tags"))
    image_url = await upload_image(files.get("imgForum")) or DEFAULT_FORUM_IMAGE
    return save_one(
        db,
        """
        INSERT INTO forums (title, tags, short_description, description, author_id, img_forum)
        VALUES (:title, CAST(:tags AS jsonb), :short_description, :description, :author_id, :img_forum)
        RETURNING *
        """,
        {
            "title": data.get("title") or "",
            "tags": json.dumps(tags),
            "short_description": data.get("shortDescription") or None,
            "description": data.get("description") or None,
            "author_id": current_user["id"],
            "img_forum": image_url,
        },
        serialize_forum,
    )


@router.patch("/forums/{forum_id}")
async def forum_update(forum_id: str, request: Request, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    forum = fetch_one(db, "SELECT * FROM forums WHERE id = :forum_id", {"forum_id": forum_id}, serialize_forum)
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")
    require_admin_or_owner(current_user, forum["author"])
    data, files = await parse_form(request)
    tags = to_array(data.get("tags[]") or data.get("tags")) or forum["tags"]
    image_url = await upload_image(files.get("imgForum")) or forum["imgForum"]
    return save_one(
        db,
        """
        UPDATE forums
        SET title = :title,
            short_description = :short_description,
            description = :description,
            tags = CAST(:tags AS jsonb),
            img_forum = :img_forum,
            updated_at = NOW()
        WHERE id = :forum_id
        RETURNING *
        """,
        {
            "forum_id": forum_id,
            "title": data.get("title") or forum["title"],
            "short_description": data.get("shortDescription") or forum["shortDescription"],
            "description": data.get("description") or forum["description"],
            "tags": json.dumps(tags),
            "img_forum": image_url,
        },
        serialize_forum,
    )


@router.delete("/forums/{forum_id}")
def forum_delete(forum_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    forum = fetch_one(db, "SELECT * FROM forums WHERE id = :forum_id", {"forum_id": forum_id}, serialize_forum)
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")
    require_admin_or_owner(current_user, forum["author"])
    save_one(db, "DELETE FROM forums WHERE id = :forum_id RETURNING *", {"forum_id": forum_id}, serialize_forum)
    return {"result": True}


@router.post("/forums/{forum_id}/follow")
def forum_follow(forum_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    forum = fetch_one(db, "SELECT * FROM forums WHERE id = :forum_id", {"forum_id": forum_id}, serialize_forum)
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")
    if forum["author"] == current_user["id"]:
        raise HTTPException(status_code=404, detail="You can't follow your own forum")
    existing = fetch_one(
        db,
        "SELECT * FROM forum_followers WHERE user_id = :user_id AND forum_id = :forum_id",
        {"user_id": current_user["id"], "forum_id": forum_id},
        serialize_forum_follower,
    )
    if existing:
        raise HTTPException(status_code=404, detail="You are already following this forum")
    return save_one(
        db,
        "INSERT INTO forum_followers (user_id, forum_id) VALUES (:user_id, :forum_id) RETURNING *",
        {"user_id": current_user["id"], "forum_id": forum_id},
        serialize_forum_follower,
    )


@router.patch("/forums/{forum_id}/follow")
def forum_like(forum_id: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    updated = save_one(
        db,
        'UPDATE forum_followers SET "like" = :like, updated_at = NOW() WHERE forum_id = :forum_id AND user_id = :user_id RETURNING *',
        {"forum_id": forum_id, "user_id": current_user["id"], "like": to_bool(payload.get("like"), False)},
        serialize_forum_follower,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Like Forum not found")
    return updated


@router.delete("/forums/{forum_id}/follow")
def forum_unfollow(forum_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    deleted = save_one(
        db,
        "DELETE FROM forum_followers WHERE user_id = :user_id AND forum_id = :forum_id RETURNING *",
        {"user_id": current_user["id"], "forum_id": forum_id},
        serialize_forum_follower,
    )
    if not deleted:
        raise HTTPException(status_code=404, detail="Forum not found")
    return {"result": True}


@router.post("/forums/{forum_id}/media")
def forum_media_add(forum_id: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    forum = fetch_one(db, "SELECT * FROM forums WHERE id = :forum_id", {"forum_id": forum_id}, serialize_forum)
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")
    require_admin_or_owner(current_user, forum["author"])
    medias = forum["medias"]
    if any(entry.get("mediaId") == payload.get("mediaId") for entry in medias):
        raise HTTPException(status_code=404, detail="Is in the forum")
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
        "UPDATE forums SET medias = CAST(:medias AS jsonb), updated_at = NOW() WHERE id = :forum_id RETURNING *",
        {"forum_id": forum_id, "medias": json.dumps(medias)},
        serialize_forum,
    )


@router.delete("/forums/{forum_id}/media")
def forum_media_delete(forum_id: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    forum = fetch_one(db, "SELECT * FROM forums WHERE id = :forum_id", {"forum_id": forum_id}, serialize_forum)
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")
    require_admin_or_owner(current_user, forum["author"])
    media_id = payload.get("mediaIdDelete")
    medias = [entry for entry in forum["medias"] if entry.get("mediaId") != media_id]
    return save_one(
        db,
        "UPDATE forums SET medias = CAST(:medias AS jsonb), updated_at = NOW() WHERE id = :forum_id RETURNING *",
        {"forum_id": forum_id, "medias": json.dumps(medias)},
        serialize_forum,
    )


@router.post("/forums/{forum_id}/messages")
def forum_message_create(forum_id: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    forum = fetch_one(db, "SELECT * FROM forums WHERE id = :forum_id", {"forum_id": forum_id}, serialize_forum)
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")
    execute(db, "UPDATE users SET notifications_read = true, updated_at = NOW() WHERE id = :user_id", {"user_id": forum["author"]})
    return save_one(
        db,
        "INSERT INTO messages (sender_id, forum_id, text_message) VALUES (:sender_id, :forum_id, :text_message) RETURNING *",
        {"sender_id": current_user["id"], "forum_id": forum_id, "text_message": payload.get("textMessage") or ""},
        serialize_message,
    )


@router.get("/forums/{forum_id}/messages")
def forum_messages(forum_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return fetch_all(
        db,
        """
        SELECT m.*, sender.username AS sender_username, receiver.username AS receiver_username
        FROM messages m
        JOIN users sender ON sender.id = m.sender_id
        LEFT JOIN users receiver ON receiver.id = m.receiver_id
        WHERE m.forum_id = :forum_id
        ORDER BY m.created_at ASC
        """,
        {"forum_id": forum_id},
        lambda row: {
            **serialize_message(row),
            "userSender": {"username": row.get("sender_username")},
            "userReceiver": {"username": row.get("receiver_username")} if row.get("receiver_username") else None,
        },
    )


@router.get("/forums/{forum_id}/messages/{message_id}")
def forum_message_detail(forum_id: str, message_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    message = fetch_one(
        db,
        "SELECT * FROM messages WHERE id = :message_id AND forum_id = :forum_id",
        {"message_id": message_id, "forum_id": forum_id},
        serialize_message,
    )
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message
