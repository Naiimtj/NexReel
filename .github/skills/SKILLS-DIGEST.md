# Skills Digest

Index of skill guides for NexReel. Skills are organized in mattpocock-style buckets:

- `engineering/` — daily code work (NexReel-specific + general engineering disciplines)
- `productivity/` — workflow tools, not code-specific
- `misc/` — kept around but rarely used

Each `SKILL.md` carries a YAML frontmatter `name` + `description` (with a "Use when…" trigger) so the agent can auto-load the right one. See [productivity/write-a-skill/SKILL.md](productivity/write-a-skill/SKILL.md) for the format.

## NexReel-Specific Skills (`engineering/`)

| Skill                 | Path                              | Summary                                                                                                                                               |
| --------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| API Design            | `engineering/api-design/SKILL.md` | FastAPI router patterns, `/v1` contracts, multipart parsing, response compatibility                                                                   |
| New Entity            | `engineering/new-entity/SKILL.md` | Workflow for adding a new NexReel resource across schema, repository, router, and tests                                                               |
| Database & Migrations | `engineering/database/SKILL.md`   | PostgreSQL schema, `database/schema.sql`, Alembic, repository query patterns                                                                          |
| Docker & Infra        | `engineering/docker/SKILL.md`     | Compose services, `justfile`, local startup, backups, schema bootstrap                                                                                |
| Code Quality          | `engineering/quality/SKILL.md`    | Naming, error handling, serializer discipline, maintainable FastAPI code                                                                              |
| Security & Auth       | `engineering/security/SKILL.md`   | Session auth, password hashing, CORS, admin backup header, secret handling                                                                            |
| Testing               | `engineering/testing/SKILL.md`    | Pytest and smoke-test strategy for the current NexReel backend                                                                                        |
| Frontend              | `engineering/frontend/SKILL.md`   | React/Vite patterns, context, caching (DB + TMDB/IMDB), carousel prefetch, `useImdbApiRating` API, `useCacheInvalidator`, Plex badge, SonarQube rules |

## General Engineering Skills (`engineering/`, imported from mattpocock/skills)

| Skill           | Path                                   | Summary                                                                                       |
| --------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- |
| Diagnose        | `engineering/diagnose/SKILL.md`        | Reproduce → minimise → hypothesise → instrument → fix loop for hard bugs and perf regressions |
| TDD             | `engineering/tdd/SKILL.md`             | Red-green-refactor cycle, vertical slices, integration-style tests                            |
| Grill With Docs | `engineering/grill-with-docs/SKILL.md` | Stress-test a plan against the codebase before coding; sharpens domain language               |

## Productivity (`productivity/`)

| Skill         | Path                                  | Summary                                                              |
| ------------- | ------------------------------------- | -------------------------------------------------------------------- |
| Write A Skill | `productivity/write-a-skill/SKILL.md` | Author or refactor SKILL.md files (frontmatter, structure, triggers) |
| Caveman       | `productivity/caveman/SKILL.md`       | Ultra-compressed answers; cuts token usage ~75% while keeping facts  |

## Misc (`misc/`)

| Skill        | Path                         | Summary                                            |
| ------------ | ---------------------------- | -------------------------------------------------- |
| Architecture | `misc/architecture/SKILL.md` | ARC42-style architecture documentation for NexReel |

## Automatic Skill Routing

| Trigger words / intent                                                  | Required skill(s)                                                         |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| endpoint, router, response, contract, schema, form-data                 | `engineering/api-design`                                                  |
| new table, schema, migration, index, query, PostgreSQL                  | `engineering/database`                                                    |
| docker, compose, justfile, backup, local dev, startup                   | `engineering/docker`                                                      |
| refactor, cleanup, naming, maintainability (backend)                    | `engineering/quality`                                                     |
| auth, session, cookie, password, CORS, secret                           | `engineering/security`                                                    |
| test, pytest, smoke, regression                                         | `engineering/testing`                                                     |
| new feature touching schema + API + tests                               | `engineering/database` + `engineering/api-design` + `engineering/testing` |
| docs, architecture, overview                                            | `misc/architecture`                                                       |
| React, JSX, component, hook, context, page, Tailwind, TMDB, Plex        | `engineering/frontend`                                                    |
| hard bug, "diagnose this", performance regression, intermittent failure | `engineering/diagnose`                                                    |
| user explicitly asks for TDD, red-green-refactor, test-first            | `engineering/tdd`                                                         |
| stress-test a plan / sharpen requirements before coding                 | `engineering/grill-with-docs`                                             |
| write/scaffold a new skill                                              | `productivity/write-a-skill`                                              |
| "caveman mode" / "be brief" / "less tokens"                             | `productivity/caveman`                                                    |

## Enforcement

- For non-trivial tasks, load at least one relevant skill before implementation.
- Combine multiple skills when the task crosses boundaries.
- If no routing is obvious, ask one concise clarification question.
- Include `Skill used: ...` in every substantive response.
- General skills (`diagnose`, `tdd`, `grill-with-docs`, `caveman`) compose with NexReel-specific ones — they do not replace them.
