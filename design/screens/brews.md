# Journal (brews)

**Purpose:** The app page. The user scans, searches, filters and sorts their brews, and starts every create/edit/delete and method-management action from here.
**Prototype:** `../prototype/screens/brews.html`

## Layout
1. **App header** (sticky, 64px desktop / 56px phone, ivory at 92% with blur, hairline bottom): brand mark + "Brewlog" (links to landing) · spacer · `button-ghost` "Manage methods" with sliders icon (phone: `icon-button`, aria-label "Manage methods") · `button-primary` "+ Add brew" (desktop only).
2. **Page head**: eyebrow "Tasting journal" (`label-caps`, terracotta) + `headline-lg` "Your brews" (phone `headline-md`); right-aligned muted count ("41 brews" / "3 of 41 brews" / "No brews yet"; singular for exactly 1: "1 brew", "1 of 41 brews"), `aria-live="polite"`.
3. **Toolbar**, between hairlines:
   - Desktop: one row, labelled controls (`label-caps` labels): Search input with search icon (2.2fr) · Method select (All methods, then every method incl. custom ones A–Z, "Other" last) · Roast select (All roasts, Light, Medium, Dark) · Min. rating select (Any rating, 2+, 3+, 4+, 5 beans only) · Sort select (Newest first [default], Oldest first, Highest rated, Lowest rated).
   - Phone: Search input + `button-secondary` "Filters" with a terracotta count badge: counts the active search (non-blank after trimming), method, roast and min rating (0–4); hidden at 0; sort never counts. Method, roast, min rating and sort live in the filters sheet.
4. **Active filter chips** (only when filters or search are active): `chip-filter` per active search/method/roast/min-rating, each with an × button, then a ghost "Clear all". Sort is not shown as a chip.
5. **Card grid**: 3 columns ≥1120px, 2 columns 768–1119px, 1 column on phone; gutter 24px (16px phone). 12 cards per page.
   - `brew-card`: top row = 40px fine-line method icon (terracotta) + method name (`label-caps`, muted) + ⋮ `icon-button` (aria-label "Actions for <name>"). Brew name (`headline-sm`, serif). "Bean · Origin" (`body-sm`, muted). Hairline. `bean-rating` (5 thin-line beans, filled = score, `role="img"` "n of 5 beans") left, `roast-tag` (roast swatch + LIGHT/MEDIUM/DARK) right. Tasting notes `body-md` clamped to 3 lines, or muted italic "No tasting notes". Date `body-sm` muted ("28 Oct 2026") pinned to the bottom.
   - Method icons: Espresso, Pour Over, French Press, AeroPress, Moka Pot, Cold Brew each have their own; custom methods and "Other" use the generic cup.
   - Hover: hairline → `outline-strong`, lift 2px. The whole card is the link to brew-detail (stretched link on the name); the ⋮ button sits above it.
