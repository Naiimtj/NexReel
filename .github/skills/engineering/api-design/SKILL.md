---
name: api-design
description: 'FastAPI router patterns and endpoint contract rules for NexReel. Use when: adding or editing endpoints, routers, request/response shapes, query/form parsing, status codes, multipart uploads, Swagger metadata, or anything under fastapi/api/routers/.'
---

# API Design

Rules for designing and implementing FastAPI routers and endpoint contracts in the active NexReel backend.

## Active Router Surface

The current backend uses these router boundaries:

| Router       | Prefix    | Purpose                       |
| ------------ | --------- | ----------------------------- |
| `health.py`  | `/health` | readiness and liveness        |
| `backup.py`  | `/db`     | backups, restores, SQL import |
| `nexreel.py` | `/v1`     | main product API              |

New product endpoints should normally be added to `fastapi/api/routers/nexreel.py` unless there is a clear reason to split a separate operational router.

## Registration

Routers are registered in `fastapi/api/main.py`. Keep registration centralized there.

## Request Patterns

- Use `Depends(get_db)` for DB access.
- Use `Depends(get_current_user)` for authenticated product flows.
- Use header-based admin protection only for `/db/*` operations.
- Use `Form(...)` and `UploadFile` for multipart endpoints already used by the frontend.

## Contract Compatibility

- Preserve existing payload shapes expected by the React frontend.
- Do not rename fields casually between snake_case and camelCase when the frontend already depends on mixed naming.
- When updating existing endpoints, prefer extending responses over reshaping them.

## Query Parameters

- Preserve existing query parameter names already consumed by the frontend.
- If a frontend route already sends camelCase, keep supporting it explicitly.
- Validate sort columns against an allowlist before interpolating them into SQL fragments.

## Response Rules

- Use explicit status codes.
- Return `401` for unauthenticated requests, `403` for forbidden actions, `404` for missing resources, and `400` for invalid user input.
- For list endpoints, preserve the existing collection envelope if one already exists for that route.

## Documentation

- Add short `summary` and `description` values when editing or adding public endpoints.
- Keep wording consistent with the product domain: users, playlists, forums, media, TV episodes, Plex data.

- Entity IDs in path: `/user/{user_id}`, `/association/{type}/{group_id}`
- Model type as path param: `/misc/{model_name}` where model_name ∈ {country, locality, occupation}

### CRUD function delegation

Routers should be thin — delegate all business logic to CRUD functions:

```python
@router.get("/{entity_id}")
def get_entity(entity_id: str, db: Session = Depends(get_db), ...):
    entity = crud.get_entity(db, entity_id)
    if not entity:
        raise HTTPException(404, detail="Entidad no encontrada")
    return entity
```

### Swagger / root

The app serves a custom Swagger UI at `GET /` (via `swagger.html` + `/static`). There is no `root_path` set — all routes are served directly on the origin:

- Custom Swagger at `http://localhost:8000/`
- Redoc at `http://localhost:8000/redoc`
- Health check at `http://localhost:8000/health`
- Product API at `http://localhost:8000/v1/*`

Do NOT add `root_path="/api"` — that belongs to the `fastapi-example` project, not NexReel.

## Checklist

- [ ] Router registered in `main.py`
- [ ] Authenticated endpoints use `Depends(get_current_user)`
- [ ] Multipart endpoints use `_parse_form(request)` helper
- [ ] Response shape is compatible with the React frontend
- [ ] Errors use explicit HTTP status codes (400, 401, 403, 404)
- [ ] New endpoints have `summary` and `description`
