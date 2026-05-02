from __future__ import annotations

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from api.core.auth import get_current_user, require_admin_or_owner
from api.core.nexreel.repository import (
    execute,
    fetch_all,
    fetch_one,
    save_one,
    serialize_message,
)
from api.dependencies import get_db

router = APIRouter(prefix="/v1", tags=["Messages"])


@router.post("/users/{user_id}/messages")
def user_message_create(user_id: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    execute(db, "UPDATE users SET notifications_read = true, updated_at = NOW() WHERE id = :user_id", {"user_id": user_id})
    return save_one(
        db,
        "INSERT INTO messages (sender_id, receiver_id, text_message) VALUES (:sender_id, :receiver_id, :text_message) RETURNING *",
        {"sender_id": current_user["id"], "receiver_id": user_id, "text_message": payload.get("textMessage") or ""},
        serialize_message,
    )


@router.get("/users/{user_id}/messages")
def user_messages(user_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return fetch_all(
        db,
        """
        SELECT m.*, sender.username AS sender_username, receiver.username AS receiver_username
        FROM messages m
        JOIN users sender ON sender.id = m.sender_id
        LEFT JOIN users receiver ON receiver.id = m.receiver_id
        WHERE (m.sender_id = :current_user_id AND m.receiver_id = :user_id)
           OR (m.sender_id = :user_id AND m.receiver_id = :current_user_id)
        ORDER BY m.created_at ASC
        """,
        {"current_user_id": current_user["id"], "user_id": user_id},
        lambda row: {
            **serialize_message(row),
            "userSender": {"username": row.get("sender_username")},
            "userReceiver": {"username": row.get("receiver_username")} if row.get("receiver_username") else None,
        },
    )


@router.get("/users/{user_id}/messages/{message_id}")
def user_message_detail(user_id: str, message_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    message = fetch_one(
        db,
        """
        SELECT * FROM messages
        WHERE id = :message_id AND sender_id = :current_user_id AND receiver_id = :user_id
        """,
        {"message_id": message_id, "current_user_id": current_user["id"], "user_id": user_id},
        serialize_message,
    )
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message


@router.patch("/messages/{message_id}")
def message_update(message_id: str, payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    message = fetch_one(db, "SELECT * FROM messages WHERE id = :message_id", {"message_id": message_id}, serialize_message)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    require_admin_or_owner(current_user, message["sender"])
    return save_one(
        db,
        "UPDATE messages SET text_message = :text_message, edited = true, updated_at = NOW() WHERE id = :message_id RETURNING *",
        {"message_id": message_id, "text_message": payload.get("textMessage") or message["textMessage"]},
        serialize_message,
    )


@router.delete("/messages/{message_id}")
def message_delete(message_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    message = fetch_one(db, "SELECT * FROM messages WHERE id = :message_id", {"message_id": message_id}, serialize_message)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    require_admin_or_owner(current_user, message["sender"])
    save_one(db, "DELETE FROM messages WHERE id = :message_id RETURNING *", {"message_id": message_id}, serialize_message)
    return {"result": True}
