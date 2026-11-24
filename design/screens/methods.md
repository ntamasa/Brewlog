# Brew methods

**Purpose:** Manage the brew-method list: add a method, rename any method, delete any method (each of its brews moves to a method the user picks, "Other" by default). "Other" can't be renamed or deleted.
**Prototype:** `../prototype/screens/methods.html`

## Layout
`dialog` 560px over the journal (or over the brew form when opened from it) with `modal-backdrop`. Phone: bottom sheet (90% max height).
1. Head: `headline-md` "Brew methods" + muted `body-sm` "Renaming updates every brew that uses the method. Deleting moves those brews to “Other”, or to a method you choose." Close `icon-button`.
2. Add row: input (placeholder "Add a method, e.g. Chemex", sr-only label "New method name") + `button-primary` "+ Add". Error slot below. (Hidden in the error state.)
3. Method list (hairline rows, min 60px): 28px method icon (terracotta) · name (`title-md`-weight) with "n brews" below (custom methods add "· added by you") · rename (pencil) and delete (trash) `icon-button`s, aria-labels "Rename X" / "Delete X"; trash turns error color on hover. Order: predefined methods in fixed order, then custom methods alphabetically, then "Other" last.
4. "Other" row: generic cup icon, count, and a lock + "PROTECTED" `label-caps` instead of buttons (tooltip "“Other” can’t be renamed or deleted").
5. Hint `body-sm` muted: "“Other” is always available and catches brews from deleted methods."
6. Actions: `button-secondary` "Done".

**Step views.** Confirming a rename or delete that affects brews replaces the dialog content (same dialog, same size; bottom sheet on phone), never a second dialog. Head: back `icon-button` (chevron-left, "Back to methods") · `headline-md` title · close. Brew lists are hairline rows (min 64px): brew name (`title-md` weight, `body-md`) over "Bean · Origin · d MMM yyyy" (`body-sm` muted), newest first; the list scrolls inside a hairline frame (max 336px desktop, 44vh phone). Actions at the bottom; on phone stacked, primary/danger on top.

- **Rename confirm** (method with ≥1 brew): title "Rename “Pour Over” to “Pour Over (V60)”?"; text "14 brews use this method and will show the new name:" + the brews; `button-secondary` "Cancel" + `button-primary` "Rename for all 14 brews".
- **Delete with reassignment** (method with ≥1 brew): title "Delete “Moka Pot”?"; text "3 brews use this method. Choose where each one goes; any you leave on “Other” move there. Deleting the method can’t be undone."; "Move all brews to" label + select (all other methods A–Z, "Other" last; default "Other"); live summary `body-sm` muted ("10 to Other · 3 to Kalita Wave · 1 to AeroPress", largest group first, `aria-live="polite"`); each brew row has a select on the right (210px; on phone below the info, full width) with the same options, default "Other", aria-label "Move “<brew>” to"; a row moved away from "Other" shows a 6px terracotta dot before its select. `button-secondary` "Keep method" + `button-danger` "Delete method".

**Singular for exactly 1** everywhere: "1 brew" in rows, "1 brew uses this method…", "Rename for 1 brew", "1 to Other".

## Data shown
| Field | Source/type | Notes |
|---|---|---|
| Method name | string, unique (case-insensitive) | |
| Brew count per method | int | Shown in the row and in the rename/delete step views |
| Brews of a method | list: name, bean, origin, date (newest first) | Rename confirm and delete-with-reassignment lists; reassignment sends one target method per brew |
| Predefined/custom flag | boolean | Custom rows say "added by you"; both are editable |
| Protected flag | boolean | Only "Other" |

