# Delete brew

**Purpose:** Confirm before a brew is permanently deleted.
**Prototype:** `../prototype/screens/brew-delete.html`

## Layout
`dialog` (480px, `role="alertdialog"`) over the journal with `modal-backdrop`; on phone it stays a centered dialog with stacked full-width buttons.
1. 48px error-soft circle with trash icon (error color).
2. Title `headline-md` "Delete this brew?" + muted line "It will be permanently removed from your journal. This can’t be undone."
3. Summary box (ivory fill, hairline): method icon, brew name in serif `headline-sm`, "Pour Over · Light · 28 Oct 2026" muted.
4. Error banner slot.
5. Actions: `button-secondary` "Keep brew" + `button-danger` "Delete brew". Phone: stacked, Delete on top.

## Data shown
| Field | Source/type | Notes |
|---|---|---|
| Brew name, method, roast, date | Brew | Identifies exactly what will be deleted |

## States
| State | When | What differs |
|---|---|---|
| default | Delete chosen from card menu or detail | As above |
| deleting | Request in flight | Danger button shows spinner + "Deleting…" (`aria-busy`) |
| error | Delete failed | Banner "Couldn’t delete this brew — The server didn’t respond, so nothing was removed. Try again in a moment."; "Delete brew" retries |
| gone | The brew was already deleted elsewhere (e.g. another tab) | Banner "This brew no longer exists — It may have been deleted in another tab. Your journal has been refreshed."; "Keep brew" and "Delete brew" are replaced by one `button-primary` "Close"; the journal behind refreshes |

## Interactions
- Initial focus on "Keep brew" (safe default). Esc / backdrop = Keep.
- "Delete brew" → deleting → success: close, toast "Brew deleted", list refreshes; failure: error state; brew not found: gone state.
- gone: focus moves to "Close"; Close / Esc / backdrop closes the dialog. No toast.

## Design decisions
- Confirmation dialog, then permanent delete, no undo (per intent).
- The dialog names the brew and its key facts so the user deletes the right one.
- Brew already gone: one "Close" button, since retrying a delete of a missing brew is pointless.
- Danger color only inside this confirmation, never on the card menu trigger itself (menu item text uses error color as a hint).
