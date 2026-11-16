# Changelog

All notable changes are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-11-16

First public release (early version), tested by installing from the public repo and customizing the frontend-design plugin skill.

### Added

- `customize` skill: setup wizard (pop-ups or settings file), first customization, settings changes, text patches, undo, and restoring customizations after updates.
- `sc` engine: `list`, `status`, `config`, `schema`, `settings`, `preview`, `apply`, `undo`, `forget`, `reapply` (with `--dry-run`) and `check-updates` (with `--hook`).
- SessionStart hook that reports customized skills an update changed.
- Support for user, project and plugin skills.
- Settings page: `serve` opens a local page in your default browser (`--no-open` to only print the link) (127.0.0.1, token-protected) with switches and menus for every customized skill. Choices stay a draft until Save; a box takes anything else you want, and `serve --wait` hands the save and that note to Claude, which acts on it in the chat; `/skill-customizer:customize settings` opens it. It changes only setting values, never skill files.
- Settings panel beside the chat (plugin installs): a Claude Code mod with a switch, choice or number field per setting; Claude opens it with the `open_settings_panel` tool, the user with `/skill-settings`.
- With the page, panel or settings file, every key behaviour Claude finds becomes a setting (no ticking pop-up first).
- `overview` command and `settings reset`; the setup wizard offers four screens (pop-ups, settings file, settings page, panel).
- The `customize` skill can customize itself; its previews, approvals, backups and undo can't be switched off.
- `npm run export:public`: builds the public repo's files from an allowlist, refuses on failing checks, uncommitted changes or personal data, and never deletes or pushes.

### Changed

- CI uses actions/checkout and actions/setup-node v7; Dependabot removed (dependencies are updated by hand on main).
- The skill, the settings block and the README also name `/customize`, the command when installed with the skills CLI.

### Security

- The settings section written into a skill names the settings file with a `~/` path, so a project skill committed to git doesn't reveal the user's name or folders.
- Setting texts must be one line without HTML comments or skill-customizer markers, and text patches can't contain the markers, so a schema or patch can't end the managed section early or slip extra instructions into a skill.
- The session-start notice quotes skill names (one line, at most 80 characters), so a skill folder named like an instruction stays a name.
- Reusing a running settings page now requires the page's own answer to the ping, so another program on that port never receives the page's token; tokens are compared in constant time.

### Fixed

- The settings page can be saved with no changes (it tells Claude to keep the settings as they are).
- A deleted backup or a damaged record now gives `BACKUP_MISSING` / `CORRUPT_RECORD` with a clear message instead of an internal error.
- The panel's "can't be shown" message is in plain words.
- A skill that changed while every customization stayed in place (`changed-intact`, e.g. the user's own edit) now has its own route in the skill: re-record it and offer to protect the hand edits, instead of hitting `SKILL_CHANGED`.

- The settings page says a link is missing its token, instead of saying the page stopped.
- Undoing a `reapply` now goes back to "updated, changes lost" instead of marking the skill unchanged, and a further `undo` stops at the update (`SKILL_CHANGED`) instead of restoring the pre-update text over it.

[Unreleased]: https://github.com/manasvimittal-22/skill-customizer/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/manasvimittal-22/skill-customizer/releases/tag/v0.1.0
