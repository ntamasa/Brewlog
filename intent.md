# Brewlog

## Objective

Brewlog is a coffee tasting journal web application. It lets a coffee drinker record, review, and organize the brews they make, so they can remember what they tasted and find their best brews again. It is built as a real product, used by a single person on a local or private deployment.

The application has two main pages:

- **Landing page:** a modern, eye-catching page that attracts visitors and explains what Brewlog is and what it offers, with a way into the app page.
- **App page:** where the user lists, adds, edits, deletes, searches, filters, and sorts their brews.

All brews are stored in a database through a backend, so every create, update, and delete is persisted.

## Constraints

### Technical

- Backend: Java Spring Boot.
- Frontend: Angular.
- Database: PostgreSQL.
- The project is greenfield (no existing code).
- Single user, no authentication. Because of this, the application is deployed only locally or privately, not exposed publicly.
- Both the landing page and the app page must be responsive and work well on phone and desktop screens.

### Brew data

Each brew has the following fields:

- **Brew name:** required and unique (uniqueness is case-insensitive). Used for text search.
- **Bean name:** required.
- **Origin of the beans:** required.
- **Brew method:** required, selected from a dropdown.
- **Roast level:** required, selected from a dropdown of Light, Medium, Dark.
- **Rating:** required, from 1 to 5.
- **Creation date:** required, picked by the user, defaults to today, editable later.
- **Tasting notes:** optional.

### Brew methods

- The dropdown offers a predefined list of common methods (e.g. Espresso, Pour Over, Moka Pot) plus an "Other" option.
- The user can add a new method by free text. It is saved to the database and is selectable for later brews.
- All methods, predefined and custom, can be renamed or deleted, except "Other", which is protected.
- Renaming a method updates the method shown on every brew that uses it.
- Deleting a method reassigns every brew that used it to "Other".

### In scope

- Create, list, edit, and delete brews, all persisted in the database.
- Deleting a brew asks for confirmation and is permanent afterwards.
- Text search on brew name.
- Filters by brew method, roast level, and minimum rating.
- Sorting by creation date or rating, ascending or descending, defaulting to newest first.
- Search, filters, and sort apply together.
- Managing brew methods as described above.

### Out of scope

- Authentication and multiple user accounts.
- Public deployment.
- Photos or images for brews.
- Statistics, analytics, or charts.

## Success Criteria

- The landing page is modern and eye-catching, explains the application, and leads the user to the app page.
- The user can create a brew with all fields listed above; required fields are enforced, tasting notes may be left empty, and the date defaults to today.
- A brew whose name matches an existing brew name (ignoring case) is rejected.
- The user can edit any field of an existing brew, and the changes are saved.
- The user can delete a brew after confirming in a dialog; the brew is permanently removed.
- All brew and brew-method changes are stored in PostgreSQL through the backend.
- The user can add a custom brew method by free text, and it then appears in the dropdown for later brews.
- Renaming a brew method updates it on all brews using it; deleting one reassigns those brews to "Other"; "Other" cannot be renamed or deleted.
- Text search by brew name, filters (method, roast level, minimum rating), and sort (date or rating, ascending or descending, default newest first) all work and combine correctly.
- Invalid input is rejected by the backend, and the validation errors are shown to the user in the UI.
- Both pages are usable on phone and desktop screen sizes.
- The backend has automated tests covering the API's create, read, update, delete operations and validation.
- The frontend has automated tests for its components and services.
