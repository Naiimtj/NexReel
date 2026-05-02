---
name: quality
description: 'Backend code quality rules for NexReel: naming, error handling, repository discipline, file boundaries, parameterized SQL, FastAPI dependency injection. Use when: refactoring, cleaning up routers/CRUD, reviewing maintainability, or removing legacy/dead code.'
---

# Code Quality

Code quality rules for NexReel backend work.

## General Principles

- Fix root causes instead of layering compatibility hacks when the controlling code path is clear.
- Prefer small, local edits over broad rewrites.
- Preserve public response contracts unless the task explicitly changes them.

## Naming

- Use domain terms consistently: users, followers, playlists, forums, messages, Plex data, movies, TV shows.
- Keep helper names explicit about what they fetch, serialize, or persist.
- Avoid reintroducing stale names from the legacy backend or unrelated projects.

## Repository Discipline

- Reuse helpers in `fastapi/api/core/nexreel/repository.py` instead of duplicating query/serialization logic in routers.
- Keep SQL parameterized and aliases stable.
- Extract small helpers when a route or repository function starts mixing parsing, persistence, and serialization in one block.

## Error Handling

- Raise explicit HTTP errors for user-facing failures.
- Do not swallow database or validation failures silently.
- Keep messages concise and aligned with existing endpoint behavior.

## File Boundaries

- `routers/` decide HTTP behavior.
- `core/nexreel/repository.py` owns shared DB access and serialization.
- `core/database/backup.py` owns operational DB tooling.
- `config/env.py` owns settings loading.

## Cleanup Rules

- Remove stale references to MySQL, JWT-only auth, or legacy `api/` flows when touching guidance or infrastructure.
- Avoid dead imports, commented-out code, and speculative abstractions.

# Good — parameterized

from sqlalchemy import text
db.execute(text("SELECT \* FROM users WHERE status = :status"), {"status": status})

````

### Flush vs Commit

- In CRUD functions, use `db.flush()` to send changes to DB without committing
- Let the caller (router/dependency) handle `db.commit()`
- In tests, the `db` fixture rolls back automatically — `flush()` is sufficient

## FastAPI-Specific

### Use dependency injection

```python
# Bad — importing session directly
from api.core.database.database import SessionLocal
db = SessionLocal()

# Good — FastAPI dependency
from api.dependencies import get_db
@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    ...
````

### Use Pydantic for validation

```python
# Bad — manual validation
@router.post("/users")
def create_user(request: Request):
    body = await request.json()
    if "name" not in body:
        raise HTTPException(400, "name required")

# Good — Pydantic schema
@router.post("/users", response_model=UserRead, status_code=201)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    ...
```

### Query parameter aliases for old-code compatibility

```python
# Always use alias for camelCase frontend params
sort_by: str = Query("last_name", alias="sortBy")
parent_group_id: str | None = Query(None, alias="parentGroupId")
```

## Quality Review Checklist

- [ ] All functions have type hints (parameters + return)
- [ ] No magic numbers or hardcoded strings
- [ ] Constants referenced from `constants.py`
- [ ] Error messages in Spanish
- [ ] No `print()` — use `logging`
- [ ] No empty `__init__.py` files
- [ ] SQL queries use parameterized bindings (no f-string SQL)
- [ ] Import order: stdlib → third-party → project
- [ ] Functions ≤ 30 lines, ≤ 4 parameters
- [ ] No dead code or commented-out blocks

## Frontend Quality

For React/JSX quality rules (SonarQube cognitive complexity, nested ternaries, accessibility, `globalThis`, optional chaining, `img` alt props), see the **frontend** skill at `.github/skills/engineering/frontend/SKILL.md` — section **SonarQube / React Code Quality**.
