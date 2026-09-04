# Rebranding a Riser app onto the design system

Written at the end of the riser.events rebrand, for the sessions that will do Promo,
Academy, Checkout and the mobile app. It records what was decided and, more usefully, what
went wrong — the failures here cost hours to find and every one of them will recur.

This ships inside the package, so from any consuming app it is at
`node_modules/@riser/design-system/DesignSystemRebrand.md`.

**Read `SKILL.md` first** for the eleven rules. This document does not repeat them; it
covers how to apply them to an existing codebase without repeating our mistakes.

---

## 1. Where things stand

**Design system: v1.14.0.** Everything below is in it. riser.events is the reference
implementation and is fully migrated on `main`, `staging` and `development`, all pinned to
v1.14.0.

The package ships tokens, 23 React primitives, the logo and font assets, `SKILL.md`, and
**the checker** (`npx riser-check`). Nothing about the identity should be re-derived in an
app: if it is not in the package, it does not exist.

| App | Stack | Router | Tailwind | State |
|---|---|---|---|---|
| **riser.events** | Next 15 · React 19 | App | v4 | Done — the reference |
| **RiserPromo** | Next 15.5 · React 19 | App (`src/app`) | v4 | Old indigo `#6666FF` |
| **RiserAcademy** | Next 15.5 · React 19 | App (`src/app`) | v4 | Old indigo `#6666FF` |
| **RiserCheckout** | Next 13.4 · React 18 | **Pages** (`pages/`) | **v3.3** | Old palette |
| **RiserApp** | Vite 5 · React 19 · Capacitor | — | none | Old palette |

Promo and Academy are the same shape as Events line for line. Checkout and the mobile app
are not — see §7.

---

## 2. Decisions already made

These were settled with Karim during the Events rebrand. Do not reopen them; do not
re-ask.

**Chrome is left alone.** Pagination, tabs, carousels, close buttons, dropdown triggers,
layout switchers and the Syncfusion text-editor toolbar keep their own markup. The checker
has a `CHROME` regex that exempts them, extendable per app via `chromeExtra`.

**Third-party surfaces are in scope.** The Clerk sign-in form, the text editor and the
image editor get reskinned rather than excused.

