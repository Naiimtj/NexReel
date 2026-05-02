---
name: new-entity
description: 'Scaffold a new NexReel backend resource. Use when adding a new domain table plus repository logic, route handling, and focused tests.'
argument-hint: 'Resource name, fields, and expected API behavior'
---

# New Entity

Use this skill when NexReel needs a genuinely new backend resource, not when extending an existing users/media/playlists/forums flow.

## Current Architecture Constraints

- Active backend code lives under `fastapi/`.
- Product routes are usually added to `fastapi/api/routers/nexreel.py`.
- Shared DB behavior belongs in `fastapi/api/core/nexreel/repository.py`.
- Bootstrap schema lives in `database/schema.sql`.
- Incremental DB changes may also need an Alembic revision under `fastapi/alembic/versions/`.

## Workflow

1. Define the table shape and relationships.
2. Update `database/schema.sql`.
3. Add an Alembic migration if incremental upgrade support is required.
4. Add repository queries and serializers in `fastapi/api/core/nexreel/repository.py`.
5. Add or extend `/v1` endpoints in `fastapi/api/routers/nexreel.py`.
6. Add focused pytest or smoke coverage.

## Design Rules

- Prefer PostgreSQL-native types already used in the repo: `UUID`, `JSONB`, `TIMESTAMPTZ`.
- Preserve current frontend contract patterns instead of inventing a parallel API style.
- Keep the change minimal if the new concept fits an existing domain surface.

## Do Not Assume

- Do not assume per-entity schema modules or CRUD folders exist or should be created.
- Do not scaffold legacy `api/` code.
- Do not introduce JWT or MySQL-era patterns.
