# Component reference

Every primitive, its prop contract, and the file it was recreated from. Source paths are
relative to each repository root: `RiserEvents/` and `RiserPromo/`.

Legend — **E** RiserEvents · **P** RiserPromo · **E+P** existed in both, folded into one.

---

## Button — E `components/ui/button/button.tsx`

```ts
variant?: 'primary' | 'ink' | 'paper' | 'secondary' | 'ghost' | 'danger'   // default 'secondary'
size?:    'sm' | 'md' | 'lg'                                              // default 'md'  (28 / 36 / 44px)
block?:   boolean
icon?:    ReactNode
loading?: boolean
// plus every ButtonHTMLAttributes
```

Events' size contract is kept exactly. `default` → `primary`, `outline` → `secondary`.
`ink`, `paper`, `ghost` and `danger` are added to cover what Promo was doing with inline
Tailwind (`bg-black text-white`, bordered cancel buttons, borderless row actions) so those
stop being one-off classNames.

`primary` is the orange — at most one on screen. `paper` is the solid action on an ink
surface where the orange is spent elsewhere. `danger` is an ink outline that fills on
hover; there is no red in the palette, and the copy says what will happen.

`loading` puts the mono `Loader` in the icon slot, disables the button and sets
`aria-busy`; the loader itself is `aria-hidden`, since `aria-busy` already carries it and
`Loader`'s `role="status"` would otherwise announce a second time. A loading button keeps
its variant fill rather than taking the disabled grey — going flat mid-save reads as the
button having broken. Keep the label, or move it to its progressive form ("Saving"); a
button that empties its label mid-action leaves the user without the thing they clicked.

A spinner is not the ornament rule 7 forbids. Rule 7 rules out an icon restating its own
label; a loader reports state the label cannot.

## Card / CardHeader / CardFooter — E+P

```ts
tone?:        'paper' | 'ink' | 'accent'      // default 'paper'
padding?:     'default' | 'tight' | 'none'    // 26 / 16 / 0
dashed?:      boolean                          // specification and measurement only
interactive?: boolean                          // hover takes the rule to ink; no lift
onClick?:     () => void
```

Events' `.pru-stat-card` and `.dru-description-section` and Promo's
`bg-content-bg border border-content-border rounded-lg p-6` were the same card at three
radii. Radius is now 0 in all of them.

## SectionLabel

```ts
index?:  string        // "01", rendered before an em dash
ruled?:  boolean       // hairline under the label
accent?: boolean       // index in orange — only when this section holds the view's orange
as?:     'div' | 'h2' | 'h3'
```

New, but not invented: it is the brief's stated organising device ("a small mono label
above each section, `01 — CORE`") which neither codebase had a component for.

## StatusBadge — E+P

```ts
tone?:    'live' | 'neutral' | 'done' | 'stopped'   // default 'neutral'
boxed?:   boolean      // for ink surfaces
onImage?: boolean      // ink block behind, for badges over photography
```

Exports `CAMPAIGN_STATUS`, `CAMPAIGN_STATUS_TONE`, `DELIVERY_STATUS_TONE`,
`campaignStatus(n)`, `deliveryStatus(n)` — Promo's numeric enums mapped once, so screens
stop re-deriving them.

Events used `rounded-full` pills; Promo had a commented-out six-shade grey ramp in
`globals.css`. Six greys are indistinguishable at 11px, and the brand has one signal
colour, so state is a mono caps label over a 2px rule and only `live` spends the orange.

## StatCard — E `PublicReUseableComponents` + P upload statistics, WelcomeBanner

```ts
label: string
value: ReactNode
note?: ReactNode
live?: boolean          // figure in orange; only on views with no primary action
tone?: 'paper' | 'ink'
```

Events put every figure beside a 40px icon in a tinted rounded tile, which the brief rules
out twice — icons are never boxed in a tinted tile, and never decorative beside a heading.
The label carries the meaning.

## Field / Input / Textarea / Select / SearchInput / Checkbox — E `CreateUpdateFormComponents`

