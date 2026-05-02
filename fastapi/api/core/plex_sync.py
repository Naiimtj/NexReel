"""Plex library sync logic.

Fetches all media from the configured Plex sections (movie, tv, anime,
animation, documental) and upserts rows into plex_movie and plex_tv tables.
Updates the plex_data summary row with total counts and sync timestamp.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import httpx
from sqlalchemy import text
from sqlalchemy.orm import Session

from api.config.env import settings
from api.core.nexreel.repository import fetch_one, save_one, serialize_plex

logger = logging.getLogger("nexreel-fastapi")

# Plex library section IDs — mirror the values from old-api/controllers/Plex
_SECTION_IDS: dict[str, int] = {
    "movie": 18,
    "tv": 10,
    "anime": 11,
    "animation": 12,
    "documental": 15,
}


async def _fetch_section(
    client: httpx.AsyncClient, section_id: int, plex_url: str, plex_api_key: str
) -> list[dict[str, Any]]:
    base = plex_url.rstrip("/")
    url = f"{base}/sections/{section_id}/all"
    # Omit X-Plex-Container-Size so Plex returns its full library without pagination
    response = await client.get(
        url,
        params={"X-Plex-Token": plex_api_key, "includeGuids": 1},
        headers={"Accept": "application/json"},
    )
    response.raise_for_status()
    return response.json().get("MediaContainer", {}).get("Metadata") or []


async def _fetch_all_sections(plex_url: str, plex_api_key: str) -> tuple[list[dict], list[dict]]:
    """Return (movies, tv_shows) filtered to the minimal shape stored in DB."""
    async with httpx.AsyncClient(timeout=60.0) as client:
        results = await asyncio.gather(
            *[_fetch_section(client, sid, plex_url, plex_api_key) for sid in _SECTION_IDS.values()],
            return_exceptions=True,
        )

    combined: list[dict] = []
    for section_name, result in zip(_SECTION_IDS.keys(), results):
        if isinstance(result, Exception):
            logger.warning("Failed to fetch Plex section '%s': %s", section_name, result)
        else:
            combined.extend(result)

    def _extract_guids(item: dict) -> dict[str, str | None]:
        guids: dict[str, str | None] = {"imdb_id": None, "tmdb_id": None, "tvdb_id": None}
        for guid in item.get("Guid") or []:
            raw = guid.get("id", "")
            if raw.startswith("imdb://"):
                guids["imdb_id"] = raw[len("imdb://"):]
            elif raw.startswith("tmdb://"):
                guids["tmdb_id"] = raw[len("tmdb://"):]
            elif raw.startswith("tvdb://"):
                guids["tvdb_id"] = raw[len("tvdb://"):]
        return guids

    def _filter(item: dict) -> dict:
        return {
            "ratingKey": item.get("ratingKey"),
            "type": item.get("type"),
            "year": item.get("year"),
            "originalTitle": item.get("originalTitle") or "",
            "title": item.get("title"),
            **_extract_guids(item),
        }

    movies = [_filter(i) for i in combined if i.get("type") == "movie"]
    tv_shows = [_filter(i) for i in combined if i.get("type") == "show"]
    return movies, tv_shows


async def sync_plex_data(
    db: Session,
    plex_url: str | None = None,
    plex_api_key: str | None = None,
) -> dict[str, Any]:
    """Sync Plex library into plex_movie + plex_tv. Updates plex_data summary.

    ``plex_url`` and ``plex_api_key`` override the environment-level settings
    when provided, allowing callers to pass credentials per-request.
    """
    resolved_url = plex_url or settings.PLEX_URL
    resolved_key = plex_api_key or settings.PLEX_API_KEY
    if not resolved_url or not resolved_key:
        raise ValueError("PLEX_URL and PLEX_API_KEY must be configured to run a sync")

    movies, tv_shows = await _fetch_all_sections(resolved_url, resolved_key)
    logger.info("Plex sync fetched: %d movies, %d TV shows", len(movies), len(tv_shows))

    # Full refresh: truncate and reinsert both tables
    db.execute(text("TRUNCATE TABLE plex_movie, plex_tv"))

    if movies:
        db.execute(
            text(
                "INSERT INTO plex_movie (rating_key, title, original_title, year, imdb_id, tmdb_id, tvdb_id) "
                "VALUES (:ratingKey, :title, :originalTitle, :year, :imdb_id, :tmdb_id, :tvdb_id)"
            ),
            movies,
        )

    if tv_shows:
        db.execute(
            text(
                "INSERT INTO plex_tv (rating_key, title, original_title, year, imdb_id, tmdb_id, tvdb_id) "
                "VALUES (:ratingKey, :title, :originalTitle, :year, :imdb_id, :tmdb_id, :tvdb_id)"
            ),
            tv_shows,
        )

    # Upsert plex_data summary row (single row tracking counts + last sync time)
    existing = fetch_one(
        db,
        "SELECT * FROM plex_data ORDER BY created_at ASC LIMIT 1",
        serializer=serialize_plex,
    )

    if existing:
        result = save_one(
            db,
            """
            UPDATE plex_data
               SET movie_count = :movie_count,
                   tv_count    = :tv_count,
                   synced_at   = NOW(),
                   updated_at  = NOW()
             WHERE id = :id
            RETURNING *
            """,
            {"id": existing["id"], "movie_count": len(movies), "tv_count": len(tv_shows)},
            serialize_plex,
        )
    else:
        result = save_one(
            db,
            """
            INSERT INTO plex_data (movie_count, tv_count, synced_at)
            VALUES (:movie_count, :tv_count, NOW())
            RETURNING *
            """,
            {"movie_count": len(movies), "tv_count": len(tv_shows)},
            serialize_plex,
        )

    logger.info("Plex sync complete: movies=%d, tv=%d", len(movies), len(tv_shows))
    return result
