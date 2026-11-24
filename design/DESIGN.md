---
version: alpha
name: Brewlog
description: Ivory editorial luxury for a private coffee tasting journal. Paper-warm surfaces, espresso ink, a single burnt-terracotta accent, high-contrast serif headlines and a quiet sans for data.
colors:
  primary: "#2B1D16"
  on-primary: "#FAF6EE"
  primary-hover: "#45302A"
  secondary: "#6B5A4E"
  tertiary: "#B4532A"
  tertiary-hover: "#96441F"
  tertiary-soft: "#F3E2D6"
  neutral: "#F7F2E9"
  surface: "#FFFDF8"
  surface-sunken: "#EFE8DC"
  on-surface: "#2B1D16"
  on-surface-muted: "#6B5A4E"
  outline: "#DCD2C3"
  outline-strong: "#B5A592"
  error: "#A3302A"
  error-soft: "#F7E3DF"
  roast-light: "#C9A27A"
  roast-medium: "#8A5A3B"
  roast-dark: "#3B2820"
  scrim: "#1A120DB8"
  backdrop: "#2B1D1680"
  on-scrim: "#FAF6EE"
typography:
  display-xl:
    fontFamily: Cormorant Garamond
    fontSize: 88px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: -0.02em
  display-md:
    fontFamily: Cormorant Garamond
    fontSize: 52px
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Cormorant Garamond
    fontSize: 40px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Cormorant Garamond
    fontSize: 30px
    fontWeight: 600
    lineHeight: 1.15
  headline-sm:
    fontFamily: Cormorant Garamond
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.2
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.65
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.3
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.16em
rounded:
  none: 0px
  sm: 2px
  md: 4px
  full: 9999px
spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  4xl: 96px
  5xl: 144px
  gutter: 24px
  page-margin: 48px
  page-margin-mobile: 16px
  content-max: 1200px
  drawer-width: 520px
  control-height: 44px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    height: "{spacing.control-height}"
    padding: 0 24px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-accent:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    height: "{spacing.control-height}"
  button-accent-hover:
    backgroundColor: "{colors.tertiary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    height: "{spacing.control-height}"
  button-ghost:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    height: "{spacing.control-height}"
  icon-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    size: "{spacing.control-height}"
    rounded: "{rounded.sm}"
  fab:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    size: 56px
    rounded: "{rounded.full}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    height: "{spacing.control-height}"
    padding: 0 14px
  input-field-error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
  field-label:
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
  field-error:
    textColor: "{colors.error}"
    typography: "{typography.body-sm}"
  chip-filter:
    backgroundColor: "{colors.tertiary-soft}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    height: 32px
  segmented-option-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  brew-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  brew-card-highlight:
    backgroundColor: "{colors.tertiary-soft}"
  bean-rating:
    textColor: "{colors.tertiary}"
    size: 18px
  roast-swatch-light:
    backgroundColor: "{colors.roast-light}"
    size: 10px
    rounded: "{rounded.full}"
  roast-swatch-medium:
    backgroundColor: "{colors.roast-medium}"
    size: 10px
    rounded: "{rounded.full}"
  roast-swatch-dark:
    backgroundColor: "{colors.roast-dark}"
    size: 10px
    rounded: "{rounded.full}"
  roast-tag:
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-caps}"
  method-icon:
    textColor: "{colors.tertiary}"
    size: 40px
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.xl}"
  modal-backdrop:
    backgroundColor: "{colors.backdrop}"
  drawer:
    backgroundColor: "{colors.surface}"
    width: "{spacing.drawer-width}"
  bottom-sheet:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
  sheet-handle:
    backgroundColor: "{colors.outline-strong}"
    width: 36px
    height: 4px
    rounded: "{rounded.full}"
  banner-error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
  toast:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
  skeleton:
    backgroundColor: "{colors.surface-sunken}"
    rounded: "{rounded.sm}"
  pagination-current:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    size: 40px
  hero-scrim:
    backgroundColor: "{colors.scrim}"
    textColor: "{colors.on-scrim}"