```ts
// Field
label: string; htmlFor?: string; required?: boolean
error?: string; hint?: string; full?: boolean

// Input     extends InputHTMLAttributes  + data?: boolean   (mono, tabular figures)
// Textarea  extends TextareaHTMLAttributes
// Select    extends SelectHTMLAttributes
//   options: {value, label}[]; placeholder?: string
//   addOptionLabel?: string; onAddOption?: () => void      // Promo's "+ Add Audience"
// SearchInput extends InputHTMLAttributes + icon?: ReactNode
// Checkbox  extends InputHTMLAttributes                     // square, ink fill when checked
```

Two changes from what shipped: labels are mono caps rather than 14px Inter in grey, and
`error` carries real text — Events rendered the literal string `"Required"` for every
error whatever went wrong. The `theme: '1' | '2'` prop on `CUFPhoneNumberInputGroup`
(underline fields vs bordered-plus-radius) is gone; there is one control treatment.

## Filter — E `components/Filter.tsx`

```ts
items: {id, value}[]
selectedId: string
onChange: (id: string) => void
label?: string
allLabel?: string | null     // default 'All'
align?: 'left' | 'right'
```

Promo built the same control inline inside DataGrid. DataGrid now renders this one.

## DataGrid — E `components/ui/DataGrid/DataGrid.tsx` (canonical)

```ts
title: string
columns: ColumnConfig[]
data: any[]
pageSize?: number            // default 10 — page count only; the parent slices
showPagination?: boolean
totalCount?: number          // total in the database, not in `data`
activePageNumber?: number    // 1-indexed
onPageChange?: (pageIndex: number) => void
emptyMessage?: string
searchable?: boolean         // default true
searchPlaceholder?: string
filterOptions?: FilterOption[]
filterKey?: string           // default 'filterId'
filterLabel?: string
activeId?: string
onRowClick?: (row: any) => void      // falls back to row.baseUrl
notice?: ReactNode                   // ← the Promo difference
```

```ts
interface ColumnConfig {
  label: string
  key: string
  render?: (value: any, row: any) => ReactNode
  sortable?: boolean
  data?: boolean                       // mono, tabular figures
  responsive?: { breakpoint: number; width: number }[]
}
```

`responsive` behaves like CSS `min-width`: each entry applies from that width upward, and
`width: 0` hides the column. A column with no `responsive` array is hidden at every width.
The algorithm is Events', unchanged and exported as `getColumnWidth` — it is not styling,
it decides which columns exist.

Promo's copy was identical except that it fetched the current user's team membership
inside the component and rendered an "Operating as a {organizer} Team Member" banner. That
is now `notice`, and the fetching belongs to the screen.

Below 500px the grid becomes stacked records, each cell labelled by its column through
`data-label`.

## Pagination — E `components/ui/Pagination.tsx`

```ts
currentPage: number
totalPages: number
onPageChange: (page: number) => void
showEdges?: boolean     // first/last jumps — default true
windowSize?: number     // default 3, as Events had it
```

For paginated card lists. Grids use DataGrid's own pagination.

## DetailView — E+P (identical contracts)

```ts
title: ReactNode
data: any
fields: DetailField[]        // {label, key, render?, data?}
actions?: ReactNode
bottomActions?: ReactNode
status?: number              // deprecated — see below
```

`status` reproduces Promo's rule that when no `bottomActions` are given and `status === 1`
(Draft), the header actions repeat in the footer. Kept for compatibility; pass
`bottomActions` explicitly in new screens. A numeric domain status leaking into a
presentational component is part of why the two copies drifted.

## DetailForm — P `components/DetailForm/DetailForm.tsx` (canonical — the richer one)

```ts
title: ReactNode
data: any
fields: FormField[]
onSubmit: (data: any) => void
onCancel: () => void
onChangeField?: (key: string, value: any, next: any) => void
submitLabel?: string        // default 'Save'
cancelLabel?: string        // default 'Cancel'
errors?: Record<string, string>
```

```ts
interface FormField {
  label: string
  key: string
  type?: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'datetime-local' | 'email' | 'tel'
  placeholder?: string
  required?: boolean
  disabled?: boolean | ((data: any) => boolean)
  options?: {value, label}[]
  hint?: string
  full?: boolean
  addOptionLabel?: string
  onAddOption?: () => void
  render?: (field, value, onChange, data) => ReactNode
}
```

