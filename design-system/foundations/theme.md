# Theme Configuration — ODM Poser

> This project's overrides of `design/melta-ui/foundations/theme.md` (melta UI reads a project's
> `design-system/foundations/theme.md` first). Everything not named here is melta's.

## Brand

- Brand name: 立体人形装置 / ODM Poser (Omni-Directional Mannequin Poser)
- Primary color: melta's standard `#2B70EF` (the primary palette is melta's, unchanged)

## Dark mode

- **ON**. The editor keeps its theme switch (auto / light / dark): `html[data-theme="dark"]`, or the
  system's `prefers-color-scheme: dark` while the switch is on auto. Values: melta's dark tokens
  (`foundations/theme.md` dark-tokens), set in `web/editor/ui.src.css`.

## Tech Stack

- CSS: Tailwind CSS 4, generated ahead of time (`npm run css`: `web/editor/ui.src.css` → `web/editor/ui.css`,
  committed). The editor runs without a build: from disk, a static site, offline as an installed app.
- Component: plain JavaScript; melta's recipes are given to the controls by `web/editor/ui.js`.
- Template: HTML (`web/editor/index.html`) and template strings in the modules.

## Sizes

- Controls: melta's S on a mouse (buttons h-8, text-sm fields), M on a finger (`pointer-coarse:`),
  with the 44px hit area on buttons (`after:` pseudo-element) as melta asks.
- Panel text: `text-sm`; hints: `text-xs` (captions, not body text).

## Locale

- ja (日本語), with English through `web/editor/i18n.js`.
