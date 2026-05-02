---
name: security
description: 'Auth, sessions, passwords, CORS and admin protection rules for NexReel. Use when: editing session cookie flow, password hashing (bcrypt/PBKDF2), CORS allow_origins, X-Admin-Password backup routes, secret handling, or SQL safety / sort allowlists.'
---

# Security & Authentication

Security rules for the active NexReel backend.

## Auth Model

- Authentication is session-based through `SessionMiddleware`.
- Protected routes should rely on `get_current_user()`.
- Do not introduce JWT-based flows unless the task explicitly requires a migration.

## Passwords

- Use the password helpers in `fastapi/api/core/auth.py`.
- Preserve legacy bcrypt verification while new passwords use the current PBKDF2 flow.
- Never log plaintext passwords, hashes, or reset secrets.

## CORS and Cookies

- The frontend uses credentialed requests.
- `allow_origins` must be explicit; wildcard origins are incompatible with cookies.
- Changes to auth must preserve `withCredentials: true` compatibility.

## Admin Operations

- `/db/*` endpoints require `X-Admin-Password`.
- Keep admin password checks centralized rather than duplicating header validation in each route.

## SQL Safety

- Use parameterized SQL only.
- Never interpolate user input into SQL strings.
- Validate any user-controlled sort or filter field against an allowlist before using it in SQL fragments.

## Session Safety

- If a session references a deleted or missing user, clear the session and fail cleanly.
- Avoid storing unnecessary sensitive data in session payloads.

## Review Checklist

- Auth change preserves session cookies.
- No secrets are exposed in logs or error responses.
- Backup and restore routes remain admin-protected.
- SQL stays parameterized.
