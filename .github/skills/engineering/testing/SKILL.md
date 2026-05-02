---
name: testing
description: 'Pytest and smoke-test strategy for the NexReel FastAPI backend. Use when: adding/editing tests under fastapi/tests/, writing endpoint regressions, validating auth/session, mocking subprocess backups, or running just smoke / pytest after changes.'
---

# Testing

Testing guidance for the active NexReel backend.

## What To Test

- Endpoint regressions in `fastapi/api/routers/nexreel.py`
- Auth/session behavior in `fastapi/api/core/auth.py`
- Backup route protection and subprocess behavior in `fastapi/api/core/database/backup.py`
- Startup or environment-sensitive flows with targeted smoke checks when pytest coverage is sparse

## Preferred Validation Order

1. Run the narrowest affected pytest file when one exists.
2. If pytest coverage is missing, run a targeted smoke or startup check.
3. Only fall back to broader validation when the change crosses multiple slices.

## Test Style

- Extend existing tests instead of creating overlapping files.
- Prefer contract-focused assertions over implementation-detail assertions.
- Preserve frontend-facing payload shapes when asserting responses.
- Use mocking for subprocess-backed backup operations.

## Commands

- `cd fastapi && ../.venv/bin/python -m pytest tests/ -v`
- `just smoke`

## When Coverage Is Thin

If the backend area has little or no pytest coverage, add a focused regression test if practical. Otherwise run and report the narrowest executable validation you can.
| `../.venv/bin/python -m pytest tests/ -k "test_create"` | Run by name match |
| `../.venv/bin/python -m pytest tests/ -v --tb=short` | Short tracebacks |

## Checklist for Test Quality

- [ ] Each CRUD function has at least one test
- [ ] Each endpoint tests success case + auth required + forbidden role
- [ ] Test data is created inside the test (not dependent on seeds)
- [ ] `db` fixture used for all database operations (rollback isolation)
- [ ] Old-code compatibility verified (response shapes, field names)
- [ ] Edge cases covered: empty lists, missing records (404), duplicate entries
- [ ] Descriptive names: `test_create_user_returns_201`, `test_list_users_requires_auth`
- [ ] Real DB-safe tests reuse seeded catalog rows or use get-or-create helpers for natural keys like countries/localities
