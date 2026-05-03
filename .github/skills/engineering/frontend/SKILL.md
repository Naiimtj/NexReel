---
name: frontend
description: 'NexReel React/Vite frontend patterns and conventions. Use when: adding or editing React components, pages, context providers, hooks, services, mock data, Tailwind styling, TMDB/IMDB/Plex integrations, media cards, carousels, playlists, forums, or any file under web/src/.'
---

# NexReel Frontend

## Stack

- **React 18** + **Vite** — no StrictMode (removed to avoid double `useEffect` in dev)
- **Tailwind CSS** — all styling via utility classes, no inline styles except `backgroundImage`
- **react-i18next** — all user-facing strings via `useTranslation`
- **react-router-dom v6** — `useNavigate`, `<Link>`, nested routes

## Project Structure

```
web/
├── services/
│   ├── DB/services-db.js       ← FastAPI backend calls (withCredentials: true)
│   ├── TMDB/services-tmdb.js   ← TMDB API calls (with USE_MOCKS guard)
│   ├── IMDB/services-imdb.js   ← IMDB/RapidAPI ratings (with USE_MOCKS guard)
│   └── PLEX/services-plex.js   ← Plex Media Server
├── src/
│   ├── context/                ← Shared state providers
│   ├── components/MediaList/   ← Media card components
│   ├── pages/                  ← Route-level pages
│   ├── utils/                  ← Shared utilities (Carousel, Buttons, etc.)
│   └── assets/image/index.js   ← Central image/icon exports
```

## Context Providers (Provider Tree)

Order in `main.jsx`: `AuthProvider > MediaProvider > PlexProvider > App`

### AuthProvider (`auth-context.jsx`)

- `user` — hydrated from `localStorage` on load (can be stale)
- `onLogin(user)`, `onLogout()`, `onReload()` — `onReload()` fetches fresh from API
- **Warning**: `user.isPlexFriend` from localStorage may be stale; fetch from API when needed

### MediaProvider (`media-context.jsx`)

- Centralizes `GET /v1/medias` — fetches once on login
- Exposes: `mediasUser` (array), `refreshMedias()` (callback)
- **Always use this instead of calling `getAllMedia()` directly in components**

### PlexProvider (`plex-context.jsx`)

- Fetches Plex library only when `user` exists **and** `user.isPlexFriend === true`. Non-Plex friends never trigger the fetch and the four Sets stay empty (so the Plex badge cannot appear for them).
- If `user.isPlexFriend` is stale in `localStorage`, `onReload()` from `AuthContext` re-hydrates it from the API and the effect re-runs.
- Exposes 4 Sets for O(1) lookup:
  - `plexMovieImdbIds`, `plexMovieTmdbIds`
  - `plexTvImdbIds`, `plexTvTmdbIds`
- Sets are empty when user is logged out or not a Plex friend.

## Key Patterns

### Consuming Contexts

```jsx
import { useMediaContext } from '../../context/media-context';
import { usePlexContext } from '../../context/plex-context';
import { useAuthContext } from '../../context/auth-context';

const { mediasUser, refreshMedias } = useMediaContext();
const { plexMovieImdbIds, plexMovieTmdbIds, plexTvImdbIds, plexTvTmdbIds } =
  usePlexContext();
const { user, onReload } = useAuthContext();
```

### Plex Badge Detection (Multi.jsx pattern)

```jsx
const tmdbIdStr = String(id); // id is TMDB id (number), tmdbId in Plex is TEXT
const isMovie = mediaType === 'movie';
const isTv = mediaType === 'tv';
const inPlex =
  (isMovie && imdbID && plexMovieImdbIds.has(imdbID)) ||
  (isMovie && plexMovieTmdbIds.has(tmdbIdStr)) ||
  (isTv && imdbID && plexTvImdbIds.has(imdbID)) ||
  (isTv && plexTvTmdbIds.has(tmdbIdStr));
```

> **Note**: Always convert TMDB id to `String()` before checking `plexMovieTmdbIds`/`plexTvTmdbIds` — the DB stores `tmdb_id` as TEXT.

### DetailsMedia Plex Detection (full logic)

`DetailsMedia.jsx` has its own Plex fetch (does NOT use PlexContext) because it needs a title-based fallback for items Plex hasn't matched to external IDs:

