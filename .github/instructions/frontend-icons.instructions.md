---
description: Frontend icon usage rule for NexReel. Use when adding any clickable/icon button or any inline icon in React components under `web/`.
applyTo: 'web/**'
---

# Frontend — Icon Usage Rule (mandatory, ALWAYS apply)

> ⚠️ **Hard rule — no exceptions.** Every icon rendered in the React app
> (under `web/`) **MUST** go through the canonical `BaseIcon` component.
> This applies to plain decorative icons, clickable controls, toggle states,
> and icons inside reusable wrappers. If you find a `<svg>`, an inline SVG
> path, or a `react-icons/*` import being used as the rendered icon in a
> component, it is a bug and must be migrated to `BaseIcon`.

- Path: [web/src/components/base/BaseIcon.jsx](../../web/src/components/base/BaseIcon.jsx)
- Re-exported from: [web/src/components/base/index.js](../../web/src/components/base/index.js)
- Icon registry: [web/src/components/base/icons/index.js](../../web/src/components/base/icons/index.js)

## Required pattern

```jsx
import { BaseIcon } from '../components/base';

// Plain icon (no action)
<BaseIcon icon="close" size="sm" className="fill-grayNR" />

// Clickable icon — pass onClick directly to BaseIcon. NEVER wrap in <button>.
// ALWAYS pass `tooltip` (it is the accessible label and the visible hint).
<BaseIcon
  icon="close"
  size="sm"
  onClick={handleClear}
  tooltip={t('Clear')}
  className="fill-slate-400 transition duration-200 hover:fill-grayNR"
  wrapperClassName="absolute inset-y-0 right-0 flex items-center pr-2"
/>
```

## Canonical reference: how toggle buttons should look

Use [web/src/utils/Buttons/SeenPendingButton.jsx](../../web/src/utils/Buttons/SeenPendingButton.jsx)
as the reference implementation for any "toggleable icon button" (seen/unseen,
pending/no pending, repeat/no repeat, follow/unfollow, like/dislike, etc.).
Key points it demonstrates and that you must replicate:

- A small lookup object maps a logical state to a `BaseIcon` registry key
  (`{ active: 'alarmOutline', inactive: 'alarmFill' }`).
- The component renders a single `<BaseIcon>` — **no `<button>` wrapper**.
- `onClick` is passed directly to `BaseIcon` via the `handle` prop.
- `tooltip` is always provided and is translated with `t(...)`. It doubles as
  the accessible label.
- Color, size, and hover transitions are configured via `BaseIcon` props
  (`color`, `size`, `className`).

When creating a new toggle button (e.g. `RepeatSeenButton`, `LikeButton`,
`FollowButton`), copy the exact shape of `SeenPendingButton`.

## Forbidden

- Do **not** wrap `BaseIcon` in a `<button>` (or any other interactive
  element). `BaseIcon` already handles `onClick` and adds `cursor-pointer`
  automatically. Use the `tooltip` prop for the accessible label.
- Do **not** import icons directly from `react-icons/*` (e.g. `BsXLg`,
  `FaStar`, `BsSearch`, `BsFillCaretDownFill`, `RiMovie2Line`,
  `BiSolidRightArrow`, …) and place them inside JSX as the rendered icon
  for a control.
  - Exception: `react-icons` may only be used inside `BaseIcon`'s own icon
    files in `web/src/components/base/icons/` to build a registry entry.
- Do **not** inline raw `<svg>` markup in components for buttons/controls.
  Add the SVG to `iconRegistry` and use `BaseIcon` instead.
- Do **not** import a hand-rolled SVG component from
  `web/src/components/Icons/` and render it directly anywhere. The files in
  that folder are legacy/dead code. Inline the SVG paths in a new
  `XxxIcon.jsx` under `web/src/components/base/icons/` and register it in
  `iconRegistry`. Consume it via `<BaseIcon icon="..." />`.
- Do **not** create an icon button without a `tooltip`. The tooltip is the
  accessible label for the action — its absence is a bug.

## If the icon does not exist in `iconRegistry`

1. Create a new `XxxIcon.jsx` under [web/src/components/base/icons/](../../web/src/components/base/icons/) following the structure of `CloseIcon.jsx` (inline the SVG paths directly — do **not** import a separate SVG component).
2. Register it in [web/src/components/base/icons/index.js](../../web/src/components/base/icons/index.js) under `iconRegistry` with a lowercase camelCase key.
3. Use it via `<BaseIcon icon="newKey" ... />`.

## Styling reminders (see frontend SKILL)

- `className` → applied to the inner `<svg>` (use `fill-*`, `stroke-*`, `hover:*`, transitions).
- `wrapperClassName` → applied to the outer wrapper (use for layout/positioning, e.g. `absolute inset-y-0 right-0 flex items-center pr-2`).
- For clickable icons, pass `onClick` directly to `BaseIcon` and use the `tooltip` prop as the accessible label. Do not wrap in `<button>`.

## Pre-commit checklist for any new/edited icon usage

- [ ] Rendered through `<BaseIcon>` (no raw `<svg>`, no `react-icons/*` in feature code, no hand-rolled SVG component imported directly).
- [ ] Icon key exists in `iconRegistry`; if new, the file lives under `web/src/components/base/icons/` and is registered with a lowercase camelCase key.
- [ ] Clickable icons receive `onClick` directly (no `<button>` wrapper).
- [ ] Clickable icons have a translated `tooltip` (acts as accessible label).
- [ ] Toggle buttons follow the [SeenPendingButton](../../web/src/utils/Buttons/SeenPendingButton.jsx) shape.

> Skill reference: see the "BaseIcon Component" section in [.github/skills/engineering/frontend/SKILL.md](../skills/engineering/frontend/SKILL.md).
