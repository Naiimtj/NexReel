---
name: database
description: 'PostgreSQL schema, SQLAlchemy Core/Text, and Alembic conventions for NexReel. Use when: changing tables, columns, indexes, bootstrap schema (database/schema.sql), Alembic revisions, raw SQL queries, JSONB/UUID/TIMESTAMPTZ usage, or repository query patterns.'
---

# Database & Migrations

Rules for working with PostgreSQL, SQLAlchemy Core/Text, and Alembic in NexReel.

## Canonical Sources

- Bootstrap schema: `database/schema.sql`
- Runtime connection code: `fastapi/api/core/database/database.py`
- Shared SQL and serializers: `fastapi/api/core/nexreel/repository.py`
- Migrations: `fastapi/alembic/versions/`

## Core Conventions

- Use PostgreSQL-native `UUID` primary keys where the schema already does.
- Use `TIMESTAMPTZ` and `NOW()` for timestamps.
- Use `JSONB` for list-like or structured user preferences.
- Keep bootstrap DDL idempotent with `IF NOT EXISTS` when editing `database/schema.sql`.

## Tables To Understand First

- `users` — includes `api_token TEXT UNIQUE` for header-based auth
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
- `plex_data` — summary row: `movie_count`, `tv_count`, `synced_at`
- `plex_movie` — one row per Plex film, `rating_key UNIQUE`; columns include `imdb_id`, `tmdb_id`, `tvdb_id` (nullable TEXT)
- `plex_tv` — one row per Plex show, `rating_key UNIQUE`; columns include `imdb_id`, `tmdb_id`, `tvdb_id` (nullable TEXT)

## Query Patterns

- Prefer parameterized `sqlalchemy.text(...)` queries.
- Keep SQL aliases aligned with the serializer functions in `repository.py`.
- Use expanding bind params only when needed for `IN` queries.
- Avoid ad hoc ORM layering that duplicates the repository abstraction already in place.

## Migrations

- Use Alembic when the running database must be upgraded incrementally.
- Keep `upgrade()` and `downgrade()` symmetrical.
- Reflect the same schema intent in `database/schema.sql` when the bootstrap path must also change.
- Validate operational impact on Docker init and backup/restore flows.

## Index Discipline

Preserve or intentionally update lookup indexes on follower, media, playlist, forum, and message tables when changing access patterns.

## Testing Implications

- Schema changes should be validated with the narrowest available backend check.
- If a migration changes payload shape indirectly, coordinate with router and testing updates in the same task.

## Checklist

- [ ] Migration has both `upgrade()` and `downgrade()`
- [ ] `down_revision` points to the actual latest migration
- [ ] Bootstrap schema mirrors the intended structure
- [ ] PostgreSQL types stay consistent with runtime queries
- [ ] Raw SQL uses bind parameters, not string interpolation
