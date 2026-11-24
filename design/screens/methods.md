# Brew methods

**Purpose:** Manage the brew-method list: add a method, rename any method, delete any method (its brews move to "Other"). "Other" can't be renamed or deleted.
**Prototype:** `../prototype/screens/methods.html`

## Layout
`dialog` 560px over the journal (or over the brew form when opened from it) with `modal-backdrop`. Phone: bottom sheet (90% max height).
1. Head: `headline-md` "Brew methods" + muted `body-sm` "Renaming updates every brew that uses the method. Deleting moves those brews to “Other”." Close `icon-button`.
2. Add row: input (placeholder "Add a method, e.g. Chemex", sr-only label "New method name") + `button-primary` "+ Add". Error slot below.
3. Method list (hairline rows, min 60px): 28px method icon (terracotta) · name (`title-md`-weight) with "n brews" below (custom methods add "· added by you") · rename (pencil) and delete (trash) `icon-button`s, aria-labels "Rename X" / "Delete X"; trash turns error color on hover. Order: predefined methods in fixed order, then custom methods alphabetically, then "Other" last.
4. "Other" row: generic cup icon, count, and a lock + "PROTECTED" `label-caps` instead of buttons (tooltip "“Other” can’t be renamed or deleted").
5. Hint `body-sm` muted: "“Other” is always available and catches brews from deleted methods."
6. Actions: `button-secondary` "Done".

## Data shown
| Field | Source/type | Notes |
|---|---|---|
| Method name | string, unique (case-insensitive) | |
| Brew count per method | int | Shown in the row and in the delete confirmation |
| Predefined/custom flag | boolean | Custom rows say "added by you"; both are editable |
| Protected flag | boolean | Only "Other" |

## States
| State | When | What differs |
|---|---|---|
| default | Dialog opened | List as above |
| renaming | Pencil on a row | Row turns ivory, shows a focused input with the current name, ghost "Cancel" + primary "Save". Phone: input full width, buttons below |
| delete-confirm | Trash on a row | Inline error-soft panel under that row: "**Delete “Moka Pot”?** Its 3 brews will move to “Other”. This can’t be undone." + "Keep" / `button-danger` "Delete method" |
| duplicate | Add or rename to an existing name | Field error under the input: "“Pour Over” already exists. Method names must be unique." (input "pour over") |
| added | Add succeeded | New row ("Chemex · 0 brews · added by you") briefly highlighted terracotta-soft; toast "“Chemex” added" |

## Interactions
- Add: Enter or "Add" saves via backend; empty input → "Enter a method name"; duplicate → duplicate state; success → added state, input cleared and refocused.
- Rename: Enter saves, Esc cancels; empty/duplicate names show the inline error under the row input; success → row returns to normal, toast "Renamed to “…”". Every brew using it shows the new name.
- Delete: trash → inline confirm (one at a time); "Delete method" → row removed, toast "“Moka Pot” deleted · 3 brews moved to Other"; Keep closes the confirm. A method with 0 brews still confirms ("No brews use it.").
- If the brew form is open behind and its selected method was deleted, it switches to "Other".
- Done / × / Esc closes; the journal and form reload method data.

## Design decisions
- A dedicated "Manage methods" dialog (from the app header and from the method dropdown) plus quick-add inside the brew form's dropdown.
- Inline rename (Enter saves, Esc cancels) and an inline delete confirmation that states how many brews will move to "Other" — no dialog-on-dialog.
- "Other" shown locked with no actions.
- Method names unique case-insensitively, same rule as brew names (design assumption; the intent doesn't state it — confirm in spec).
- Predefined methods: Espresso, Pour Over, French Press, AeroPress, Moka Pot, Cold Brew, plus Other.
