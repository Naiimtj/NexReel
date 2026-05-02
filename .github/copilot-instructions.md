# NexReel — Project Context

## What Is This

NexReel is a social entertainment platform. Users can track movies and TV shows, follow each other, create playlists, participate in forums, exchange messages, and manage Plex-related metadata.

The active backend is `fastapi/` over PostgreSQL. The `api/` folder is legacy Node/Express code and should not be used for new backend work.

> Skills reference: see `.github/skills/SKILLS-DIGEST.md`.

## Mandatory Skill Selection (Strict)

- Before proposing or writing code, always select at least one relevant skill from `.github/skills/SKILLS-DIGEST.md`.
- Skill selection is required for every non-trivial task.
- If multiple concerns are present, combine all relevant skills.
- If no skill clearly applies, ask one clarification question before proceeding.
- In every substantive response, include: `Skill used: <skill-name(s)>`.
- If the task is trivial, state: `Skill used: none (trivial task)`.

### Skill Routing Rules

NexReel-specific skills (under `engineering/`, `misc/`):

- Endpoint, router, response shape, schema, form-data → `.github/skills/engineering/api-design/SKILL.md`
- New resource or new domain flow → `.github/skills/engineering/new-entity/SKILL.md`
- PostgreSQL schema, Alembic, SQL queries, seed, bootstrap schema → `.github/skills/engineering/database/SKILL.md`
- Docker, compose, backups, justfile, local dev workflow → `.github/skills/engineering/docker/SKILL.md`
- Refactor, naming, cleanup, error handling → `.github/skills/engineering/quality/SKILL.md`
- Auth, sessions, cookies, backup admin header, secrets → `.github/skills/engineering/security/SKILL.md`
- Pytest, smoke tests, regression checks → `.github/skills/engineering/testing/SKILL.md`
- React components, pages, context, hooks, services, Tailwind, TMDB/IMDB/Plex frontend, media cards, carousels, mock system → `.github/skills/engineering/frontend/SKILL.md`
- Architecture or repo documentation → `.github/skills/misc/architecture/SKILL.md`

General engineering skills (imported from mattpocock/skills, complement the above):

- Hard bug, debug session, performance regression, "diagnose this", "why is this failing?" → `.github/skills/engineering/diagnose/SKILL.md`
- Test-first / red-green-refactor / TDD requested explicitly → `.github/skills/engineering/tdd/SKILL.md`
- Stress-test a plan against the codebase before coding, sharpen domain terms → `.github/skills/engineering/grill-with-docs/SKILL.md`

Productivity skills:

- Create / write / scaffold a new skill file → `.github/skills/productivity/write-a-skill/SKILL.md`
- User says "caveman mode" / "be brief" / "less tokens" → `.github/skills/productivity/caveman/SKILL.md`

## Folders to Ignore

- `api/` — legacy Node/Express backend; do not extend it unless the task explicitly asks to extract legacy behavior.
- `old-api/` — same as above, older Node/Express remnant.
- `api/node_modules/`, `web/node_modules/` — dependencies only.
- `database/backup_data/` — generated artifacts, not source.

## Project Root Structure

```text
NexReel/
├── .env                  ← single source of env vars for local dev and compose
├── justfile              ← dev and ops shortcuts
├── docker-compose.yml    ← postgres + fastapi + backup services
├── database/
│   ├── schema.sql        ← canonical PostgreSQL bootstrap schema
│   ├── backup_data/      ← host-mounted backup output
│   └── backups/          ← backup container image sources
├── fastapi/
│   ├── alembic/          ← Alembic revisions
│   ├── api/
│   │   ├── main.py       ← FastAPI app registration
│   │   ├── routers/      ← `health`, `backup`, `nexreel`
│   │   ├── core/         ← auth, database, repository, uploads, constants
│   │   └── config/env.py ← settings loader
│   ├── debug.py          ← local uvicorn runner
│   └── tests/            ← pytest area (currently sparse)
├── scripts/
│   └── smoke_fastapi.py  ← API smoke validation script
├── web/                  ← Vite/React frontend
│   ├── services/
│   │   ├── TMDB/         ← services-tmdb.js (all TMDB calls)
│   │   ├── IMDB/         ← services-imdb.js (ratings)
│   │   ├── PLEX/         ← services-plex.js
│   │   ├── DB/           ← services-db.js (FastAPI backend calls)
│   │   └── __mocks__/
│   │       └── data/     ← JSON fixtures for VITE_USE_MOCKS=true
│   └── src/              ← React components and pages
└── api/                  ← legacy backend, no longer canonical
```

