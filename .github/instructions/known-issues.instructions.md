---
description: 'Known issues and gotchas for NexReel. Use when: debugging startup, Docker, session auth, PostgreSQL bootstrap, backup routes, or legacy path confusion.'
---

# NexReel — Known Issues & Patterns

## Canonical Backend vs Legacy Backend

- Active backend: `fastapi/`
- Legacy backend: `api/`
- Rule: do not add new backend logic under `api/`.

## PostgreSQL Bootstrap

- Canonical bootstrap schema: `database/schema.sql`
- Compose mounts it into `/docker-entrypoint-initdb.d/001_schema.sql`
- Docker applies it automatically on a fresh volume
- Rule: `just up-local` must not manually re-run the schema file

If you see repeated `NOTICE: relation ... already exists`, someone reintroduced a manual schema import.

## Local Startup Behavior

- `just up-local` should only wait until `docker exec ... psql -tAc "SELECT 1"` succeeds.
- `pg_isready` alone can be too early for some initialization flows.
- A syntax error in generated `just` shell scripts usually means the recipe became too clever with nested command substitutions.

## Auth and Frontend Compatibility

- Auth is session/cookie based through `SessionMiddleware`.
- The frontend sends credentialed requests, so CORS must use explicit origins, never `*`.
- `get_current_user()` clears the session if the stored `user_id` no longer resolves to a user.

## Password Compatibility

- New passwords use PBKDF2-HMAC-SHA256.
- Legacy bcrypt hashes are still accepted and transparently verified.
- Never remove bcrypt support unless the migration plan explicitly includes rehashing all stored passwords.

## Backup Endpoints

- `/db/*` routes require `X-Admin-Password`.
- SQL import accepts `.sql` only.
- Backup and restore behavior lives in `fastapi/api/core/database/backup.py`; operational changes belong there, not in routers only.

## Plex Schema — Common Mistakes

- `plex_data` is a **summary row** only: `movie_count`, `tv_count`, `synced_at`.
- The actual media lives in `plex_movie` (one row per film) and `plex_tv` (one row per show).
- Do NOT put `movie JSONB` or `tv JSONB` columns on `plex_data` — that was an earlier incorrect implementation that was reverted.
- Sync uses `TRUNCATE plex_movie, plex_tv` + bulk INSERT for a full refresh. Never accumulate rows.

## Plex Guid / External IDs — `includeGuids=1` Required

- `plex_movie` and `plex_tv` store `imdb_id`, `tmdb_id`, `tvdb_id` extracted from Plex's `Guid` array.
- **The Plex library listing endpoint (`/sections/{id}/all`) does NOT return the `Guid` array by default.** You must add `includeGuids=1` as a query parameter, otherwise all three ID columns will be `NULL`.
- Guid format: `[{"id": "imdb://tt0286716"}, {"id": "tmdb://1927"}, {"id": "tvdb://1117"}]`
- Extraction logic is in `_extract_guids()` inside `fastapi/api/core/plex_sync.py`.

## Alembic — Single Migration Rule

- There is only **one** migration file: `fastapi/alembic/versions/001_nexreel_initial.py`.
- All schema additions (`api_token` on `users`, `plex_movie`, `plex_tv`) are consolidated into this file.
- Do not create a `002_*` migration unless an explicit incremental migration for a live production DB is needed.
- If the DB is being rebuilt from scratch (fresh volume), the Docker entrypoint applies `database/schema.sql`, not Alembic. Alembic is for incremental upgrades on an already-running DB.

## Token Auth (`X-User-Token`)

- All `/v1/*` routes accept either session cookie **or** `X-User-Token` header.
- `get_current_user()` checks the header first, then falls back to session.
- `api_token` is stored in the `users` table, auto-generated on first login.
- To regenerate: `POST /v1/users/me/token`. To revoke: `DELETE /v1/users/me/token`.
- Do not add `X-User-Token` support to `/db/*` routes — those use `X-Admin-Password` only.

## Environment and Config

- Root `.env` is the source of truth.
- `fastapi/api/config/env.py` resolves `.env` from the repo root for local development.
- Docker env values must not include inline comments.

## Frontend Axios baseURL

- `VITE_URL_DB` in `web/.env` is set to `http://localhost:8000/v1/`.
- Axios ignores the path portion of `baseURL` when the call path starts with `/`. All calls in `web/services/DB/services-db.js` must use relative paths (no leading `/`):

```js
// WRONG — axios ignores /v1/ and sends to /register
service.post('/register', data);

// CORRECT — axios concatenates to http://localhost:8000/v1/register
service.post('register', data);
```

- If a service call is missing the backend, first check whether it has a leading `/`.

## Mongoose Compatibility — `serialize_follower`

- `user_followers` relations serialize with `"user"` as an **array** `[{id, username, avatarURL}]`, not a plain object.
- This matches the old Mongoose virtual (which had no `justOne: true`).
- The React frontend uses `i.user[0]` everywhere — do not change `user` to a plain object.

## Tests

- `fastapi/tests/` is currently minimal, so regression coverage often depends on targeted smoke checks.
- For backend changes, validate the contract either with pytest or `scripts/smoke_fastapi.py`.

## Frontend Mock System

- Controlled by `VITE_USE_MOCKS` in `web/.env` (`"true"` / `"false"`).
- When `"true"`, all TMDB and IMDB service calls return static JSON from `web/services/__mocks__/data/` — no network requests are made.
- Fictional entity IDs for dev/test: movie `99999`, tv `99998`, person `99997`.
- If a new service function is added to `services-tmdb.js` or `services-imdb.js`, it **must** include the `if (USE_MOCKS) { return mock...; }` guard or real API calls will fire regardless of the flag.
- Mock data shape must exactly match what the calling component destructures — if the real API response shape changes, update the corresponding JSON fixture too.
- `VITE_USE_MOCKS` is a Vite build-time variable. Changing it requires a dev-server restart (`just web` or `npm run dev`).
