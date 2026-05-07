---
description: 'FastAPI architecture and patterns for NexReel. Use when: adding routes, changing startup behavior, editing auth/session flow, wiring dependencies, or reorganizing backend files.'
applyTo: 'fastapi/**'
---

# FastAPI Service — Architecture & Patterns

## Structure

```text
fastapi/
├── alembic/
│   └── versions/
│       ├── 001_nexreel_initial.py   ← single migration, all schema
│       └── 002_drop_pending_tv.py   ← removes pending from seasons/episodes
├── api/
│   ├── main.py
│   ├── dependencies.py
│   ├── config/env.py
│   ├── routers/
│   │   ├── health.py
│   │   ├── backup.py
│   │   ├── nexreel.py
│   │   ├── medias.py                ← media CRUD (movies + TV parent)
│   │   ├── tv.py                    ← TV seasons/episodes endpoints
│   │   └── _helpers.py              ← shared router helpers
│   ├── core/
│   │   ├── auth.py
│   │   ├── constants.py
│   │   ├── uploads.py
│   │   ├── plex_sync.py             ← Plex library sync logic
│   │   ├── database/
│   │   │   ├── database.py
│   │   │   └── backup.py
│   │   └── nexreel/repository.py
│   └── static/
├── debug.py
└── tests/
```

## Core Architectural Rules

- `api/main.py` is the composition root. Register routers and middleware there.
- Session auth lives in `api/core/auth.py` and depends on `SessionMiddleware` configured in `main.py`.
- Main product endpoints live in `api/routers/nexreel.py` under `/v1`.
- Shared SQL and serializer logic belongs in `api/core/nexreel/repository.py`.
- Backup and restore logic belongs in `api/core/database/backup.py`, exposed through `api/routers/backup.py`.

## Router Boundaries

- `health.py`: readiness and liveness only.
- `backup.py`: operational endpoints under `/db`, protected by the admin password header.
- `nexreel.py`: user-facing product/domain endpoints under `/v1` (users, playlists, forums, messages, plex).
- `medias.py`: media CRUD under `/v1` (movies + TV parent `media_tv`).
- `tv.py`: TV seasons and episodes under `/v1` (season/episode CRUD with automatic parent consistency).
- `_helpers.py`: shared utilities (`parse_form`, `get_media_for_user`, constants).

TV tracking logic lives in `tv.py` (helpers: `_ensure_parent_tv`, `_sync_parent_after_season_change`, `_check_season_complete`). Media-level logic lives in `medias.py` (`_create_all_season_rows`, `_delete_all_children`).

## Request Handling Patterns

- Use `Depends(get_db)` for DB sessions.
- Use `Depends(get_current_user)` for authenticated product routes.
- Use `Request`, `Form(...)`, and `UploadFile` when handling multipart frontend payloads.
- Reuse serializer helpers from `repository.py` instead of rebuilding response objects ad hoc.

## Startup and Config

- Settings are loaded from the root `.env` through `api/config/env.py`.
- Local host development runs through `debug.py` and `just dev`.
- Dockerized startup should assume PostgreSQL is available through Compose service discovery.
- `main.py` uses a `lifespan` context manager that runs `alembic upgrade head` on every startup (both dev and container).
- `main.py` also starts an APScheduler `AsyncIOScheduler` in the lifespan that runs Plex sync daily at 04:00 (timezone from `settings.TZ`).
- `docs_url=None` disables the default Swagger. A custom Swagger UI is served at `GET /` via `swagger.html` and `/static`.
- `redoc_url="/redoc"` remains available.
- `debug.py` also runs migrations before starting uvicorn — do not remove this duplication; it ensures local dev works even without a running container.
- OpenAPI spec is customized via `_custom_openapi()` in `main.py` to expose both `X-User-Token` and `X-Admin-Password` in the Swagger Authorize dialog.

## Contract Rules

- Preserve existing frontend-facing response shapes unless the task explicitly changes the contract.
- Preserve mixed field naming where the frontend already depends on it.
- Keep cookie/session auth compatible with frontend `withCredentials: true` usage.

## Things To Avoid

- Do not add new backend code under the legacy `api/` folder.
- Do not introduce a second auth model beside the current session-based one unless explicitly requested.
- Do not split `repository.py` into many files unless it becomes a concrete blocker for the task.
- Do not create a second Alembic migration file for schema elements that belong in `001_nexreel_initial.py`. All schema lives in the single initial migration unless an explicit incremental migration is requested.
- Do not store Plex movie/show lists as JSONB blobs in `plex_data` — they belong in `plex_movie` and `plex_tv` tables.
