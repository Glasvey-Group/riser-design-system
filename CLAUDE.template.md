# <APP NAME> — Riser Design System rebrand

<APP NAME> is migrating to the Riser Design System (`@riser/design-system`, pinned by tag
in package.json). This is a refactor, not a feature. Every pass should end with fewer lines
of CSS than it started with.

## Read these once, then stop re-deriving

- `node_modules/@riser/design-system/SKILL.md` — the eleven rules, and the brand law
- `node_modules/@riser/design-system/DesignSystemRebrand.md` — how to run this migration,
  and the traps that cost the last one hours
- `node_modules/@riser/design-system/docs/COMPONENTS.md` — prop contracts
- `node_modules/@riser/design-system/components/index.ts` — the actual export list
- `npm run check:design` — what is machine-checked; the checker ships with the package

Do not restate tokens, hex values or type scales back to me. Do not invent a token: if it
isn't in the design system, it doesn't exist. Do not keep a local copy of the brand — the
last app had one and it drifted from the package inside a week.

## Order of operations — never skip a step upward

1. A design-system component (Button, Field, Card, DataGrid, Notice, StatusBadge, Modal,
   FormActions, Pagination, EmptyState, Loader...). Check `index.ts` BEFORE writing markup.
2. If no component fits: an existing shared class (`riser-button`, `riser-input`,
   `riser-select`, `riser-label`, `riser-measure`, `riser-band`, `riser-check`).
3. If neither: a new shared `riser-*` class, added once, used everywhere.
4. Page-local CSS is the last resort, and only for layout genuinely unique to that screen.

Whenever you move up a level, DELETE the CSS you replaced. A migration that adds a
component and leaves the old rules behind has made things worse — the old rule usually
outranks the new one and the screen keeps rendering the old thing.

## Specificity is the thing that goes wrong

Adding the design-system class is half the job. Strip whatever competes with it, or the
markup will look migrated while rendering the old treatment:

- `.thing-group label` (0-1-1) beats `.riser-field__label` (0-1-0).
- An inline `style={{ }}` beats everything.
- A `width` on an element that also carries `.riser-measure` ties, and import order decides.
- A retired treatment survives as a bare element selector (`input, select, textarea { }`)
  after its class is deleted.

Where an app rule genuinely must win, qualify it with a second class
(`.navbar.riser-measure`) so it wins on specificity rather than on load order.

## Class naming law

A class name states what the element IS, never which feature it was written for first, and
never what happens to sit inside it today.

- Shared/repeated → `riser-<thing>`: `riser-table`, `riser-table-row`, `riser-table--compact`
  (single dash for parts, double dash for modifiers).
- Genuinely one-screen layout → `<surface>-<thing>`: `edit-event-header`.
- Never name a generic structure after its first caller. Same markup under a name that
  describes only the first use is the canonical bug: either both callers become the
  component, or the shared class gets an honest name.
- A name that describes a position or a colour will become a lie the first time either
  changes. Rename it then, don't leave it.
- Before renaming anything: grep the whole repo for the old name first.

## Structural rules

- Do not add wrapper divs to hang styles on. If a wrapper exists only for CSS, the CSS is wrong.
- No inline style objects, no arbitrary Tailwind values for anything a token covers.
- `!important` is allowed where it is beating a stylesheet we do not control — a vendor
  reskin. Don't spend a pass hunting them down.
- Breakpoints are 360, 500, 768, 960, 1200, 1440 and nothing else.
- Don't restyle a raw `<button>`; use `Button`. Don't hand-roll a `<label htmlFor>`; use
  `Field`. Don't write `width: calc(100% - 6rem)`; use `.riser-measure`. The checker fails
  on all three.
- Legacy `--color-*` vars are a bridge. Don't add new uses; when you touch a rule that uses
  one, move it to the design-system token.

## Working method

- One surface per pass. Say which surface, do it completely, stop.
- Use grep to locate, then read the specific range. Never read a whole page file to change
  one section.
- Don't re-read a file you just edited to check the edit landed.
- Don't paste large before/after blocks back to me. Show diffs only where a decision needs
  my input.
- Verify by measuring computed styles, not by looking. A wrong colour, a wrong height and a
  card inset from the navbar all look deliberate on screen.
- Ask before any repo-wide rename touching more than 5 files. Otherwise decide and proceed —
  state the assumption in one line, don't open a discussion.

## Definition of done for a surface

1. `npm run check:design` is clean for the files you touched.
2. No orphan CSS: every class removed from TSX is removed from CSS, and every class in CSS
   is still used (grep it).
3. Net line count for the surface is negative, or you explain why not.
4. Report: components adopted, classes renamed (old → new), lines deleted, anything
   deliberately left for a later pass.

---

## This app specifically

**Claude: filling this in is your first task, before any migration work.** Everything above
is true of every Riser app. Nothing below it is known yet, and the answers change how the
rest of this file applies — so establish them from the codebase, replace each angle-bracket
prompt with the answer, and delete this instruction block when you are done. Do not ask me
for any of it; all of it is discoverable, and the last two lines are the only ones needing
anything to have been run.

Answer from evidence, not assumption. `Unknown` is a valid answer where a short look does
not settle it — a wrong entry here is worse than a missing one, because the next twenty
passes will trust it.

- **Stack:** <Next version · React version · router · Tailwind version — from package.json,
  and whether the router is `app/`, `src/app/` or `pages/`>
- **Global stylesheet:** <the file that imports the design system — usually src/app/globals.css,
  or wherever _app.tsx imports CSS on the Pages Router>
- **Stylesheet convention:** <one per route? per component? one big file? count the .css files
  and where they sit>
- **Page file size:** <the line count of the three largest page files — it decides whether to
  read them whole or grep and read a range>
- **Known duplication:** <surfaces existing twice, e.g. the same form under two routes. Find
  these before converting anything: extracting after converting means converting twice>
- **Legacy palette bridge:** <where the old --color-* vars are declared, so they can be
  re-pointed at design-system tokens and retired surface by surface>
- **Vendor UI to reskin:** <Syncfusion, Clerk, rich-text or image editors — grep the
  dependencies. These need a single import point, not a reskin per screen>
- **Checker starting count:** <findings on the first `npm run check:design`, recorded so
  progress is visible. Re-run and update it at the end of each pass>
