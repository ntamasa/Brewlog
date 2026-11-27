# Business rules

## General
- **Single private user:** there is exactly one user and no authentication; the app runs only on a local or private deployment.
- **Text normalisation:** every text value (brew name, bean name, origin, tasting notes, method name, search) is trimmed at both ends; a value of only spaces counts as empty, and empty tasting notes are stored as null.
- **Singular counts:** counts say "brew" for exactly 1 and "brews" otherwise.
- **Toasts:** every toast shows for 4 seconds.
- **Changes made elsewhere:** if a brew was deleted elsewhere, saving its edit offers "Save as new brew" and deleting it reports it's gone; if a brew's chosen method was deleted, the brew can't be saved until another method is chosen; a method deleted elsewhere is removed from the methods dialog with a toast. The list refreshes in every case.
- **One change at a time:** while a change is being sent (saving or deleting a brew, or adding, renaming or deleting a method), its button can't send it again. The other buttons in the same window that send or start a change are disabled until the server answers. Closing, cancelling and going back stay possible.

## Journal
- **Search:** finds brews whose name contains the trimmed search text, ignoring case; % and _ match literally; an empty search means no search.
- **Filters:** method (exact), roast level (exact) and minimum rating (rating ≥ 2, 3, 4 or 5) combine with each other, with search and with sort. No minimum rating is shown as "Any rating". The phone "Filters" badge counts the active search (non-blank), method, roast and minimum rating, is hidden at 0, and never counts sort.
- **Sort:** Newest first (default): date descending, then most recently added. Oldest first: date ascending, then earliest added. Highest rated: rating descending, then newest date, then most recently added. Lowest rated: rating ascending, then newest date, then most recently added.
- **Pagination:** 12 brews per page; any search, filter or sort change goes back to page 1; after a delete, the list stays on the same page, or goes to the previous one if the page became empty; with more than 7 pages, the desktop pagination shows the first and last page, the current page ±1 and a non-clickable "…" for each gap, but a gap of exactly one page shows that page's number.

## Brews
- **Brew fields:** brew name, bean name, origin, brew method, roast level, rating and creation date are required; tasting notes are optional.
- **Length limits:** after trimming, brew name, bean name and origin at most 100 characters, tasting notes at most 2000. Over-long input is rejected with an inline error, never cut off.
- **Unique brew names:** brew names are unique ignoring case; a brew may change only the capitals of its own name.
- **Rating:** a whole number from 1 to 5.
- **Roast level:** Light, Medium or Dark.
- **Creation date:** defaults to today (browser's local date) when creating, editable later, never after today; the server accepts up to its own today + 1 day to tolerate time zones.
- **Insertion order:** the time a brew was added is stored only to break sort ties; there is no "last edited" date.
- **Deleting a brew:** needs a confirmation and is permanent, with no undo.

## Brew methods
- **Predefined methods:** Espresso, Pour Over, French Press, AeroPress, Moka Pot, Cold Brew and the protected "Other" exist from the first start.
- **"Other" is protected:** "Other" can't be renamed or deleted; every other method, predefined or custom, can be.
- **Custom methods:** the user can add a method by free text (from the brew form or the methods dialog); it is saved and selectable for later brews.
- **Unique method names:** at most 50 characters after trimming, unique ignoring case (so no custom "other"); a method may change only the capitals of its own name.
- **Renaming a method:** changes the method on every brew that uses it; if at least 1 brew uses it, the user first confirms in a view listing those brews, and declining changes nothing.
- **Deleting a method:** each of its brews moves to a method the user picks per brew, "Other" by default; untouched brews move to "Other". A method with 0 brews is deleted after a simple confirmation. The toast always says "reassigned".
- **Stale method deletions:** a chosen target that no longer exists sends the brew to "Other"; listed brews that are gone or moved are ignored; unlisted brews of the method go to "Other". The delete always succeeds.
- **Method order:** the brew form's method dropdown and the journal's Method filter list methods A–Z with "Other" last; the methods dialog lists predefined methods in their fixed order, then custom methods A–Z, then "Other". A renamed predefined method keeps its place.
- **Method icon:** each predefined method has its own icon, which stays after a rename; custom methods and "Other" use the generic cup.
