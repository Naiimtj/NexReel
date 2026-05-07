---
description: 'Business rules for NexReel. Use when: implementing or changing user flows, followers, media tracking, playlists, forums, messages, Plex data, or frontend-compatible payloads.'
applyTo: 'fastapi/**'
---

# NexReel — Business Logic & Domain Rules

## Main Domains

- `users`: account, avatar, role, region, favorite phrase, notification state, Plex friendship flag.
- `user_followers`: follower/following graph between users.
- `media`, `media_tv`, `media_tv_seasons`, `media_tv_episodes`: tracking of movies and TV progress.
- `playlists`, `playlist_followers`: curated media lists and likes.
- `forums`, `forum_followers`, `messages`: social and discussion layer.
- `plex_data`: sync summary row (movie_count, tv_count, synced_at).
- `plex_movie`: individual Plex movie records, one row per item.
- `plex_tv`: individual Plex TV show records, one row per item.

## Roles

- `DEFAULT_ROLE = 200`: regular authenticated user.
- `ADMIN_ROLE = 999`: elevated admin.
- `SUPERADMIN_ROLE = 9999`: full administrative access.

Only admin-level users should access destructive or operational flows such as backup/restore.

## Auth and Session Rules

- Authentication is session-based, not JWT-based.
- `login_user()` writes `user_id` into `request.session`.
- `get_current_user()` must be used for protected routes.
- The frontend uses `withCredentials: true`, so any auth change must preserve cookie/session compatibility.
- An `api_token` (via `X-User-Token` header) is also accepted as an alternative to the session cookie on all `/v1/*` routes. It is auto-generated on first login. Both auth modes resolve through `get_current_user()`.
- `X-Admin-Password` header remains the only auth mechanism for `/db/*` backup routes — do not add token auth there.

## Plex Sync Rules

- `POST /v1/plex/sync` is admin-only and calls `api/core/plex_sync.py`.
- Sync does a full refresh: TRUNCATE `plex_movie` and `plex_tv`, then bulk INSERT all items fetched from Plex sections (movie=18, tv=10, anime=11, animation=12, documental=15).
- After inserting rows, the single `plex_data` summary row is upserted with updated `movie_count`, `tv_count`, and `synced_at`.
- APScheduler runs the same sync daily at 04:00 (Europe/Madrid) via `main.py` lifespan.
- `GET /v1/plex/movies` and `GET /v1/plex/tv` query `plex_movie`/`plex_tv` tables directly; both support optional `?q=` search parameter.
- Each Plex item row includes `imdb_id`, `tmdb_id`, `tvdb_id` (nullable). Serialized as `imdbId`, `tmdbId`, `tvdbId` in API responses.
- The Plex fetch requests use `includeGuids=1` to ensure the `Guid` array is returned by the Plex server.

## API Contract Compatibility

- Preserve field names already expected by the frontend, even when they mix conventions.
- Multipart form payloads currently use keys like `favoritePhrase` and `avatarURL`; avoid breaking them.
- When returning existing domain objects, preserve the current serialized shape unless the task explicitly includes a contract migration.

## Domain Rules by Area

### Users

- Registration requires unique `email` and `username`.
- Emails and usernames are normalized to lowercase.
- `region` is normalized to uppercase.
- New registrations auto-login the user after creation.

### Followers

- A follow relation is unique per pair.
- Follower lists and following lists must always hydrate user-facing data, not raw row payloads only.

### Movies and TV

- `media` is for one-shot items like movies.
- `media_tv` stores show-level state (seen, pending, repeat, runtime_seen).
- `media_tv_seasons` and `media_tv_episodes` track granular progress.

#### TV Tracking State Model

Row existence IS the state for seasons and episodes:

- **Season row exists** = that season is seen.
- **Episode row exists** = that episode is seen.
- **No row** = not seen.

Only `media_tv` (parent) retains explicit `seen` and `pending` boolean columns.
Seasons and episodes do NOT have a `pending` column.

#### Hierarchy and Consistency Rules

1. **Marking a season as seen**: creates a season row, deletes all episode rows for that season (they become redundant).
2. **Marking the series as seen**: sets parent `seen=true`, creates all season rows, deletes all episode rows.
3. **All episodes of a season marked individually**: backend auto-creates the season row and deletes the episode rows (`_check_season_complete`).
4. **All seasons seen**: backend sets parent `seen=true`, `pending=false`, deletes season and episode rows (`_sync_parent_after_season_change`).
5. **Unmarking one episode** (when season or parent was seen): "explodes" into individual episode rows for every OTHER episode of that season, deletes the season row. If the parent was fully seen, also creates season rows for all OTHER seasons.
6. **Unmarking a season**: deletes season row + its episode rows, then syncs parent.

#### `runtime_seen` Calculation

`media_tv.runtime_seen` is recalculated on every season/episode state change via `_sync_parent_after_season_change`:

- **Fully-seen seasons**: uses `runtime_seasons[season_number]` from the parent JSONB array (which stores `episode_count × per_episode_runtime` for each season index).
- **Individual episode rows** (loose, not yet rolled up into a season): sums each episode's `runtime` field (the per-episode duration, e.g. 23 min).
- **Total**: `sum(runtime_seasons[i] for each seen season) + sum(episode.runtime for each episode row)`.
- **When ALL seasons are seen**: the total is computed from `runtime_seasons` before deleting child rows and marking parent `seen=true`.

This value is returned as `runtime_seen` in the serialized `media_tv` response and used by the frontend to display "Time seen".

#### Read Logic (GET endpoints)

- `GET /episodes/{id}/{season}/{episode}`: checks episode row → season row `seen` → parent `seen`. Returns `{seen: true}` if any level covers it.
- `GET /seasons/{id}/{season}`: checks season row → parent `seen`. Returns synthetic data from parent if parent is fully seen.

#### Seen/Pending Mutual Exclusion (media_update)

- If payload explicitly sends `seen: true` → force `pending = false`.
- If payload explicitly sends `pending: true` → force `seen = false`.
- Only the explicitly sent field wins; the other is derived.
- `vote >= 0` always forces `seen=true, pending=false`.

### Playlists and Forums

- Playlists and forums belong to an author user.
- Default images should be applied when no image upload succeeds.
- Followers/likes are stored in dedicated relation tables, not embedded arrays.

### Messages

- A message belongs either to a user-to-user conversation or to a forum thread.
- Message history ordering should remain chronological by `created_at`.

## Error Handling Rules

- Preserve current public behavior where the frontend depends on it, even if some error texts are in English today.
- Prefer explicit HTTP status codes over silent fallbacks.
- Raise `401` for unauthenticated access, `403` for forbidden actions, `404` for missing resources, and `400` for invalid input.
