from __future__ import annotations

import json
from collections.abc import Callable
from datetime import date, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session


RowSerializer = Callable[[dict[str, Any]], Any]


def to_json_safe(value: Any) -> Any:
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, list):
        return [to_json_safe(item) for item in value]
    if isinstance(value, dict):
        return {key: to_json_safe(item) for key, item in value.items()}
    return value


def fetch_one(
    db: Session,
    sql: str,
    params: dict[str, Any] | None = None,
    serializer: RowSerializer | None = None,
) -> Any:
    result = db.execute(text(sql), params or {})
    row = result.mappings().first()
    if not row:
        return None
    payload = dict(row)
    return to_json_safe(serializer(payload) if serializer else payload)


def fetch_all(
    db: Session,
    sql: str,
    params: dict[str, Any] | None = None,
    serializer: RowSerializer | None = None,
) -> list[Any]:
    result = db.execute(text(sql), params or {})
    rows = [dict(row) for row in result.mappings().all()]
    if not serializer:
        return to_json_safe(rows)
    return [to_json_safe(serializer(row)) for row in rows]


def execute(db: Session, sql: str, params: dict[str, Any] | None = None) -> None:
    db.execute(text(sql), params or {})
    db.commit()


def save_one(
    db: Session,
    sql: str,
    params: dict[str, Any] | None = None,
    serializer: RowSerializer | None = None,
) -> Any:
    result = db.execute(text(sql), params or {})
    db.commit()
    row = result.mappings().first()
    if not row:
        return None
    payload = dict(row)
    return to_json_safe(serializer(payload) if serializer else payload)


