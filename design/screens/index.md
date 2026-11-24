# Screens

| Screen | Purpose | States |
|---|---|---|
| [landing](landing.md) | Explains Brewlog and leads into the journal | default |
| [brews](brews.md) | All brews as cards, with search, filters, sort and pagination | default, filtered, filters-sheet, card-menu, saved, empty, no-results, loading, error |
| [brew-form](brew-form.md) | Add or edit a brew (drawer on desktop, bottom sheet on phones), incl. inline "add method" | create, edit, method-open, add-method, validation-error, duplicate-name, server-error, saving, field-limits, method-gone, brew-gone |
| [brew-detail](brew-detail.md) | One brew with full tasting notes, Edit and Delete | default, no-notes |
| [brew-delete](brew-delete.md) | Confirm the permanent deletion of a brew | default, deleting, error, gone |
| [methods](methods.md) | Add, rename and delete brew methods; "Other" is protected | default, renaming, rename-confirm, rename-saving, rename-error, delete-confirm, delete-reassign, delete-mixed, deleting, delete-error, duplicate, added, save-error, error, gone |

Prototype support files: `prototype/components.css` (component styles built only from tokens.css) and `prototype/icons.js` (fine-line icon sprite: brand mark, beans, method icons, UI icons). Landing photos live in `prototype/assets/` (Unsplash License).

## Flows

- landing → brews: "Open my journal" (hero, closing CTA) or "Open journal" (nav).
- brews → landing: Brewlog logo in the app header.
- brews → brew-form (create): "Add brew" (header, desktop) / FAB (phone) / "Log your first brew" (empty state) → Save → brews (saved: toast + highlighted card).
- brews → brew-detail: click/tap anywhere on a card → "Edit brew" → brew-form (edit) → Save → brews (saved).
- brews → brew-form (edit): card ⋮ menu → "Edit brew".
- brews → brew-delete: card ⋮ menu → "Delete brew" → "Delete brew" → brews (toast "Brew deleted").
- brew-detail → brew-delete: "Delete" → confirm → brews.
- brews → methods: "Manage methods" (header) → Done → brews.
- brew-form → method-open → "Add new method…" → add-method → Add → brew-form with the new method selected.
- brew-form → method-open → "Manage methods…" → methods → Done → back to brew-form.
- brews (phone) → filters-sheet: "Filters" button → "Show n brews" → brews (filtered).
- brews (filtered / no-results) → brews (default): "Clear all" chip action or "Clear search and filters".
- brew-form (edit) → brew-gone on Save when the brew was deleted elsewhere → "Save as new brew" → brews (saved), or "Close" → brews.
- brew-form → method-gone on Save when the chosen method was deleted elsewhere → choose another method → Save.
- brew-delete → gone when the brew was already deleted → "Close" → brews (refreshed).
- methods → error when the list fails to load → "Try again" → default.
- methods (renaming) → Save on a method with brews → rename-confirm → "Rename for all n brews" → default (toast); Cancel / back → renaming with the typed value. 0 brews: Save renames directly.
- methods → trash on a method with brews → delete-reassign → "Delete method" → default (toast "“Moka Pot” deleted · 3 brews reassigned"); "Keep method" / back → default. 0 brews: inline delete-confirm.
- methods → rename or delete of a method already deleted elsewhere → gone (list reloaded, toast).
