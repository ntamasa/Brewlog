---
intent: ./intent.md
mode: fresh
base_commit: c3e75515db71e6ad6237f422a4c39775ad95ac1b
---

# Design changes: Brewlog

## Summary
Brewlog had no UI, so this is the whole first design: a design system ("ivory editorial luxury", light theme only, designed for 390px phone and 1440px desktop) and six screens. A photographic landing page leads into the journal app page (`brews`), which hosts every other screen as an overlay: the brew form (drawer / bottom sheet), brew detail, the delete confirmation and the brew-methods dialog.

Points the design adds or assumes beyond the intent, to confirm in the spec:
- **Pagination:** the journal shows 12 brews per page with numbered pagination; any search, filter or sort change resets to page 1.
- **Method names unique, ignoring case** (same rule as brew names). The intent doesn't say this.
- **Brew counts per method** are shown in the methods dialog and in the method delete confirmation ("Its 3 brews will move to “Other”").
- **Predefined methods:** Espresso, Pour Over, French Press, AeroPress, Moka Pot, Cold Brew, plus the protected "Other".
- **"Last edited" date** in the edit form's footer, only if the backend provides it; otherwise omitted.
- **Brew detail** screen (full brew incl. untruncated notes) opened by clicking a card; cards clamp notes to 3 lines.
- **Unsaved-changes guard:** closing the form with changes asks inline "Discard changes?".
- **Landing photos** are three Unsplash images stored locally in `design/prototype/assets/` (hero-pour-over.jpg, beans.jpg, cup-notebook.jpg), credited in the landing footer.

## Design system changes
New `design/DESIGN.md` (Google Stitch format) and generated `design/prototype/tokens.css`:
- **Colors (22):** espresso ink `primary` #2B1D16 with `on-primary` ivory, mocha `secondary`, one burnt-terracotta accent `tertiary` #B4532A (+ hover, soft), warm paper neutrals (`neutral`, `surface`, `surface-sunken`, `on-surface`, `on-surface-muted`, `outline`, `outline-strong`), `error` / `error-soft`, roast swatches `roast-light` / `roast-medium` / `roast-dark`, and `scrim`, `backdrop`, `on-scrim` for the landing hero and overlays.
- **Typography (11 scales):** Cormorant Garamond for display and headlines (`display-xl` 88px … `headline-sm` 24px), Inter for UI and data, plus `label-caps` for eyebrows and labels.
- **Shapes, spacing, layout:** 4 radius levels (small, near-square corners), 8px spacing rhythm `xs` 4 … `5xl` 144, content max width 1200px, page margins 48px desktop / 16px phone. Breakpoints: phone < 768px (1 column), tablet 768–1119px (2 columns), desktop ≥ 1120px (3 columns). Hairline borders instead of shadows.
- **Components (33):** `button-primary`(+hover), `button-accent`(+hover), `button-secondary`, `button-ghost`, `button-danger`, `icon-button`, `fab`, `input-field`, `input-field-error`, `field-label`, `field-error`, `chip-filter`, `segmented-option-selected`, `brew-card`, `brew-card-highlight`, `bean-rating`, `roast-swatch-light/medium/dark`, `roast-tag`, `method-icon`, `dialog`, `modal-backdrop`, `drawer`, `bottom-sheet`, `sheet-handle`, `banner-error`, `toast`, `skeleton`, `pagination-current`, `hero-scrim`.
- **Prototype support files:** `prototype/components.css` (component styles built only from tokens.css) and `prototype/icons.js` (fine-line icon sprite: brand mark, bean, a method icon per predefined method, generic cup for custom methods and "Other", UI icons).

## Screens

All screens are new. Screenshots exist for every state at both viewports: `design/screenshots/<screen>.<state>.desktop.png` and `.mobile.png`. The full element-level spec of each screen is in `design/screens/<screen>.md`; the flows between them are in `design/screens/index.md`.

