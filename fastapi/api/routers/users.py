from __future__ import annotations

import json

from fastapi import APIRouter, Body, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from api.core.auth import (
    ADMIN_ROLE,
    DEFAULT_ROLE,
    SUPERADMIN_ROLE,
    generate_api_token,
    get_current_user,
    hash_password,
    login_user,
    logout_user,
    require_admin_or_owner,
    verify_password,
)
from api.core.nexreel.repository import (
    execute,
    fetch_all,
    fetch_one,
    fetch_user_followers,
    hydrate_user,
    save_one,
    serialize_follower,
    serialize_user,
    to_array,
    to_bool,
)
from api.core.uploads import upload_image
from api.dependencies import get_db
from api.routers._helpers import DEFAULT_AVATAR, parse_form

router = APIRouter(prefix="/v1", tags=["Users"])


@router.post("/login")
def login(
    request: Request,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
):
    email = (payload.get("email") or "").lower()
    password = payload.get("password") or ""
    user_row = fetch_one(db, "SELECT * FROM users WHERE email = :email", {"email": email})
    if not user_row or not verify_password(password, user_row["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user_row.get("api_token"):
        user_row = save_one(
            db,
            "UPDATE users SET api_token = :token, updated_at = NOW() WHERE id = :id RETURNING *",
            {"token": generate_api_token(), "id": user_row["id"]},
        )
    login_user(request, user_row["id"])
    return serialize_user(user_row)


@router.post("/logout")
def logout(request: Request):
    logout_user(request)
    return {"result": True}


@router.post("/register")
async def register(request: Request, db: Session = Depends(get_db)):
    data, files = await parse_form(request)
    email = (data.get("email") or "").lower()
    username = (data.get("username") or "").lower()
    password = data.get("password") or ""
    region = (data.get("region") or "").upper()
    favorite_phrase = data.get("favoritePhrase") or None

    existing = fetch_all(
        db,
        "SELECT email, username FROM users WHERE email = :email OR username = :username",
        {"email": email, "username": username},
    )
    if existing:
        errors: dict[str, str] = {}
        for row in existing:
            if row.get("email") == email:
                errors["email"] = "Email already exists"
            if row.get("username") == username:
                errors["username"] = "Username already exists"
        raise HTTPException(status_code=400, detail={"message": "Invalid user registration", "errors": errors})

    avatar_url = await upload_image(files.get("avatarURL")) or DEFAULT_AVATAR
    user = save_one(
        db,
        """
        INSERT INTO users (
          email, password, username, region, favorite_phrase, role, avatar_url
        ) VALUES (
          :email, :password, :username, :region, :favorite_phrase, :role, :avatar_url
        )
        RETURNING *
        """,
        {
            "email": email,
            "password": hash_password(password),
            "username": username,
            "region": region,
            "favorite_phrase": favorite_phrase,
            "role": DEFAULT_ROLE,
            "avatar_url": avatar_url,
        },
        serialize_user,
    )
    login_user(request, user["id"])
    return user


@router.get("/users")
def list_users(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    users = fetch_all(
        db,
        "SELECT * FROM users WHERE id <> :user_id ORDER BY created_at DESC",
        {"user_id": current_user["id"]},
        serialize_user,
    )
    return [hydrate_user(db, user, include_followers=True, include_following=True) for user in users]


@router.get("/users/search")
def search_users(username: str = "", current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    users = fetch_all(
        db,
        "SELECT * FROM users WHERE username ILIKE :username AND id <> :user_id ORDER BY username ASC",
        {"username": f"%{username}%", "user_id": current_user["id"]},
        serialize_user,
    )
    return {"results": users}


@router.get("/users/me")
def user_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return hydrate_user(
        db,
        current_user,
        include_medias=True,
        include_medias_tv=True,
        include_playlists=True,
        include_forums=True,
        include_followers=True,
        include_following=True,
        include_playlists_follow=True,
    )


@router.patch("/users/me")
async def update_me(request: Request, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    data, files = await parse_form(request)
    if data.get("password"):
        password_hash = hash_password(data["password"])
    else:
        raw_user = fetch_one(db, "SELECT * FROM users WHERE id = :user_id", {"user_id": current_user["id"]})
        password_hash = raw_user["password"]

    avatar_url = await upload_image(files.get("avatarURL")) or current_user["avatarURL"]
    updated = save_one(
        db,
        """
        UPDATE users
        SET email = :email,
            password = :password,
            username = :username,
            region = :region,
            favorite_phrase = :favorite_phrase,
            avatar_url = :avatar_url,
            genres_like = CAST(:genres_like AS jsonb),
            genres_unlike = CAST(:genres_unlike AS jsonb),
            notifications_read = :notifications_read,
            updated_at = NOW()
        WHERE id = :user_id
        RETURNING *
        """,
        {
            "user_id": current_user["id"],
            "email": (data.get("email") or current_user["email"]).lower(),
            "password": password_hash,
            "username": (data.get("username") or current_user["username"]).lower(),
            "region": (data.get("region") or current_user["region"]).upper(),
            "favorite_phrase": data.get("favoritePhrase", current_user["favoritePhrase"]),
            "avatar_url": avatar_url,
            "genres_like": json.dumps(to_array(data.get("genresLike")) or current_user["genresLike"]),
            "genres_unlike": json.dumps(to_array(data.get("genresUnLike")) or current_user["genresUnLike"]),
            "notifications_read": current_user["notificationsRead"],
        },
        serialize_user,
    )
    return updated


@router.patch("/users/me/notifications")
def update_notifications(payload: dict = Body(...), current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    updated = save_one(
        db,
        """
        UPDATE users
        SET notifications_read = :notifications_read,
            updated_at = NOW()
        WHERE id = :user_id
        RETURNING *
        """,
        {"user_id": current_user["id"], "notifications_read": to_bool(payload.get("notificationsRead"), False)},
        serialize_user,
    )
    return updated


@router.delete("/users/me")
def delete_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    deleted = save_one(
        db,
        "DELETE FROM users WHERE id = :user_id RETURNING *",
        {"user_id": current_user["id"]},
        serialize_user,
    )
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"result": True}


@router.post(
    "/users/me/token",
    summary="Generate API token",
    description="Creates (or regenerates) a personal API token for the current user. Returns the token once — store it safely.",
)
def generate_user_token(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    token = generate_api_token()
    save_one(
        db,
        "UPDATE users SET api_token = :token, updated_at = NOW() WHERE id = :user_id RETURNING *",
        {"token": token, "user_id": current_user["id"]},
        serialize_user,
    )
    return {"token": token}


@router.delete(
    "/users/me/token",
    summary="Revoke API token",
    description="Revokes the personal API token of the current user.",
)
def revoke_user_token(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    save_one(
        db,
        "UPDATE users SET api_token = NULL, updated_at = NOW() WHERE id = :user_id RETURNING *",
        {"user_id": current_user["id"]},
        serialize_user,
    )
    return {"result": True}


@router.get("/users/{user_id}")
def user_detail(user_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user = fetch_one(db, "SELECT * FROM users WHERE id = :user_id", {"user_id": user_id}, serialize_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return hydrate_user(
        db,
        user,
        include_medias=True,
        include_medias_tv=True,
        include_playlists=True,
        include_followers=True,
        include_following=True,
    )


@router.get("/user/followers")
def followers(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    return fetch_user_followers(db, current_user["id"])


@router.post("/users/{user_id}/follows")
def follow_user(user_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_id == current_user["id"]:
        raise HTTPException(status_code=403, detail="You can't follow your own user")
    existing = fetch_one(
        db,
        "SELECT * FROM user_followers WHERE follower_id = :follower_id AND following_id = :following_id",
        {"follower_id": current_user["id"], "following_id": user_id},
        serialize_follower,
    )
    if existing:
        raise HTTPException(status_code=404, detail="You are already following this user")
    created = save_one(
        db,
        """
        INSERT INTO user_followers (follower_id, following_id)
        VALUES (:follower_id, :following_id)
        RETURNING *
        """,
        {"follower_id": current_user["id"], "following_id": user_id},
        serialize_follower,
    )
    execute(
        db,
        "UPDATE users SET notifications_read = true, updated_at = NOW() WHERE id = :user_id",
        {"user_id": user_id},
    )
    return created


@router.post("/users/{user_id}/follow")
def confirm_follow(user_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    follower = fetch_one(
        db,
        "SELECT * FROM user_followers WHERE follower_id = :follower_id AND following_id = :following_id",
        {"follower_id": user_id, "following_id": current_user["id"]},
        serialize_follower,
    )
    if not follower:
        raise HTTPException(status_code=404, detail="You don't have a follow-up request from this user")
    updated = save_one(
        db,
        "UPDATE user_followers SET user_confirm = true, updated_at = NOW() WHERE id = :id RETURNING *",
        {"id": follower["id"]},
        serialize_follower,
    )
    return updated


@router.get("/users/{user_id}/follow")
def follow_detail(user_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    is_follow = fetch_one(
        db,
        """
        SELECT * FROM user_followers
        WHERE follower_id = :follower_id AND following_id = :following_id AND user_confirm = true
        """,
        {"follower_id": current_user["id"], "following_id": user_id},
        serialize_follower,
    )
    user = fetch_one(db, "SELECT * FROM users WHERE id = :user_id", {"user_id": user_id}, serialize_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not is_follow:
        hydrated = hydrate_user(db, user, include_playlists=True)
        hydrated.pop("email", None)
        pending = fetch_one(
            db,
            "SELECT * FROM user_followers WHERE follower_id = :follower_id AND following_id = :following_id",
            {"follower_id": current_user["id"], "following_id": user_id},
            serialize_follower,
        )
        return {"user": hydrated, "isFollowing": bool(pending), "isConfirm": False}
    hydrated = hydrate_user(
        db,
        user,
        include_medias=True,
        include_medias_tv=True,
        include_playlists=True,
        include_forums=True,
        include_followers=True,
        include_following=True,
        include_playlists_follow=True,
    )
    hydrated.pop("email", None)
    return {"user": hydrated, "isFollowing": True, "isConfirm": True}


@router.delete("/users/{user_id}/follows")
def delete_follower(user_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    follower = fetch_one(
        db,
        "SELECT * FROM user_followers WHERE follower_id = :follower_id AND following_id = :following_id",
        {"follower_id": user_id, "following_id": current_user["id"]},
        serialize_follower,
    )
    if not follower:
        raise HTTPException(status_code=404, detail="UnFollower not found")
    save_one(db, "DELETE FROM user_followers WHERE id = :id RETURNING *", {"id": follower["id"]}, serialize_follower)
    return {"result": True}


@router.delete("/users/{user_id}/nofollow")
def unfollow(user_id: str, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    follower = fetch_one(
        db,
        "SELECT * FROM user_followers WHERE follower_id = :follower_id AND following_id = :following_id",
        {"follower_id": current_user["id"], "following_id": user_id},
        serialize_follower,
    )
    if not follower:
        raise HTTPException(status_code=404, detail="UnFollower not found")
    save_one(db, "DELETE FROM user_followers WHERE id = :id RETURNING *", {"id": follower["id"]}, serialize_follower)
    execute(db, "UPDATE users SET notifications_read = false, updated_at = NOW() WHERE id = :user_id", {"user_id": user_id})
    return {"result": True}
