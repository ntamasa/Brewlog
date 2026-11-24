# Landing

**Purpose:** First impression of Brewlog. Explains what the journal keeps and how it works, and sends the visitor into the app.
**Prototype:** `../prototype/screens/landing.html`

## Layout
1. **Hero** (full viewport height): full-bleed photo `assets/hero-pour-over.jpg` under `hero-scrim` (scrim gradient left→right on desktop, top→bottom on phone).
   - Top nav: brand mark + "Brewlog" (left, `on-scrim`), "Open journal →" link (right).
   - Eyebrow `label-caps` in `tertiary-soft` with a 40px rule: "A private coffee tasting journal".
   - Headline `display-xl` (desktop) / `display-md` (phone): "Remember every cup *worth remembering.*" (second half italic, `tertiary-soft`).
   - Lede `body-lg` (phone `body-md`), max ~520px.
   - CTAs: `button-accent` "Open my journal" + outlined on-scrim button "How it works" (anchors to #how). Equal-width on phone.
   - Desktop only: hairline-topped footer strip listing the fields in `label-caps`: Bean & origin · Method · Roast · Rating · Tasting notes.
2. **What it keeps** (`5xl` vertical padding desktop, `4xl` phone): eyebrow + `display-md` "A ledger for the cups you love." Two columns 5/7: portrait photo `assets/beans.jpg` with a floating caption card (5 filled beans + "Ethiopia Guji, washed. Light roast, pour over."), and a 2×2 feature list (1 column on phone). Each feature: hairline top, 32px fine-line terracotta icon, `headline-sm` title, muted body.
   - Log every brew (notebook icon), Find any cup again (search), Your methods, your words (pour-over), Private by design (lock).
3. **How it works** (`id="how"`, surface band with hairlines): eyebrow + "Brew. Log. Rediscover." and a 3-step ordered list with italic serif roman numerals (i., ii., iii.) in terracotta, hairline separated. Right column: photo `assets/cup-notebook.jpg` (4:5) with an overlapping sample `brew-card` ("Kenyan Morning") that floats over its bottom-left corner. Stacks on tablet/phone.
4. **Closing CTA** (centered): 64px vertical terracotta rule, `display-md` "Your next great cup starts with the last one.", muted `body-lg` line, `button-primary` "Open my journal →" (full width on phone).
5. **Footer**: brand + one muted line incl. Unsplash photographer credits.

## Data shown
| Field | Source/type | Notes |
|---|---|---|
| All copy | Static | No backend data on this page |
| Photos | Static assets, Unsplash License | hero-pour-over.jpg (Nadia Valko), beans.jpg (Mona Jain), cup-notebook.jpg (Andres Molina) |
| Sample card | Static | Illustrative only, not user data |

## States
| State | When | What differs |
|---|---|---|
| default | Always | Only state |

## Interactions
- "Open my journal" / "Open journal" → app page (brews).
- "How it works" → smooth-scroll to the How it works section (instant under reduced motion).
- Brand mark → landing (top).

## Design decisions
- Premium "ivory editorial luxury" look, light theme only — the user asked for a premium, expensive look; replaces the earlier playful direction.
- Full-bleed photo hero with dark scrim and overlaid text — chosen over split and banded layouts for drama.
- Photography from Unsplash, downloaded into `prototype/assets/` (not hotlinked), used on the landing page only.
- Sections: hero + features + how-it-works + closing CTA + footer — explains enough for a single-user private app without a long marketing page.
- Cormorant Garamond for display, Inter for UI; terracotta accent used sparingly (eyebrows, icons, numerals, one CTA).
- Viewports designed: 390 mobile, 1440 desktop.
