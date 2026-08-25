# Migration notes

What changes in each codebase when it adopts this system, and why. Ordered by how much
work each item is, not by how important it is.

---

## Both codebases

### The palette is replaced, not remapped

`riser.events` and `promo.riser.events` both define the same variables in `globals.css`:

```css
--color-primary: #6666FF;          /* indigo */
--color-highlight: linear-gradient(135deg, #6666FF, #8b5cf6);
--color-bg: #F1F1F1;
--color-content-bg: #FFFFFF;
--color-text: #202020;
--color-content-border: #e5e4e4;
--color-shadow-primary: rgba(102, 126, 234, 0.3);
```

The closest mapping, for a mechanical first pass:

| Old | New | Note |
| --- | --- | --- |
| `--color-primary` | `--accent` | The indigo becomes the orange, but see **orange discipline** below — a straight swap will put orange on far more than 10% of the surface. |
| `--color-highlight` | — | No gradients. Delete the rule. |
| `--color-bg` | `--surface-page` | `#F1F1F1` → `#ECEBE8`. |
| `--color-content-bg` | `--surface-raised` | `#FFFFFF` → `#FAF9F7`. Keep the step: the page stays one shade under the things sitting on it. An earlier build of this system mapped both of these onto `--surface-page`, on the principle that a hairline is enough to separate a card from its ground. It is not — on a dense dashboard everything reads washed out, with nothing to tell surface from surface. `riser.events` shipped it that way and it was reverted. |
| `--color-text` | `--text-primary` | `#202020` → `#121212`. |
| `--color-text-secondary` | `--text-secondary` | `#666666` → `#5F6B7A`. |
| `--color-content-border` | `--border-hairline` | |
| `--color-shadow-primary` | — | No shadows. Delete. |
| `--color-error` `--color-success` | — | There is no red and no green. Status is a mono label over a rule; see `StatusBadge`. |
| notification palette (8 vars) | — | See `NotificationStack`. |

**The orange is not a drop-in replacement for the indigo.** The indigo was used for every
interactive element: links, hovers, active states, the sidebar CTA, the top loader, sort
icons, focus rings. The orange is used for one thing per view. A find-and-replace produces
a page that is roughly 40% orange and reads as an error state. Work screen by screen: pick
the one action or live figure, and make everything else ink, slate or a hairline.

### Fonts

Inter and Anton are both retired. Archivo replaces both — 800 where Inter 800 was, 900
where Anton was doing display work. Anton is a condensed face and Archivo at width 88–100%
is not, so headline line breaks will move; re-check any two-line headline.

`next/font/google` blocks in both `layout.tsx` files can be deleted. Archivo is self-hosted
in `assets/fonts/`; JetBrains Mono still comes from Google Fonts via `tokens/fonts.css`.

The `--font-body` and `--font-heading` variables become `--font-ui` and `--font-display`,
which are the same family.

### Corners