## States
| State | When | What differs |
|---|---|---|
| default | Dialog opened | List as above |
| renaming | Pencil on a row | Row turns ivory, shows a focused input with the current name, ghost "Cancel" + primary "Save". Phone: input full width, buttons below |
| rename-confirm | Save on a rename of a method with ≥1 brew | Step view as above (example: Pour Over → Pour Over (V60), 14 brews, list scrolls) |
| rename-saving | Rename request in flight | Primary shows spinner + "Renaming…" (`aria-busy`) |
| rename-error | Rename failed on the server/network | `banner-error` "Couldn’t save the method — Nothing was changed. Try again." above the actions; primary retries |
| delete-confirm | Trash on a method with 0 brews | Inline error-soft panel under that row: "**Delete “Kalita Wave”?** No brews use it. This can’t be undone." + "Keep" / `button-danger` "Delete method" |
| delete-reassign | Trash on a method with ≥1 brew | Step view as above, every brew on "Other" (example: Moka Pot, 3 brews), summary "3 to Other" |
| delete-mixed | Some brews moved elsewhere | Example: Pour Over, 14 brews, 4 rows changed (dot), summary "10 to Other · 3 to Kalita Wave · 1 to AeroPress"; list scrolls |
| deleting | Delete request in flight | Danger button spinner + "Deleting…" (`aria-busy`); selects disabled |
| duplicate | Add or rename to an existing name | Field error under the input: "“Pour Over” already exists. Method names must be unique." (input "pour over") |
| added | Add succeeded | New row ("Chemex · 0 brews · added by you") briefly highlighted terracotta-soft; toast "“Chemex” added" |
| error | Method list failed to load | Add row, list and hint are replaced by `banner-error` "We couldn’t load your methods" + "The Brewlog server didn’t respond. Check that the backend is running, then try again." with `button-primary` "Try again" (refresh icon); "Done" stays |
| save-error | Add or rename failed on the server/network | Field error under the add input (or the rename input) "Couldn’t save the method. Try again."; input keeps its value ("Chemex"), error border |
| delete-error | Delete failed on the server/network | Step view stays with the choices kept; `banner-error` "Couldn’t delete the method — Nothing was changed. Try again."; "Delete method" retries. (In the 0-brew inline panel, the text "Couldn’t delete the method. Try again." appears as a field error inside the panel.) |
| gone | Rename or delete answered "not found" (deleted elsewhere) | Any step view or confirm closes, the list reloads without that method, toast "That method no longer exists. The list has been refreshed." The journal behind refreshes too |

**Method name errors** (same slot under the add or rename input): empty "Enter a method name"; longer than 50 characters (after trimming) "Method name can be at most 50 characters"; duplicate "“<existing name>” already exists. Method names must be unique."; server failure "Couldn’t save the method. Try again."

## Interactions
- Add: Enter or "Add" saves via backend; empty input → "Enter a method name"; duplicate → duplicate state; success → added state, input cleared and refocused.
- Rename: Enter / Save validates first (empty, too long, duplicate → inline error under the row input, no step view). Valid and the method has 0 brews → saves directly. Valid with ≥1 brew → rename-confirm. "Rename for all n brews" → saves → back to the list, row shows the new name, toast "Renamed to “…”"; every brew using it shows the new name. Cancel or back → renaming with the typed value kept. Esc in the step view = Cancel.
- Delete: trash on a 0-brew method → inline confirm (one at a time); "Delete method" → row removed, toast "“Kalita Wave” deleted"; Keep closes it. Trash on a method with brews → delete-reassign. "Move all brews to" sets every row's select (rows can still be changed after); the summary updates live. "Delete method" sends the method and every brew's target in one request → back to the list, row removed, counts updated, toast "“Moka Pot” deleted · 3 brews reassigned" (always "reassigned", whatever the targets; "1 brew reassigned" for one). "Keep method" / back / Esc → list, nothing changed.
- Focus: entering a step view moves focus to its title; leaving it returns focus to the row's pencil or trash button.
- If the brew form is open behind and its selected method was deleted, it switches to "Other" (the form's unsaved brew isn't in the reassignment list).
- All toasts show for 4 s.
- Done / × / Esc closes; the journal and form reload method data.
- error: "Try again" reloads the list (back to default, or error again).

## Design decisions
- A dedicated "Manage methods" dialog (from the app header and from the method dropdown) plus quick-add inside the brew form's dropdown.
- Inline rename (Enter saves, Esc cancels); renames and deletes that affect brews are confirmed in a step view inside the same dialog listing every affected brew — no dialog-on-dialog (spec decision: replaces the intent's unconfirmed rename and move-all-to-Other delete).
- Delete lets each brew go to any remaining method, default "Other", with "Move all brews to" plus a live summary; changed rows are marked with a terracotta dot.
- Rename confirmation: declining cancels and changes nothing.
- Delete toast always says "reassigned" (user choice), not the destination.
- A method with 0 brews keeps the quick inline confirm.
- "Other" shown locked with no actions.
- Method names unique case-insensitively, same rule as brew names (confirmed in spec); max 50 characters.
- Predefined methods: Espresso, Pour Over, French Press, AeroPress, Moka Pot, Cold Brew, plus Other (confirmed in spec).
- This dialog keeps its own order (predefined fixed, custom A–Z, Other last); the form dropdown and journal filter use A–Z with Other last.
- Server failures appear inline in the existing slots (add/rename input, delete panel) and a load failure replaces the list with a retry banner.