---

# Brewlog

## Overview

Brewlog is a private coffee tasting journal for one person. The look is **ivory editorial luxury**: it should feel like a hand-bound tasting ledger from a high-end roaster, not a SaaS dashboard. Expensive comes from restraint: generous whitespace, a high-contrast serif for headlines, hairline rules instead of shadows, one accent color used sparingly, and precise alignment.

- The **landing page** is atmospheric: a full-bleed photograph with a dark scrim and serif headline, then calm editorial sections with photography.
- The **app page** is quiet and typographic: ivory paper, white cards with hairline borders, fine-line method icons and thin-line bean ratings in terracotta. No photographs in the app.
- Light theme only. Viewports designed: mobile 390px and desktop 1440px.

## Colors

Warm paper neutrals, espresso ink and a single burnt-terracotta accent.

- **Primary (#2B1D16) Espresso Ink:** body text, headlines and the primary button (ivory text on espresso). Hover: #45302A.
- **Secondary (#6B5A4E) Mocha:** metadata, helper text, secondary labels (6.1:1 on neutral).
- **Tertiary (#B4532A) Burnt Terracotta:** the only accent. Bean ratings, method icons, links, focus rings, active filter chips, the accent CTA on the landing page. 4.9:1 on neutral, so it may carry text at 14px+. Soft tint #F3E2D6 for chips and the "just saved" card highlight.
- **Neutral (#F7F2E9) Ivory Paper:** page background. **Surface (#FFFDF8):** cards, dialogs, drawer, inputs. **Surface sunken (#EFE8DC):** skeletons, toolbar wells.
- **Outline (#DCD2C3):** 1px hairlines on cards, inputs, dividers. **Outline strong (#B5A592):** input hover and dashed empty-state frames.
- **Error (#A3302A)** with soft tint #F7E3DF. Success needs no color: confirmations use the espresso toast.
- **Roast swatches:** light #C9A27A, medium #8A5A3B, dark #3B2820. Always paired with the roast word, never color alone.
- **Scrim (#1A120D at 72%)** over the hero photo; **Backdrop (#2B1D16 at 50%)** behind dialogs, drawer and sheets.

## Typography

**Cormorant Garamond** (display, headings, brew names) and **Inter** (UI, data, forms). Google Fonts.

- `display-xl` 88px (landing hero desktop), `display-md` 52px (hero mobile, section heads desktop).
- `headline-lg` 40px (page title "Your journal", landing section heads mobile), `headline-md` 30px (dialog and drawer titles, detail brew name), `headline-sm` 24px (brew name on cards).
- `title-md` Inter 16/600 for small headings in UI; `body-lg` 18 for landing prose; `body-md` 15 for UI text and notes; `body-sm` 13 for metadata, helper and error text.
- `label-md` Inter 14/500 for buttons and field labels; `label-caps` 11px, 0.16em tracking, uppercase, for eyebrows ("TASTING NOTES", "PAGE 2 OF 5") and roast tags.
- Never set Inter below 13px. Brew names are always the serif.

## Layout

- 8px rhythm (`xs` 4 … `5xl` 144). Content max width 1200px, centered, page margins 48px desktop / 16px mobile.
- **Landing:** full-viewport hero; sections separated by `4xl`/`5xl` vertical space on desktop, `3xl` on mobile.
- **App:** sticky header (64px) → page title row → toolbar → 3-column card grid (gutter 24px) → pagination. Mobile: one column, toolbar collapses to search + "Filters" button, FAB bottom-right.
- **Drawer** 520px from the right on desktop; on mobile the form is a bottom sheet at 90% viewport height. Dialogs max 480px wide (methods dialog 560px), full-width minus 16px margins on mobile.
- Breakpoints: mobile < 768px (1 col), tablet 768–1119px (2 col), desktop ≥ 1120px (3 col).

## Elevation & Depth

Flat by default. Hierarchy comes from tonal layers (ivory page → white surface) and 1px `outline` hairlines, not shadows. The only shadow is a soft, wide one under floating layers (drawer, dialogs, bottom sheet, toast, FAB, menus): `0 24px 64px -24px` in espresso at 35%. Hovering a card darkens its hairline to `outline-strong` and lifts it 2px. No shadow on cards at rest.

## Shapes

Tailored, near-sharp corners: `sm` 2px for buttons, inputs, chips' inner elements and menus; `md` 4px for cards, dialogs, drawer and sheet top corners. `full` only for the FAB, filter chips and the pagination current-page marker. Icons are fine-line: 1.25px stroke at 24px, round caps and joins.

## Components

- **Buttons:** primary (espresso, ivory text), accent (terracotta, landing CTAs only), secondary (surface with 1px outline), ghost (text only), danger (error red, only inside delete confirmations). Height 44px. Labels in `label-md`, sentence case.
- **Icon button:** 44×44 hit area, 20px fine-line icon, always with `aria-label`. The card ⋮ menu uses this.
- **Input field:** surface fill, 1px outline (hover: `outline-strong`), 2px radius, 44px tall; textarea min 120px. Label always above (`label-md`), helper/error below (`body-sm`). Focus: 1px terracotta border + 3px terracotta-soft ring. Error: error border, error-soft fill, message below with an icon.
- **Select:** same as input with a chevron. The method select ends with a divider and "+ Add new method" which turns into an inline text field with Add/Cancel.
- **Bean rating:** five fine-line coffee-bean glyphs, filled terracotta for the score, outlined for the rest. Display 16–18px; input 32px glyphs with 44px hit areas as a radio group ("4 of 5 beans"). Min-rating filter uses the same glyphs as a "≥ n" select.
- **Brew card:** white surface, 1px outline, 4px radius, 24px padding. Top row: 40px fine-line method icon (terracotta) + method name, ⋮ menu at the right. Brew name (`headline-sm`), "Bean · Origin" (`body-sm` muted), hairline, bean rating + roast tag (swatch dot + LIGHT/MEDIUM/DARK), date, notes clamped to 3 lines in italic-free `body-md`. Whole card is a button that opens the detail.
- **Filter chip:** terracotta-soft pill with label and × button, 32px tall (44px hit area via padding).
- **Dialog / drawer / bottom sheet:** surface, title in `headline-md`, close icon button top-right, actions bottom-right (sticky bar on drawer/sheet). Sheets have a 36×4 grab handle.
- **Error banner:** error-soft fill, error text, icon, `role="alert"`, lists linked field errors or the server message.
- **Toast:** espresso pill-ish (2px radius) bar, bottom-center, ivory text, no undo; auto-dismiss 4s; `role="status"`.
- **Skeleton:** sunken blocks matching the card layout, gentle 1.6s shimmer (disabled under reduced motion).
- **Pagination:** prev / numbered pages / next on desktop; prev / "Page 2 of 5" / next on mobile.

## Do's and Don'ts

- Do keep terracotta to accents: ratings, icons, links, focus, one CTA per landing section. Never fill large areas with it.
- Do use the serif only for headings and brew names; all UI controls and data are Inter.
- Do use hairlines and whitespace to separate; don't add drop shadows to cards or nest boxes in boxes.
- Don't use photography inside the app page; photos are for the landing page only.
- Don't use emoji or filled/cartoon icons; all icons are fine-line SVG at 1.25px stroke.
- Do keep WCAG AA: body text 4.5:1, never place mocha text on surface-sunken below 13px.
- Do pair roast colors with the roast word, and every icon-only button with an aria-label.
- Don't mix radii in one view beyond the documented `sm`/`md`/`full` roles.
