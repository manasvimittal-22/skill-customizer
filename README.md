# skill-customizer

Customize any installed Claude Code skill with clickable options or a settings file, and **keep your changes when the skill updates**.

> **Early version.** It works and is tested, but it's new: if something looks wrong or confusing, please [open an issue](https://github.com/manasvimittal-22/skill-customizer/issues). Every change to a skill is previewed first and can be undone.

Skill updates replace the skill's folder, so hand edits silently disappear. skill-customizer records each change outside the skill (both what you wanted in plain words and the exact text), notices when an update removed something, and puts it back. Where the update reworded the text, Claude reapplies your intent to the new wording and shows you the before and after first.

## Install

**As a Claude Code plugin** (recommended: includes the automatic update check):

```
/plugin marketplace add manasvimittal-22/skill-customizer
/plugin install skill-customizer@skill-customizer
```

**With the skills CLI** (the skill only; it checks for updates each time you use it):

```bash
npx skills add manasvimittal-22/skill-customizer
```

Requires Node.js 22 or newer.

## Use

```
/skill-customizer:customize <skill-name>    customize a skill
/skill-customizer:customize setup           change how customizing works
/skill-customizer:customize status          see customized skills and pending updates
/skill-customizer:customize undo <skill>    undo the last change
```

Installed with the skills CLI, the command is `/customize` instead (same arguments).

`/skill-customizer:customize settings` opens your settings screen for every customized skill at once.

The first time, a short setup asks two questions:

1. **Which screen?** Pop-ups in the chat, a settings file you edit yourself, a settings page in your browser, or a panel beside the chat (`/skill-settings`; plugin install only).
2. **How are changes applied?** The skill reads a small settings file each run (about 100–200 tokens, and changing a setting is instant), or Claude rewrites the skill text.

The first time you customize a skill, Claude reads it, suggests the behaviours worth turning into settings (say "ask before installing" or "how many options to show"), and you tick the ones you want. After that, changing a setting needs no rewrite: flip it in the page or panel, pick from a pop-up, or edit `settings.yaml`. The page and panel only ever change setting values, never a skill's text.

**Every write to a skill is previewed and needs your yes.** A backup is kept, so `undo` always works.

## How it survives updates

```
~/.claude/skill-customizations/<scope>/<skill>/
├── settings.yaml   your values (edit freely)
├── schema.json     which settings exist and what each value does
├── record.json     every change: intent, exact text, fingerprint
├── CHANGES.md      the same, readable
└── backups/
```

At the start of each session, a hook compares each customized skill with its saved fingerprint. It prints nothing (and costs nothing) unless an update removed some of your changes; then Claude offers to put them back.

When an update reworded a part you had changed, Claude applies your change to the new wording and shows you the result before saving. If the update already does what you wanted, it offers to stop tracking that change.

User skills (`~/.claude/skills`), project skills (`.claude/skills`) and skills from other plugins are all supported.

## Privacy

Everything stays on your computer. skill-customizer makes no outside network requests (the settings page listens on 127.0.0.1 only, behind a one-time token); see [SECURITY.md](SECURITY.md) for exactly what it reads and writes.

## License

[MIT](LICENSE)