1. `imdb_id` match
2. `tmdbId` match (String)
3. Title/year fuzzy match via `compareStrings` (diacritic-normalizing)

Do not migrate this to PlexContext — the raw arrays and title data are only available inside DetailsMedia.

### Checking User Media

```jsx
const isInMediaUser = mediasUser?.find(
  (f) => Number(f.mediaId) === Number(id) && mediaType === f.media_type,
);
```

- `mediaId` = TMDB id stored as VARCHAR in DB
- Always compare with `Number()` on both sides

### refreshMedias After Mutation

```jsx
const isFirstRender = useRef(true);
useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }
  if (changeSeenPending) refreshMedias();
}, [changeSeenPending]);
```

Use `isFirstRender` ref to skip the first effect run and avoid calling `refreshMedias()` on mount.

## Mock System

```js
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

export async function getSomeTmdbData(id) {
  if (USE_MOCKS) return mockFixture; // Always guard at top of every exported fn
  // real fetch...
}
```

- Fixtures in `web/services/__mocks__/data/`
- Fictional entities: Movie `id=99999`, TV `id=99998`, Person `id=99997`
- **Always preserve the `if (USE_MOCKS)` guard when editing service files**

## Asset Exports

All images/icons exported from `web/src/assets/image/index.js`:

```js
export { default as PlexTile } from './cardsMedia/plex-tile.svg';
```

Import in components:

```js
import { PlexTile, NoImage, star } from '../../assets/image';
```

## Plex SVG Icon

`web/src/assets/image/cardsMedia/plex-tile.svg` — transparent background, yellow arrow only:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <path d="M256 70H148l108 186-108 186h108l108-186z" fill="#e5a00d"/>
</svg>
```

Plex badge usage: `className="absolute top-2 left-2 w-6 h-6 opacity-40 blur-[0.5px] pointer-events-none"`

## Services Layer (`services/DB/services-db.js`)

All calls go to FastAPI via an axios instance with `baseURL = VITE_URL_DB` and `withCredentials: true`.

Key functions:

- `getAllMedia()` → `GET /v1/medias` — **use MediaContext instead of calling directly**
- `getPlexMovies()` → `GET /v1/plex/movies`
- `getPlexTv()` → `GET /v1/plex/tv`
- `getUser()` → fresh user data from API (use when `user` from localStorage may be stale)

## SonarQube / React Code Quality

These rules are enforced by SonarQube for IDE. Violations appear as Problems in VS Code.

### Cognitive Complexity

When a component exceeds ~15 in cognitive complexity (SonarQube limit), extract:

1. **Pure helper functions** outside the component for logic that does not need hooks:
   ```js
   function resolveMediaType(mediaMovie, mediaTv, fallback) {
     if (mediaMovie) return 'movie';
     if (mediaTv) return 'tv';
     return fallback;
   }
   ```
2. **Custom hooks** for groups of related `useEffect` + `useState` blocks:
   ```js
   function useMediaData(mediaType, id, language) {
     const [dataMedia, setDataMedia] = useState({});
     // ...all related effects
     return { dataMedia, imdbID, imdbData };
   }
   ```
3. **Sub-components** for conditionally rendered JSX blocks with internal logic (e.g., `PlexBadge`).

### Nested Ternary Operators

Replace deeply nested ternaries with named helper functions or early-return logic:

```jsx
// Bad
const type = a ? 'movie' : b ? 'tv' : fallback;

// Good
function resolveType(a, b, fallback) {
  if (a) return 'movie';
  if (b) return 'tv';
  return fallback;
}
```

### Constant Truthiness in Logical Expressions

```jsx
// Bad — null is always falsy, || short-circuits to right side anyway
const url = poster ? urlA : null || profile ? urlB : null;

// Good — explicit helper
function resolvePosterUrl(posterPath, profilePath) {
  if (posterPath) return `${base}${posterPath}`;
  if (profilePath) return `${base}${profilePath}`;
  return null;
}
```

### Optional Chaining

```jsx
// Bad
const found = arr && arr.find((f) => f.id === id);

// Good
const found = arr?.find((f) => f.id === id);
```

### Negated Conditions in JSX

```jsx
// Bad — negated condition with ternary
{
  condition !== 'value' ? <A /> : null;
}

// Good — positive && shorthand
{
  condition === 'value' && <A />;
}

