# Riser Design System

The brand foundation brief, built. Tokens, foundation specimens, React primitives with
prop contracts, and a UI kit for each product surface.

Everything visual comes from the brief and is unchanged: four colours, Archivo with its
width axis, JetBrains Mono for labels and data, the logo files, square corners, hairline
rules, flat surfaces, one signal colour. Everything structural comes from the two
codebases — `riser.events` (RiserEvents) for shared primitives, `promo.riser.events`
(RiserPromo) for the organiser dashboard. No component here was invented; each one is
recreated from code that shipped, and where the same component existed in both, Events'
implementation is canonical and Promo's difference is a prop.

---

## Start here

Install it into a Riser app, pinned to a tag:

```bash
npm install "git+https://github.com/Glasvey-Group/riser-design-system.git#v1.1.3"
```

npm records the resolved URL as `git+ssh://` — that is its canonical form for any
GitHub dependency and cannot be changed from the consuming repo. It does not require
an SSH key: this repository is public, so npm falls back to HTTPS. Verified with
`GIT_SSH_COMMAND=false npm ci`, which is what a build agent without a key looks like.

Pin a tag rather than a branch, so a design system change never lands in an app
without someone choosing it.

To work on the design system itself:

```bash
npm install                 # peer deps: react >= 18
```

```css
/* one import gives you tokens, base layer and every component style */
@import "@riser/design-system/styles.css";
```

```tsx
import { Button, DataGrid, StatusBadge } from '@riser/design-system';
```

**Next.js apps use the fonts-free entry point instead.** `styles.css` pulls in
`tokens/fonts.css`, which `@font-face`s a self-hosted Archivo and a self-hosted JetBrains
Mono. An app using `next/font` already has both, so that import ships every face twice:

```css
@import "@riser/design-system/styles-no-fonts.css";
```

The app then points the family tokens at whatever `next/font` loaded:

```css
:root {
  --font-display: var(--font-archivo), system-ui, sans-serif;
  --font-ui:      var(--font-archivo), system-ui, sans-serif;
  --font-mono:    var(--font-jetbrains-mono), ui-monospace, Menlo, monospace;
}
```

Next also needs `transpilePackages: ['@riser/design-system']` in `next.config.ts`, because
this package ships TypeScript source rather than built JS.

Tailwind v4 (this is how `promo.riser.events` consumes it):

```css
@import "tailwindcss";
@import "@riser/design-system/styles-no-fonts.css";
@import "@riser/design-system/tokens/tailwind.css";
```

`tokens/tailwind.css` re-exports the same custom properties into Tailwind's namespace and
defines no values of its own, so `bg-ink`, `text-accent`, `p-4` (16px) and `text-label`
resolve to the brief's tokens. Both codebases end up reading one source.

Open `foundations/index.html` for the specimens, `components/gallery.html` for the
primitives, and `kits/*.html` for the three surfaces.

---

## What is in here

```
tokens/          colors · typography · spacing · motion · fonts · layout · elevation · tailwind
styles.css       entry point: fonts + tokens + components + base
styles-no-fonts.css  same, minus fonts — for apps loading Archivo themselves
base.css         element defaults, type/layout utilities, icon, motion, imagery
components/      22 React primitives (.tsx), one stylesheet, a static gallery
foundations/     colour, type, spacing, motion, icons, logo, imagery, voice
kits/            promo-dashboard · ticket-buyer · marketing-site
assets/logo/     10 SVGs and 4 PNGs, as supplied
assets/fonts/    Archivo variable, self-hosted (186 KB woff2)
docs/            COMPONENTS.md · MIGRATION.md · ICONS.md
SKILL.md         so the whole thing can be used from Claude Code
DesignSystemRebrand.md  how to migrate an existing app onto this, and what went wrong last time
CLAUDE.template.md      base CLAUDE.md to copy into an app before its rebrand session
```

---

## The rules that decide things

Six rules do most of the work. When a decision is not obvious, it is usually because one
of these has not been applied yet.

**One orange thing per view.** Signal Orange is about 10% of any surface. It marks the
action, the live figure, or the rising bar — and it marks; it does not decorate. Resolved
concretely: *if a view has a primary action, the orange is on that action and nothing else
in the view is orange. If a view has no primary action — a listing, a public profile, a
log — the orange may instead mark the single most important live figure.* Never both.

**Square everywhere.** The only radius in the identity is the app icon tile, at 22% of its
side. Not cards, not buttons, not inputs, not badges, not avatars.

**Hairline rules rather than boxes.** 1px `--line` separates content; 2px ink marks a grid
header or a section break; dashed marks measurement and specification — a spec panel, a
dropzone, a placeholder — and never decoration.

