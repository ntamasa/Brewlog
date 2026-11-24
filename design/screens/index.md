# Screens

| Screen | Purpose | States |
|---|---|---|
| [landing](landing.md) | Explains Brewlog and leads into the journal | default |
| [brews](brews.md) | All brews as cards, with search, filters, sort and pagination | default, filtered, filters-sheet, card-menu, saved, empty, no-results, loading, error |
| [brew-form](brew-form.md) | Add or edit a brew (drawer on desktop, bottom sheet on phones), incl. inline "add method" | create, edit, method-open, add-method, validation-error, duplicate-name, server-error, saving |
| [brew-detail](brew-detail.md) | One brew with full tasting notes, Edit and Delete | default, no-notes |
| [brew-delete](brew-delete.md) | Confirm the permanent deletion of a brew | default, deleting, error |
| [methods](methods.md) | Add, rename and delete brew methods; "Other" is protected | default, renaming, delete-confirm, duplicate, added |

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