// Bad — null check that's always truthy/falsy
{
  x !== null ? x : null;
}

// Good — just render the value
{
  x;
}
```

### `globalThis` vs `window`

```js
// Bad
window.setTimeout(() => { ... }, 3000);

// Good
globalThis.setTimeout(() => { ... }, 3000);
```

### Interactive Elements Accessibility

Never put `onClick` on a plain `<div>` or `<span>`. Use a native `<button>`:

```jsx
// Bad
<div onClick={handleClick}>...</div>

// Also bad — role=button on div is still flagged
<div role="button" tabIndex={0} onClick={handleClick}>...</div>

// Good
<button type="button" onClick={handleClick}>...</button>
```

When structural nesting prevents using `<button>` at the outer level (e.g., a clickable card containing buttons), keep the outer `<div>` handler-free and move navigation into the inner `<button>`.

### `<img>` Alt Props

Every `<img>` must have an `alt` prop:

```jsx
<img src={icon} alt="" />          {/* decorative — empty string */}
<img src={poster} alt={title} />   {/* meaningful — describe content */}
```

## Headless UI Compatibility

### `Menu.Item` children must accept refs

`@headlessui/react`'s `<Menu.Item>` (renderless mode) injects a `ref` into its child. A plain function component will trigger:

> `Warning: Function components cannot be given refs. Did you mean to use React.forwardRef()?`

Wrap the child component with `forwardRef` and forward the ref to the root DOM node:

```jsx
import { forwardRef, useState } from 'react';

const UserNotifications = forwardRef(function UserNotifications(
  { notifications = [], toggleDropdown = () => {} /* defaults stay here */ },
  ref,
) {
  // hooks and handlers unchanged
  return (
    <div ref={ref} className="relative">
      {/* contents */}
    </div>
  );
});

UserNotifications.propTypes = {
  /* ... */
};
export default UserNotifications;
```

Keep `propTypes` and `default export` as before. No change is needed in the parent (`<Menu.Item>` will assign the ref to the root `<div>`).

## DOM Nesting

### No nested `<button>` elements

React warns at runtime: `validateDOMNesting(...): <button> cannot appear as a descendant of <button>`.

When a clickable card uses an outer `<button>` for navigation and also exposes action buttons (delete, seen, pending, etc.), the action buttons must be **siblings** of the outer button, not children. Use absolute positioning to overlay them on top of the card:

```jsx
<div className="relative ...">
  <button type="button" onClick={() => navigate(...)}>
    {/* card body — no nested buttons here */}
  </button>
  {isPlaylist && (
    <button
      type="button"
      className="absolute top-2 right-2 z-50 ..."
      onClick={handleDeletePlaylist}
      aria-label={t('Delete Playlist Icon')}
    >
      <FaTrash />
    </button>
  )}
</div>
```

Same rule applies to `ShowPlaylistMenu` / `SeenPendingButton` rows in `MultiList`/`Multi`/`MultiSmall`.

## Carousel `size` Prop (compact mode)

`Carousel`, `CarouselPersons`, `Multi`, `Credits`, `PlaylistsList` and `ShowPlaylistMenu` accept a `size` prop: `'normal'` (default) or `'small'`.

- `Carousel` / `CarouselPersons` use a `SIZE_CONFIG` table to switch:
  - `cardsPerPage` per breakpoint (more cards per page in `small`).
  - Tailwind grid columns (`gridClass`).
  - Header title (`text-xs md:text-base` vs `text-sm md:text-2xl`).
- They reset `currentPage` to `1` via `useEffect(() => setCurrentPage(1), [info])` so navigating between movies/collections never leaves the user on a now-empty page.
- They forward `size` to the inner card (`Multi` or `Credits`).
- `Multi` shrinks the title and the `Seen`/`Pending` icon sizes when `size === 'small'`.
- `Credits` shrinks poster (`h-16/h-24` vs `h-28/h-40`), placeholder icon, name, and character text.
- `ShowPlaylistMenu` shrinks the trigger text/icon, the dropdown width, and the per-item padding.
- `PlaylistsList` shrinks poster (`70x40`), title (`text-sm line-clamp-1`) and inner padding.

Use `size="small"` from compact contexts like `SearchResults`. Default everywhere else; do not introduce new size variants without extending the `SIZE_CONFIG` tables and the `PropTypes.oneOf([...])` lists.

## ShowPlaylistMenu Toggle Behavior

Clicking a playlist row in `ShowPlaylistMenu`:

- If the media is **not** in that playlist → calls `postPlaylistMedia` (add).
- If the media **is already** in that playlist (rendered with `✓`) → calls `deletePlaylistMedia` (remove).

Both branches share the same post-mutation refresh (`setPlaylistsChange`, `setOpenPlaylistsList(false)`, `setChangeSeenPending`, `onReload()`). Preserve this toggle when touching the component — do not revert to a no-op on the "already added" case.

## Service Layer Refactor Patterns

`services/TMDB/services-tmdb.js` and `services/DB/services-db.js` use small helpers to remove try/catch repetition. **Preserve these helpers and the `USE_MOCKS` guard when editing.**

### TMDB — `fetchTmdb` helper

```js
const paramsKeyLang = (language, extra = {}) => ({
  api_key: APIKEY,
  language,
  ...extra,
});