**Flat.** Paper or ink, no gradients, no tints of the orange, no shadows. Depth is a
hairline, a change of surface, or a scrim over a photograph. `tokens/elevation.css`
defines `--shadow-none` and no shadow scale, deliberately.

**Mono is load-bearing.** Small labels and all numeric or technical data are JetBrains
Mono, uppercase, 0.16em tracking, slate. It is what keeps the identity reading as
infrastructure rather than a flyer. It is never used for body copy — and a caps label with
0.16em tracking stops working past a few words, so long technical strings use
`.riser-dropzone__spec`: mono, sentence case, normal tracking.

**Things enter by rising.** 8px upward, 200ms, `cubic-bezier(0.16, 0.84, 0.44, 1)`,
staggered 45ms between siblings like the bars of the mark. 140ms for state changes, 320ms
only for a full view transition. Nothing scales on hover. Nothing rotates — which is why
the loading state is four rising bars and not a spinner.

---

## Colour

| Role | Token | Hex | Use |
| --- | --- | --- | --- |
| Signal Orange | `--orange` | `#F28600` | Primary. Fills, display type on dark, the last bar. Never body text on light. |
| Ink | `--ink` | `#121212` | All text, dark surfaces, the logo's dark bars and stage line. |
| Paper | `--paper` | `#FAF9F7` | Light surfaces. |
| Slate | `--slate` | `#708090` | Lines, borders, dividers, disabled states. |

Derived, not a fifth colour: `--slate-text` `#5F6B7A` is the slate darkened to clear 4.5:1
on paper, for secondary copy. `--ink-soft` `#3A3A3A` is body copy. `--accent-hover`
`#D97800` is the orange darkened for hover — lightening it drops ink below 4.5:1.

Measured, and re-verified in this build: ink on paper **17.8:1** · paper on ink **17.8:1** ·
ink-soft on paper **10.8:1** · orange on ink **7.3:1** · ink on orange **7.3:1** ·
ink on orange-hover **5.9:1** · slate-text on paper **5.2:1**.

Do not use: slate as body text (3.9:1) · white on orange (2.6:1) · orange as text on paper
(2.4:1).

Azure `#00A3F2` was considered and rejected: 1.09:1 against the orange in luminance and a
near-complement, so the two vibrate side by side and collapse into the same tone in
greyscale, one-colour print and embroidery. One signal colour only.

---

## Type

Archivo, variable, with its width axis. 800 is the wordmark and headline weight; 900 for
the largest display; 400–500 for body and labels. The wordmark is 88% width; UI text stays
at 100%. Body copy is 15px at 1.6 in `#3A3A3A`. Headlines are tight — negative tracking,
line-height under 1.2.

Both faces are **self-hosted**. Archivo is `assets/fonts/Archivo-Variable.woff2`, 186 KB,
carrying weight 100–900 and width 62–125 in one file, converted from the TTF in the
`RiserDesignBrief` folder. JetBrains Mono is `JetBrainsMono-Regular.woff2` and
`JetBrainsMono-Medium.woff2` — latin subset, 21 KB each, the two weights the system uses
(400 for labels, 500 for `.riser-data`), taken from `@fontsource/jetbrains-mono` 5.3.0.

Nothing here reaches the network. That is a hard requirement rather than an optimisation:
RiserApp packages the build into a Capacitor shell, where a Google Fonts request fails
offline and takes the identity with it — including `LogoLockup`, which sets the wordmark
as live Archivo text rather than a path. Both faces are SIL Open Font License 1.1;
`assets/fonts/OFL.txt` ships alongside them.

| Class | Size / leading | Weight |
| --- | --- | --- |
| `.riser-display` | 52 / 0.95, tracking −0.03em | 900 |
| `.riser-h1` | 36 / 1.15, tracking −0.02em | 800 |
| `.riser-h2` | 26 / 1.15 | 800 |
| `.riser-h3` | 20 / 1.15 | 800 |
| `.riser-body` | 15 / 1.6 | 400 |
| `.riser-small` | 13.5 / 1.6 | 400 |
| `.riser-label` | 11, caps, tracking 0.16em | 400 mono |
| `.riser-data` | inherits, tabular figures | 500 mono |

---

## Icons

Lucide, with one override:

```css
.icon { stroke-width: 1.5; stroke-linecap: square; stroke-linejoin: miter; }
```

CSS wins over the presentation attributes in Lucide's SVGs, so squaring the caps and joins
costs one rule. Sizes 16, 20 and 24 only. Icons are ink, or slate when secondary; one icon
per view may be orange, on the same discipline as everything else. Never filled, never
boxed in a circle or a tinted tile, never decorative beside a heading.

