# Brew detail

**Purpose:** Read one brew in full, especially long tasting notes, and jump to Edit or Delete.
**Prototype:** `../prototype/screens/brew-detail.html`

## Layout
`dialog` over the journal with `modal-backdrop`; 640px wide, 48px padding on desktop. Phone: bottom sheet (90% max height, `sheet-handle`, 24px padding).
1. Kicker row: 40px method icon (terracotta) + method name `label-caps`; close `icon-button` at the right.
2. Brew name `headline-lg` (phone `headline-md`) and "Bean · Origin" muted.
3. Facts grid 2×2 with hairlines (`dl`): RATING (beans + "5 of 5"), ROAST (swatch + word), METHOD, BREWED ON (date). Labels `label-caps` muted.
4. "TASTING NOTES" eyebrow (terracotta) + notes in `body-lg`, line-height 1.7, preserving line breaks. Empty: muted italic "No tasting notes yet. Edit this brew to add some."
5. Actions row above a hairline: ghost "Delete" in error color with trash icon (left), `button-primary` "Edit brew" with pencil icon (right). Phone: same row, equal width.

## Data shown
| Field | Source/type | Notes |
|---|---|---|
| Brew name, bean, origin, method, roast, rating, date, notes | Brew | All fields, notes untruncated with line breaks |

## States
| State | When | What differs |
|---|---|---|
| default | Brew with notes | As above (example: Kenyan Morning) |
| no-notes | Notes empty | Notes area shows the muted italic empty line (example: Quick Flat White Base, Espresso, 2 beans, Medium) |

## Interactions
- Opens from a card click. Close via ×, Esc or backdrop click; focus returns to the card.
- "Edit brew" → closes the detail and opens brew-form (edit) for this brew.
- "Delete" → brew-delete confirm for this brew.

## Design decisions
- Cards clamp notes to 3 lines; the full brew is shown in this modal with Edit/Delete — keeps the grid uniform.
- Facts as a hairline 2×2 ledger grid, not chips — editorial, premium.
- Bottom sheet on phone for consistency with the form and filters.
