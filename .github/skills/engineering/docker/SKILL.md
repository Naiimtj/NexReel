---
name: docker
description: 'Docker, Compose, justfile and backup workflow for NexReel. Use when: editing docker-compose.yml, Dockerfile, justfile recipes, .env wiring, local startup (just up-local / just dev), backup/restore containers, or PostgreSQL bootstrap behavior.'
---

# Docker & Infrastructure

Rules for Docker, Compose, backups, and local workflow in NexReel.

## Active Compose Topology

The active `docker-compose.yml` orchestrates:

- `postgres`
- `fastapi`
- `backup`

The bootstrap schema is mounted from `database/schema.sql` into the Postgres init directory.

## Local Workflow

- `just up-local` starts the local DB stack.
- `just down-local`, `just logs-local`, `just ps-local`, and `just db-shell` support local operations.
- `just install` sets up the Python environment.
- `just dev` runs FastAPI on the host (no hardcoded env vars — relies on `set dotenv-load := true`).
- `just migrate` applies Alembic migrations against the local DB.
- `just migrate-down` reverts the last migration.
- `just migrate-status` shows the current revision.
- `just migrate-history` shows the full revision history.
- `just migrate-new MESSAGE` creates a new Alembic revision.
- `just test` runs pytest; accepts extra args (`just test -k test_auth`).

## Rules

- Root `.env` is the canonical environment source.
- `set dotenv-load := true` in `justfile` loads `.env` automatically — do NOT repeat env vars inside recipes.
- Docker env values must not include inline comments.
- `just up-local` must wait for PostgreSQL readiness only; it must not manually reapply the schema.
- Schema bootstrap changes must stay compatible with fresh volumes.

## Backup Behavior

- Backup endpoints live under `/db/*`.
- Operational logic belongs in `fastapi/api/core/database/backup.py`.
- Any change affecting dump/restore must consider the backup container and host-mounted backup directories.

## Validation

- Use `docker compose config` as a cheap structural validation after Compose edits.
- When changing startup flow, verify the affected `just` command rather than only reading the file.
