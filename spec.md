---
intent: ./intent.md
design: ./design-changes.md
type: feature
base_commit: 784446b281fb2b165321a307af6989c8200d863c
---

# Spec: Brewlog

## Objective
Brewlog is a coffee tasting journal web application for a single coffee drinker, used on a local or private deployment. It lets the user record, review and organize the brews they make, so they remember what they tasted and can find their best brews again. A modern, eye-catching landing page explains the product and leads into the app page, where the user lists, adds, edits, deletes, searches, filters and sorts brews and manages brew methods. Every change is persisted in PostgreSQL through a backend.

## Summary
New greenfield app: an Angular 22 frontend (landing page `/`, journal page `/journal` with overlays for the brew form, brew detail, delete confirmation and methods dialog) and a Spring Boot 4.2 / Java 25 backend with a REST API on PostgreSQL 17. The backend owns validation, uniqueness, filtering, sorting, pagination and method reassignment. Both sides ship with unit, integration and end-to-end tests, Docker images and path-filtered CI.

## Constraints
- Backend Java Spring Boot → Technical design → Backend
- Frontend Angular → Technical design → Frontend
- Database PostgreSQL → Technical design → Data model
- Greenfield (no existing code) → Technical design → Repository and tooling
- Single user, no authentication; deployed only locally or privately → B1, Technical design → Deployment, Out of scope
- Landing and app page responsive on phone and desktop → R42
- Brew fields (name required + unique ignoring case, bean, origin, method from dropdown, roast Light/Medium/Dark, rating 1–5, creation date defaulting to today and editable, optional tasting notes) → B2–B8, R12–R18, R22–R25
- Brew methods: predefined list + "Other"; add by free text, saved and selectable later → B10, B12, R29–R31
- All methods except "Other" can be renamed or deleted → B11, R37
- Renaming updates the method shown on every brew using it → B13, R32, R33 (now confirmed in a step view, from grilling)
- Deleting a method reassigns its brews to "Other" → B14, R34–R36, R40 (now with optional per-brew targets, "Other" by default, from grilling)
- Deleting a brew asks for confirmation and is permanent → B16, R27, R28
- Text search on brew name; filters method, roast, minimum rating; sort by date or rating asc/desc, default newest first; all combine → B17–B20, R5–R10
- Out of scope: authentication/multiple accounts, public deployment, photos, statistics → Out of scope

## Business rules

### B1 — Single private user
There is exactly one user and no authentication; the app runs only on a local or private deployment.

### B2 — Brew fields
A brew has: brew name, bean name, origin, brew method, roast level, rating, creation date (all required) and tasting notes (optional).

### B3 — Text normalisation
Every text value (brew name, bean name, origin, tasting notes, method name, search) is trimmed at both ends before validation and storage. A value of only spaces counts as empty; empty tasting notes are stored as null. (from grilling)

### B4 — Length limits
After trimming: brew name, bean name and origin at most 100 characters, method name at most 50, tasting notes at most 2000. Over-long input is never cut off: it is rejected with an inline error. (from grilling)

### B5 — Unique brew names
Brew names are unique ignoring case. The check excludes the brew itself, so changing only the capitals of a brew's own name is allowed. (from grilling)

### B6 — Rating
The rating is a whole number from 1 to 5.

### B7 — Roast level
The roast level is one of Light, Medium, Dark.

