# First customization of a skill

A one-time cost per skill. Afterwards, most changes need no rewrite at all.

Read the saved config (`config get`). Its `applyMode` decides the path:

- `settings-file`: steps 1–6 below.
- `rewrite`: steps 1–2, then go straight to text patches in [applying-changes.md](applying-changes.md). There's no schema or settings block.

## 1. Read the skill

Read the `skillFile` from `status`. Work out its **key behaviours that a user might want to switch**, for example "asks before installing", "only runs when asked", "how many options it shows", "which sources it trusts". Aim for 3–8. Prefer behaviours the skill text actually describes; don't invent features.

**Customizing `customize` itself** works like any other skill (changes take effect the next time it loads). Never offer a setting or patch that weakens its Rules: previews, the user's yes before every write, backups and undo always stay.

## 2. Already-made hand edits

If the user says they already edited this skill by hand, or the text clearly contains their edits, offer to protect them: for each one, make a `text-patch` whose `find` is the original wording (ask the user, or say you can't know it) and whose `replace` is the current text. `apply` records changes that are already in place without rewriting anything. If the original wording isn't known, record the intent as a setting instead.

## 3. Let the user pick the settings

**With the settings page, panel or settings file**, skip this step: every key behaviour from step 1 becomes a setting, so the user sees all of them as options on their screen. Say so in one line ("All 6 behaviours become settings; you choose the values on the page.").

**With pop-ups**, AskUserQuestion with `multiSelect: true`, header "Settings":

> Which of these should become settings you can change?

One option per behaviour, label 1–5 words, description saying what it controls. At most 4 options per question and 4 questions per screen; if there are more, use a second screen. Pre-tick nothing.

## 4. Write the schema

For each picked behaviour (every key behaviour, on the page, panel or file screen), write one setting. Keys are snake_case. Choose the type:

- **boolean**: on/off. Give `whenTrue` and/or `whenFalse`: the instruction the skill should follow in that case, written as a direct rule ("Never install a skill without the user's clear yes to that specific skill.").
- **enum**: 2–4 named levels. Each option has `value` and `instruction`.
- **integer**: a number with `min`, `max`, and an `instruction` containing `{value}` ("Show at most {value} options.").

The `default` must match how the skill behaves today, so nothing changes until the user changes a value. Example `schema.json`:

```json
{
  "settings": [
    {
      "key": "ask_before_installing",
      "type": "boolean",
      "description": "Ask before installing a skill",
      "default": false,
      "whenTrue": "Never install a skill without the user's clear yes to that specific skill. Show the exact command first.",
      "whenFalse": "Install the best match when the user asked for an install."
    },
    {
      "key": "options_to_show",
      "type": "integer",
      "description": "How many options to show",
      "min": 1,
      "max": 5,
      "default": 3,
      "instruction": "Show at most {value} options."
    }
  ]
}
```

Run `schema set <skill> --file <schema.json>`. It writes `settings.yaml` with the defaults.

## 5. Choose the starting values

With **Pop-ups**, ask what the user wants now, as in "Changing existing settings" in [applying-changes.md](applying-changes.md), then run `settings set <skill> key=value ...`. With any other screen, skip the questions: the defaults keep today's behaviour, and after step 6 open the user's screen as in [settings-screens.md](settings-screens.md).

## 6. Insert the "read your settings" block

Write `changes.json`:

```json
{ "changes": [{ "kind": "settings-block", "intent": "Read my settings for this skill" }] }
```

1. `preview <skill> --file changes.json`, then show the `diff`.
2. AskUserQuestion, header "Approve": "Add this settings section to <skill>?" Options: **Yes, save it** / **No** / **Change something**.
3. On yes: `apply <skill> --file changes.json`. Then confirm in one line, mention `undo`, and give the settings file path.
