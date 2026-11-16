# Applying changes to a customized skill

Check `status` first: `schema` lists the settings that exist, `settings` the current values, and `customizations` the recorded text patches.

## Changing existing settings (no rewrite)

**Pop-ups screen**: ask, then save with `settings set <skill> key=value ...`:

- **booleans**: one AskUserQuestion with `multiSelect: true`, header "Switches". Each option is a setting; ticked means `true`. Put the current state in each description ("now: on").
- **enums**: single choice, one option per value. Use `preview` on the options to show the instruction each level gives the skill.
- **integers**: single choice with up to 4 sensible values from the range; "Other" lets the user type any number.

Up to 4 questions per screen. Then confirm the new values in one short line. There's no diff to approve: the values live in the settings file, not the skill.

**Settings page or panel**: open it as in [settings-screens.md](settings-screens.md). The user changes values there; nothing else to do.

**Settings file screen**: give the path (`status.files.settings`) and say which lines to change. If the user asks you to make the edit, change only the values, keep the comments, then run `settings get <skill>` to check the file is valid.

## A new kind of change

When the user wants something no setting covers:

- **applyMode `settings-file`**: add one more setting. Take the current schema (`schema get`), append the new setting (default = today's behaviour), run `schema set`, then re-insert the block (a `settings-block` change). Its preview shows the new rule. Existing values are kept.
- **applyMode `rewrite`**, or a one-off wording change that makes no sense as a switch: make a `text-patch`.

## Text patches

```json
{
  "changes": [
    {
      "kind": "text-patch",
      "intent": "Only run when I ask for it",
      "find": "exact text copied from the current SKILL.md",
      "replace": "the new text"
    }
  ]
}
```

- `find` must be copied exactly from the current file and appear **once**; include a whole sentence or line.
- Make `replace` distinctive (a full sentence, not a word or two), so the engine can tell later whether the change is still in place.
- `intent` is the user's goal in plain words. It's what lets the change be redone after an update reworded the text.
- To delete text, use `"replace": ""`.

Then:

1. `preview <skill> --file changes.json`. If any `outcomes[].result` is `anchor-not-found` or `anchor-ambiguous`, fix `find` and preview again.
2. Show the `diff`, then AskUserQuestion, header "Approve": "Save this change to <skill>?" Options: **Yes, save it** / **No** / **Change something**.
3. On yes: `apply <skill> --file changes.json`. Confirm in one line and mention `undo`.

## Undo

`undo <skill>` restores the skill and its records from before the most recent change. Repeat to go further back. Show the returned `diff`.