6. **List footer**: "Showing 1–12 of 41" (muted) left, pagination right: ‹ 1 2 3 4 › with the current page as an espresso circle. With 7 or fewer pages every number shows. With more than 7: first page, last page, current page ±1, and a muted, non-clickable "…" (same 40px slot as a number, `aria-hidden`; the nav's aria-label carries "page x of y") for each gap; a gap of exactly one page shows that number instead of "…". Examples, 20 pages: page 1 "1 2 … 20", page 4 "1 2 3 4 5 … 20", page 10 "1 … 9 10 11 … 20", page 20 "1 … 19 20". Phone: stacked, pagination full width as ‹ "PAGE 1 OF 4" ›.
7. **FAB** (phone only): 56px espresso circle with +, bottom-right, aria-label "Add brew".
8. **Toast** (bottom-center, above the FAB on phone): espresso bar, check icon, ivory text.

## Data shown
| Field | Source/type | Notes |
|---|---|---|
| Brew name | string, unique (case-insensitive) | Serif on cards; searched by the search box |
| Bean name | string | Shown with origin as "Bean · Origin" |
| Origin | string | |
| Brew method | method reference (id + name) | Icon chosen by predefined method; custom/Other → cup |
| Roast level | enum Light/Medium/Dark | Swatch + word |
| Rating | int 1–5 | Thin-line beans |
| Creation date | date | Format "d MMM yyyy" (e.g. 3 Oct 2026), English |
| Tasting notes | string, optional | Clamped to 3 lines |
| Total count / filtered count | int | "3 of 41 brews" when filtered |
| Method list | all methods | Fills the Method filter, A–Z with "Other" last |
| Page / page count | int | 12 per page |

## States
| State | When | What differs |
|---|---|---|
| default | Brews loaded, no filters | 12 cards, page 1 of 4, newest first |
| many-pages | More than 7 pages (example: 240 brews, page 10 of 20) | Count "240 brews"; footer "Showing 109–120 of 240" + ‹ 1 … 9 10 11 … 20 ›; phone ‹ "PAGE 10 OF 20" › |
| filtered | Search/filters active | Toolbar shows values (Pour Over, Light, 4+ beans, Highest rated); chip row; count "3 of 41 brews"; 3 cards; footer "Showing 1–3 of 3", no pagination when one page; Filters badge "3" on phone |
| filters-sheet | Phone: "Filters" tapped | Bottom sheet (90% max height) "Filter & sort" over a backdrop: Method select, Roast segmented (All/Light/Medium/Dark), Minimum rating bean picker (44px targets; bean 1 = "Any rating": no min-rating filter, shown with 1 bean filled and the legend "Any rating"; beans 2–5 set the minimum, legend "2+ beans" / "3+ beans" / "4+ beans" / "5 beans only"; screen-reader labels "Any rating", "At least 2 beans" … "At least 5 beans"), Sort select; footer "Clear all" + "Show 3 brews" (live result count; "Show 1 brew" for one). Desktop renders like filtered (sheet is phone-only) |
| filters-sheet-any | Phone sheet with no min rating chosen | Like filters-sheet, but the bean picker shows 1 filled bean, legend "Any rating", primary "Show 7 brews" |
| card-menu | ⋮ on a card | Popover menu under the ⋮: "Edit brew", "Delete brew" (error color) |
| saved | Right after create/edit | Toast "“Kenyan Morning” saved to your journal" (4s); that card gets `brew-card-highlight` (terracotta-soft fill + terracotta border), fading back over ~1.2s |
| empty | No brews at all | Toolbar hidden; dashed `panel` with cup art in a circle, "Your journal is waiting", short line, `button-primary` "+ Log your first brew"; count "No brews yet" |
| no-results | Filters/search match nothing | Toolbar + chips (incl. search chip "“panama natural”"); panel with search art, "No brews match", explanation naming the search, `button-secondary` "Clear search and filters"; count "0 of 41 brews" |
| loading | First load / page change | 6 skeleton cards with shimmer (none under reduced motion); count is a skeleton bar; `aria-busy` |
| error | List request failed | Panel with alert art (error color), "We couldn’t load your brews", "The Brewlog server didn’t respond. Check that the backend is running, then try again. Your entries are safe.", `button-primary` "Try again" (refresh icon); `role="alert"` |

## Interactions
- Typing in search filters by brew name (case-insensitive contains), debounced ~250ms; all filters, search and sort combine.
- Changing search, any filter or sort resets to page 1.
- Chip × removes just that filter; "Clear all" resets search + filters (sort stays).
- Pagination: ‹/› and page numbers; ‹ disabled on page 1, › disabled on the last page; scroll to top of the grid after paging.
- Card click/Enter → brew-detail. ⋮ → card-menu; Esc or outside click closes; arrow keys move between items.
- "Edit brew" → brew-form (edit). "Delete brew" → brew-delete.
- "Add brew" / FAB / "Log your first brew" → brew-form (create).
- "Manage methods" → methods dialog.
- After save → saved state. After delete → toast "Brew deleted", the list reloads on the same page (or previous page if it became empty).
- Error "Try again" → loading → default/error.

## Design decisions
- Cards grid (3/2/1 columns) — journal feel, collapses naturally to one column on phone.
- Numbered pagination, 12 per page — chosen over load-all; page resets to 1 on any search/filter/sort change. Kept custom (not mat-paginator) by spec decision; truncated with "…" beyond 7 pages, never hiding a single page behind "…".
- Phone min-rating picker: bean 1 means "Any rating" (the API only filters 2–5), so the picker needs no extra control.
- Filters badge counts search too (spec decision), so in no-results with a search it shows 4.
- Toolbar on desktop; on phone, search + "Filters (n)" button opening a bottom sheet, with active filters as removable chips.
- Cards are typographic with a fine-line method icon (no photos, no doodles) — premium restraint; replaces the earlier random doodles.
- Rating shown as thin-line coffee beans in terracotta, also used as the min-rating picker in the sheet.
- ⋮ overflow menu (always visible, works on touch) with Edit/Delete, plus card click opens the detail modal.
- "Add brew" in the header on desktop, FAB on phone.
- Success feedback: bottom-center toast + temporary card highlight.
- List states: default, empty, no-results, loading (skeleton), error (retry).
- Dates in English "12 Oct 2026" format.
