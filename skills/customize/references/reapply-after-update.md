# Putting customizations back after an update

An update (or a hand edit) replaced the skill's text, so some customizations are gone. The user shouldn't have to remember what they changed: everything needed is in the record.

## 1. Ask first

`status <skill>` shows `update.lost` (the ids that are gone) and `customizations` (their intents). AskUserQuestion, header "Update":

> <skill> was updated, and N of your changes are no longer in it: <short list of intents>. Put them back?

Options: **Yes, put them back** / **Show me first** / **Not now**.

- **Not now**: stop. The session-start check will remind them next time.

## 2. Preview the exact part

Run `reapply <skill> --dry-run`.

- `restored`: changes that can be put back exactly (and the settings block).
- `alreadyPresent`: changes the update kept.
- `needsRewrite`: changes whose original text the update reworded. Each has its `intent` and the old `find` / `replace`.

If the user chose "Show me first", show the `diff` and ask "Save these?" (Yes / No). If they chose "Yes", you may go ahead without asking again, but still show the `diff` afterwards.

Then run `reapply <skill>` (without `--dry-run`).

## 3. Rewrite what moved

For each item in `needsRewrite`:

1. Read the updated skill file and find the passage that now covers the same topic as the old `find`.
2. Write a `text-patch` that achieves the same `intent` on the **new** wording: `find` is the new exact text, `replace` keeps the update's improvements and applies the user's intent. Don't revert unrelated parts of the update.
3. Put the old id in `replaces`, so the record swaps the old patch for the new one:

```json
{
  "changes": [
    { "kind": "text-patch", "intent": "<same intent>", "find": "<new exact text>", "replace": "<rewritten>" }
  ],
  "replaces": ["c2"]
}
```

4. `preview`, show the `diff` with the intent, and ask (header "Rewrite"): "The update reworded this part. Apply your change '<intent>' to the new wording like this?" Options: **Yes, save it** / **Skip this one** / **Change something**.
5. On yes: `apply`. If skipped, it stays marked "needs putting back" and the user is reminded next session.

If the intent no longer makes sense (the update removed the feature, or already does what the user wanted), say so and offer to stop tracking it. On a yes, run `forget <skill> <id>`; the skill file isn't changed, the change just won't be checked or put back any more.

## 4. Finish

Run `check-updates` and confirm in one line that the skill is back to the user's way (or which changes are still waiting).