Emoji are not used. Unicode symbols are not used as icons. Where a glyph is genuinely
unavailable in Lucide, add a hand-built SVG on the same grid and stroke and record it in
`docs/ICONS.md` — do not add a second icon library.

---

## Imagery — the one thing still open

The rules are settled: live event photography, in colour, underexposed. Warm stage light,
deep shadow, real rooms, shot from inside the crowd or the booth rather than from a
balcony. No duotone, no orange wash, no filters, no grain. Full-bleed to the grid edge,
never inset in a rounded card. Text over an image needs an ink scrim at 70% or the darkest
third of the frame. Captions are mono, slate, 11px caps.

**The pictures are not here.** The 18 frames in
`RiserSolutions/public/images/events` were reviewed against those rules and every one of
them fails — they are bright, cool-graded stock event photography with raised hands and lit
phone screens, which the brief rules out by name. They are documented in the imagery
foundation card as an audit and are deliberately not shipped as examples. The hero and card
treatments in the kits use gradient placeholders until two or three on-brand frames exist.

---

## Voice

Section headlines in caps, declarative, often two beats: "THE LISTING TAX." · "BEYOND THE
TICKET." · "ROI ON AUTOPILOT." Body in sentence case, short, factual, numbers-forward.
Verbs of motion carry the brand: push, drive, amplify, reach, convert. The company is "we";
the organiser is "you". Named things get named plainly: The Promo Dashboard, The Heat Map,
Influencer Bridge, Campaign Credits.

No emoji. No exclamation marks. No "revolutionary" or "game-changing". Claims come with a
figure attached or they don't ship.

---

## The logo

Four sheared bars rise off a stage line, the last one in Signal Orange. Bar width 16 units,
gap 8, shear 10. The first three bars step 16 units each; the orange bar steps 18, so it
clears the wordmark's cap line by a hair and is the only element above the name. The
wordmark sits on the stage line with its cap height locked to the third bar's top point,
15 units to the right of the mark.

Clear space is one bar width on all sides. Minimums: lockup 90px or 24mm wide, mark 20px,
favicon 32px preferred over 16px. On orange the whole mark goes ink.

Never recolour the orange bar, restack the bars, add a container the mark does not have, or
set the wordmark in another face.

`components/Logo.tsx` renders the lockup, the mark and the app icon from the same geometry
and enforces the minimum sizes. `assets/logo/` holds the static files for everywhere React
is not. The previous violet R monogram is retired, along with its indigo `#554CF5`.

---

## Components

22 primitives. Full prop contracts are in `docs/COMPONENTS.md`, and every one carries a
header comment saying which file it came from and what changed.

Layout and identity — `Logo` · `SectionLabel` · `Card` · `Navbar` · `Drawer`
Action and status — `Button` · `StatusBadge` · `Notice` · `NotificationStack`
Data — `DataGrid` · `Pagination` · `Filter` · `StatCard` · `DetailView` · `DetailForm`
Input — `Field` · `Input` · `Select` · `Textarea` · `SearchInput` · `Checkbox` · `Dropzone`
State — `Modal` · `ConfirmModal` · `LoadingModal` · `Loader` · `LoadingScreen` ·
`Skeleton` · `EmptyState`
Product — `EventCard` · `TicketCard` · `Icon`

Where a component existed in both codebases it appears here once. `DataGrid` is Events'
implementation including its responsive breakpoint algorithm, with Promo's team-member
banner folded in as the `notice` prop. `DetailForm` is Promo's richer version with its
navigation and audience-model logic lifted back out into the screen. `ConfirmModal` keeps
Events' prop names and accepts Promo's as aliases.

---

## The three kits

**The Promo Dashboard** — eight screens recreated from `promo.riser.events`: the shell,
dashboard home, campaigns, audiences, upload audience, message templates, credits, and the
payment result and in-between states. Every route, field, column, status enum and empty
string is taken from `src/app/organizer/[slug]/`.

**The ticket-buyer web flow** — category listing, event page, ticket selection, and the
public organiser, venue and performer pages, from RiserEvents.

**The marketing site** — hero, the argument, how it works, the six organiser types,
pricing and close, with the site's own copy.

---

## Not in this build

- **Photography.** See above; the only genuinely open item.
- **Micro-SaaS surfaces.** Copy-Genie, Influencer-Track, Fan-Insight AI and white-label
  ticketing have no code yet, so they have no kit. The primitives cover them when they do.
- **A Figma library.** The tokens are structured to generate one, but nothing here writes
  Figma variables.