**There is a fifth colour.** `--error: #A81420`, semantic only — error text, invalid
borders, the error `Notice`, the `danger` button. Nothing else, ever. It exists because
errors used to be drawn in `--accent`, which put the orange on the thing that is broken as
well as the thing to press. `#B3261E` (Material's default, which apps had inherited) was
rejected: it sits 30° from Signal Orange and reads as a dulled version of it.

**A button is 44px, like every other control.** Two heights only: 44 and `sm` at 28 for a
control inside a table row or a chip. `md` is an alias of `lg` kept so old call sites
compile — never reach for it.

**The required asterisk is the colour of its label**, and takes `--error` only when the
field is actually invalid. It used to be `--accent`, so a form with eight required fields
had eight orange marks before the primary action was drawn.

**One page measure.** 1440px capped, 48px gutter, centred — `.riser-measure`. Every page
edge lines up with the navbar because both are that class. Events previously had five
different maximum widths; they were all collapsed to one.

**The navbar is floating, with a centred lockup**, on every surface. See §5.

---

## 3. The traps

Every one of these was found the hard way. They are ordered by how much time they cost.

### 3.1 Specificity beats correctness, silently

The recurring failure of the whole rebrand. Markup gets migrated to a design-system class,
an older rule outranks it, and the screen looks migrated while rendering the old thing.

| Old rule | Beats | Because |
|---|---|---|
| `.thing-group label { font-size }` | `.riser-field__label` | 0-1-1 > 0-1-0 |
| `style={{ padding }}` | any class | inline wins everything |
| `width` on an element that also has `.riser-measure` | the measure | 0-1-0 tie, import order decides |
| `.riser-app-checkbox input[type=checkbox]` | `.riser-check` | 0-1-1 > 0-1-0 |
| two single-class rules | each other | import order — not deterministic |

**A cascade layer outranks specificity entirely, and that catches the case above out.**
`base.css` is imported unlayered, and Tailwind puts its utilities in `@layer utilities` —
so `base.css`'s `a { color: inherit }` (0-0-1, unlayered) beats `.text-slate-text`
(0-1-0, layered). Every text-colour utility on an `<a>` silently does nothing, and adding
specificity in the app does not help, because the app's rule is layered too.

Work around it by colouring something that is not the anchor. A `BrandMark` or `Icon`
inside the link takes the utility cleanly, and `group` / `group-hover:` carries the hover
across:

```tsx
<a href={href} className="group">
  <BrandMark name="facebook" size={24}
             className="text-slate-text group-hover:text-text-primary transition-colors" />
</a>
```

Fixing it properly means wrapping `base.css` in `@layer base`, which changes cascade
behaviour for every rule in it across both apps — worth doing, worth doing on its own.

**When you put a design-system class on an element, strip the competing declarations from
whatever else that element carries.** Adding the class is half the job. The other half is
the reason the first attempt at each of these looked done and was not.

Where an app rule genuinely must win — a mobile override on the navbar — qualify it with a
second class (`.navbar.riser-measure`) so it wins on specificity rather than on import
order.

### 3.2 The double gutter

`width: calc(100% - 6rem)` is the page gutter written by hand. Nested inside an
already-capped container it subtracts the gutter twice, and the card comes out 96px
narrower than the navbar above it. **It coincides at ~1280px viewport**, so it looks
correct on a laptop and wrong on a monitor — which is why it survived being reported.

Two containers do different jobs and are not interchangeable:

- **`.riser-container`** — padded. The element spans the viewport; its *children* land on
  the measure. For a transparent wrapper.
- **`.riser-measure`** — bounded. The element's *own edges* land on the measure. For
  anything you can see: a card, a panel, the navbar.

A full-bleed band (a section with a background, holding a measure inside) takes
**`.riser-band`** and has **no horizontal padding**. That padding is the gutter under
another name and applies it a second time.

### 3.3 A retired treatment survives as an element selector

Deleting `.cuf-input` did not delete the underline, because the same treatment also existed
as `input, select, textarea { border: none; border-bottom: 1px }` — a bare element selector
reaching every unclassed control in the app. A bare `label {}` in the same file was adding
`margin-bottom` under every design-system label.

**Grep for bare element selectors before declaring a treatment removed.** The checker has a
rule for this now.

### 3.4 Dead classes that are not dead, and live ones that are

`ResponsiveHTML` renders HTML from the database, so a class used only in stored content
looks dead to a static scan. In practice it only ever renders *descriptions* — rich text —
so **page-structure class names absent from every TSX are genuinely dead** and safe to
delete. Content-level classes are not; check before pruning those.

Conversely, `.section` appeared to be used in 45 files. Every hit was the substring
`section` inside another word. Match on `className="x"`, not on the bare name.

### 3.5 Regexes that cannot see JSX

Four separate tools broke the same way. If you write a codemod:

- `[^>]*` **cannot cross the `>` inside an arrow function** — `onChange={(e) => {…}}`. Use
  brace-aware scanning. Sixteen controls were invisible to the regex version.
- A regex anchored on the first `{` starts inside `value={form.name}` and runs to an `&&`
  further down, eating the control.
- `<[^>]*/>` matches `</>` (a closing fragment) while leaving `<>`, producing files that
  look plausible and will not parse.
- A **self-closing `<Button … />`** has no children; `indexOf('</Button>')` runs on to the
  *next* button and reads its label as this one's.
- In a JS **string**, `'\.'` is just `.` — which matches any character. Building a regex
  from a class name this way made `.organizer-dashboard-container` match the carrier
  `dashboard-container`. Prefer `indexOf` over a built regex when the needle is a literal.

Always dry-run a codemod and diff before writing.

### 3.6 npm reports success and changes nothing

`npm install` says "up to date" while `package-lock.json` still pins the old commit,
because the tag in `package.json` *looks* satisfied. **Always name the spec:**

```bash
npm install "github:Glasvey-Group/riser-design-system#v1.14.0"
```

Then verify `node_modules/@riser/design-system/package.json` really says the new version.

### 3.7 A vendor stylesheet redeclaring your palette at `:root`

The worst version of 3.1, because it is invisible to every method used to find the others.

`@clever-ui-kit/sign-in-form/dist/style.css` ships its own `:root` block restating a
consuming app's entire legacy `--color-*` bridge at that app's *pre-rebrand* values —
`--color-primary: #6666FF`, `--font-heading: Anton`, `--font-body: Inter`,
`--color-success: #28a745`. On every route that loads the sign-in form it lands after
`globals.css`. Equal specificity, later wins.

RiserPromo finished its rebrand, measured clean, and its three auth screens were still
rendering the old indigo and Anton headings. Nothing in the app source says so. Grep
cannot find it — the declaration is in `node_modules`. The checker cannot see it either;
it reads your files, not your dependencies' files.

Beat it on specificity, in the app, because the names belong to the app:

```css
:root:root {          /* 0-2-0 against the vendor's 0-1-0 */
  --color-primary: var(--accent);
}
```

Verify by probing a throwaway element. This is the only method that catches it:

```js
const d = document.createElement('div');
d.className = 'bg-primary';
document.body.append(d);
getComputedStyle(d).backgroundColor;   // rgb(102,102,255) means the vendor won
```

Do this once per app that pulls in any third-party stylesheet, and specifically on the
routes that load it — the same probe on a route without the vendor bundle passes.

### 3.8 Things that look like bugs and are not

- **A 2px border computes to 1.6px.** Device-pixel snapping at 125% display scaling
  (2 ÷ 1.25). It renders 2px at 100%.
- **`accent-color` does nothing to `.riser-check`.** The class sets `appearance: none`, so
  the native rendering it would tint no longer exists.
- **`npm run build` breaks a running dev server.** It overwrites `.next`; the dev server
  then 500s. Restart it, or do not build while it runs.
- **Running `riser-check` inside the design system repo reports findings.** It is linting
  the components that *define* the primitives. Run it in a consuming app.
- **A computed style does not follow a custom property you just changed.** Set
  `--button-color` and the element's own `--button-color` reads back correctly while
  `backgroundColor` still reports the old paint, so the variable looks live and the rule
  looks broken. A forced reflow does not clear it. Clone the node (`el.cloneNode(false)`,
  append, measure, remove) — the fresh element resolves correctly. Same cause as the
  frozen transition clock in 9.
- **A vendor control looks reskinned on one screen and not the next.** Not a specificity
  problem: CSS order in the module graph. Route both through the app's one
  `syncfusionTheme` module — see §4.
- **`font-stretch` does not drive the `wdth` axis** of the Archivo `next/font` serves.
  Measured identical at 62%, 88% and 100%. `font-variation-settings: 'wdth' 88` does.
  This clipped the final R off the lockup in both apps and read as a bad logo file: the
  font *was* loading, `document.fonts.check('800 80px Archivo')` passed, and the family
  resolved to `Archivo` — the axis was simply doing nothing. Fixed in `Logo.tsx` at
  v1.16.0; if you set a width axis anywhere else, set both properties and measure the
  text's `getBBox().width` against the space it has, on a freshly built node.

---

## 4. Components that exist — check before writing markup

`components/index.ts` is the authoritative list. The ones most often reinvented:

`Field` (label + control + error + hint) · `Input` `Select` `Textarea` `Checkbox` ·
`Button` · `FormActions` · `Modal` · `Notice` · `StatusBadge` · `DataGrid` · `Pagination` ·
`EmptyState` · `Loader` · `Navbar` · `Drawer` · `Card` · `StatCard` · `DetailView` ·
`DetailForm` · `Filter` · `Dropzone` · `EventCard` · `TicketCard` · `SectionLabel` · `Icon` ·
`BrandMark`

Three that get hand-rolled every time:

- **`BrandMark`** — Facebook, Instagram and TikTok logos. Lucide 1.x dropped its brand
  glyphs, so both apps added Phosphor as a second icon library for two footer links, which
  `docs/ICONS.md` forbids. A brand mark is not an icon and not a hand-built glyph: it is
  filled, it keeps its owner's geometry, and it is exempt from the stroke rules — but it
  still takes the 16/20/24 scale and `currentColor`, never the brand's own blue or pink.
  The checker now reports any `@phosphor-icons` import.

- **`FormActions`** — takes `primary` and `secondary` and renders secondary-then-primary,
  right-aligned. Order stops being something a call site can get wrong. `bare` drops the
  rule for a standalone action under a table (Add Ticket, Add Social).
- **`Field`** — never hand-roll `<label htmlFor>`. If a composite component needs to show a
  validation message, give it an `error` prop that reaches `Field`. Five call sites in
  Events rendered their own error div *after* the component, which made it a sibling flex
  item in the row rather than part of the field — a "Required" floating beside the *next*
  control.

Shared classes when no component fits: `.riser-label` (any caption), `.riser-measure`,
`.riser-band`, `.riser-container`, `.riser-check` / `.riser-check-row`,
`.riser-input` / `.riser-select` / `.riser-textarea`.

### Vendor reskins

`vendor/syncfusion.css` reskins Syncfusion Material; `vendor/clever-ui-kit.css` reskins
`@clever-ui-kit`'s own CSS modules around it. Both were written twice, once per app,
before they were moved here.

Do not import either from a layout, and do not import them per screen. Give the app one
module — the name `vendorReskin` in `riser-design.config.json` points at — which imports
whichever vendor stylesheets *this* app pulls in, then the reskin last:

```ts
// components/ui/syncfusionTheme.ts
import '@clever-ui-kit/sign-in-form/dist/style.css';   // or @syncfusion/…/material.css
import '@riser/design-system/vendor/syncfusion.css';
import '@riser/design-system/vendor/clever-ui-kit.css';
```

The import list stays in the app because it names packages this one does not depend on;
the treatment is the shared part. A layout-level import lands *before* component-level
vendor CSS rather than after it, which is how the same control ends up reskinned on one
screen and Material on the next.

Scope a reskin by measuring the DOM, not by reading the vendor stylesheet. Most of what a
bundle ships never mounts: `.e-float-text` alone carries 184 of the sign-in form's
Material-magenta rules and the form does not render a float label at all.

**`min-height` does not make a vendor control 44px.** It raises a short one and is
powerless against a tall one, so a reskin that sets it and stops looks correct and is
not. `vendor/syncfusion.css` carried `min-height: 44px` from the start and RiserApp
still measured 56px on the sign-in inputs, because `@clever-ui-kit`'s own CSS module
puts 8px of padding on the wrapper: 38 + 16 + 2. Zero the wrapper's padding — the
inset belongs to the control inside it — and set `align-items: center`, or a
dropdown's icon pins to the top of the taller box. Fixed at v1.21.0. **Measure the
control's height; do not read the rule and assume it landed.**

---

## 5. Layout conditions

**The measure.** `.riser-measure` = `min(100% - 2 × gutter, 1440px)`, centred. Gutter is
48px, 16px below 960, 8px below 500.

**The navbar** carries `.riser-measure` in `variant="floating"`, which is what makes the
page line up with it. Floating is fixed, 16px off the top, ruled on four sides, square,
opaque, no blur, no shadow. It collapses to the full-bleed sticky bar below 960.

**The lockup is centred**, between the menu button and the auth slot. Left and right tracks
are `flex: 1 1 0` so they share the leftover evenly — `space-between` lets the mark drift by
half the difference between the two ends whenever the auth slot changes.

**Breakpoints are exhaustive**: 360, 500, 768, 960, 1200, 1440 (`--bp-xs` … `--bp-2xl`).
Media queries cannot read custom properties, so the numbers are written literally — but
they must be one of those six. Events had ten before this; 768 alone appeared 51 times.

**Controls are 44px** — inputs, selects, textareas, date pickers and buttons. Field padding
is `var(--space-2) var(--space-3)`: at 12px vertical the border-box came to 47px and the
declared `min-height: 44px` never governed.

---

## 6. The checker

```bash
npx riser-check
```

Ten rules, each proven against a fixture before it was trusted. Every one of them exists
because something shipped that a human review missed.

Per-app settings in `riser-design.config.json` at the repo root — all optional:

```json
{
  "sourceDirs": ["app", "components"],
  "skipFiles": "testerror|design-check",
  "chromeExtra": "carousel|slug-check|share-",
  "vendorReskin": {
    "module": "syncfusionTheme",
    "hint": "import '@/components/ui/syncfusionTheme'"
  }
}
```

`sourceDirs` defaults to `app`, `components`, `src`. For Checkout, add `pages`.

Wire it as `"check:design": "riser-check"` in the app's `package.json`.

**A rule that never fires is worthless.** When adding one, write a fixture that fails,
confirm it fails, then delete the fixture. Rule 10's carrier check found five real problems
on its first run; the checkbox rule found eight.

---

## 7. What differs per app

**RiserPromo and RiserAcademy** — identical to Events. Follow §8 exactly.

**RiserCheckout** — two differences that need deciding before starting:

- **Tailwind v3.** `tokens/tailwind.css` uses `@theme inline`, which is v4 syntax and will
  not parse. Import `styles-no-fonts.css` only, and either use the CSS custom properties
  directly or map them in `tailwind.config.js`.
- **Pages Router**, not App Router. There is no `app/layout.tsx`; the global stylesheet is
  imported from `pages/_app.tsx`. Add `pages` to `sourceDirs`.
- Next 13.4 predates some of what Events relies on. Decide early whether Checkout gets
  upgraded first or migrated as it stands.

**RiserApp** — Vite + Capacitor:

- No `next/font`, so import the **full `styles.css`** and take the design system's
  self-hosted Archivo.
- No `transpilePackages` — that is a Next setting. Vite compiles TS in dependencies, but
  may need `optimizeDeps.exclude: ['@riser/design-system']` if pre-bundling complains.
- Capacitor packages the web build into a native shell, so **fonts must be bundled, not
  fetched**. Both faces are self-hosted as of v1.20.0 — JetBrains Mono was an `@import`
  from Google until then, which fails offline in the shell and takes `LogoLockup` with it,
  because the wordmark is live Archivo text and not a path.
- Do this one last, once the package has been proven against three web apps.

---

## 8. The procedure

Steps 1–3 are half an hour. Everything after is the actual migration.

### Step 1 — Install, pinned

```bash
npm install "github:Glasvey-Group/riser-design-system#v1.14.0"
```

Verify: `node_modules/@riser/design-system/package.json` says `1.14.0`. If it does not,
§3.6.

### Step 2 — Wire the build

`next.config.ts` — the package ships TypeScript source, so Next must compile it:

```ts
transpilePackages: ['@riser/design-system']
```

`globals.css` — replace the old palette block, do not remap it:

```css
@import "tailwindcss";
@import "@riser/design-system/styles-no-fonts.css";
@import "@riser/design-system/tokens/tailwind.css";   /* Tailwind v4 only */

:root {
  --font-display: var(--font-archivo), system-ui, sans-serif;
  --font-ui:      var(--font-archivo), system-ui, sans-serif;
  --font-mono:    var(--font-jetbrains-mono), ui-monospace, monospace;
}
```

`layout.tsx` — load Archivo and JetBrains Mono via `next/font` and expose them as
`--font-archivo` / `--font-jetbrains-mono`.

**The old indigo `#6666FF` is replaced, not remapped.** `docs/MIGRATION.md` §"The palette is
replaced" covers why. Keep the old `--color-*` names alive as a bridge pointing at the new
tokens, and retire them surface by surface.

### Step 3 — Turn the checker on

Add `riser-design.config.json` (§6) and the `check:design` script. Run it. **Expect a large
number of findings** — that list is the migration backlog, and it shrinks monotonically.
Record the starting count.

### Step 4 — Layout first, before any component work

Get the page measure right before touching screens, because everything else is judged
against it.

1. Put `Navbar variant="floating"` in the layout.
2. Every page container gets `.riser-measure`; strip its `width` / `max-width`.
3. Every full-bleed band gets `.riser-band` and loses its horizontal padding.
4. Verify by measuring, not by looking — §9.

### Step 5 — Shared primitives, then screens

Order matters. Converting screens before the primitives means converting them twice.

1. **Buttons** — every raw `<button>` that is an action becomes `Button`. Chrome stays.
2. **Fields** — every `<label htmlFor>` + control becomes `Field`. Composite components
   (typeahead, slug check) get an `error` prop that reaches `Field`.
3. **Delete the retired treatments** — the old field classes *and* any bare element
   selectors (§3.3). This is the step that makes it stick: while the old class exists, the
   next screen will use it.
4. **Status** — every status column becomes `StatusBadge`. Never re-derive a status enum;
   the package exports the mappings.
5. **Then screens**, worst first.

**Extract before you convert.** Where a form exists twice — Events had Add Ticket at ~215
lines in two files — pull it into one component first, then convert once. Check whether the
copies have diverged: in Events every divergence turned out to be cosmetic (an identity
function, a deprecated wrapper, a renamed state variable) except one, which became a prop
so each caller kept its own behaviour.

### Step 6 — Verify, then land

`npx tsc --noEmit` · `npm run check:design` · `npm run build` — all clean.

Then measure the result (§9), and get sign-off on the screens behind auth.

---

## 9. Verifying

**Do not verify a rebrand by looking at it.** That is how a Save button painted orange, a
pencil beside the word "Edit" and a card 96px narrower than the navbar all reached
production. Measure computed styles.

Build a `/design-check` route that renders every control in every state — default, focus,
error, disabled, required — plus the composites. Exclude it from production
(`if (process.env.NODE_ENV === 'production') notFound()`) and keep it out of the auth
matcher, so it can be checked without signing in. Every form screen is behind auth; this
route is how you see them.

The assertions that caught real problems in Events:

```js
// one label treatment
[...new Set([...document.querySelectorAll('.riser-field__label')]
  .map(l => { const c = getComputedStyle(l);
    return [c.textTransform, c.fontFamily, c.fontSize, c.color].join('|'); }))]
// expect length 1

// one control height
[...new Set([...document.querySelectorAll('.riser-input,.riser-select,.riser-button')]
  .map(e => Math.round(e.getBoundingClientRect().height)))]
// expect [44]

// every measure aligned to the navbar
const nav = document.querySelector('.riser-navbar').getBoundingClientRect();
[...new Set([...document.querySelectorAll('.riser-measure')]
  .filter(e => e.getBoundingClientRect().width > 200)
  .map(e => { const r = e.getBoundingClientRect();
    return Math.round(r.left - nav.left) + '/' + Math.round(nav.right - r.right); }))]
// expect ['0/0']

// no double gutter: nothing with a measure sits inside a padded or capped ancestor
[...document.querySelectorAll('.riser-measure')].flatMap(el => {
  const out = []; let n = el.parentElement;
  while (n && n !== document.documentElement) {
    const c = getComputedStyle(n);
    if (parseFloat(c.paddingLeft) > 0 || c.maxWidth !== 'none') out.push(n.className);
    n = n.parentElement;
  }
  return out;
})
// expect []
```

**Measure at more than one viewport.** The double gutter is invisible at ~1280 and obvious
at 1600. Check 1600, 1300 and 1100 at minimum.

---

## 10. Shipping

The package is fetched from GitHub, pinned to a tag. Two files carry it: `package.json`
names the tag, `package-lock.json` records the exact commit. Both must move together.

**Merging does not install anything.** It updates the pin; the code arrives when the build
runs `npm ci`. Vercel does re-resolve the git dependency on a lockfile change — verified
twice on riser.events by diffing the deployed CSS across a version bump, not assumed from
settings. Confirm the same for each app the first time.

After deploying, check a marker from the new version is actually in the served CSS:

```bash
curl -s <deployment-url> | grep -oE '/_next/static/css/[^"]+\.css' | sort -u | \
  while read c; do curl -s "<deployment-url>$c" | grep -c 'riser-measure'; done
```

---

## 11. If the design system needs to change

It usually does, and that is correct — five of the releases during the Events rebrand came
from finding a gap while migrating a screen. The test is whether the thing being written is
identity or application:

**Belongs in the package** — a treatment, a state, a token, a primitive, a layout measure.
If two apps would each write it, it goes here.

**Stays in the app** — data shape, routing, business rules, a layout genuinely unique to one
screen.

Bump, tag, push, then install by tag in the app. Apps that should not take the change yet
simply stay on their old tag; four apps on four versions is a normal, safe state. **Never
point an app at a branch** — that is how a change nobody chose lands in production.

When the same declarations appear in the package more than once, collapse them. The label
treatment was written out identically fourteen times, which is why consuming apps had
nothing to be consistent with — there was no single selector to point at.