Two things are lifted out of the component. Promo hard-coded which sentinel belonged to
which key (`audienceId → __ADD_AUDIENCE__`) and called `router.push` itself; that is
`onAddOption`, so the screen owns navigation. Promo also reset `parentAudienceId` whenever
`audienceType` changed away from `DERIVED` — audience-model logic inside a form renderer;
use `onChangeField`.

## Modal / ConfirmModal / LoadingModal — E `ConfirmationModal` + P `ConfirmModal`

```ts
// Modal
isOpen: boolean; title: ReactNode; children?: ReactNode
onClose?: () => void; actions?: ReactNode
wide?: boolean; dismissible?: boolean     // Escape + overlay click, default true

// ConfirmModal
isOpen, title, message, submessage?, onConfirm, onCancel
confirmText?, cancelText?          // Events' names
confirmLabel?, cancelLabel?        // Promo's names, accepted as aliases
destructive?: boolean              // ink fill rather than the orange

// LoadingModal
isOpen, title, message?
```

Promo's confirm dialog had a gradient background, a 20–24px radius, a coloured shadow, a
150px logo and a springy `cubic-bezier(0.175, 0.885, 0.32, 1.275)` entrance. All four are
out: square, flat paper, firm ease-out, no bounce.

## Loader / LoadingScreen / Skeleton — E+P

```ts
// Loader        variant?: 'full' | 'mono' | 'on-ink'   // default 'full'
//               size?: number                          // px, default 64
//               label?: string                         // default 'Loading'
// LoadingScreen text?: string        // mono caps under the bars
//               onInk?: boolean      // maps to the loader's 'on-ink' variant
//               size?: number
//               overlay?: boolean    // cover the viewport; centred, no logo
// Skeleton      variant?: 'text' | 'title' | 'media'; width?: string
```

Four bars rising in sequence on the mark's 10-unit shear, the last one orange, over the
mark's baseline rule. Both codebases used a rotating ring; nothing in this identity
rotates.

The geometry is taken from `assets/logo/riser-mark-primary.svg` rather than approximated:
16-unit bars on 8-unit gaps, each cut on the same shear, a 5-unit stage rule below the
baseline, on the mark's 88 x 84 box. `size` sets the height of the mark in px and
everything else scales from it, so the loader stays in register with the logo at any size.

`variant`:

- `full` — the mark's own colours, ink bars with the orange fourth. The default.
- `mono` — every bar and the stage inherit `currentColor`, for use inside a filled button
  where the orange would disappear into the background.
- `on-ink` — paper bars keeping the orange fourth, for ink surfaces.

Motion is the brand's: each bar travels `--rise-distance` upward, `--stagger-step` between
siblings, on `--ease-out`. The animation is dropped under `prefers-reduced-motion` and the
bars rest at full height. Skeletons pulse in opacity — Promo's 1000px shimmer sweep is
gone, since nothing travels across a surface.

## Notice — P (DataGrid banner + credit screen, deduplicated)

```ts
tone?: 'neutral' | 'attention' | 'ink'
icon?: ReactNode
```

Promo rendered the same team-member string in two places with two sets of inline classes,
both using a filled warning icon in `--notification-error-bg` — a red that is not in the
palette. One component, a 2px leading rule.

## NotificationStack — E `components/ui/NotificationSlider.tsx`

```ts
notifications: NotificationItem[]    // {id, type, header, message, note?, duration?}
onDismiss: (id: string) => void
closeIcon?: ReactNode
```

Presentational only — keep `useNotificationStore` in the app. Both codebases carried a
four-colour notification palette in `globals.css` (green / red / light blue / orange fills
with black or white text): four colours the brand does not have. Notifications are ink
blocks with a 2px leading rule, and only warning and error spend the orange, because those
are the two that must be noticed.

## Navbar — E `NavbarClient` + P `Navbar`

```ts
logo: ReactNode
onMenuClick?: () => void
menuIcon?: ReactNode
context?: ReactNode        // Promo's "as {organizer}" — mono caps, hidden below 768px
children?: ReactNode
tone?: 'paper' | 'ink'
```

