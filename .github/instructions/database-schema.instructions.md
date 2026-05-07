---
description: 'PostgreSQL schema reference for NexReel. Use when: changing tables, columns, indexes, bootstrap schema, Alembic revisions, or SQL query behavior.'
applyTo: '{fastapi,database}/**'
---

# NexReel DB — PostgreSQL Schema Reference

## Canonical Sources

- Bootstrap schema: `database/schema.sql`
- Runtime connection/config: `fastapi/api/core/database/database.py`
- App query helpers: `fastapi/api/core/nexreel/repository.py`
- Optional migrations: `fastapi/alembic/versions/`

`api/` is no longer a schema source. Do not read or update database rules from there.

## Engine and Type Conventions

- Database engine: PostgreSQL 16.
- Primary keys: native `UUID` with `gen_random_uuid()` defaults.
- Flexible collections: `JSONB`.
- Timestamps: `TIMESTAMPTZ` with `NOW()` defaults.
- Bootstrap DDL uses `IF NOT EXISTS` because it runs through Docker init on a fresh volume.

## Tables

- `users`
- `user_followers`
- `media`
- `media_tv`
- `media_tv_seasons`
- `media_tv_episodes`
- `playlists`
- `playlist_followers`
- `forums`
- `forum_followers`
- `messages`
- `plex_data`
- `plex_movie`
- `plex_tv`

## Important Column Patterns

### `users`

- Unique: `email`, `username`, `api_token`
- Session/auth fields: `password`, `role`, `api_token`
- Profile fields: `region`, `favorite_phrase`, `avatar_url`
- State flags: `notifications_read`, `is_plex_friend`
- Preferences: `genres_like`, `genres_unlike` as `JSONB`
- `api_token` is auto-generated on first login; can be regenerated via `POST /v1/users/me/token` or revoked via `DELETE /v1/users/me/token`

### Plex tables

- `plex_data`: single summary row with `movie_count`, `tv_count`, `synced_at`. Updated on every sync.
- `plex_movie`: one row per Plex movie (`rating_key` UNIQUE). Columns: `id`, `rating_key`, `title`, `original_title`, `year`, `imdb_id`, `tmdb_id`, `tvdb_id`, `created_at`. Full-refreshed on sync via TRUNCATE + bulk INSERT.
- `plex_tv`: one row per Plex TV show (`rating_key` UNIQUE). Same columns and refresh strategy as `plex_movie`.
- `imdb_id`, `tmdb_id`, `tvdb_id` are nullable TEXT columns populated from the Plex `Guid` array (e.g. `[{"id": "imdb://tt0286716"}, ...]`). Plex only returns this array when `includeGuids=1` is sent in the request.
- Do NOT store movies/shows as JSONB arrays in `plex_data` — they live in their own dedicated tables.

### Media tracking

- `media` stores movie-like items per user.
- `media_tv` stores show-level state (`seen`, `pending`, `repeat`, `runtime_seen`, `seen_complete`, `runtime_seasons` JSONB).
  - `runtime_seasons`: JSONB array indexed by season number. Each value = `episode_count × per_episode_runtime` in minutes. Index 0 may be "Specials" (season 0).
  - `runtime_seen`: total minutes the user has watched. Computed as sum of `runtime_seasons[i]` for seen seasons + sum of individual episode runtimes for loose episode rows. Updated on every season/episode state change.
  - `runtime`: per-episode runtime in minutes (used as fallback for calculation).
- `media_tv_seasons` tracks per-season progress. **Row existence = seen.** No `pending` column.
  - `runtime`: stores the per-episode runtime (NOT the total season time). Use `runtime_seasons` from parent for season totals.
- `media_tv_episodes` tracks per-episode progress. **Row existence = seen.** No `pending` column.
  - `runtime`: per-episode runtime in minutes.
- Consistency invariant: when all seasons are seen, parent becomes `seen=true` and season/episode rows are deleted. When a season is seen, its episode rows are deleted. The backend manages this automatically.

### Social tables

- `playlist_followers`, `forum_followers`, and `user_followers` enforce uniqueness per relation pair.
- `messages` supports both direct and forum-bound messages through nullable `receiver_id` and `forum_id`.

## Indexes

Keep and preserve these lookup indexes unless the task explicitly changes query strategy:

- `idx_user_followers_following_id`
- `idx_media_user_id`
- `idx_media_tv_user_id`
- `idx_media_tv_seasons_lookup`
- `idx_media_tv_episodes_lookup`
- `idx_playlist_followers_playlist_id`
- `idx_forum_followers_forum_id`
- `idx_messages_forum_id`
- `idx_messages_users_lookup`
- `idx_plex_movie_rating_key`
- `idx_plex_tv_rating_key`

## Query Rules

- Prefer parameterized SQL via `sqlalchemy.text(...)`.
- Match serializer expectations in `repository.py`; do not change column aliases casually.
- When persisting arrays or nested objects, use valid PostgreSQL JSON input and cast explicitly when needed.