def to_array(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if value is None:
        return []
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError:
            return []
        return parsed if isinstance(parsed, list) else []
    return []


def to_bool(value: Any, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() == "true"
    return bool(value)


def to_number(value: Any, default: int | None = None) -> int | None:
    if value in (None, ""):
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def normalize_vote(value: Any, default: float = -1) -> float:
    if value in (None, ""):
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _timestamps(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "createdAt": row.get("created_at"),
        "updatedAt": row.get("updated_at"),
    }


def serialize_user(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "email": row.get("email"),
        "username": row.get("username"),
        "region": row.get("region"),
        "favoritePhrase": row.get("favorite_phrase"),
        "role": row.get("role"),
        "genresLike": to_array(row.get("genres_like")),
        "genresUnLike": to_array(row.get("genres_unlike")),
        "avatarURL": row.get("avatar_url"),
        "notificationsRead": row.get("notifications_read"),
        "isPlexFriend": row.get("is_plex_friend"),
        "apiToken": row.get("api_token"),
        **_timestamps(row),
    }


def serialize_follower(row: dict[str, Any]) -> dict[str, Any]:
    payload = {
        "id": row.get("id"),
        "UserIDFollower": row.get("follower_id"),
        "UserIDFollowing": row.get("following_id"),
        "UserConfirm": row.get("user_confirm"),
        **_timestamps(row),
    }
    if row.get("user_id"):
        payload["user"] = {
            "id": row.get("user_id"),
            "username": row.get("user_username"),
            "avatarURL": row.get("user_avatar_url"),
        }
    return payload


def serialize_media(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "userId": row.get("user_id"),
        "mediaId": row.get("media_id"),
        "media_type": row.get("media_type"),
        "like": row.get("like"),
        "seen": row.get("seen"),
        "pending": row.get("pending"),
        "repeat": row.get("repeat"),
        "runtime": row.get("runtime"),
        "vote": float(row.get("vote", -1)),
        **_timestamps(row),
    }


def serialize_media_tv(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "userId": row.get("user_id"),
        "mediaId": row.get("media_id"),
        "media_type": row.get("media_type"),
        "like": row.get("like"),
        "seen": row.get("seen"),
        "pending": row.get("pending"),
        "seenComplete": row.get("seen_complete"),
        "repeat": row.get("repeat"),
        "runtime": row.get("runtime"),
        "number_seasons": row.get("number_seasons"),
        "number_of_episodes": row.get("number_of_episodes"),
        "runtime_seen": row.get("runtime_seen"),
        "runtime_seasons": to_array(row.get("runtime_seasons")),
        "vote": float(row.get("vote", -1)),
        **_timestamps(row),
    }


def serialize_media_tv_season(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "userId": row.get("user_id"),
        "mediaId": row.get("media_id"),
        "media_type": row.get("media_type"),
        "season": row.get("season"),
        "number_seasons": row.get("number_seasons"),
        "number_of_episodes": row.get("number_of_episodes"),
        "seenComplete": row.get("seen_complete"),
        "like": row.get("like"),
        "seen": row.get("seen"),
        "runtime": row.get("runtime"),
        "vote": float(row.get("vote", -1)),
        **_timestamps(row),
    }


def serialize_media_tv_episode(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "userId": row.get("user_id"),
        "mediaId": row.get("media_id"),
        "media_type": row.get("media_type"),
        "season": row.get("season"),
        "episode": row.get("episode"),
        "number_seasons": row.get("number_seasons"),
        "number_of_episodes": row.get("number_of_episodes"),
        "idEpisode": row.get("episode_external_id"),
        "like": row.get("like"),
        "seen": row.get("seen"),
        "runtime": row.get("runtime"),
        "vote": float(row.get("vote", -1)),
        **_timestamps(row),
    }


def serialize_playlist(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "author": row.get("author_id"),
        "title": row.get("title"),
        "description": row.get("description"),
        "imgPlaylist": row.get("img_playlist"),
        "tags": to_array(row.get("tags")),
        "medias": to_array(row.get("medias")),
        **_timestamps(row),
    }


def serialize_playlist_follower(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "userId": row.get("user_id"),
        "playlistId": row.get("playlist_id"),
        "like": row.get("like"),
        **_timestamps(row),
    }


def serialize_forum(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "title": row.get("title"),
        "tags": to_array(row.get("tags")),
        "shortDescription": row.get("short_description"),
        "description": row.get("description"),
        "imgForum": row.get("img_forum"),
        "medias": to_array(row.get("medias")),
        "author": row.get("author_id"),
        **_timestamps(row),
    }


def serialize_forum_follower(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "userId": row.get("user_id"),
        "forumId": row.get("forum_id"),
        "like": row.get("like"),
        **_timestamps(row),
    }


def serialize_message(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "sender": row.get("sender_id"),
        "receiver": row.get("receiver_id"),
        "forum": row.get("forum_id"),
        "textMessage": row.get("text_message"),
        "edited": row.get("edited"),
        **_timestamps(row),
    }


def serialize_plex(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "movieCount": row.get("movie_count", 0),
        "tvCount": row.get("tv_count", 0),
        "syncedAt": row.get("synced_at"),
        **_timestamps(row),
    }


def serialize_plex_movie(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "ratingKey": row.get("rating_key"),
        "title": row.get("title"),
        "originalTitle": row.get("original_title", ""),
        "year": row.get("year"),
        "imdbId": row.get("imdb_id"),
        "tmdbId": row.get("tmdb_id"),
        "tvdbId": row.get("tvdb_id"),
        "createdAt": row.get("created_at"),
    }


def serialize_plex_tv(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "ratingKey": row.get("rating_key"),
        "title": row.get("title"),
        "originalTitle": row.get("original_title", ""),
        "year": row.get("year"),
        "imdbId": row.get("imdb_id"),
        "tmdbId": row.get("tmdb_id"),
        "tvdbId": row.get("tvdb_id"),
        "createdAt": row.get("created_at"),
    }


def fetch_playlist_followers(db: Session, playlist_id: str) -> list[dict[str, Any]]:
    return fetch_all(
        db,
        "SELECT * FROM playlist_followers WHERE playlist_id = :playlist_id ORDER BY created_at DESC",
        {"playlist_id": playlist_id},
        serialize_playlist_follower,
    )


def fetch_forum_followers(db: Session, forum_id: str) -> list[dict[str, Any]]:
    return fetch_all(
        db,
        "SELECT * FROM forum_followers WHERE forum_id = :forum_id ORDER BY created_at DESC",
        {"forum_id": forum_id},
        serialize_forum_follower,
    )


def fetch_user_followers(db: Session, user_id: str) -> list[dict[str, Any]]:
    return fetch_all(
        db,
        """
        SELECT uf.*, u.id AS user_id, u.username AS user_username, u.avatar_url AS user_avatar_url
        FROM user_followers uf
        JOIN users u ON u.id = uf.follower_id
        WHERE uf.following_id = :user_id
        ORDER BY uf.created_at DESC
        """,
        {"user_id": user_id},
        serialize_follower,
    )


def fetch_user_following(db: Session, user_id: str) -> list[dict[str, Any]]:
    return fetch_all(
        db,
        "SELECT * FROM user_followers WHERE follower_id = :user_id ORDER BY created_at DESC",
        {"user_id": user_id},
        serialize_follower,
    )


def hydrate_playlist(db: Session, playlist: dict[str, Any] | None) -> dict[str, Any] | None:
    if not playlist:
        return None
    payload = dict(playlist)
    payload["followersPlaylist"] = fetch_playlist_followers(db, playlist["id"])
    payload["user"] = fetch_one(
        db,
        "SELECT id, username FROM users WHERE id = :user_id",
        {"user_id": playlist["author"]},
    )
    return payload


def hydrate_forum(db: Session, forum: dict[str, Any] | None) -> dict[str, Any] | None:
    if not forum:
        return None
    payload = dict(forum)
    payload["followers"] = fetch_forum_followers(db, forum["id"])
    payload["userCreate"] = fetch_one(
        db,
        "SELECT id, username FROM users WHERE id = :user_id",
        {"user_id": forum["author"]},
    )
    return payload


def hydrate_user(
    db: Session,
    user: dict[str, Any] | None,
    *,
    include_medias: bool = False,
    include_medias_tv: bool = False,
    include_playlists: bool = False,
    include_forums: bool = False,
    include_followers: bool = False,
    include_following: bool = False,
    include_playlists_follow: bool = False,
) -> dict[str, Any] | None:
    if not user:
        return None

    payload = dict(user)

    if include_medias:
        payload["medias"] = fetch_all(
            db,
            "SELECT * FROM media WHERE user_id = :user_id ORDER BY created_at DESC",
            {"user_id": user["id"]},
            serialize_media,
        )

    if include_medias_tv:
        payload["mediasTv"] = fetch_all(
            db,
            "SELECT * FROM media_tv WHERE user_id = :user_id ORDER BY created_at DESC",
            {"user_id": user["id"]},
            serialize_media_tv,
        )

    if include_playlists:
        playlists = fetch_all(
            db,
            "SELECT * FROM playlists WHERE author_id = :user_id ORDER BY created_at DESC",
            {"user_id": user["id"]},
            serialize_playlist,
        )
        payload["playlists"] = [hydrate_playlist(db, playlist) for playlist in playlists]

    if include_forums:
        payload["forums"] = fetch_all(
            db,
            "SELECT * FROM forums WHERE author_id = :user_id ORDER BY created_at DESC",
            {"user_id": user["id"]},
            serialize_forum,
        )

    if include_followers:
        payload["followers"] = fetch_user_followers(db, user["id"])

    if include_following:
        payload["following"] = fetch_user_following(db, user["id"])

    if include_playlists_follow:
        playlists = fetch_all(
            db,
            """
            SELECT p.*
            FROM playlist_followers pf
            JOIN playlists p ON p.id = pf.playlist_id
            WHERE pf.user_id = :user_id
            ORDER BY pf.created_at DESC
            """,
            {"user_id": user["id"]},
            serialize_playlist,
        )
        payload["playlistsFollow"] = [hydrate_playlist(db, playlist) for playlist in playlists]

    return payload