Both shipped a floating pill: `position: fixed`, `calc(100% − 6rem)` wide, 4px radius,
`backdrop-filter: blur(10px)`, `box-shadow: 0 4px 30px rgba(0,0,0,0.1)`. Flat, square and
hairline-ruled means a bar that sits on the page. The logo moves centre to left, because
left-aligned is the layout rule.

## Drawer / DrawerSection / DrawerLink — E `SidebarShell` + `SidebarSection` + `SidebarLink`

```ts
// Drawer        isOpen, onClose, logo?, closeIcon?, tone?: 'paper' | 'ink'
// DrawerSection title?: string
// DrawerLink    href, active?, onClick?, as?: ElementType    // pass your router's Link
```

Promo's Sidebar is the same drawer with a different link list; the list is content and
stays in the app. Active links carry a 2px orange rule on the leading edge.

## EventCard / EventCardSkeleton — E `components/ui/EventCard.tsx`

```ts
id: string
title: string
image?: string | null        // resolved URL
date?: string                // already formatted
location?: string            // already resolved
price?: string               // already formatted
description?: string
features?: string[]
variant?: 'event' | 'organizer' | 'brand'
status?: { label: string; tone: StatusTone }
detail?: boolean             // was showDetails
action?: ReactNode
onClick?: (id: string) => void
```

The prop surface had grown to 24, five of which were whole unfiltered collections
(`allTickets`, `allCities`, `allCountries`, `allLocations`, `allEventFeatures`) that the
card joined itself in three `useEffect`s — a presentational component doing data joins on
every render. It takes resolved strings now; do the joins in the screen or the loader.
`cardType`, `isDashboard`, `status`, `showDetails` and `showSharing` collapse into
`variant`, `status` and `detail`.

## TicketCard — E `OrganizerTicketCard` + `TicketsList`

```ts
name, price, type?, description?
status?: { label, tone }
spec?: { label, value }[]         // quantity, order limits, sales window — mono, dashed rule
flags?: string[]                   // refundable, service charge
mode?: 'organizer' | 'buyer'
quantity?, onQuantityChange?, maxQuantity?, minQuantity?
action?: ReactNode
```

The organiser card labelled every row with an emoji — 💰 price, 📦 quantity, 🛒 order
limit, 📅 sales period, ↩️ refundable, 💳 service charge — and marked status with a "●"
bullet. The brief is explicit: no emoji, and Unicode symbols are not icons. Mono caps
labels do the work, which is also what makes the spec block scan as a spec block.

## Dropzone — P upload-audience screen

```ts
onFile: (file: File) => void
accept?: string              // default '.csv'
headline?: string
hint?: string                // the expected-columns line
fileName?: string | null
onReset?: () => void
processing?: boolean
disabled?: boolean
icon?: ReactNode
```

Recreated from the CSV upload, not invented: drag-and-drop or click, a dragging state, a
processing state, a named-file state with a reset. The original scaled the whole zone up
5% on drag; the dashed rule goes orange instead.

## EmptyState

```ts
label?: string        // mono caps above the headline
headline: string
body?: ReactNode
actions?: ReactNode
```

Replaces the bare `<p>Loading campaigns…</p>`, `<p>No brands found</p>` and
`<p>Error: {error}</p>` strings across Promo's screens, and Events' `ErrorScreen` /
`InfoScreen`, which were this block with a 400px logo on top.

## Logo — LogoLockup / LogoMark / LogoAppIcon

```ts
variant?: 'primary' | 'knockout' | 'mono-ink' | 'mono-paper'
width?: number         // clamped to the minimums: lockup 90, mark 20
title?: string
```

Geometry exactly as constructed. The SVGs reference Archivo as live text, so Archivo must
be loaded — `tokens/fonts.css` self-hosts it.

## Icon

```ts
as: LucideComponent
size?: 16 | 20 | 24
tone?: 'default' | 'secondary' | 'accent' | 'on-ink'
label?: string          // omit for decorative; those are hidden from assistive tech
```
