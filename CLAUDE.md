# CLAUDE.md

Read `AGENTS.md` (this repository's rules for the UI and how to check it) and
`design/melta-ui/DESIGN.md` (melta UI) before changing what the editor looks like.

- The melta MCP server can be added for this project: `claude mcp add melta-ui -- npx -y melta-ds-mcp`
  (tools `get_token`, `get_component`, `check_rule`, `check_html`); `check_html` is the same check as
  `python tools/lint_ui.py`.
- Never hand-edit `web/editor/ui.css`: change `ui.src.css` or `ui.js`, then `npm run css`.