Every `rounded`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl` and
`rounded-full` goes to 0. The one exception in the whole system is the app icon tile.
`rounded-full` on avatars and status pills is the most common instance — avatars become
square, pills become mono labels over a rule.

### Shadows

Delete every `box-shadow` and every Tailwind `shadow-*`. Depth is a hairline, a change of
surface, or a scrim. `--shadow-none` exists so a component can state flatness.

### Motion

Replace `transition: all 0.2s` / `0.3s ease` with the tokens: `--duration-fast` (140ms) for
state changes, `--duration-base` (200ms) for entrances, `--ease-out` for both. Remove:

- `hover:scale-105`, `active:scale-95`, `transform: translateY(-1px)` on hover — nothing
  scales, nothing lifts
- `animate-spin` — nothing rotates; use `Loader` (see the note under riser.events below)
- `animate-bounce` — no bounce
- `animate-pulse` on shimmer gradients — `Skeleton` pulses in opacity instead
- `backdrop-filter: blur()` on the navbar
- Framer Motion's `scale: 0.9 → 1` entrances in `NotificationSlider` — the rise is 8px up,
  no scale

Keep Framer Motion if you want; the entrance is `y: 8 → 0`, `opacity: 0 → 1`, 200ms,
`[0.16, 0.84, 0.44, 1]`.

### Icons

`@phosphor-icons/react` is replaced by `lucide-react`. Phosphor's `weight="duotone"` and
`weight="fill"` have no equivalent and no place — icons are never filled. Common swaps:

| Phosphor | Lucide |
| --- | --- |
| `CaretUp` / `CaretDown` / `CaretLeft` / `CaretRight` | `ChevronUp` / `ChevronDown` / `ChevronLeft` / `ChevronRight` |
| `List` | `Menu` |
| `X` | `X` |
| `PencilSimple` | `Pencil` |
| `Trash` | `Trash2` |
| `Copy` | `Copy` |
| `Play` | `Play` |
| `CheckCircle` / `XCircle` / `Warning` / `Info` | `CheckCircle` / `XCircle` / `AlertTriangle` / `Info` |
| `Question` | `HelpCircle` |
| `FileCsv` | `FileText` |
| `Upload` | `Upload` |
| `MapPin` / `Calendar` / `Tag` / `Ticket` | `MapPin` / `Calendar` / `Tag` / `Ticket` |
| `Gift` | `Gift` |

Wrap them in `Icon` so the square-cap override applies.

### Emoji

`OrganizerTicketCard` uses 💰 📦 🛒 📅 ↩️ 💳 as row labels and "●" as a status bullet.
`CUFPhoneNumberInputGroup` renders flag emoji in the country selector and "▾" as its
chevron. All of it goes: mono caps labels for the rows, `StatusBadge` for the status, ISO
codes or a Lucide chevron for the selector.

---

## riser.events (RiserEvents)

- **`app/index.css` is 16 KB of page-specific CSS** alongside 27 route-level stylesheets.
  Most of it is card, button and layout rules that now come from `components.css`. Delete
  as you migrate each route rather than all at once.
- **`EventCard` needs its callers changed**, not just its styles. It currently receives
  `allTickets`, `allCities`, `allCountries`, `allLocations` and `allEventFeatures` and
  filters them in three `useEffect`s. Move those joins into the ISR loader
  (`EventCardISR`, `HomeEventsSectionISR`) and pass resolved strings.
- **Syncfusion.** `DateTimePickerComponent`, `RichTextEditorComponent` and the image editor
  ship their own Material stylesheets, which cannot be squared or recoloured without
  overriding them — which is what Promo already ended up doing in `globals.css`.
  `DetailForm` here uses a native `datetime-local` input. If Syncfusion stays, it needs a
  Riser theme stylesheet; that is not in this build.
- **The navbar is `position: fixed` with a `100px` top margin compensating on most pages.**
  The new navbar is sticky and in flow, so those margins come off.
- **`ErrorScreen` / `LoadingScreen` render the logo at 400×400** and scale it down with CSS.
  Use `EmptyState` and `LoadingScreen`.
- **`Loader` is now RiserEvents' own implementation.** The design system originally shipped
  a generic loader — four fixed-width bars on percentage heights, scaled on a
  `skewX(-10deg)` transform, sized by a hard-coded 28px box. That entry is replaced by
  `components/ui/RiserLoader.tsx` + `riserLoader.css` from RiserEvents, which is cut to the
  mark's actual polygons: 16-unit bars on 8-unit gaps, a real clip-path shear per bar, and
  the mark's baseline rule below them, all scaling from a `size` prop on the mark's 88 x 84
  box. Two consequences when migrating:
  - The prop contract changed. `onInk?: boolean` on `Loader` is now
    `variant?: 'full' | 'mono' | 'on-ink'`, plus `size` and `label`. `LoadingScreen` keeps
    its `onInk` boolean and maps it to the `on-ink` variant, so its callers are unaffected.
  - The markup and class names changed. `.riser-loader__bar` × 4 becomes a
    `.riser-loader-bars` wrapper holding `.riser-loader-bar` × 4, followed by a
    `.riser-loader-stage` span. Anything hand-writing the old markup needs updating; the
    styles now live in `components/components.css` like every other component, not in a
    per-component stylesheet.

## promo.riser.events (RiserPromo)

- **Tailwind is fine to keep.** Import `tokens/tailwind.css` after `styles.css` and the
  utility names stay; their values change. `p-4` is 16px, `gap-6` is 26px — the brief's
  steps, not Tailwind's default scale. Check any layout that relied on `gap-6` being 24px.
- **`DataGrid` loses its data fetching.** It currently calls `getOrganizerBySlug`,
  `getOrganizerById` and `getTeamMembersByRiserUserId` and reads Clerk's user, in order to
  decide whether to show one banner. Lift that to the screen and pass `notice`. The credit
  screen renders the same banner inline; it uses `Notice` now too.
- **`DetailForm` loses its router.** `handleChange`'s `__ADD_AUDIENCE__` and
  `__ADD_TEMPLATE__` sentinels and the `parentAudienceId` reset move to the screen via
  `onAddOption` and `onChangeField`.
- **The status ramp in `globals.css` can be deleted.** `.status-none` through
  `.status-unknown` are commented out already; `StatusBadge` and `campaignStatus()` replace
  them.
- **`WelcomeBanner`'s skeleton uses a 1000px shimmer sweep** in eight places. Replace with
  `Skeleton`, or with `StatCard` once the values load.
- **The confirm dialog's logo comes out.** A 150px lockup inside every confirmation is not
  a use the logo rules cover, and it pushes the actual question below the fold on mobile.

---

## Order of work

1. Swap the token files in and delete the old `:root` block. Everything will look wrong;
   that is expected — the radii and shadows are still in the component CSS.
2. Delete radii and shadows globally.
3. Replace fonts. Re-check headline breaks.
4. Migrate the shared primitives: Button, Card, Field, StatusBadge. This is most of the
   visual change.
5. Migrate DataGrid, DetailView, DetailForm. This is most of the dashboard.
6. Screen by screen, apply the orange discipline: pick the one orange thing.
7. Swap the icon library.
8. Delete the route-level stylesheets that no longer do anything.
