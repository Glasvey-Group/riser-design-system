---
name: riser-design-system
description: Build UI for Riser — riser.events, promo.riser.events, the marketing site and the Micro-SaaS tools — using the settled Riser design system. Use whenever writing or reviewing components, screens, styles or copy for any Riser surface, or when asked about Riser's colours, type, spacing, motion, iconography, logo or voice.
---

# Riser Design System

Four colours, Archivo, JetBrains Mono for labels and data, square corners, hairline rules,
flat surfaces, one signal colour. Import `styles.css` and use the primitives in
`components/`; do not restyle them inline. In a Next.js app import
`styles-no-fonts.css` instead and let `next/font` supply Archivo and JetBrains Mono —
see the README.

## Before writing any UI

Read `README.md` for the rules and `docs/COMPONENTS.md` for prop contracts. If you are
changing an existing Riser codebase, read `docs/MIGRATION.md` first — the old indigo
`#6666FF` palette is not a drop-in swap for the orange.

## The eight rules

1. **One orange thing per view.** If the view has a primary action, the orange is on that
   action and nothing else. If it has no primary action, the orange may mark the single
   most important live figure. Never both. Orange is ~10% of any surface.
2. **The orange belongs to the commercial action.** Not to the most prominent button —
   to the one that moves the business forward: Promote on the organiser dashboard, Sign up
   on the marketing site. Editing, updating, saving and cancelling never take it, however
   central they are to the screen. A form's submit is `ink`, its cancel is `secondary`, and
   a create is `ink` unless that create *is* the commercial action. Most working screens
   have no orange at all, and should. A confirmation dialog inherits the tone of the action
   it confirms rather than defaulting to the loudest button available: `danger` to destroy,
   `primary` only where the thing being confirmed is itself the commercial action, `ink`
   otherwise. One orange for "Yes, Publish" and "Yes, Delete" alike tells the reader nothing
   about which one they are about to do.
3. **Square everywhere.** Radius 0. The only exception in the identity is the app icon
   tile, at 22% of its side.
4. **Hairline rules rather than boxes.** 1px for separation, 2px ink for a grid header or
   section break, dashed only for measurement and specification.
5. **Flat, but not flat-toned.** No shadows, no gradients, no tints of the orange. Depth is
   a rule, a change of surface, or a 70% ink scrim over a photograph — and the page sits a
   step under the things on it (`--surface-page` vs `--surface-raised`), so a card reads as
   raised rather than dissolving into its ground.
6. **Mono is load-bearing, and there is exactly one label.** Labels and all numeric or
   technical data are JetBrains Mono, caps, 0.16em tracking, slate — never body copy, and
   never for strings longer than a few words (use sentence-case mono for those). Every
   label in the system is the single `.riser-label` rule: a field's, a stat's, a filter's,
   a detail row's, an empty state's, a section's. A label you style yourself is a label
   that will drift, and a `.thing-group label` descendant rule outranks `.riser-field__label`
   and silently keeps the old size after the markup has been migrated. Reach for `Field`
   for anything in a form and `.riser-label` for a caption that is not part of a component.
7. **An icon is the colour of what it sits in, and a button's only icon is a create's
   plus.** A leading Lucide `Plus` through `icon` when
   the button creates a new record — never a literal "+" in the label, which is a unicode
   symbol doing an icon's job. Edit, Update, Cancel, Save, Promote, View and Duplicate go
   without: the verb is the affordance, and an icon restating its label is ornament.
   Icon-only controls in a dense row are the exception and carry an `aria-label`.
8. **Things enter by rising.** 8px up, 200ms, `cubic-bezier(0.16, 0.84, 0.44, 1)`, 45ms
   stagger. Nothing scales on hover. Nothing rotates.

## Tokens

Never write a raw hex, px value or duration. Use the custom properties.

