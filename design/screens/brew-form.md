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
   - **Brew method** — custom select (button + listbox): shows the method icon + name (muted "Choose a method" when none is selected). Listbox lists all methods A–Z with "Other" last, with icons (selected = bold + terracotta dot), then a hairline, then "+ Add new method…" and "Manage methods…" in terracotta.
   - **Roast level** — segmented control Light / Medium / Dark, each with its roast swatch; selected = espresso fill, ivory text. Radio group semantics.
   - **Rating** — 5 bean radios, 30px glyphs in 44px targets, filled up to the chosen value; "n of 5" / "Not rated" text beside it.
   - **Date** — input showing "1 Nov 2026" with calendar icon (opens a date picker in which days after today are greyed out and can't be picked); help "Defaults to today. Change it if you’re logging an earlier brew." (create only).
   - **Tasting notes** — textarea (min 120px, 5 rows), label shows "Optional", placeholder "Aroma, acidity, body, finish… and anything you’d change next time." Character counter `body-sm` muted, right-aligned below the textarea ("1,950 / 2,000", tabular figures), shown only once the notes are longer than 1,800 characters; over 2,000 it turns `error` and semibold. Announced politely (`aria-live="polite"`) only when it appears and when it crosses the limit, not on every keystroke.
3. **Foot** (sticky, hairline above): `button-secondary` "Cancel" + `button-primary` "Add to journal" (create) / "Save changes" (edit). No "Last edited" date. Phone: both buttons equal width. In the brew-gone state: `button-secondary` "Close" + `button-primary` "Save as new brew".

**Length limits** (counted after trimming the ends): brew name, bean name and origin at most 100 characters; tasting notes at most 2000. Typing and pasting are never cut off: an over-long value gets the inline error below.

**Field error messages** (same inline slot, one at a time, first match wins):
| Field | Empty | Too long | Other |
|---|---|---|---|
| Brew name | Enter a brew name | Brew name can be at most 100 characters | duplicate: You already have a brew called “<name>”. Brew names must be unique, ignoring capitals. |
| Bean name | Enter a bean name | Bean name can be at most 100 characters | |
| Origin | Enter where the beans are from | Origin can be at most 100 characters | |
| Brew method | Choose a brew method | | deleted: This method no longer exists. Choose another one. |
| Roast level | Choose a roast level | | |
| Rating | Choose a rating from 1 to 5 beans | | |
| Date | Choose a date | | The date can’t be in the future |
| Tasting notes | | Tasting notes can be at most 2000 characters | |

## Data shown
| Field | Source/type | Notes |
|---|---|---|
| Brew name | string, required, max 100, unique case-insensitive | Backend rejects duplicates → field error |
| Bean name | string, required, max 100 | |
| Origin | string, required, max 100 | |
| Brew method | method id, required | From the methods list (A–Z, "Other" last); default none selected in create |
| Roast level | enum Light/Medium/Dark, required | No default in create |
| Rating | int 1–5, required | No default in create |
| Creation date | date, required, not after today | Defaults to today in create; editable in both modes |
| Tasting notes | string, optional, max 2000 | |

## States
| State | When | What differs |
|---|---|---|
| create | "Add brew" | Title "Log a brew"; all empty except date = today; primary "Add to journal" |
| edit | "Edit brew" | Title "Edit brew"; all fields prefilled; primary "Save changes" |
| method-open | Method select opened | Listbox popover under the select (max 320px, scrolls) |
| add-method | "+ Add new method…" chosen | Select replaced by a terracotta-soft box: label "New method name", focused input, `button-primary` "Add", help "It will be saved and selected for this brew.", ghost "Cancel" |
| validation-error | Submit with client-side errors | Banner "3 fields need your attention" with links to each invalid field; each invalid field gets error border + error-soft fill + message with alert icon below ("Enter a brew name", "Enter where the beans are from", "Choose a rating from 1 to 5 beans"); focus moves to the banner |
| one-error | Submit with exactly 1 invalid field | Banner "1 field needs your attention" with one link ("Enter where the beans are from"); only Origin shows the error. Singular for exactly 1, plural otherwise ("3 fields need your attention") |
| duplicate-name | Backend rejects the name (edit or create) | Banner "Couldn’t save your changes — That brew name is already taken" (linked); name field error "You already have a brew called “Kenyan morning”. Brew names must be unique, ignoring capitals." |
| server-error | Non-field server/network failure | Banner "Couldn’t save your brew" + "The Brewlog server didn’t respond. Nothing was lost: your entry is still here, so you can try again." Fields keep their values |
| saving | Request in flight | Primary button busy: spinner + "Saving…" in its espresso fill at 75% (`aria-busy`), disabled; fields disabled; "Cancel" stays enabled |
| add-method-saving | Quick-add "Add" request in flight | As add-method, with "Chemex" in the input: the input is disabled, "Add" is busy (own label, no spinner, 75%, `aria-busy`, disabled), and the primary "Add to journal" is blocked (own label, 75%, disabled). The box's "Cancel" and the drawer "Cancel" stay enabled. On failure the input is enabled again with its value kept and refocused |
| field-limits | Submit with over-long values or a future date (client- or server-side) | Banner "4 fields need your attention" linking each field; inline errors "Brew name can be at most 100 characters", "Origin can be at most 100 characters", "The date can’t be in the future" (date 2 Nov 2026, today 1 Nov), "Tasting notes can be at most 2000 characters" with the counter "2,046 / 2,000" in error color beside it. "Bean name can be at most 100 characters" uses the same slot (not shown) |
| method-gone | Save rejected because the chosen method was deleted meanwhile | Method list reloads; the select shows muted "Choose a method" with error border; field error "This method no longer exists. Choose another one."; banner "Couldn’t save your brew" linking to the method field. Other fields keep their values |
| brew-gone | Saving an edit of a brew that was deleted meanwhile | Title stays "Edit brew"; banner "This brew no longer exists" + "It may have been deleted in another tab. Your changes are still here: save them as a new brew, or close."; fields keep the edited values; foot shows "Close" + primary "Save as new brew". The journal behind refreshes |

## Interactions
- Client validation runs on submit, then live per field on blur/change once the field has been touched. Required fields: name, bean, origin, method, roast, rating, date.
- Backend field errors map to the same inline slots (by field name); errors without a field go to the banner. Banner items link to and focus their field.
- Method select: click/Enter/Space opens; arrows move; Enter selects; Esc closes. "Add new method…" → add-method state; Add saves the method through the backend, adds it to the list and selects it; errors show inline in the box: empty "Enter a method name", too long "Method name can be at most 50 characters", duplicate "“Pour Over” already exists.", server failure "Couldn’t save the method. Try again." (same texts as the methods dialog). Cancel returns to the select.
- "Manage methods…" opens the methods dialog on top; when it closes, the form keeps its values and the method list refreshes (a deleted selected method becomes "Other").
- Rating: click a bean or use arrow keys within the radio group.
- Save success → close drawer/sheet → brews (saved state with toast + highlight).
- Cancel / close / Esc / backdrop click → close. If fields were changed, ask inline in the foot: "Discard changes?" with "Keep editing" / "Discard" (not a browser dialog).
- Focus is trapped in the drawer; on open, focus goes to Brew name; on close, focus returns to the trigger.
- brew-gone: "Save as new brew" creates a new brew from the current form values (all the usual validation, including the unique name) → on success the same as a create (close, toast, highlight); on errors the matching error state. "Close" closes without asking.
- method-gone: choosing a method clears the method error; saving again works as usual.

## Design decisions
- Side drawer on desktop, 90%-height bottom sheet on phone — keeps list context on desktop; native feel on phone.
- Inline per-field errors + a summary banner for non-field server errors; backend errors such as the duplicate name appear inline on the field.
- Inline "+ Add new method" at the end of the method dropdown, plus a link to the full manage-methods dialog.
- Rating input uses the same thin-line beans as the cards.
- Roast as a segmented control with swatches (3 fixed options, faster than a dropdown); method as a select with icons (open-ended list).
- "Everything is required except tasting notes" instead of asterisks on every label — quieter, premium.
- No "Last edited" date in the edit footer — the backend doesn't store it (spec decision).
- Method dropdown sorted A–Z with "Other" last (spec decision); the methods dialog keeps its own order.
- Length limits: typing is never blocked or cut off; over-long values get an inline error, and notes show a counter once past 1,800 characters — no silent truncation of pasted text.
- Future dates are greyed out in the date picker and a typed future date gets an inline error.
- Brew deleted elsewhere while editing: offer "Save as new brew" so the edits aren't lost, plus "Close".
- Busy and blocked buttons (spec decision): a request in flight disables its own button (busy) and the other sender in the drawer (blocked: the primary and quick-add "Add" block each other), both at 75% in their own colours, never Material grey; the quick-add input is disabled while its request runs.
- Chosen method deleted elsewhere: inline error on the method field and a reloaded list, instead of silently switching to "Other".
