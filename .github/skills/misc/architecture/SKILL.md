---
name: Creating ARC42 architecture documentation
description: Creation of architecture documentation following the ARC42 template for NexReel.
when_to_use: When asked to document the active repository architecture, deployment, quality concerns, or system boundaries.
version: 0.0.1
---

# Creating architecture documentation following arc42

## Project Context

Document the active NexReel architecture, not the legacy Node backend.

Current core shape:

- FastAPI backend in `fastapi/`
- PostgreSQL bootstrap schema in `database/schema.sql`
- Docker Compose orchestration in `docker-compose.yml`
- Host-first local development via `justfile`
- Legacy `api/` folder present only for reference unless explicitly requested

## Documentation Rules

- Base architecture statements on the current repository structure.
- Distinguish clearly between active and legacy surfaces.
- Prefer concise diagrams and traceable file references.
- Do not change runtime code when the request is documentation-only.

## Recommended Coverage

- System context for frontend, FastAPI, PostgreSQL, backup service, and external media providers
- Building blocks around `main.py`, routers, repository, config, and database support
- Deployment view for local and containerized workflows
- Cross-cutting concepts: session auth, CORS, backups, environment loading, contract compatibility
- Technical debt and remaining legacy footprint such as the dormant `api/` folder
