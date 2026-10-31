# ODM Poser — notes for AI coding agents

The editor's UI follows **melta UI** (`design/melta-ui`, a git submodule: run
`git submodule update --init` first). Before changing anything you can see, read
`design/melta-ui/DESIGN.md`, then this project's overrides in
`design-system/foundations/theme.md`.

## How the UI is built

- No build is needed to run the editor (it opens from disk, GitHub Pages, the installed app, and
  ComfyUI through ODM-Poser-ComfyUIBridge). The look is `web/editor/ui.css`, **generated** by Tailwind
  CSS 4 from `web/editor/ui.src.css`; commit both. `npm install` once, then `npm run css`
  (`npm run css:watch` while working).
- `web/editor/ui.js` holds melta's class strings, once, and gives every control its recipe by what
  it is (section → card, button → outlined / `class="primary"` → contained / `#modes` → tabs,
  select → wrapped with the chevron, inputs, labels, `.hint`, `.row`, `.btns`, `.grid2`, ...).
  Panels built by the modules or by mods get the same through a MutationObserver. So:
  write plain, semantic markup (`section > h2`, `label`, `button`, `select`, `input`) and **do not
  give controls colours, borders, paddings or fonts** in inline styles or new CSS.
- `web/editor/ui.src.css`: melta's tokens (`@theme`), the light and dark values (the editor keeps
  its theme switch: melta's dark tokens), and the app shell that utilities do not say well
  (split screen, two-screen devices, the canvas views, the camera pad). Show / hide rules there
  are written as "hidden where it does not belong", so a shown element keeps its utility display.
- The canvas reads colours through CSS variables (`--figure`, `--sel`, `--far`, `--stage`, `--warn`,
  ... in `cssVar()`); they map to melta's values in `ui.src.css`.

## Checking

- `python tools/lint_ui.py` opens the editor in a browser (Playwright), takes the page as drawn
  (with every panel the modules build) and runs `melta-lint` on it: the same check as melta's MCP
  `check_html` and CI. It must pass (0 errors). `npm run lint:ui` checks index.html as written.
- After a UI change, also run the behaviour tests you have (panel / view sync, undo / redo, touch).

## What is this repository's own

- Brand: 立体人形装置 / ODM Poser; primary colour melta's standard blue `#2b70ef`.
- Dark mode: ON (melta's dark tokens), switched by `html[data-theme]` or the system.
- Japanese and English: `web/editor/i18n.js` translates text nodes; new strings need entries there.