### landing — new
- **After:** `design/screenshots/landing.default.desktop.png`, `design/screenshots/landing.default.mobile.png`
- **Changes:** marketing page, no backend data. Full-viewport photo hero with dark scrim: top nav (brand + "Open journal →"), eyebrow "A private coffee tasting journal", headline "Remember every cup *worth remembering.*", lede, CTAs `button-accent` "Open my journal" and outlined "How it works" (scrolls to #how), desktop-only strip listing the brew fields. Then "What it keeps" (photo with floating caption card + 2×2 features: Log every brew, Find any cup again, Your methods, your words, Private by design), "How it works" (3 numbered steps + photo with an overlapping sample brew card), closing CTA "Your next great cup starts with the last one." with `button-primary` "Open my journal →", footer with photo credits. Brand mark → top of landing; both "Open … journal" links → brews.
- **New data fields:** none (static copy and images).
- **New/changed states:** default.

### brews — new
- **After:** `design/screenshots/brews.<state>.desktop.png` / `.mobile.png` for every state below
- **Changes:** the app page. Sticky app header: brand (→ landing), "Manage methods" (→ methods dialog), "+ Add brew" (desktop; FAB on phone). Page head "Your brews" with live count ("41 brews" / "3 of 41 brews" / "No brews yet"). Toolbar: desktop one row with Search (brew name, case-insensitive contains, debounced ~250ms), Method (All methods + every method), Roast (All roasts / Light / Medium / Dark), Min. rating (Any rating, 2+, 3+, 4+, 5 beans only), Sort (Newest first [default], Oldest first, Highest rated, Lowest rated); phone: Search + "Filters" button with active-filter count badge opening a filter bottom sheet. Removable filter chips + "Clear all" (sort stays). Brew card grid 3/2/1 columns: method icon + method name, ⋮ menu (Edit brew / Delete brew), brew name, "Bean · Origin", bean rating, roast tag, notes clamped to 3 lines or "No tasting notes", date "d MMM yyyy". Card click → brew-detail. Footer "Showing 1–12 of 41" + numbered pagination (phone: ‹ PAGE 1 OF 4 ›). Toast after save/delete.
- **New data fields:** brew list page (12 per page) filtered by search, method, roast, min rating and sorted by date or rating; total and filtered counts; page/page count; list of all methods for the Method filter.
- **New/changed states:** default, filtered, filters-sheet, card-menu, saved, empty, no-results, loading, error.

### brew-form — new
- **After:** `design/screenshots/brew-form.<state>.desktop.png` / `.mobile.png` for every state below
- **Changes:** create/edit form; desktop 520px drawer from the right, phone 90%-height bottom sheet. Title "Log a brew" / "Edit brew", intro "Everything is required except tasting notes.", error banner slot, fields: Brew name (help: must be unique), Bean name | Origin, Brew method (custom select with icons, then "+ Add new method…" and "Manage methods…"), Roast level (segmented Light / Medium / Dark with swatches), Rating (5 bean radios), Date (defaults to today in create, editable), Tasting notes (optional textarea). Sticky foot: "Cancel" + "Add to journal" / "Save changes" (+ "Last edited" in edit, if available). Client validation on submit then per field; backend field errors shown inline on the matching field, other errors in the banner. Inline add-method saves via the backend and selects the new method. Closing with unsaved changes asks inline "Discard changes?" (Keep editing / Discard).
- **New data fields:** brew name, bean name, origin, method id, roast level, rating 1–5, creation date, tasting notes (optional), last edited (optional, display only).
- **New/changed states:** create, edit, method-open, add-method, validation-error, duplicate-name, server-error, saving.

### brew-detail — new
- **After:** `design/screenshots/brew-detail.default.desktop.png` / `.mobile.png`, `design/screenshots/brew-detail.no-notes.desktop.png` / `.mobile.png`
- **Changes:** 640px dialog (phone: bottom sheet) opened by clicking a card: method icon + name, brew name, "Bean · Origin", 2×2 facts (Rating, Roast, Method, Brewed on), full tasting notes keeping line breaks (empty: "No tasting notes yet. Edit this brew to add some."), actions ghost "Delete" (→ brew-delete) and "Edit brew" (→ brew-form edit).
- **New data fields:** none beyond the brew's own fields.
- **New/changed states:** default, no-notes.

### brew-delete — new
- **After:** `design/screenshots/brew-delete.<state>.desktop.png` / `.mobile.png` for every state below
- **Changes:** 480px alert dialog: trash icon, "Delete this brew?", "It will be permanently removed from your journal. This can’t be undone.", summary of the brew (name, method · roast · date), error banner slot, "Keep brew" (initial focus) + `button-danger` "Delete brew". Success: closes, toast "Brew deleted", list reloads on the same page (previous page if it became empty).
- **New data fields:** none.
- **New/changed states:** default, deleting, error.

### methods — new
- **After:** `design/screenshots/methods.<state>.desktop.png` / `.mobile.png` for every state below
- **Changes:** 560px dialog (phone: bottom sheet), opened from the app header or from the brew form's method dropdown. Explainer "Renaming updates every brew that uses the method. Deleting moves those brews to “Other”." Add row (input + "+ Add"). Method list: icon, name, "n brews" (custom: "· added by you"), rename (inline input, Enter saves, Esc cancels) and delete (inline confirm naming how many brews move to "Other"; a method with 0 brews says "No brews use it."). Order: predefined in fixed order, custom alphabetically, "Other" last with a lock and "PROTECTED" instead of actions. Errors: empty name "Enter a method name", duplicate "“Pour Over” already exists. Method names must be unique." Toasts on add, rename, delete. If the brew form behind had the deleted method selected, it switches to "Other".
- **New data fields:** method name (unique, ignoring case), brew count per method, predefined/custom flag, protected flag (only "Other").
- **New/changed states:** default, renaming, delete-confirm, duplicate, added.

Everything is new; there is no earlier UI to keep unchanged.