### B8 — Creation date
The creation date defaults to today (the browser's local date) when creating, is editable in create and edit, and may not be after today. The server rejects dates after its own today + 1 day, to tolerate time-zone differences. (from grilling)

### B9 — Insertion order
The time each brew was added is stored but never shown; it only breaks sort ties. Brews have no "last edited" date. (from grilling)

### B10 — Predefined methods
On first start the methods Espresso, Pour Over, French Press, AeroPress, Moka Pot, Cold Brew and the protected "Other" exist. (from grilling)

### B11 — "Other" is protected
"Other" can't be renamed or deleted. Every other method, predefined or custom, can be.

### B12 — Unique method names
Method names are unique ignoring case (so no custom method can be called "other"). The check excludes the method itself, so changing only its capitals is allowed. (from grilling)

### B13 — Renaming a method
A rename changes the method on every brew that uses it. If at least 1 brew uses the method, the user first confirms in a step view listing those brews; declining changes nothing. With 0 brews the rename saves directly. (from grilling; replaces the intent's unconfirmed rename)

### B14 — Deleting a method
Deleting a method moves each of its brews to a method the user picks per brew, "Other" by default; brews left untouched move to "Other". A method with 0 brews is deleted after a simple confirmation. The delete toast always says "reassigned". (from grilling; extends the intent's "reassign to Other")

### B15 — Stale method deletions
When a method is deleted, a chosen target that no longer exists sends the brew to "Other". A listed brew that no longer exists or no longer uses the method is ignored. A brew of the method that wasn't listed goes to "Other". The delete always succeeds and reports the number of brews actually moved. (from grilling)

### B16 — Deleting a brew
Deleting a brew needs a confirmation and is permanent; there is no undo.

### B17 — Search
Search finds brews whose name contains the trimmed search text, ignoring case. The characters % and _ match literally. Empty search means no search. (from grilling)

### B18 — Filters
The filters are method (exact method), roast level (exact) and minimum rating (rating ≥ value: 2, 3, 4 or 5). They combine with each other, with search and with sort (AND). No minimum rating is shown as "Any rating". The phone "Filters" badge counts the active search (non-blank after trimming), method, roast and minimum rating (0–4), is hidden at 0, and never counts sort. (from grilling)

### B19 — Sort
Newest first (default): creation date descending, then most recently added first. Oldest first: date ascending, then earliest added first. Highest rated: rating descending, then newest date, then most recently added. Lowest rated: rating ascending, then newest date, then most recently added. (from grilling)

### B20 — Pagination
The journal shows 12 brews per page. Any change to search, filter or sort goes back to page 1. After a delete, the list reloads on the same page, or on the previous page if the current page became empty. With 7 or fewer pages, the desktop pagination shows every page number; with more than 7, it shows the first page, the last page, the current page ±1 and a non-clickable "…" for each gap, except that a gap of exactly one page shows that page's number. (from grilling)

### B21 — Method order
The brew form's method dropdown and the journal's Method filter list methods A–Z (ignoring case), with "Other" last. The methods dialog lists the predefined methods in the fixed order of B10, then custom methods A–Z, then "Other". A renamed predefined method keeps its place in that order. (from grilling)

### B22 — Method icon
Each predefined method has its own icon, which stays with it after a rename. Custom methods and "Other" use the generic cup. (from grilling)

### B23 — Singular counts
Counts use "brew" for exactly 1 and "brews" otherwise. (from grilling)

### B24 — Toasts
Every toast is shown for 4 seconds. (from grilling)

### B25 — Changes made elsewhere
If a brew was deleted elsewhere (e.g. another tab), saving its edit offers "Save as new brew". A delete of an already-deleted brew reports that it's gone. If the chosen method was deleted, the brew can't be saved until another method is chosen. A method deleted elsewhere is removed from the methods dialog with a toast. In every case the list refreshes. (from grilling)

## Requirements

Example data: journal with 41 brews; today is 1 Nov 2026 in the browser and on the server.

### R1 — Landing page
**Given** the user opens `/`, **when** the page loads, **then** it shows the hero "Remember every cup worth remembering.", the sections "A ledger for the cups you love.", "Brew. Log. Rediscover." and "Your next great cup starts with the last one." with the three local photos and their credits. "Open my journal" (hero and closing CTA) and "Open journal →" navigate to `/journal`, "How it works" scrolls to `#how`, and the brand mark goes to the top of `/`.
- **Rules:** B1
- **Screens:** `landing` (default)

### R2 — Journal default list
**Given** 41 brews, **when** the user opens `/journal`, **then** the count reads "41 brews", 12 cards show page 1 sorted newest first, the footer reads "Showing 1–12 of 41", and pages 1–4 are shown with ‹ disabled. Each card shows the method icon and name, the brew name, "Bean · Origin", the rating as beans, the roast tag, the notes clamped to 3 lines (or "No tasting notes") and the date as "28 Oct 2026".
- **Rules:** B19, B20, B22
- **Screens:** `brews` (default)

### R3 — Empty journal
**Given** 0 brews, **when** `/journal` loads, **then** the count reads "No brews yet", the toolbar is hidden, and the panel "Your journal is waiting" shows the button "+ Log your first brew", which opens the brew form (create).
- **Screens:** `brews` (empty)

### R4 — Loading and load error
**Given** the list request is in flight, **then** 6 skeleton cards show with `aria-busy`. **Given** the list request fails (network or 5xx), **then** the panel "We couldn’t load your brews" / "The Brewlog server didn’t respond. Check that the backend is running, then try again. Your entries are safe." shows with "Try again", which reloads the list (loading, then default or error).
- **Screens:** `brews` (loading, error)

### R5 — Search
**Given** brews "Kenyan Morning", "KENYA AA Batch" and "Sunday Moka", **when** the user types "  kenya " in Search, **then** after 250 ms the list shows the two Kenya brews, the count reads "2 of 41 brews", a search chip "“kenya”" appears, and the URL contains `q=kenya`. **When** the search is "50%", **then** only names containing "50%" literally match. **When** the search is only spaces, **then** no search applies.
- **Rules:** B3, B17, B23
- **Screens:** `brews` (filtered)

### R6 — Filters combine
**Given** 3 brews that are Pour Over, Light and rated 4 or more, **when** the user picks Method "Pour Over", Roast "Light", Min. rating "4+" and Sort "Highest rated", **then** exactly those 3 show, highest rating first. The count reads "3 of 41 brews", the footer reads "Showing 1–3 of 3" with no pagination, there are chips for method, roast and min rating (none for sort), and the phone "Filters" badge reads "3". With the search "kenya" added, the badge reads "4"; with only the sort changed, the badge is hidden. Chip × removes only its filter. "Clear all" resets search and filters but keeps the sort. With exactly 1 match, the count reads "1 of 41 brews" and the phone sheet button reads "Show 1 brew".
- **Rules:** B18, B19, B23
- **Screens:** `brews` (filtered, filters-sheet)

### R7 — Sort and ties
**Given** brews A (1 Nov, rating 4, added first), B (1 Nov, rating 4, added second) and C (30 Oct, rating 5): Newest first shows B, A, C; Oldest first shows C, A, B; Highest rated shows C, B, A; Lowest rated shows B, A, C.
- **Rules:** B9, B19

### R8 — Page reset and URL state
**Given** the user is on page 3, **when** search, any filter or sort changes, **then** page 1 loads. **Given** the URL `/journal?q=kenya&roast=LIGHT&minRating=4&sort=HIGHEST&page=2`, **when** the page is reloaded or reached via Back, **then** the toolbar shows those values and page 2 loads. Paging scrolls to the top of the grid; › is disabled on the last page.
- **Rules:** B20
- **Screens:** `brews` (default, filtered)

### R9 — Invalid list parameters
**Given** `GET /api/brews?roast=FOO` (or `minRating=7`, `minRating=1`, `sort=X`, `page=0`, `methodId=abc`), **then** the API answers 400 with `errors: [{field: "roast", code: "INVALID"}]` (the field named accordingly) and returns no list. **Given** `/journal?roast=FOO&methodId=9` where method 9 doesn't exist, **when** the page loads, **then** the UI removes both params from the URL and loads with All roasts / All methods. **Given** `GET /api/brews?methodId=9` for a nonexistent method, **then** the API returns 200 with `items: []` and `matchingCount: 0`.
- **Rules:** B18

### R10 — Page past the last
**Given** 41 brews, **when** `GET /api/brews?page=9` is called, **then** it returns 200 with `items: []`, `page: 9`, `totalPages: 4`, `matchingCount: 41` and `totalCount: 41`, and the UI then loads page 4 and updates the URL.
- **Rules:** B20

### R11 — No results
**Given** the search "panama natural" matches nothing, **then** the count reads "0 of 41 brews" and the panel "No brews match" says "Nothing in your journal matches “panama natural” with these filters. Try a different name or loosen a filter.". "Clear search and filters" resets search and filters.
- **Screens:** `brews` (no-results)

### R12 — Create a brew
**Given** the form opened via "+ Add brew" (desktop), the FAB (phone) or "+ Log your first brew", **then** the title reads "Log a brew", all fields are empty except Date = "1 Nov 2026", and focus is on Brew name. **When** the user enters name "Kenyan Morning", bean "AA Kiambu", origin "Kenya", method Pour Over, roast Light, rating 5, empty notes and clicks "Add to journal", **then** the API returns 201 with `notes: null`. The form closes, the toast "“Kenyan Morning” saved to your journal" shows for 4 s, the card is highlighted, and the list reloads with the current query. The brew is still there after a backend restart.
- **Rules:** B2, B3, B8, B24
- **Screens:** `brew-form` (create, saving), `brews` (saved)

### R13 — Required fields
**Given** an empty create form except the date, **when** the user clicks "Add to journal", **then** nothing is sent, the banner reads "6 fields need your attention" (with exactly 1 invalid field: "1 field needs your attention") with links to each invalid field, focus moves to the banner, and the field errors read "Enter a brew name", "Enter a bean name", "Enter where the beans are from", "Choose a brew method", "Choose a roast level" and "Choose a rating from 1 to 5 beans". A cleared date gives "Choose a date". After the first submit, a touched field re-validates on blur or change. The API rejects a missing or blank field with 400 `{field, code: "REQUIRED"}` (fields `name`, `beanName`, `origin`, `methodId`, `roast`, `rating`, `brewDate`) and saves nothing.
- **Rules:** B2, B3
- **Screens:** `brew-form` (validation-error, one-error)

### R14 — Trimming
**Given** name "  Kenyan Morning ", bean "   " and notes "   ", **when** saved, **then** the bean gets "Enter a bean name" (API: `beanName` REQUIRED). After fixing the bean, the name is stored as "Kenyan Morning" and the notes as null.
- **Rules:** B3

### R15 — Length limits
**Given** a brew name of exactly 100 characters after trimming, **then** it saves. **Given** 101 characters, **then** the field error reads "Brew name can be at most 100 characters" (API 400 `name` TOO_LONG) and nothing is saved. The same applies to bean name ("Bean name can be at most 100 characters", `beanName`), origin ("Origin can be at most 100 characters", `origin`) and notes at 2000/2001 ("Tasting notes can be at most 2000 characters", `notes`). Typing and pasting are never cut off. The notes counter appears at 1801 characters ("1,801 / 2,000") and turns error-coloured at 2001.
- **Rules:** B4
- **Screens:** `brew-form` (field-limits)

### R16 — Duplicate brew name
**Given** an existing brew "Kenyan Morning", **when** the user saves a new or edited brew named "kenyan morning", **then** the API answers 400 `{field: "name", code: "DUPLICATE"}`. The banner reads "Couldn’t save your changes — That brew name is already taken", the name error reads "You already have a brew called “kenyan morning”. Brew names must be unique, ignoring capitals.", the form keeps its values and nothing is saved. Two parallel saves of the same name never both succeed.
- **Rules:** B5
- **Screens:** `brew-form` (duplicate-name)

### R17 — Rating and roast values
**Given** the API receives `rating` 0 or 6, **then** it answers 400 `rating` OUT_OF_RANGE. **Given** `rating` 1 or 5, **then** it accepts. **Given** `roast` "BOLD", **then** it answers 400 `roast` INVALID. In the form, rating is set by the 5 bean radios ("n of 5" / "Not rated") and roast by the Light/Medium/Dark toggle.
- **Rules:** B6, B7

### R18 — Future date
**Given** the server's today is 1 Nov 2026, **when** the API receives `brewDate` "2026-11-03", **then** it answers 400 `brewDate` FUTURE_DATE. With "2026-11-02" it accepts. In the form, days after the browser's today are disabled in the datepicker, and a typed "2 Nov 2026" gives "The date can’t be in the future".
- **Rules:** B8
- **Screens:** `brew-form` (field-limits)

### R19 — Method gone on save
**Given** the selected method was deleted in another tab, **when** the user saves, **then** the API answers 400 `{field: "methodId", code: "METHOD_NOT_FOUND"}`. The method list reloads, the select shows "Choose a method" with the error "This method no longer exists. Choose another one.", and the banner reads "Couldn’t save your brew". The other fields keep their values and nothing is saved.
- **Rules:** B25
- **Screens:** `brew-form` (method-gone)

### R20 — Server error on save
**Given** the save fails with a network error or 5xx, **then** the banner reads "Couldn’t save your brew" / "The Brewlog server didn’t respond. Nothing was lost: your entry is still here, so you can try again.", the fields keep their values, and no toast shows. While a save is in flight, the primary button shows "Saving…" and the fields are disabled.
- **Screens:** `brew-form` (server-error, saving)

### R21 — Unsaved changes
**Given** the user changed any field, **when** they press Cancel, ×, Esc or the backdrop, **then** the foot asks "Discard changes?" with "Keep editing" (stay) and "Discard" (close, nothing saved). Without changes the form closes at once.
- **Screens:** `brew-form` (create, edit)

### R22 — Edit a brew
**Given** "Kenyan Morning", **when** the user chooses "Edit brew" (card menu or detail), **then** the form titled "Edit brew" shows all values prefilled, with no "Last edited" text. **When** they change the rating to 4 and click "Save changes", **then** `PATCH /api/brews/{id}` is sent with `{"rating": 4}` only. The response is 200 with the full brew, the toast "“Kenyan Morning” saved to your journal" shows and the card is highlighted.
- **Rules:** B2, B9
- **Screens:** `brew-form` (edit), `brews` (saved)

### R23 — Patch semantics
**Given** a PATCH body `{"notes": null}`, **then** the notes are cleared. **Given** `{}`, **then** nothing changes (200). **Given** `{"name": null}` or `{"name": "  "}`, **then** 400 `name` REQUIRED. The merged brew passes the same validation as a create. **Given** the edit form's notes are emptied, **then** the UI sends `"notes": null`.
- **Rules:** B3

### R24 — Own name in different capitals
**Given** a brew "kenyan morning", **when** it is saved as "Kenyan Morning", **then** it saves (200). Renaming the method "moka" to "Moka" works the same way.
- **Rules:** B5, B12

### R25 — Edited brew gone
**Given** the brew being edited was deleted in another tab, **when** the user clicks "Save changes", **then** the API answers 404 `BREW_NOT_FOUND`. The banner reads "This brew no longer exists" / "It may have been deleted in another tab. Your changes are still here: save them as a new brew, or close.", the foot shows "Close" and "Save as new brew", and the journal refreshes. "Save as new brew" POSTs all current values with the usual validation; success behaves like R12. "Close" closes without asking.
- **Rules:** B25
- **Screens:** `brew-form` (brew-gone)

### R26 — Brew detail
**Given** a card is clicked, **then** a dialog (bottom sheet on phone) shows the method, the name, "Bean · Origin", Rating ("5 of 5"), Roast, Method, "Brewed on" and the full notes with their line breaks. Empty notes show "No tasting notes yet. Edit this brew to add some.". "Edit brew" opens R22; "Delete" opens R27. ×, Esc or the backdrop closes it and returns focus to the card.
- **Screens:** `brew-detail` (default, no-notes)

### R27 — Delete a brew
**Given** "Delete brew" in the card menu or "Delete" in the detail, **then** the dialog "Delete this brew?" names the brew ("Pour Over · Light · 28 Oct 2026"), with focus on "Keep brew". **When** the user clicks "Delete brew", **then** `DELETE /api/brews/{id}` returns 204, the dialog closes, the toast "Brew deleted" shows, and the list reloads on the same page. If brew 37 was the only brew on page 4, page 3 loads. "Keep brew", Esc or the backdrop changes nothing.
- **Rules:** B16, B20
- **Screens:** `brew-delete` (default, deleting)

### R28 — Brew delete fails or is gone
**Given** the delete fails with a network error or 5xx, **then** the banner reads "Couldn’t delete this brew — The server didn’t respond, so nothing was removed. Try again in a moment." and "Delete brew" retries. **Given** a 404 `BREW_NOT_FOUND`, **then** the banner reads "This brew no longer exists — It may have been deleted in another tab. Your journal has been refreshed.", the only button is "Close", no toast shows, and the journal refreshes.
- **Rules:** B25
- **Screens:** `brew-delete` (error, gone)

### R29 — Seeded methods and their order
**Given** a fresh database, **then** `GET /api/methods` returns, in this order, AeroPress, Cold Brew, Espresso, French Press, Moka Pot, Pour Over, Other. Each entry has `predefined` true, `protected` true only for Other, `position` 1–6 in the order Espresso, Pour Over, French Press, AeroPress, Moka Pot, Cold Brew (Other 99), `iconKey` (`espresso`, `pour-over`, `french-press`, `aeropress`, `moka-pot`, `cold-brew`, `cup`) and `brewCount`. With a custom "chemex", the dropdown and filter read AeroPress, chemex, Cold Brew, …, Pour Over, Other. The methods dialog reads Espresso, Pour Over, French Press, AeroPress, Moka Pot, Cold Brew, chemex, Other.
- **Rules:** B10, B21, B22
- **Screens:** `methods` (default), `brew-form` (method-open), `brews` (default)

### R30 — Add a method (dialog)
**Given** the methods dialog, **when** the user adds " Chemex ", **then** `POST /api/methods` returns 201 with name "Chemex", `iconKey` "cup", `predefined` false and `brewCount` 0. The row "Chemex · 0 brews · added by you" is highlighted, the toast "“Chemex” added" shows, the input is cleared and refocused, and Chemex appears in the dropdown and filter. Errors (in the slot under the input; nothing saved): empty → "Enter a method name" (API `name` REQUIRED); 51 characters → "Method name can be at most 50 characters" (`name` TOO_LONG; 50 characters is accepted); "pour over" → "“Pour Over” already exists. Method names must be unique." (`name` DUPLICATE); network or 5xx → "Couldn’t save the method. Try again." with the input keeping its value.
- **Rules:** B3, B4, B12, B23, B24
- **Screens:** `methods` (added, duplicate, save-error)

### R31 — Quick-add from the form
**Given** the brew form's method dropdown, **when** the user picks "+ Add new method…", types "Chemex" and clicks "Add", **then** the method is saved (as in R30) and selected for this brew, and the other form values stay. Its errors use the same texts as R30, except that the duplicate reads "“Pour Over” already exists.". "Cancel" returns to the select.
- **Rules:** B12
- **Screens:** `brew-form` (add-method, method-open)

### R32 — Rename a method without brews
**Given** "Chemex" with 0 brews, **when** the user clicks its pencil, types "Chemex Classic" and presses Enter, **then** `PUT /api/methods/{id}` returns 200, the row shows the new name, and the toast "Renamed to “Chemex Classic”" shows. Esc or "Cancel" in the row leaves the name unchanged. Empty, too long and duplicate names show the R30 errors under the row input without sending anything (the API also enforces them).
- **Rules:** B12, B13
- **Screens:** `methods` (renaming, duplicate)

### R33 — Rename a method with brews
**Given** "Pour Over" with 14 brews, **when** the user saves the rename to "Pour Over (V60)", **then** the step view "Rename “Pour Over” to “Pour Over (V60)”?" reads "14 brews use this method and will show the new name:" and lists all 14 (from `GET /api/methods/{id}/brews`, newest first). **When** the user clicks "Rename for all 14 brews", **then** the PUT is sent (showing "Renaming…"), the list returns with the new name, the toast "Renamed to “Pour Over (V60)”" shows, all 14 cards show "Pour Over (V60)", and the icon stays the pour-over icon. "Cancel", back or Esc returns to the row input with "Pour Over (V60)" kept, and nothing changes. With 1 brew the texts read "1 brew uses this method…" and "Rename for 1 brew". A failure shows "Couldn’t save the method — Nothing was changed. Try again.", and the primary button retries.
- **Rules:** B13, B22, B23
- **Screens:** `methods` (rename-confirm, rename-saving, rename-error)

### R34 — Delete a method without brews
**Given** "Kalita Wave" with 0 brews, **when** the user clicks its trash icon, **then** the inline panel reads "Delete “Kalita Wave”? No brews use it. This can’t be undone.". "Delete method" sends `POST /api/methods/{id}/delete` with `{"reassignments": []}`, which returns 200 `{"reassignedBrewCount": 0}`. The row disappears and the toast "“Kalita Wave” deleted" shows. "Keep" closes the panel. A network or 5xx failure shows "Couldn’t delete the method. Try again." in the panel.
- **Rules:** B14
- **Screens:** `methods` (delete-confirm, delete-error)

### R35 — Delete a method with reassignment
**Given** "Moka Pot" with 3 brews, **when** the user clicks its trash icon, **then** the step view "Delete “Moka Pot”?" lists the 3 brews, each set to "Other", with "Move all brews to [Other]" and the summary "3 to Other". **When** they set one brew to AeroPress and click "Delete method", **then** the request body is `{"reassignments": [{brewId, methodId: <Other>}, {brewId, methodId: <Other>}, {brewId, methodId: <AeroPress>}]}` and the response is 200 `{"reassignedBrewCount": 3}`. Moka Pot disappears, the counts update (Other +2, AeroPress +1), the toast reads "“Moka Pot” deleted · 3 brews reassigned" ("1 brew reassigned" for one), and the journal reloads. "Keep method", back or Esc changes nothing. A failure shows "Couldn’t delete the method — Nothing was changed. Try again." with the choices kept. While deleting, the button shows "Deleting…" and the selects are disabled.
- **Rules:** B14, B23, B24
- **Screens:** `methods` (delete-reassign, delete-mixed, deleting, delete-error)

### R36 — Stale delete data
**Given** a delete request for method M where (a) a target method no longer exists, (b) a listed brew no longer exists or no longer uses M, and (c) a brew of M isn't listed, **then** the API answers 200: (a) goes to Other, (b) is ignored, (c) goes to Other, and `reassignedBrewCount` equals the number of brews that used M. **Given** a reassignment that targets M itself, **then** 400 `{field: "reassignments", code: "INVALID"}` and nothing changes.
- **Rules:** B15

### R37 — "Other" is protected
**Given** the methods dialog, **then** "Other" shows a lock and "PROTECTED" instead of rename and delete buttons. **Given** `PUT` or `POST …/delete` on Other's id, **then** the API answers 409 `PROTECTED` and nothing changes.
- **Rules:** B11
- **Screens:** `methods` (default)

### R38 — Method gone in the dialog
**Given** a method deleted in another tab, **when** the user renames it, deletes it or opens its step view (the API answers 404 `METHOD_NOT_FOUND`), **then** any step view or confirm closes, the list reloads without it, the toast "That method no longer exists. The list has been refreshed." shows, and the journal refreshes.
- **Rules:** B25
- **Screens:** `methods` (gone)

### R39 — Methods list fails to load
**Given** `GET /api/methods` fails, **then** the dialog shows "We couldn’t load your methods" / "The Brewlog server didn’t respond. Check that the backend is running, then try again." with "Try again" in place of the add row, list and hint, and "Done" stays.
- **Screens:** `methods` (error)

### R40 — Form open while its method is deleted
**Given** the brew form has "Moka Pot" selected and the user opens "Manage methods…" and deletes Moka Pot, **when** the dialog closes, **then** the form keeps all other values, its method list refreshes and the selection is "Other". "Done", × or Esc closes the dialog, and the journal and form reload method data.
- **Rules:** B14
- **Screens:** `methods` (default), `brew-form` (edit)

### R41 — Not found on the API
**Given** a nonexistent brew id 999, **then** `PATCH /api/brews/999` and `DELETE /api/brews/999` answer 404 `BREW_NOT_FOUND`. **Given** a nonexistent method id 999, **then** `PUT /api/methods/999`, `POST /api/methods/999/delete` and `GET /api/methods/999/brews` answer 404 `METHOD_NOT_FOUND`. A malformed JSON body answers 400 with no field errors, and the UI shows the generic server-error banner of the screen.

### R42 — Responsive layouts
**Given** a 390 px viewport, **then** the landing stacks, the journal shows 1 card column, Search plus a "Filters" button (opening the "Filter & sort" sheet with "Show 3 brews"), the FAB "Add brew" and pagination "‹ PAGE 1 OF 4 ›". The form, detail and methods open as bottom sheets. **Given** 1440 px, **then** the journal shows 3 columns, the toolbar in one row, "+ Add brew" in the header and the form as a 520 px right drawer. At 768–1119 px it shows 2 columns.
- **Screens:** `landing` (default), `brews` (default, filters-sheet), `brew-form` (create), `brew-detail` (default), `methods` (default)

### R43 — Many pages
**Given** 240 brews and a 1440 px viewport, **when** the user is on page 10, **then** the count reads "240 brews", the footer reads "Showing 109–120 of 240" and the pagination reads ‹ 1 … 9 10 11 … 20 ›, where "…" is not clickable. For 20 pages, page 1 shows "1 2 … 20", page 4 shows "1 2 3 4 5 … 20" and page 20 shows "1 … 19 20". **Given** exactly 7 pages, **then** all of 1–7 show with no "…". **Given** a 390 px viewport on page 10 of 20, **then** the pagination reads ‹ "PAGE 10 OF 20" ›.
- **Rules:** B20
- **Screens:** `brews` (many-pages)

### R44 — Minimum rating bean picker
**Given** the phone "Filter & sort" sheet with no minimum rating, **then** 1 bean is filled and the legend reads "Any rating". **When** the user taps bean 4, **then** 4 beans are filled, the legend reads "4+ beans" and the query gets `minRating=4`; bean 5 gives "5 beans only" and `minRating=5`. **When** the user then taps bean 1, **then** `minRating` is removed from the query, 1 bean is filled and the legend reads "Any rating". The beans' screen-reader labels read "Any rating", "At least 2 beans", "At least 3 beans", "At least 4 beans" and "At least 5 beans". `minRating=1` is never sent.
- **Rules:** B18
- **Screens:** `brews` (filters-sheet, filters-sheet-any)

### R45 — Keyboard focus ring
**Given** `/` at 1440 px, **when** the user presses Tab until the hero's "Open my journal" has focus, **then** a 2px solid #FAF6EE ring shows around it with a 2px gap; "How it works" gets the same ring with a 3px gap, and the hero's brand link and "Open journal →" get a 2px solid #FAF6EE outline, offset 2px. **When** focus reaches the closing "Open my journal →", **then** its ring is 2px solid #B4532A with a 2px gap. **When** the user clicks "How it works" with the mouse instead, **then** no ring shows.
- **Screens:** `landing` (default)

## Technical design

### Overview
Three deployables in one repo: `backend/` (Spring Boot REST API, Liquibase-managed PostgreSQL schema), `frontend/` (Angular SPA served by nginx, which proxies `/api` to the backend) and `e2e/` (Playwright). `docker-compose.yml` runs db, backend and frontend. The backend owns all rules; the frontend repeats the field validation for instant feedback and maps error codes to the design's messages.

### Repository and tooling
- `backend/`: Gradle wrapper, Kotlin DSL (`settings.gradle.kts`, `build.gradle.kts`), Java toolchain 25 with the foojay resolver plugin, Spring Boot 4.2. Dependencies: web MVC, data JPA, Liquibase, PostgreSQL driver, Testcontainers PostgreSQL, spring-boot-testcontainers. Spotless with palantir-java-format. Plugin versions, pinned exactly: `org.springframework.boot` 4.2.0, `io.spring.dependency-management` 1.1.7, `com.diffplug.spotless` 8.12.0 (in `build.gradle.kts`), `org.gradle.toolchains.foojay-resolver-convention` 1.0.0 (in `settings.gradle.kts`). `build.gradle.kts` also has `tasks.bootJar { archiveFileName = "brewlog.jar" }` and `tasks.jar { enabled = false }`, so the only jar a build writes is `backend/build/libs/brewlog.jar`.
- `backend/` Gradle wrapper: Gradle 9.9.2. `backend/gradle/wrapper/gradle-wrapper.properties` has `distributionUrl=https\://services.gradle.org/distributions/gradle-9.9.2-bin.zip` and `distributionSha256Sum=971fcd7150ca4ba04852c0b2ca0d2d0ab9468e14b03473eab19528809914c76b`; its other lines stay as the wrapper task writes them. There is no `gradle` on PATH, so the wrapper is made with the official distribution: download `https://services.gradle.org/distributions/gradle-9.9.2-bin.zip` to a temp dir outside the repo, check that its SHA-256 equals the published `gradle-9.9.2-bin.zip.sha256` (the value above), unzip it, run its `bin/gradle` (`bin\gradle.bat` in PowerShell) `wrapper --gradle-version 9.9.2 --distribution-type bin --gradle-distribution-sha256-sum 971fcd7150ca4ba04852c0b2ca0d2d0ab9468e14b03473eab19528809914c76b` in `backend/`, then delete the temp dir. Result: `./gradlew --version` prints `Gradle 9.9.2`, and `backend/gradle/wrapper/gradle-wrapper.jar` has the SHA-256 `621008afc4f5d59357fcf06ffa644dd5aade5e091bdc363742710445f73cdaf8` (published `gradle-9.9.2-wrapper.jar.sha256`). `backend/gradlew` is committed executable (`git update-index --chmod=+x backend/gradlew`).
- `backend/.gitattributes`: `/gradlew text eol=lf`, `*.bat text eol=crlf`, `*.jar binary`.
- `.nvmrc` (root): `24`, the single source of the Node.js major for CI.
- `frontend/`: Angular 22 (`npx @angular/cli@22 new`), standalone components, zoneless, SCSS, Vitest. `package.json` `engines.node`: `^24.15.0`. Dependencies: `@angular/material`, `@angular/cdk`, `@angular/material-date-fns-adapter`, `date-fns`, `@ngrx/signals`, angular-eslint, Prettier. Scripts: `start` (with `proxy.conf.json` sending `/api` to `http://localhost:8080`), `test`, `lint`, `format`, `format:check`, `build`, `icons` (`node scripts/build-icons.mjs`, UI implementation → Icon build script). `typescript-eslint` is pinned exactly at `8.74.0`, the version of the `@typescript-eslint/*` packages `angular-eslint` 22.8.0 already uses (8.72.2 pulls a minimatch with advisory GHSA-g3hv-75wg-m249).
- Dependency advisories: `npm audit` reports 0 vulnerabilities in `frontend/` and in `e2e/`, dev dependencies included; CI enforces it with `npm audit --audit-level=moderate` (CI). (from grilling)
- `frontend/` scaffold: every file `ng new` generates stays as generated, except that `frontend/README.md` and `frontend/src/app/app.spec.ts` are deleted and the root `App` (`frontend/src/app/app.ts`, `app.html`) renders only `<router-outlet />`, with no `title`. The router tests live in `frontend/src/app/app.routes.spec.ts`. After scaffolding and these edits, `npm run format` runs once so every file passes `format:check`.
- `frontend/.prettierrc`: the generated file (`printWidth` 100, `singleQuote` true, `*.html` → `angular` parser) plus `"endOfLine": "auto"`. There is no other Prettier config file. `frontend/.prettierignore` holds the single line `src/styles/tokens.css`, so `format` and `format:check` skip that file.
- `e2e/`: own `package.json` with dev dependencies `"@playwright/test": "1.65.1"` (exact) and `"typescript": "~6.0.2"` (the frontend's range), and `engines.node`: `^24.15.0`; `playwright.config.ts` with projects `desktop` (1440×900) and `phone` (390×844), baseURL `http://localhost:8081`; `e2e/tsconfig.json`, for the editor only (no `typecheck` script, no CI step): `compilerOptions` `"target": "ES2022"`, `"module": "preserve"`, `"moduleResolution": "bundler"`, `"strict": true`, `"noEmit": true`, `"skipLibCheck": true`, and `"include": ["playwright.config.ts", "tests/**/*.ts"]`, nothing else. `skipLibCheck` stays `true`: Playwright's type declarations use Node types (`fs`, `Buffer`) and there is no `@types/node`.
- `.env.example`: add `DB_URL`, `DB_USER`, `DB_PASSWORD`.
- `README.md` (root, new): under the `# Brewlog` title the one intro line "Brewlog is a single-user coffee tasting journal: an Angular 22 frontend and a Spring Boot 4.2 backend on PostgreSQL 17, for local or private deployment.", then the prerequisites below, the run and test commands (`docker compose up -d --build`; `./gradlew spotlessCheck test` in `backend/`; `npm start`, `npm test`, `npm run lint`, `npm run format:check`, `npm run build` in `frontend/`; `npx playwright install chromium` and `npx playwright test` in `e2e/` against the running compose stack), and a link to `docs/business-rules.md`.

### Prerequisites
- Node.js 24, at least 24.15.0 (Angular CLI 22 refuses older versions), for local frontend and e2e work. CI, the frontend Docker build and e2e use the same major.
- Docker Desktop installed and running: backend tests (Testcontainers), `docker compose` and e2e need its engine.
- JDK 25 doesn't have to be installed: the Gradle toolchain downloads it (foojay).

### Data model
Liquibase: `backend/src/main/resources/db/changelog/db.changelog-master.yaml` includes `001-init.sql` (one changeset, `--changeset brewlog:001-init`) and `002-seed-methods.sql` (one changeset, `--changeset brewlog:002-seed-methods`), both formatted SQL starting with `--liquibase formatted sql`.
- `brew_method`: `id BIGINT GENERATED ALWAYS AS IDENTITY PK`, `name VARCHAR(50) NOT NULL`, `icon_key VARCHAR(20) NOT NULL`, `predefined BOOLEAN NOT NULL`, `is_protected BOOLEAN NOT NULL DEFAULT false`, `position INT NULL`; `UNIQUE INDEX ux_brew_method_name ON (lower(name))`.
- `brew`: `id BIGINT GENERATED ALWAYS AS IDENTITY PK`, `name VARCHAR(100) NOT NULL`, `bean_name VARCHAR(100) NOT NULL`, `origin VARCHAR(100) NOT NULL`, `method_id BIGINT NOT NULL REFERENCES brew_method(id)`, `roast VARCHAR(6) NOT NULL CHECK (roast IN ('LIGHT','MEDIUM','DARK'))`, `rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5)`, `brew_date DATE NOT NULL`, `notes VARCHAR(2000) NULL`, `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`; `UNIQUE INDEX ux_brew_name ON (lower(name))`, indexes on `method_id` and `(brew_date, created_at)`.
- Seed: Espresso/espresso/1, Pour Over/pour-over/2, French Press/french-press/3, AeroPress/aeropress/4, Moka Pot/moka-pot/5, Cold Brew/cold-brew/6 (all `predefined` true), Other/cup/99 (`predefined` and `is_protected` true).

### API
JSON, base `/api`. Brew JSON: `{id, name, beanName, origin, method: {id, name, iconKey}, roast: "LIGHT"|"MEDIUM"|"DARK", rating, brewDate: "2026-11-01", notes|null}`. Method JSON: `{id, name, iconKey, predefined, protected, position|null, brewCount}`.

| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/api/brews?q&methodId&roast&minRating&sort&page` | – | 200 `{items: Brew[], page, totalPages, matchingCount, totalCount}`; 400 INVALID |
| POST | `/api/brews` | `{name, beanName, origin, methodId, roast, rating, brewDate, notes}` | 201 Brew; 400 |
| PATCH | `/api/brews/{id}` | `application/json`, merge-patch subset of the POST body | 200 Brew; 400; 404 |
| DELETE | `/api/brews/{id}` | – | 204; 404 |
| GET | `/api/methods` | – | 200 Method[] (A–Z ignoring case, Other last) |
| POST | `/api/methods` | `{name}` | 201 Method; 400 |
| PUT | `/api/methods/{id}` | `{name}` | 200 Method; 400; 404; 409 |
| GET | `/api/methods/{id}/brews` | – | 200 `[{id, name, beanName, origin, brewDate}]` newest first (B19 Newest order); 404 |
| POST | `/api/methods/{id}/delete` | `{reassignments: [{brewId, methodId}]}` | 200 `{reassignedBrewCount}`; 400; 404; 409 |

List params: `q` (string), `methodId` (long), `roast` (enum), `minRating` (2–5), `sort` (`NEWEST` default, `OLDEST`, `HIGHEST`, `LOWEST`), `page` (≥ 1, default 1); size fixed at 12; `totalCount` counts all brews.
Errors are Spring `ProblemDetail` with extra properties: 400 `errors: [{field, code}]`, codes `REQUIRED`, `TOO_LONG`, `DUPLICATE`, `OUT_OF_RANGE`, `FUTURE_DATE`, `METHOD_NOT_FOUND`, `INVALID`. 404 `code: BREW_NOT_FOUND | METHOD_NOT_FOUND`. 409 `code: PROTECTED`. Malformed JSON gives 400 with no `errors`.

### Backend
Package `com.brewlog`, by layer, under `backend/src/main/java/com/brewlog/`:
- `BrewlogApplication`; `config/ClockConfig` (`@Bean Clock clock()` = system default zone, replaced in tests).
- `entity/`: `Brew`, `BrewMethod` (field `isProtected` → column `is_protected`), `Roast` enum.
- `repository/`: `BrewRepository extends JpaRepository<Brew, Long>, JpaSpecificationExecutor<Brew>` (`existsByNameIgnoreCaseAndIdNot`, `findByMethodId`, `countByMethodId`); `BrewMethodRepository` (`existsByNameIgnoreCaseAndIdNot`, `findByIsProtectedTrue`, `findAllWithBrewCount()` JPQL projection).
- `service/`: `BrewService` (`BrewPage list(BrewQuery)`, `BrewResponse create(BrewRequest)`, `BrewResponse patch(long id, JsonNode patch)`, `void delete(long id)`); `BrewValidator` (`List<FieldErrorDto> validate(BrewDraft, Long selfId)`: normalises (B3) and checks B4–B8 plus method existence); `BrewSpecifications` (`nameContains`, `methodIs`, `roastIs`, `ratingAtLeast`); `BrewSort` (`Sort toSort(SortKey)`); `BrewMethodService` (`list`, `create`, `rename(long id, String name)`, `brewsOf(long id)`, `DeleteMethodResponse delete(long id, DeleteMethodRequest)`).
- `controller/`: `BrewController`, `BrewMethodController`; `BrewQueryParams` binds and validates the list params (INVALID).
- `dto/`: records `BrewRequest`, `BrewResponse`, `MethodRef`, `BrewPage`, `BrewQuery`, `SortKey`, `MethodRequest`, `MethodResponse` (`@JsonProperty("protected")`), `MethodBrewResponse`, `DeleteMethodRequest`, `Reassignment`, `DeleteMethodResponse`, `FieldErrorDto(String field, ErrorCode code)`.
- `exception/`: `ErrorCode` enum, `ValidationException(List<FieldErrorDto>)`, `NotFoundException(ErrorCode)`, `ProtectedMethodException`, `ApiExceptionHandler extends ResponseEntityExceptionHandler` (maps these exceptions plus `DataIntegrityViolationException` on `ux_brew_name` / `ux_brew_method_name` to DUPLICATE).
- `application.yml`: `spring.datasource.url: ${DB_URL:jdbc:postgresql://localhost:5432/brewlog}`, `username: ${DB_USER:brewlog}`, `password: ${DB_PASSWORD:brewlog}`, `jpa.hibernate.ddl-auto: validate`, `jpa.open-in-view: false`.

### Frontend
Under `frontend/src/app/`, by feature:
- `app.routes.ts`: `''` → `LandingPage`, `'journal'` → `JournalPage`, `'**'` → redirect `''`. `app.config.ts`: router, `provideHttpClient`, `provideDateFnsAdapter` with formats parse/display `d MMM yyyy`, `MAT_DATE_LOCALE` enGB, an icon registration `provideAppInitializer`.
- `core/`: `models.ts` (`Brew`, `BrewMethod`, `BrewPage`, `BrewQuery`, `Roast`, `SortKey`, `ApiFieldError`); `brew-api.ts` (`BrewApi`: `list(query)`, `create(body)`, `patch(id, changes)`, `delete(id)`); `method-api.ts` (`MethodApi`: `list()`, `create(name)`, `rename(id, name)`, `brewsOf(id)`, `delete(id, reassignments)`); `api-error.ts` (`parseApiError(err): {kind: 'fields'|'notFound'|'protected'|'network', fields, code}`); `error-messages.ts` (field + code → exact message from the requirements); `format.ts` (`formatDate`, `brewCount(n)` → "1 brew"/"n brews", `methodsAz`, `methodsDialogOrder`); `toast.ts` (`Toaster.show(text)`: MatSnackBar, 4000 ms).
- `journal/`: `journal.store.ts` (`JournalStore` signalStore: `query`, `items`, `page`, `totalPages`, `matchingCount`, `totalCount`, `status: 'loading'|'ready'|'error'`, `highlightId`, computed `activeFilterCount` for the phone badge per B18; `rxMethod` load with 250 ms debounce on `q`; syncs `query` with the URL query params `q`, `methodId`, `roast`, `minRating`, `sort`, `page`); `journal-page`, `journal-toolbar`, `filters-sheet` (MatBottomSheet; its min-rating `bean-rating` input maps bean 1 to `minRating` null), `filter-chips`, `brew-card` (mat-card), `pagination` (custom numbered; `pageItems(page, totalPages): (number | 'gap')[]` in `pagination-items.ts` builds the desktop list per B20), `brew-detail-dialog` (MatDialog / MatBottomSheet), `brew-delete-dialog` (MatDialog).
- `brew-form/`: `brew-form.ts` (reactive form, typed; desktop in a `mat-sidenav` `mode="over" position="end"` inside the journal page, phone in a MatBottomSheet); `brew-validators.ts` (client copies of B3–B8); `method-select` (mat-select with icons + "Add new method…" / "Manage methods…" options); `diff.ts` (`changedFields(original, value)` → the PATCH body, with emptied notes → null).
- `methods/`: `method.store.ts` (`MethodStore`: `methods`, `status`, `load`, `add`, `rename`, `remove`); `methods-dialog` with step components `rename-step` and `delete-step` (MatDialog / MatBottomSheet on phone).
- `shared/`: `bean-rating` (display + ControlValueAccessor input, custom), `method-icon` (mat-icon `svgIcon` from `iconKey`).
- `landing/landing-page`.
- Breakpoints via CDK `BreakpointObserver`: phone < 768 px, tablet 768–1119 px, desktop ≥ 1120 px.

### UI implementation
- `frontend/src/styles/tokens.css`: an exact, byte-for-byte copy of `design/prototype/tokens.css` (generated by `designmd export`, double-quoted font names kept), never formatted (`frontend/.prettierignore`); `styles/theme.scss`: `mat.theme` (palettes and system colours below, Cormorant Garamond + Inter) plus `mat.*-overrides` (button, icon-button, fab, form-field, select, dialog, bottom-sheet, snack-bar, card, button-toggle, datepicker, menu, sidenav) mapped to tokens.css variables (`var(--color-*)`, `var(--radius-*)`, `var(--text-*)`, …), raw values only where the prototype has them; component SCSS ported from `design/prototype/components.css` and the screen files.
- Palettes and system colours: in `frontend/`, `ng generate @angular/material:theme-color --primary-color=#2B1D16 --tertiary-color=#B4532A --include-high-contrast=false --directory=src/styles/ --is-scss=true --interactive=false` creates `frontend/src/styles/_theme-colors.scss` (`$primary-palette`, `$tertiary-palette`) once; `npm run format` runs right after, and the formatted file is committed (only whitespace changes; `.prettierignore` keeps its single line). `theme.scss` has `@use './theme-colors'` and, inside `html { }`, `mat.theme((color: (primary: theme-colors.$primary-palette, tertiary: theme-colors.$tertiary-palette, theme-type: light), typography: (plain-family: Inter, brand-family: 'Cormorant Garamond'), density: 0))`, then `mat.theme-overrides(...)` with each value a `var()`: `primary` → `--color-primary`; `on-primary`, `on-tertiary`, `on-error`, `inverse-on-surface` → `--color-on-primary`; `secondary` → `--color-secondary`; `tertiary` → `--color-tertiary`; `tertiary-container` → `--color-tertiary-soft`; `on-tertiary-container`, `on-background`, `on-surface` → `--color-on-surface`; `background` → `--color-neutral`; `surface`, `surface-container-lowest`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest` → `--color-surface`; `on-surface-variant` → `--color-on-surface-muted`; `outline`, `outline-variant` → `--color-outline`; `error`, `on-error-container` → `--color-error`; `error-container` → `--color-error-soft`; `inverse-surface` → `--color-primary`. Without these overrides the generated palettes would give `--mat-sys-primary` #6D5A51 and `--mat-sys-tertiary` #9E421A (tone 40), not the tokens.
- Buttons are Material (`MatButtonModule`), on `<button>` and `<a routerLink>` alike: button-primary → `matButton="filled"`; button-accent → `matButton="filled" class="btn-accent"`; button-secondary → `matButton="outlined" class="btn-secondary"`; button-ghost → `matButton="text"`; button-danger → `matButton="filled" class="btn-danger"`; the landing's on-scrim button ("How it works") → `matButton="outlined" class="btn-on-scrim"`; icon-button → `matIconButton`; fab → `matFab`. These 4 variant classes are the only prototype button classes in the app (no `btn`, `btn-primary`, `btn-ghost`, `icon-btn`, `fab`). A trailing icon (closing "Open my journal →") is `<mat-icon svgIcon="arrow-right" iconPositionEnd>`.
- Button overrides in `theme.scss`, `html`: `mat.button-overrides` with, for each of `filled-`, `outlined-` and `text-`: `container-shape: var(--radius-sm)`, `container-height: var(--spacing-control-height)`, `label-text-size: var(--text-label-md)`, `label-text-weight: var(--font-weight-label-md)`, `label-text-tracking: normal`; plus `filled-horizontal-padding` and `outlined-horizontal-padding: var(--spacing-lg)`, `text-horizontal-padding: var(--spacing-md)`, `filled-container-color: var(--color-primary)`, `filled-label-text-color: var(--color-on-primary)`, `outlined-outline-color: var(--color-outline)`, `outlined-label-text-color: var(--color-on-surface)`, `text-label-text-color: var(--color-on-surface)`. `mat.icon-button-overrides`: `container-shape: var(--radius-sm)`, `state-layer-size: var(--spacing-control-height)`, `icon-size: 20px`, `icon-color: var(--color-on-surface)`, `state-layer-color: var(--color-on-surface)`. `mat.fab-overrides`: `container-color: var(--color-primary)`, `foreground-color: var(--color-on-primary)`, `state-layer-color: var(--color-on-primary)`, `container-shape: var(--radius-full)`, and `container-elevation-shadow`, `hover-container-elevation-shadow`, `focus-container-elevation-shadow`, `pressed-container-elevation-shadow` all `0 16px 40px -16px color-mix(in srgb, var(--color-primary) 60%, transparent)`; the FAB's position (fixed, right `var(--spacing-md)`, bottom `var(--spacing-lg)`) stays in the SCSS of the component that renders it.
- Variant classes in `theme.scss`: `.btn-accent` → `mat.button-overrides` `filled-container-color: var(--color-tertiary)`, `filled-label-text-color: var(--color-on-primary)`; `.btn-danger` → `filled-container-color: var(--color-error)`, `filled-label-text-color: var(--color-on-primary)`; `.btn-secondary` → plain CSS `background-color: var(--color-surface)` (outline and label from the `html` values); `.btn-on-scrim` → `outlined-label-text-color: var(--color-on-scrim)`, `outlined-outline-color: color-mix(in srgb, var(--color-on-scrim) 55%, transparent)`, `outlined-state-layer-color: var(--color-on-scrim)`.
- Hover and press use Material's state layer and ripple, not the prototype's `:hover` colours. Keyboard focus (`:focus-visible`) shows the state layer plus a focus ring (DESIGN.md → Colors → Focus rings, R45).
- Focus rings (from grilling): at the top level of `theme.scss`, `@include mat.strong-focus-indicators((border-style: solid, border-width: 2px, border-radius: var(--radius-sm), border-color: var(--color-tertiary)));`. Material draws this ring on `:focus-visible` only, on every Material control (buttons, icon buttons, FAB, button toggles, menu items, checkboxes), with a 2px gap outside filled buttons and 3px outside outlined ones; Material's own `.mdc-button { outline: none }` is why the native outline never shows on its buttons. Native elements (links, `bean-rating`) keep `base.scss`'s `:focus-visible { outline: 2px solid var(--color-tertiary); outline-offset: 2px; }`. Hero: `theme.scss` also has `.hero { --mat-focus-indicator-border-color: var(--color-on-scrim); }` (the custom property `mat.strong-focus-indicators` writes on `html`; `mat.strong-focus-indicators-color` accepts only a Sass colour, not a `var()`), and `landing-page.scss` carries the prototype's `.hero :focus-visible { outline-color: var(--color-on-scrim); }` with the rest of the `landing.html` `<style>` block.
- Screen styles on button classes port into the component SCSS with the selectors rewritten to Material's classes: `.btn` → `.mdc-button`, `.btn-ghost` → `.mat-mdc-button`, `.icon-btn` → `.mat-mdc-icon-button`, `.fab` → `.mat-mdc-fab` (e.g. landing `.hero .ctas .mdc-button { flex: 1; }`, `.closing .mdc-button { width: 100%; }`). A property Material sets from a token (height, font size, colour, shape) changes instead through a scoped `mat.button-overrides` / `mat.icon-button-overrides` under that selector in `theme.scss`, e.g. `.chips-row .mat-mdc-button`: `text-container-height: 32px`, `text-label-text-size: var(--text-body-sm)`.
- Busy buttons ("Saving…", "Renaming…", "Deleting…"): while the request is in flight the button is `[disabled]`, has `aria-busy="true"` and shows `<span class="spinner" aria-hidden="true"></span>` before its label, so Material's disabled colours replace its fill. `.spinner` and `@keyframes spin` (`components.css` lines 76–77) go into `frontend/src/styles/base.scss`; the prototype's `.btn[aria-busy="true"]` rule isn't ported, and `showProgress` isn't used (it hides the label).
- Shared helpers: `frontend/src/styles/helpers.scss` (new), `@use './styles/helpers'` last in `frontend/src/styles.scss` (after `tokens.css`, `theme`, `base`). It holds the `components.css` helpers once, copied as they are: lines 23–36 (`.serif`, `.t-*`, `.muted`, `h1, h2, h3, h4, p` margin 0, `text-wrap: balance`), lines 39–41 as `.mat-icon.icon`, `.mat-icon.icon-lg`, `.mat-icon.icon-sm`, lines 113–120 (`.swatch`, `.swatch-light`, `.swatch-medium`, `.swatch-dark`, `.roast-tag`, `.rating`, `.rating .mat-icon.bean`, `.rating .mat-icon.bean.off`), lines 132–134 (`.brand`, `.brand .mat-icon.brand-mark`, `.brand-name`), line 138 (`.container`), and `@media (max-width: 767px) { .container { padding: 0 var(--spacing-page-margin-mobile); } }`. Icon sizes carry the `.mat-icon` prefix because Material's own `.mat-icon` rule (24 px, one class) loads after the global stylesheet and would win a tie.
- Component SCSS holds only the component's own rules: its screen's `<style>` block and its own `components.css` section (e.g. cards, chips, pagination). It never re-declares a `helpers.scss` class. `landing-page.scss` is the `landing.html` `<style>` block (button selectors rewritten as above) plus the sample card's `.brew-card` rules (`components.css` lines 142–147, 150–152, 154, 158–159 and the `.brew-card` rule of its `max-width: 767px` block), about 7.0 kB built.
- Style budgets: the `frontend/angular.json` budgets stay as generated (`anyComponentStyle` `maximumWarning` 4kB, `maximumError` 8kB). `npm run build` must pass; the landing's "exceeded maximum budget. Budget 4.00 kB" warning is expected.
- Fonts: the Google Fonts `<link>` from the prototype in `index.html`.
- Icons: `public/icons.svg`, a `<symbol>` sprite generated from `design/prototype/icons.js` (ids = keys: `logo`, `bean`, `bean-fill`, the method keys, `cup`, `search`, …), registered with `MatIconRegistry.addSvgIconSet`. Tests read the sprite as text with `import sprite from '../../../public/icons.svg' with { loader: 'text' };` (Angular CLI's esbuild text loader; `ng test` bundles with esbuild, not Vite, so `?raw` doesn't work), typed by `frontend/src/svg.d.ts`: `declare module '*.svg' { const content: string; export default content; }`. No `angular.json` change, no new dependency.
- Icon build script (from grilling): `frontend/scripts/build-icons.mjs` reads `design/prototype/icons.js` as data and never evaluates it (no `eval`, `new Function` or `import` of it), with no new dependency:
  1. Take the lines between the line containing `var symbols = {` and the next line that is only `};`.
  2. Skip blank lines and lines starting with `//` (after leading spaces).
  3. Every other line must match `^\s*(?:'([a-z0-9-]+)'|([a-z0-9-]+)):\s*'([^'\\]*)',?\s*$` (key, value); otherwise throw `icons.js line <n>: not a symbol entry`.
  4. Each value must consist only of self-closing tags `<path|circle|ellipse|rect attr="…" />`, whose attributes are among `d`, `cx`, `cy`, `r`, `rx`, `ry`, `x`, `y`, `width`, `height`, `transform`, `style`, whose values contain none of `<`, `>`, `"`, `&`, and whose `style` is exactly `fill:currentColor` or `stroke:var(--color-surface)`; otherwise throw `icon <key>: <tag|attribute|style> <value> not allowed`.
  5. Write `public/icons.svg` as before: `<svg xmlns="http://www.w3.org/2000/svg"><defs>` + per key `<symbol id="<key>" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">…</symbol>` + `</defs></svg>` and a final newline.
  `frontend/src/app/core/icons-sprite.spec.ts` also guards the committed sprite: parsed with `DOMParser`, every element is `svg`, `defs`, `symbol`, `path`, `circle`, `ellipse` or `rect`, and every attribute is one of the step 4 list, `xmlns` on `svg`, or `id`, `viewBox`, `fill`, `stroke`, `stroke-width`, `stroke-linecap`, `stroke-linejoin` on `symbol`.
- Landing photos: `design/prototype/assets/*.jpg` copied to `frontend/public/images/`.
- Material mapping: buttons → `matButton` / `matIconButton` / `matFab` (above); selects → mat-select; roast → mat-button-toggle-group; card ⋮ → mat-menu; toast → MatSnackBar; dialogs → MatDialog; phone sheets → MatBottomSheet; date → mat-datepicker with `[max]` = today.

### Deployment
- `docker-compose.yml` (root): `db` (postgres:17, db/user/password `brewlog`, port `127.0.0.1:5432:5432` (host loopback only, so the LAN can't reach Postgres with its known password while a backend run outside Compose still finds it on `localhost:5432`; from grilling), named volume `brewlog-data` mounted at `/var/lib/postgresql/data` (postgres:17's `PGDATA`) and declared under the top-level `volumes:`, healthcheck), `backend` (build `./backend`, `DB_URL=jdbc:postgresql://db:5432/brewlog`, depends on a healthy db), `frontend` (build `./frontend`, port `8081:80`).
- `backend/Dockerfile`: build stage `FROM gradle:9.9.2-jdk25 AS build` (its Gradle version always equals the wrapper's), `WORKDIR /workspace`, `COPY settings.gradle.kts build.gradle.kts ./`, `COPY src ./src` (no wrapper files), `RUN gradle bootJar --no-daemon` → `FROM eclipse-temurin:25-jre`, `COPY --from=build /workspace/build/libs/brewlog.jar /app/app.jar` (the exact file, no wildcard), port 8080.
- `frontend/Dockerfile`: `node:24` build → `nginx:1.29-alpine` with `frontend/nginx.conf` (`try_files $uri /index.html`; `location /api/ { proxy_pass http://backend:8080; }`).

### CI
Each of the three app workflows has top-level `permissions:` `contents: read`, and every step has a `name:`, listed below as "name" (command). (from grilling)
- `.github/workflows/backend.yml`: on `pull_request` with paths `backend/**` and `.github/workflows/backend.yml`; steps "Check out code" (`actions/checkout@v4`), "Setup Java JDK" (`actions/setup-java@v4`, Temurin 25), "Check formatting" (`./gradlew spotlessCheck`), "Run tests" (`./gradlew test`), the last two in `backend/`.
- `.github/workflows/frontend.yml`: on `pull_request` with paths `frontend/**` and `.github/workflows/frontend.yml`; steps "Check out code" (`actions/checkout@v4`), "Setup Node.js" (`actions/setup-node@v4` with `node-version-file: .nvmrc`), "Install dependencies" (`npm ci`), "Audit dependencies" (`npm audit --audit-level=moderate`), "Lint" (`npm run lint`), "Check formatting" (`npm run format:check`), "Run tests" (`npm test`), "Build" (`npm run build`), the npm steps in `frontend/`.
- `.github/workflows/e2e.yml`: on `pull_request` with paths `backend/**`, `.github/workflows/backend.yml`, `frontend/**`, `.github/workflows/frontend.yml`, `e2e/**`, `docker-compose.yml` and `.github/workflows/e2e.yml`, so it runs whenever backend or frontend CI runs and whenever its own files change (from grilling); steps "Check out code" (`actions/checkout@v4`), "Reset the stack" (`docker compose down -v`), "Start the stack" (`docker compose up -d --build --wait`), "Setup Node.js" (`actions/setup-node@v4` with `node-version-file: .nvmrc`), "Install dependencies" (`npm ci`), "Audit dependencies" (`npm audit --audit-level=moderate`), "Install Playwright browser" (`npx playwright install --with-deps chromium`), "Run e2e tests" (`npx playwright test`), the last four in `e2e/`.
- `.github/workflows/factory-merge-gate.yml`: its single step (`actions/github-script@v7`) is named "Run merge gate"; nothing else changes. (from grilling)

### Seams and tests
| Seam | Covers | Setup | Mocked |
|---|---|---|---|
| Backend unit: `BrewValidator`, `BrewService`, `BrewMethodService`, `BrewSort` | R13–R18, R23, R24, R36, B19 | JUnit 5, fixed `Clock` (2026-11-01) | repositories (Mockito) |
| Backend integration: HTTP API via MockMvc | R2, R5–R10, R12–R19, R22–R25, R27–R30, R32–R38, R41 | `@SpringBootTest` + Testcontainers postgres:17 + Liquibase, fixed `Clock`; `IntegrationTest.resetDatabase()` (`@BeforeEach`) runs `classpath:reset.sql` (only `TRUNCATE brew, brew_method RESTART IDENTITY CASCADE;`), then `classpath:db/changelog/002-seed-methods.sql` (its Liquibase lines are SQL comments), so the seed has one source and Espresso is id 1 … Other id 7 in every test (from grilling) | nothing |
| Frontend unit: `BrewApi`, `MethodApi`, `parseApiError`, `error-messages`, `format`, `diff`, `brew-validators`, stores | R5–R10, R13–R23, R29–R39 | Vitest + TestBed, `HttpTestingController` | HTTP; stores get fake APIs |
| Frontend unit: generated sprite `frontend/public/icons.svg` (a `<symbol id>` per icon key; only the whitelisted elements and attributes of UI implementation → Icon build script) | B22, R29 | Vitest, `frontend/src/app/core/icons-sprite.spec.ts`, sprite imported as text (UI implementation) | nothing |
| Frontend unit: components (card, pagination, bean-rating, toolbar, chips, dialogs, method steps) and `pageItems` | R2–R4, R6, R11, R13, R43, R44, R21, R26–R28, R33–R35, R37, R39 | TestBed + Material harnesses | stores faked |
| Frontend integration: `JournalPage`, `BrewForm`, `MethodsDialog` with real stores | R2, R6, R8, R12, R16, R19, R25, R35, R40 | TestBed, real stores and APIs, harnesses | HTTP (`HttpTestingController`) |
| E2E (Playwright, `desktop` + `phone`) | (1) R1, R45; (2) R12, R16; (3) R5–R8, R22, R27; (4) R30, R33, R35 | compose stack with a fresh volume, real browser | nothing |

### Conventions
There is no application code yet. Copy markup, spacing and states from `design/prototype/screens/*.html` and styles from `design/prototype/components.css`, except buttons, which follow Technical design → UI implementation instead of the prototype's `.btn` markup and styles, and the shared helpers, which come from `frontend/src/styles/helpers.scss` (UI implementation → Shared helpers). Every message text comes from these requirements or `design/screens/*.md`, never invented.

### Hard logic
```text
patch(id, node):                         // node = JsonNode (Jackson 3, tools.jackson)
  brew = find(id) or 404 BREW_NOT_FOUND
  draft = BrewDraft.from(brew); for each field present in node: draft.set(field, node.get(field))  // null allowed
  errors = validator.validate(draft, selfId=id); if any → 400
  apply; save; on unique violation → 400 name DUPLICATE

delete method M (transaction):
  M = find or 404; M.isProtected → 409 PROTECTED
  if any r.methodId == M.id → 400 reassignments INVALID
  other = findByIsProtectedTrue(); targets = existing ids among r.methodId
  for b in brewRepo.findByMethodId(M.id): b.method = r[b.id] in targets ? that : other
  delete M; return count of those brews

nameContains(q): lower(name) LIKE '%' + escape(lower(q)) + '%' ESCAPE '\'   // escape \ % _
sort NEWEST: brewDate desc, createdAt desc, id desc; OLDEST: all asc; HIGHEST: rating desc, brewDate desc, createdAt desc; LOWEST: rating asc, brewDate desc, createdAt desc
```

### Risks
- Spring Boot 4 uses Jackson 3 (`tools.jackson.*`) and renamed starters (e.g. `spring-boot-starter-webmvc`); implementers must not use Boot 3 names.
- JDK 25 isn't installed locally: the Gradle toolchain downloads it (foojay); CI uses setup-java 25.
- Testcontainers and E2E need a running Docker engine (Docker Desktop locally, see Prerequisites); tests fail fast with a clear message otherwise.
- A Node older than 24.15.0 makes the Angular CLI refuse to run; `engines.node` makes npm warn on a wrong version.
- Line endings: on Windows with git `core.autocrlf=true` (no root `.gitattributes`), checkouts and `ng new` output are CRLF, while CI checks out LF. `endOfLine: "auto"` in `frontend/.prettierrc` keeps `format:check` passing in both. `backend/.gitattributes` keeps `backend/gradlew` LF on every checkout, so it also runs in Linux containers.
- The Gradle version lives in two places, `backend/gradle/wrapper/gradle-wrapper.properties` (with its SHA-256) and the `backend/Dockerfile` build-stage tag: an upgrade changes both, regenerating the wrapper with the new version and sum.
- Matching the ivory design with Material needs disciplined theming. Overrides are kept in `theme.scss` via the documented `mat.*-overrides` mixins, never `::ng-deep`. Material buttons hover with a state-layer tint instead of the design's hover colours, so the accent button gets lighter on hover, not darker.
- Component style size: `anyComponentStyle` fails the build above 8 kB, and emulated encapsulation adds an attribute to every selector, so copied helpers grow a component fast (the landing with all the helpers it uses built to 9.9 kB). The helpers live once in `helpers.scss`, which keeps the landing at about 7.0 kB.
- Parallel saves of the same name: the unique indexes on `lower(name)` are the last guard and are mapped to DUPLICATE.
- Time zones: the server allows today + 1 (B8); the client blocks after the browser's today.
- Focus rings over the hero photo: terracotta reaches only 1.0–3.8:1 there, below WCAG's 3:1 for non-text, so hero controls use the on-scrim ring (R45). `.hero` sets Material's focus-indicator colour custom property directly, because `mat.strong-focus-indicators-color` takes no `var()`.
- Gradle wrapper and jar: the wrapper checks (Gradle 9.9.2, wrapper jar SHA-256, line endings and mode, no leftover zip) and the single-jar check run once, when the wrapper and build are made; CI doesn't repeat them (from grilling). They stay guarded indirectly: CI's `./gradlew` fails if `gradlew` loses its LF endings or exec bit, `distributionSha256Sum` rejects any other distribution, and the e2e Docker build fails without `build/libs/brewlog.jar`. A tampered `gradle-wrapper.jar` is left to review.
- The test reset replays only `002-seed-methods.sql`: a later changeset that changes seeded rows must also run in `resetDatabase()`.
- The npm audit steps fail a PR on any newly published moderate or higher advisory, even one unrelated to the PR, until the package is upgraded.
- `factory-merge-gate.yml` is installed by the github-setup skill: rerunning it rewrites the file and drops the "Run merge gate" step name.

## Out of scope
- Authentication and multiple user accounts.
- Public deployment.
- Photos or images for brews (landing photos are static marketing assets).
- Statistics, analytics or charts.
- A "last edited" date or any edit history.
- Undo for deleted brews or methods.
- A dark theme and languages other than English.
- An endpoint to fetch a single brew (detail and edit use the list data).
- An advisory audit of the backend's Gradle dependencies.
- CI re-checks of the Gradle wrapper and the single `brewlog.jar` (Technical design → Risks).