## Current Stack

| Component | Technology                               | Notes                                                              |
| --------- | ---------------------------------------- | ------------------------------------------------------------------ |
| Database  | PostgreSQL 16                            | Dockerized locally, schema bootstrapped from `database/schema.sql` |
| API       | FastAPI + SQLAlchemy Core/Text + Alembic | Cookie/session auth, main app in `fastapi/api/`                    |
| Backups   | Debian + cron + pg_dump/psql             | Manual and scheduled PostgreSQL dumps                              |
| Frontend  | React + Vite                             | Uses `withCredentials: true` against FastAPI                       |

## How To Run

### Local DB and backups only

```bash
just up-local
just down-local
just logs-local
just ps-local
just db-shell
```

`just up-local` should only wait for PostgreSQL readiness. It must not reapply the schema manually; the Docker entrypoint bootstraps `database/schema.sql` on a fresh volume.

### Local FastAPI on host

```bash
just install
just dev
```

### Migrations

```bash
just migrate           # apply all pending
just migrate-down      # revert last
just migrate-status    # current revision
just migrate-history   # full history
just migrate-new "msg" # create new revision
```

### Full containerized stack

```bash
just build
just up
just down
just logs
```

### Validation

```bash
just smoke
cd fastapi && ../.venv/bin/python -m pytest tests/ -v
```

## Key URLs

- Swagger (custom): `http://localhost:8000/`
- Redoc: `http://localhost:8000/redoc`
- Health: `GET /health`
- Main app routes: `GET/POST/... /v1/*`
- Backup routes: `POST/GET /db/*`

## Environment Variables

- Root `.env` is the canonical env file for the backend and Docker.
- FastAPI settings are loaded from `fastapi/api/config/env.py`.
- Docker Compose injects the same values into containers.
- Docker env values must not include inline comments.
- Frontend variables live in `web/.env` (gitignored) — use `web/.env.template` as reference.

Backend important variables:

- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `SESSION_SECRET`
- `BACKUP_ADMIN_PASSWORD`
- `ALLOWED_ORIGINS`
- `BACKUP_DATA_DIR`
- `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`

Frontend variables (`web/.env`):

- `VITE_URL_DB` — FastAPI base URL (e.g. `http://localhost:8000/v1/`)
- `VITE_URL_TMDB`, `VITE_APIKEY_TMDB` — The Movie Database API
- `VITE_URL_IMDB`, `VITE_APIKEY_IMDB` — IMDB/RapidAPI ratings
- `VITE_URL_PLEX`, `VITE_APIKEY_PLEX` — Plex Media Server
- `VITE_USE_MOCKS` — set `"true"` to intercept all TMDB/IMDB calls and return local JSON fixtures (no API quota consumed)

## Backend Conventions

- Session auth is cookie-based via `SessionMiddleware`; do not introduce JWT unless the task explicitly requires it.
- Most application behavior lives in `fastapi/api/routers/nexreel.py` and `fastapi/api/core/nexreel/repository.py`.
- Preserve the response shapes expected by the current frontend, especially mixed camelCase/snake_case fields coming from forms and legacy clients.
- Use PostgreSQL features intentionally: `UUID`, `JSONB`, `TIMESTAMPTZ`, and `CREATE TABLE IF NOT EXISTS` in the bootstrap schema.

## Testing

- `fastapi/tests/` exists but currently has little or no coverage.
- For regressions, prefer adding focused pytest coverage and/or extending `scripts/smoke_fastapi.py`.
- When changing endpoints, validate both startup behavior and frontend-facing contract compatibility.

## Frontend Mock System

All external API calls (TMDB, IMDB) can be intercepted locally via `VITE_USE_MOCKS=true` in `web/.env`.

- Mock JSON fixtures live in `web/services/__mocks__/data/`.
- The guard is `const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true"` at the top of each service file.
- No network request is made when mocks are active — fixtures are imported as static JSON at build time.
- Fictional test entities available in mocks:
  - **Movie** — id `99999`, "El Origen de NexReel", imdb_id `tt9999999`
  - **TV Show** — id `99998`, "Crónicas del Nexreel", 2 seasons / 16 episodes
  - **Person** — id `99997`, "Carlos Nexreel", director
- When editing `services-tmdb.js` or `services-imdb.js`, always preserve the `if (USE_MOCKS)` guard at the top of every exported function.
- To add a new mock fixture: create the JSON file in `web/services/__mocks__/data/`, import it at the top of the relevant service file, and add the guard branch.