```
--orange #F28600   --ink #121212   --paper #FAF9F7   --slate #708090
--slate-text #5F6B7A (secondary copy)   --ink-soft #3A3A3A (body)
--paper-dim #ECEBE8 (the page ground, one step under paper)
--accent-hover #D97800   --line   --line-strong   --scrim-ink

--surface-page   the ground: body, anything flush with it   (= --paper-dim)
--surface-raised cards, panels, inputs, modals, navbar      (= --paper)

--font-display / --font-ui  Archivo      --font-mono  JetBrains Mono
--text-display 52  --text-h1 36  --text-h2 26  --text-h3 20
--text-body-size 15  --text-small 13.5  --text-label 11
--weight-regular 400  --weight-medium 500  --weight-bold 800  --weight-black 900
--tracking-label 0.16em

--space-1..9  4 8 12 16 20 26 34 52 76
--radius-none 0   --hairline 1px   --rule-heavy 2px
--duration-fast 140ms  --duration-base 200ms  --duration-slow 320ms
--ease-out cubic-bezier(0.16, 0.84, 0.44, 1)   --rise-distance 8px   --stagger-step 45ms
```

Contrast that is allowed: ink on paper 17.8:1 · paper on ink 17.8:1 · ink-soft on paper
10.8:1 · orange on ink 7.3:1 · ink on orange 7.3:1 · slate-text on paper 5.2:1.
Never: slate as body text (3.9:1) · white on orange (2.6:1) · orange as text on paper
(2.4:1).

## Components

```tsx
import {
  Button, Card, CardHeader, CardFooter, SectionLabel, StatCard, StatusBadge,
  Field, Input, Textarea, Select, SearchInput, Checkbox, Dropzone,
  DataGrid, Pagination, Filter, DetailView, DetailForm,
  Modal, ConfirmModal, LoadingModal, Loader, LoadingScreen, Skeleton,
  Notice, NotificationStack, Navbar, Drawer, DrawerSection, DrawerLink,
  EventCard, EventCardSkeleton, TicketCard, EmptyState, Icon,
  LogoLockup, LogoMark, LogoAppIcon,
} from 'riser-design-system';
```

Button variants: `primary` (the orange — one per view) · `ink` · `paper` (solid action on
an ink surface) · `secondary` · `ghost` · `danger`. Sizes `sm` `md` `lg` = 28 36 44px.

Status is `StatusBadge` with tone `live` · `neutral` · `done` · `stopped`, plus
`campaignStatus(n)` and `deliveryStatus(n)` for Promo's numeric enums. Never a coloured
pill.

## Screen composition, as the Promo Dashboard does it

DetailView (or DetailForm when creating or editing) → the Add button → any contextual
grids → the main DataGrid with the selected row marked. Page container is
`.riser-container` at 1440px with a 48px gutter. Sections are introduced by a
`SectionLabel` — `01 — CORE`.

## Icons

Lucide only, wrapped in `Icon`, at 16/20/24. Never filled, never in a tinted tile, never
decorative beside a heading. No emoji, ever, in UI or in copy. If a glyph is missing from
Lucide, hand-build it on the same grid and record it in `docs/ICONS.md`.

## Copy

Section headlines in caps, declarative, often two beats. Body in sentence case, short,
factual, numbers-forward. Verbs of motion: push, drive, amplify, reach, convert. The
company is "we"; the organiser is "you". Named things get named plainly: The Promo
Dashboard, The Heat Map, Influencer Bridge, Campaign Credits. No emoji, no exclamation
marks, no "revolutionary" or "game-changing". A claim ships with a figure attached or it
does not ship.

## Imagery

Live event photography, underexposed, warm stage light, deep shadow, real rooms, shot from
inside the crowd or the booth. No duotone, no orange wash, no filters, no grain. Full-bleed
to the grid edge, never inset in a rounded card. Text over an image needs a 70% ink scrim
or the darkest third of the frame. Avoid stock crowd shots with raised hands and lit
phones, cool blue club photography, and any visible watermark or competitor branding.

There is no approved photography yet. Use `.riser-figure` with a dark placeholder and flag
it, rather than reaching for the frames in `RiserSolutions/public/images/events` — those
were audited and every one fails the rules above.

## Common mistakes

- Swapping `#6666FF` for `#F28600` everywhere. That produces a 40% orange page.
- A `rounded-full` pill for status. Use `StatusBadge`.
- A spinner for loading. Use `Loader` — the mark's bars rising, cut to the mark's own
  geometry. `variant`: `full` (default) · `mono` (inside a filled button) · `on-ink`.
- `hover:scale-105` or a shadow on hover. Take the hairline to ink instead.
- Mono caps for a sentence. It is a label device; it fails past a few words.
- An icon in a tinted circle beside a stat. Use `StatCard`; the label carries the meaning.
- Emoji as row labels. Use mono caps labels.
- Red for errors, green for success. There is no red and no green.
