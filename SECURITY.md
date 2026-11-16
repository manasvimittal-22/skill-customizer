# Security policy

## What skill-customizer touches

- It **reads** skill files in `~/.claude/skills/`, `<project>/.claude/skills/`, and the folders of installed plugins (from `~/.claude/plugins/installed_plugins.json`).
- It **writes** a skill file only through `apply`, `reapply` or `undo`, which the skill runs only after the user approves a preview. A backup is taken before every write.
- It stores its own data in `~/.claude/skill-customizations/`.
- It makes **no outside network requests**. The optional settings page listens on `127.0.0.1` only, needs a random token on every request, checks the Host header, and can change setting values only, never a skill file. It stops when you press Done or after 30 idle minutes.
- It runs no other programs, except that `serve` starts its own engine in the background for the settings page and opens the page's `http://127.0.0.1` link with the system's own launcher (`rundll32`, `open` or `xdg-open`; `--no-open` skips that), and the panel (plugin installs) runs the bundled engine to read and change settings.

## Reporting a vulnerability

Please don't open a public issue for security problems. Use GitHub's private vulnerability reporting on this repository (Security → Report a vulnerability). You'll get a reply within a week.
