# Setup wizard

Asked once; the answers are saved and used for every skill. `/skill-customizer:customize setup` runs it again.

Run `config get` first: `choices` lists which apply modes each screen allows, and `config` shows the current answers (preselect them when re-running).

## Question 1: screen

Use AskUserQuestion (single choice), header "Screen":

> Which screen should customizing use?

| Option | Description |
| --- | --- |
| Pop-ups | Clickable choices right here in the chat. Nothing to set up; each customization uses some Claude tokens. |
| Settings file | Plain `key: value` lines in a file you edit yourself (in VS Code or any editor). Changes cost nothing. |
| Settings page | Every setting of every customized skill as switches and menus in a browser tab, plus a box to describe anything else; press Save and Claude carries on in the chat. Runs only on your computer. |
| Panel beside the chat | The same switches in a panel next to the chat. Needs the plugin install (not `npx skills`). Changes cost nothing. |

## Question 2: how changes are applied

Ask only after question 1, and show only the options `choices` allows for the chosen screen.

With **Pop-ups** (header "Apply"):

> How should your choices reach the skill?

| Option | Description |
| --- | --- |
| Claude updates a settings file (Recommended) | The skill reads a small settings file each run (about 100–200 extra tokens). Changing a setting later is instant and doesn't rewrite the skill. |
| Claude rewrites the skill | No extra cost when the skill runs, and any change is possible, but each change costs Claude tokens and rewrites the skill text. |

With **Settings file**, **Settings page** or **Panel**, there's only one fit, so don't ask. Tell the user: "The skill will read your settings file each time it runs."

## Save

| Screen | Apply | Command |
| --- | --- | --- |
| Pop-ups | settings file | `config set --screen popups --apply settings-file` |
| Pop-ups | rewrite | `config set --screen popups --apply rewrite` |
| Settings file | settings file | `config set --screen file --apply settings-file` |
| Settings page | settings file | `config set --screen page --apply settings-file` |
| Panel | settings file | `config set --screen panel --apply settings-file` |

Confirm in one line ("Saved: pop-ups, with a settings file. Change it any time with `/skill-customizer:customize setup`.") and continue with what the user originally asked for.