async function fetchTmdb(label, url, params, fallback = {}) {
  try {
    const { data } = await axios.get(url, { params });
    return data;
  } catch (error) {
    console.error(`TMDB ${label}:`, error?.message ?? error);
    return fallback;
  }
}

export async function getMovie(id, language) {
  if (USE_MOCKS) return mockMovie;
  return fetchTmdb('getMovie', `${URL}/movie/${id}`, paramsKeyLang(language));
}
```

### DB — `safe` + FormData builders

```js
async function safe(label, fn, fallback) {
  try {
    return await fn();
  } catch (error) {
    console.error(`DB ${label}:`, error?.message ?? error);
    return fallback;
  }
}

function buildPlaylistFormData(payload) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
  return fd;
}
```

The axios instance is unwrapped to `response.data` via a single response interceptor — service functions return data, not the axios envelope. Keep `withCredentials: true`.

`getFollowersUser` is intentionally **not** wrapped in `safe`: a 401 there must trigger logout in the caller.

### Plex context — `loadIds` helper

```js
async function loadIds(fetchFn, setImdb, setTmdb) {
  const items = await fetchFn();
  setImdb(new Set(items.map((m) => m.imdb_id).filter(Boolean)));
  setTmdb(new Set(items.map((m) => String(m.tmdb_id)).filter(Boolean)));
}
```

## BaseIcon Component

> **MANDATORY RULE**: Every icon and every clickable icon button in the app MUST use `BaseIcon`. Never render `react-icons/*` components (e.g. `BsXLg`, `FaStar`, `BsSearch`) directly inside a button/control, and never inline raw `<svg>` for icons. If an icon is missing from `iconRegistry`, add a new `XxxIcon.jsx` under `web/src/components/base/icons/` and register it. See also `.github/instructions/frontend-icons.instructions.md`.

`web/src/components/base/BaseIcon.jsx` is the canonical icon component. It renders SVGs from `iconRegistry` and provides built-in tooltip support via an internal `TooltipWrapper`.

### Props

| Prop               | Default          | Notes                                                                                           |
| ------------------ | ---------------- | ----------------------------------------------------------------------------------------------- |
| `icon`             | required         | Key in `iconRegistry`                                                                           |
| `size`             | `'md'`           |                                                                                                 |
| `color`            | `'currentColor'` |                                                                                                 |
| `className`        | `''`             | Applied to the **SVG** element                                                                  |
| `wrapperClassName` | `'inline-block'` | Applied to the **outer wrapper div** (layout/positioning)                                       |
| `onClick`          | —                | Adds `cursor-pointer` automatically                                                             |
| `isClicked`        | `false`          | Forces `cursor-pointer` even without `onClick`                                                  |
| `tooltip`          | —                | If set, renders a tooltip via portal-style `position: fixed`                                    |
| `tooltipPosition`  | `'top'`          | One of: `top`, `bottom`/`down`, `left`, `right`, `topleft`, `topright`, `downleft`, `downright` |
| `tooltipShowDelay` | `100`            | ms before showing                                                                               |
| `tooltipHideDelay` | `0`              | ms before hiding                                                                                |
| `absoluteMode`     | `false`          | Rarely needed — measures `firstElementChild` instead of the wrapper for tooltip coords          |

### Two-wrapper structure (critical)

When `tooltip` is set, `BaseIcon` renders **two nested divs**:

1. **Outer**: `wrapperClassName` — for layout/positioning (e.g. `flex justify-end`, `sticky`, etc.)
2. **Inner**: always `inline-block` — captures `onMouseEnter`/`onMouseLeave` and holds the ref measured by `getBoundingClientRect()`

This separation is intentional: if mouse handlers were on the outer div, they would fire over the entire layout area (e.g., the full flex row) instead of just the icon. The inner `inline-block` div shrinks to fit the SVG, so hover only triggers when the cursor is actually over the icon.

### `className` vs `wrapperClassName`

- **`className`** → goes on the `<svg>`. Use for fill/stroke/transitions/hover effects:
  ```jsx
  className = 'fill-gray-600 transition duration-200 hover:fill-purpleNR';
  ```
- **`wrapperClassName`** → goes on the outer div. Use for positioning/layout:
  ```jsx
  wrapperClassName = 'sticky top-2 z-10 flex justify-end pr-2';
  ```

### Why the `<button>` was removed from `BaseModal`

`BaseIcon` already handles `onClick` (it adds `cursor-pointer` automatically) and provides an accessible label through the `tooltip` prop. **Never wrap `BaseIcon` in a `<button>` or any other interactive element** — pass `onClick` directly to `BaseIcon`. This is the canonical pattern across the app.

### Tailwind `group` pattern with BaseIcon

If you want hover on the parent to change the icon's fill, use Tailwind's `group` pattern correctly:

```jsx
// Bad — group on child, group-hover on parent (does nothing)
<button className="group-hover:fill-purpleNR">
  <BaseIcon icon="close" className="fill-gray-600 group" />
</button>

// Good — group on parent, group-hover on child
<button className="group">
  <BaseIcon icon="close" className="fill-gray-600 group-hover:fill-purpleNR" />
</button>
```

## Refactor Hygiene

- When introducing `uniqueById(list, n)` (or any slicing helper), keep the **pre-slice** array under a named variable so JSX `length` checks still have something to reference (e.g. `directingAll`, `writersAll`, `productionsAll` in `DetailsMedia.jsx`).
- After non-trivial frontend edits, validate with `cd web && npx vite build | tail -8`.

## Common Pitfalls

| Pitfall                                            | Fix                                                                                                                                                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plexMovieIds is not defined`                      | Old variable names — use `plexMovieImdbIds`/`plexMovieTmdbIds`                                                                                                                            |
| Plex badge not showing                             | Convert TMDB `id` to `String()` before Set lookup                                                                                                                                         |
| `isPlexFriend` check blocking fetch                | Field from localStorage may be stale; gate on `user` existence only                                                                                                                       |
| `refreshMedias` in `useEffect` deps                | Omit it from deps array (use `eslint-disable-next-line`)                                                                                                                                  |
| Double fetches in dev                              | StrictMode is removed; do not re-add it                                                                                                                                                   |
| `getAllMedia()` called in component                | Replace with `useMediaContext()`                                                                                                                                                          |
| `Function components cannot be given refs`         | Wrap child of `Menu.Item` (Headless UI) in `forwardRef`                                                                                                                                   |
| `<button> cannot appear as descendant of <button>` | Move inner action buttons out of the outer `<button>`, overlay with absolute positioning                                                                                                  |
| `directing is not defined` after `uniqueById`      | Keep the pre-slice array as a named variable for JSX `length` checks                                                                                                                      |
| Lost try/catch on TMDB/DB call                     | Use `fetchTmdb` / `safe` helpers instead of raw `axios.get` + try/catch                                                                                                                   |
| `USE_MOCKS` guard removed                          | Always keep `if (USE_MOCKS) return ...` at the top of every TMDB/IMDB exported fn                                                                                                         |
| `BaseIcon` tooltip fires outside the icon          | Don't put layout classes (e.g. `flex justify-end`) directly on `className`. Use `wrapperClassName` for layout; the inner `inline-block` div ensures hover only triggers on the SVG itself |
| `BaseIcon` `ml-auto` / positioning doesn't work    | `className` applies to the `<svg>`. Use `wrapperClassName` for layout/positioning instead                                                                                                 |
| Tailwind `group-hover:` not applying               | `group` goes on the **parent**, `group-hover:*` goes on the **child** (you had them swapped)                                                                                              |
