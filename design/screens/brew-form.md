# Brew form

**Purpose:** Create a new brew or edit an existing one, with client- and server-side validation, and add a new brew method without leaving the form.
**Prototype:** `../prototype/screens/brew-form.html`

## Layout
Over the journal with `modal-backdrop`.
- **Desktop:** `drawer` from the right, 520px wide, full height, hairline left border, floating shadow.
- **Phone:** bottom sheet, 90% viewport height, 4px top corners, `sheet-handle`.

Regions top to bottom:
1. **Head** (hairline below): title `headline-md` "Log a brew" (create) / "Edit brew" (edit), close `icon-button` (aria-label "Close without saving").
2. **Body** (scrolls), 24px gap between fields:
   - Intro `body-sm` muted: "Everything is required except tasting notes."
   - `banner-error` slot (only on errors, `role="alert"`, receives focus).
   - **Brew name** — `input-field`; help "A name only you would recognise, like “Sunday Moka”. Must be unique."
   - **Bean name** | **Origin** — two columns on desktop, stacked on phone. Origin placeholder "Country or region".
   - **Brew method** — custom select (button + listbox): shows the method icon + name. Listbox lists all methods with icons (selected = bold + terracotta dot), then a hairline, then "+ Add new method…" and "Manage methods…" in terracotta.
   - **Roast level** — segmented control Light / Medium / Dark, each with its roast swatch; selected = espresso fill, ivory text. Radio group semantics.
   - **Rating** — 5 bean radios, 30px glyphs in 44px targets, filled up to the chosen value; "n of 5" / "Not rated" text beside it.
   - **Date** — input showing "1 Nov 2026" with calendar icon (opens a date picker); help "Defaults to today. Change it if you’re logging an earlier brew." (create only).
   - **Tasting notes** — textarea (min 120px, 5 rows), label shows "Optional", placeholder "Aroma, acidity, body, finish… and anything you’d change next time."
3. **Foot** (sticky, hairline above): edit only — muted "Last edited 28 Oct 2026" on the left (desktop). `button-secondary` "Cancel" + `button-primary` "Add to journal" (create) / "Save changes" (edit). Phone: both buttons equal width.

## Data shown
| Field | Source/type | Notes |
|---|---|---|
| Brew name | string, required, unique case-insensitive | Backend rejects duplicates → field error |
| Bean name | string, required | |
| Origin | string, required | |
| Brew method | method id, required | From the methods list; default none selected in create |
| Roast level | enum Light/Medium/Dark, required | No default in create |
| Rating | int 1–5, required | No default in create |
| Creation date | date, required | Defaults to today in create; editable in both modes |
| Tasting notes | string, optional | |
| Last edited | datetime | Edit mode footer only (if the backend provides it; otherwise omit) |

## States
| State | When | What differs |
|---|---|---|
| create | "Add brew" | Title "Log a brew"; all empty except date = today; primary "Add to journal" |
| edit | "Edit brew" | Title "Edit brew"; all fields prefilled; primary "Save changes"; "Last edited" in foot |
| method-open | Method select opened | Listbox popover under the select (max 320px, scrolls) |
| add-method | "+ Add new method…" chosen | Select replaced by a terracotta-soft box: label "New method name", focused input, `button-primary` "Add", help "It will be saved and selected for this brew.", ghost "Cancel" |
| validation-error | Submit with client-side errors | Banner "3 fields need your attention" with links to each invalid field; each invalid field gets error border + error-soft fill + message with alert icon below ("Enter a brew name", "Enter where the beans are from", "Choose a rating from 1 to 5 beans"); focus moves to the banner |
| duplicate-name | Backend rejects the name (edit or create) | Banner "Couldn’t save your changes — That brew name is already taken" (linked); name field error "You already have a brew called “Kenyan morning”. Brew names must be unique, ignoring capitals." |
| server-error | Non-field server/network failure | Banner "Couldn’t save your brew" + "The Brewlog server didn’t respond. Nothing was lost: your entry is still here, so you can try again." Fields keep their values |
| saving | Request in flight | Primary button shows spinner + "Saving…" (`aria-busy`); fields disabled |

## Interactions
- Client validation runs on submit, then live per field on blur/change once the field has been touched. Required fields: name, bean, origin, method, roast, rating, date.
- Backend field errors map to the same inline slots (by field name); errors without a field go to the banner. Banner items link to and focus their field.
- Method select: click/Enter/Space opens; arrows move; Enter selects; Esc closes. "Add new method…" → add-method state; Add saves the method through the backend, adds it to the list and selects it; empty or duplicate name shows an inline error in the box ("“Pour Over” already exists."). Cancel returns to the select.
- "Manage methods…" opens the methods dialog on top; when it closes, the form keeps its values and the method list refreshes (a deleted selected method becomes "Other").
- Rating: click a bean or use arrow keys within the radio group.
- Save success → close drawer/sheet → brews (saved state with toast + highlight).
- Cancel / close / Esc / backdrop click → close. If fields were changed, ask inline in the foot: "Discard changes?" with "Keep editing" / "Discard" (not a browser dialog).
- Focus is trapped in the drawer; on open, focus goes to Brew name; on close, focus returns to the trigger.

## Design decisions
- Side drawer on desktop, 90%-height bottom sheet on phone — keeps list context on desktop; native feel on phone.
- Inline per-field errors + a summary banner for non-field server errors; backend errors such as the duplicate name appear inline on the field.
- Inline "+ Add new method" at the end of the method dropdown, plus a link to the full manage-methods dialog.
- Rating input uses the same thin-line beans as the cards.
- Roast as a segmented control with swatches (3 fixed options, faster than a dropdown); method as a select with icons (open-ended list).
- "Everything is required except tasting notes" instead of asterisks on every label — quieter, premium.
