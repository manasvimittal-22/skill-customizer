# Opening the settings screen

How to show the user their settings on the screen they chose in setup (`config get` → `screen`). Every screen edits only `settings.yaml` values, never a skill file, so none of them needs a diff or approval.

| Screen | What to do |
| --- | --- |
| `popups` | Ask with AskUserQuestion as in "Changing existing settings" in [applying-changes.md](applying-changes.md). |
| `file` | Give the path (`status.files.settings`) and say "Edit the values there and save; the skill picks them up next time it runs." |
| `page` | Follow "The settings page" below. |
| `panel` | Call the tool `mcp__skill-customizer__open_settings_panel` (load it with ToolSearch if it isn't loaded). Say: "The settings are in the panel beside the chat; `/skill-settings` opens it again. Anything a setting doesn't cover, tell me here." |

## The settings page

1. Run `serve --wait` (give the shell call a 10-minute timeout). Right away it opens the page in the user's default browser; tell the user in the same message, before the call, that it's opening, and give the link if `opened` is false. Say: "Pick your choices, write anything else in the box at the bottom, then press Save. I'll pick it up here. (To keep it inside VS Code: Ctrl+Shift+P → Simple Browser: Show, then paste the link.)"
2. The call returns when the user presses Save, with `submission`:
   - `saved`: the skills whose values changed. Confirm them in one short line ("Saved for trial-finder: install_scope → project."). If it's empty and there's no note, the user kept everything as it was: say so in one line and carry on.
   - `note`: what the user typed. If it isn't empty, it's a request: act on it in this chat. Work out which skill it's about (ask with AskUserQuestion if more than one could fit), then follow "A new kind of change" in [applying-changes.md](applying-changes.md): a new setting or a text patch, with the preview and the Approve pop-up. Ask any follow-up question as an AskUserQuestion pop-up, not as plain text.
3. If `submission` is null (no Save within the wait), say the page stays open, and that they can press Save whenever they're ready and then tell you; when they do, run `serve --wait --timeout 1` to collect it.
4. The page stays open after a Save, so the user can change more and save again; each Save needs another `serve --wait` to reach you.

## When a screen isn't available

- **Panel**: the tool only exists when skill-customizer is installed as a plugin (not with `npx skills`), and the panel shows in Claude Code's terminal, desktop app and VS Code extension. If the tool isn't found, say so in one line and open the page instead.
- **Page**: on `PAGE_START_FAILED`, say what `error.message` says and give the settings file path instead.

## Afterwards

The page and the panel show every customized skill at once, and the user may change values there without telling you. Before acting on a skill's settings, run `settings get <skill>` rather than trusting values from earlier in the conversation.
