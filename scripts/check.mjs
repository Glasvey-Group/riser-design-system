#!/usr/bin/env node
/**
 * Checks the parts of the Riser design system that are decisions rather than tokens.
 *
 * A rebrand can be verified by looking at it. These cannot: a Save button painted orange,
 * a pencil beside the word "Edit", a unicode "+" standing in for an icon, an icon-only
 * button with no accessible name, a form card 96px narrower than the navbar above it.
 * They all look deliberate on screen. They reached production because nothing checked
 * them, and were found one screenshot at a time.
 *
 * This ships with the design system rather than living in each app, because a checker
 * copied per app is a rule with as many versions as there are copies — the failure this
 * whole system exists to prevent. Rule numbers refer to SKILL.md.
 *
 *   npx riser-check
 *
 * Per-app settings go in riser-design.config.json at the repo root. Every key is
 * optional:
 *
 *   {
 *     "sourceDirs":   ["app", "components"],
 *     "skipFiles":    "testerror|design-check",
 *     "chromeExtra":  "add-feature-btn|share-",
 *     "vendorReskin": { "module": "syncfusionTheme",
 *                       "hint": "import '@/components/ui/syncfusionTheme'" }
 *   }
 *
 * vendorReskin names the app's own one-import-point module. That module imports whichever
 * vendor stylesheets this app actually pulls in, then vendor/syncfusion.css from this
 * package last: the treatment is shared, the import list is not.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();

let config = {};
try {
  config = JSON.parse(readFileSync(join(ROOT, 'riser-design.config.json'), 'utf8'));
} catch {
  /* No config is the normal case for a small app; the defaults below are Next.js shaped. */
}

const SOURCE_DIRS = config.sourceDirs ?? ['app', 'components', 'src'];
const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'dist', 'build']);
/* Diagnostic routes that exist to break on purpose. They are not product surfaces and
   styling them to the identity would make them harder to recognise as test pages. */
const SKIP_FILES = new RegExp(config.skipFiles ?? 'design-check', 'i');

const findings = [];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = SOURCE_DIRS.flatMap((d) => {
  try {
    return walk(join(ROOT, d));
  } catch {
    return [];
  }
});
const tsx = files.filter((f) => f.endsWith('.tsx') && !SKIP_FILES.test(f));
const css = files.filter((f) => f.endsWith('.css'));

const lineOf = (src, index) => src.slice(0, index).split('\n').length;
const rel = (f) => relative(ROOT, f).split(sep).join('/');

function report(rule, file, line, message, detail) {
  findings.push({ rule, file: rel(file), line, message, detail });
}

/* ------------------------------------------------------------------ helpers */

/** Ranges covered by a comment, so commented-out markup and prose are not linted.
 *
 * This used to match only the JSX form, {/* … *\/}. A component explaining in its own
 * doc comment which markup it replaced — "the old markup wrapped each control in
 * <label className='ticket-label'>" — was read as that markup and reported. Every
 * comment form counts: block, line and JSX. */
function commentRanges(src) {
  const ranges = [];
  const re = /\{\s*\/\*|\/\*|\/\//g;
  let m;
  while ((m = re.exec(src))) {
    let end;
    if (m[0].endsWith('//')) {
      const nl = src.indexOf('\n', m.index);
      end = nl === -1 ? src.length : nl;
    } else {
      const close = src.indexOf('*/', m.index);
      end = close === -1 ? -1 : close + 2;
    }
    if (end === -1) break;
    ranges.push([m.index, end]);
    re.lastIndex = end;
  }
  return ranges;
}

const inRanges = (ranges, i) => ranges.some(([a, b]) => i >= a && i < b);

/** Index just past the '>' closing an opening tag, skipping braces and strings. */
function tagEnd(block) {
  let i = block.indexOf('<') + 1;
  while (i < block.length) {
    const c = block[i];
    if (c === '{') {
      let depth = 0;
      while (i < block.length) {
        if (block[i] === '{') depth++;
        else if (block[i] === '}') {
          depth--;
          if (depth === 0) { i++; break; }
        }
        i++;
      }
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const q = c;
      i++;
      while (i < block.length && block[i] !== q) {
        if (block[i] === '\\') i++;
        i++;
      }
    } else if (c === '>') {
      return i + 1;
    }
    i++;
  }
  return block.length;
}

/**
 * Controls that are not action buttons and stay as raw <button>.
 *
 * A disclosure toggle, a dropdown option, a tab, a pagination arrow, a modal close and a
 * menu item are all <button> because that is the correct element, not because they are
 * buttons in the design system's sense. They have no variant to pick and wrapping them in
 * riser-button fights their own layout. Matched on the class name because that is how this
 * codebase already names them — if a genuine action button ever gets called
 * "something-toggle", this will wave it through, which is the cost of not keeping a
 * per-file allowlist that nobody updates.
 */
const CHROME_BASE = 'toggle|expand|collapse|close|menu-item|dropdown-item|result-item|tab-|pagination|carousel|trigger|switch|password-toggle';
const CHROME = new RegExp(
  '(' + CHROME_BASE + (config.chromeExtra ? '|' + config.chromeExtra : '') + ')', 'i');

function classOf(block) {
  const m = /className=(["'])(.*?)\1/.exec(block) || /className=\{`([^`]*)`/.exec(block);
  return m ? m[m.length - 1] : '';
}

function* rawButtons(src) {
  const comments = commentRanges(src);
  const re = /<button\b/g;
  let m;
  while ((m = re.exec(src))) {
    if (inRanges(comments, m.index)) continue;
    const close = src.indexOf('</button>', m.index);
    if (close === -1) continue;
    const end = close + '</button>'.length;
    const block = src.slice(m.index, end);
    const inner = block.slice(tagEnd(block), block.lastIndexOf('</button>'));
    /* classOf reads the opening tag, not the whole block. Given the whole block it
       returns the first *quoted* className anywhere inside — so a button whose own
       className is a template literal, wrapping a child with a plain className, was
       classified by its child. That mis-flagged a menu row carrying `user-menu-item`
       around a <span className="flex-1">, and would equally wave through a real action
       button whose child happened to say "toggle". */
    const openTag = block.slice(0, tagEnd(block));
    yield { index: m.index, block, inner, chrome: CHROME.test(classOf(openTag)) };
  }
}

/** True when the children contain a brace expression that is not a comment. */
function hasDynamicChild(inner) {
  return /\{(?!\s*\/\*)/.test(inner.replace(/<[^>]*>/g, ''));
}

/** Visible text of a button: strips elements and brace expressions. */
function visibleText(inner) {
  let out = '';
  let i = 0;
  while (i < inner.length) {
    const c = inner[i];
    if (c === '<') {
      const gt = inner.indexOf('>', i);
      i = gt === -1 ? inner.length : gt + 1;
    } else if (c === '{') {
      let depth = 0;
      while (i < inner.length) {
        if (inner[i] === '{') depth++;
        else if (inner[i] === '}') {
          depth--;
          if (depth === 0) { i++; break; }
        }
        i++;
      }
    } else {
      out += c;
      i++;
    }
  }
  return out.trim();
}

/* ------------------------------------------------ rule 2: the orange is spent
 * A CSS rule whose selector names a save, update, edit, cancel or confirm and
 * fills with the accent. The orange belongs to the commercial action.
 */
const MAINTENANCE = /(save|update|edit|cancel|confirm|delete|remove)/i;
const ORANGE_FILL = /(?:^|[\s;{])(?:background|background-color)\s*:\s*var\(\s*--(accent|orange)/;

for (const file of css) {
  const src = readFileSync(file, 'utf8');
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(src))) {
    const selector = m[1].trim();
    const body = m[2];
    if (selector.startsWith('@') || !selector.includes('.')) continue;
    if (!MAINTENANCE.test(selector)) continue;
    if (!ORANGE_FILL.test(body)) continue;
    report(2, file, lineOf(src, m.index),
      'orange fill on a maintenance action',
      `${selector} — editing, updating, saving and cancelling never take the orange`);
  }
}

/* -------------------------------------- rule 4 (Button): labelled raw button
 * A <button> with a visible label is an action button and belongs to the
 * design system. Icon-only controls in dense rows may stay raw.
 */
for (const file of tsx) {
  const src = readFileSync(file, 'utf8');
  for (const { index, inner, chrome } of rawButtons(src)) {
    if (chrome) continue;
    const text = visibleText(inner);
    const dynamic = hasDynamicChild(inner);
    if (!text && !dynamic) continue;
    report('4', file, lineOf(src, index),
      'labelled <button> is not a design-system Button',
      `"${(text || '{expression}').replace(/\s+/g, ' ').slice(0, 48)}" — import { Button } from '@riser/design-system'`);
  }
}

/* ------------------------------------------------- rule 7: icons and symbols
 * A button's only icon is a create's plus, passed through `icon`. A unicode
 * symbol in a label is a symbol doing an icon's job.
 */
const SYMBOLS = ['+', '✓', '✔', '×', '✕', '✗', '→', '←', '»', '«'];

for (const file of tsx) {
  const src = readFileSync(file, 'utf8');
  const comments = commentRanges(src);

  for (const { index, inner } of rawButtons(src)) {
    const text = visibleText(inner);
    const hit = SYMBOLS.find((s) => text.includes(s));
    if (hit) {
      report(7, file, lineOf(src, index),
        'unicode symbol in a button label',
        `"${hit}" — use Lucide through the icon prop, or drop it`);
    }
  }

  // Same, for design-system Buttons.
  const re = /<Button\b/g;
  let m;
  while ((m = re.exec(src))) {
    if (inRanges(comments, m.index)) continue;
    // A self-closing <Button … /> has no children, so it has no label and this rule
    // cannot apply to it. Without this the indexOf below runs past it to the *next*
    // </Button> in the file and reads that button's label as this one's — which is how
    // seven icon-only image-picker buttons got reported for a label they do not have.
    const selfClose = src.slice(m.index, m.index + tagEnd(src.slice(m.index)));
    if (selfClose.trimEnd().endsWith('/>')) continue;
    const close = src.indexOf('</Button>', m.index);
    if (close === -1) continue;
    const block = src.slice(m.index, close + '</Button>'.length);
    const inner = block.slice(tagEnd(block), block.lastIndexOf('</Button>'));
    const text = visibleText(inner);
    const hit = SYMBOLS.find((s) => text.includes(s));
    if (hit) {
      report(7, file, lineOf(src, m.index),
        'unicode symbol in a Button label',
        `"${hit}" — pass icon={<Icon as={Plus} />} instead`);
    }
    // An icon alongside a label is only ever a create's plus or a loader.
    const openTag = block.slice(0, tagEnd(block));
    const iconProp = /icon=\{/.test(openTag);
    const allowed = /Plus|loading/.test(openTag);
    if (text && iconProp && !allowed) {
      report(7, file, lineOf(src, m.index),
        'labelled Button carries a non-create icon',
        `"${text.slice(0, 40)}" — the verb is the affordance`);
    }
  }
}

/* ------------------------------------------------------- forms: one treatment
 * The design system retired the underline field outright — "there is one control
 * treatment, and it is the bordered square one". Six classes in this codebase
 * outlived that decision, and while any of them exists the next form will use one.
 */
const RETIRED_FIELD_CLASSES = [
  'cuf-input',
  'cuf-input-date-picker',
  'event-create-input-date-picker',
  'slug-verification-input-variant-2',
];

for (const file of [...css, ...tsx]) {
  // Comments discuss these class names by name — that is documentation, not usage.
  const src = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/\S/g, ' '));
  for (const name of RETIRED_FIELD_CLASSES) {
    // the class itself, not a longer name that merely starts with it
    const re = new RegExp(`[.'"\s]${name}(?![\w-])`, 'g');
    let m;
    while ((m = re.exec(src))) {
      report('form', file, lineOf(src, m.index),
        `retired field class "${name}"`,
        'the underline treatment is gone — use Field + riser-input/riser-select');
    }
  }
}

/* A field label belongs to Field, which renders it as mono caps. A hand-rolled
 * <label htmlFor> next to a control renders browser-default sentence case, which is
 * how two label treatments ended up on the same screen. A label that comes *after*
 * its control is a checkbox label and is correct. */
for (const file of tsx) {
  // Blanked, not stripped, so line numbers still point at the real line. A component that
  // documents the markup it replaced quotes that markup in its doc comment; without this
  // the checker reads the quotation as the thing itself.
  const src = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/\S/g, ' '));
  const re = /<label\s+htmlFor=/g;
  let m;
  while ((m = re.exec(src))) {
    // Three correct shapes, none of them a field label:
    //   <input type=checkbox> <label htmlFor>      label follows the control
    //   <label htmlFor className="checkbox-label"> label declares itself
    //   <label htmlFor> <input type=checkbox>      label wraps the control
    const before = src.slice(Math.max(0, m.index - 400), m.index);
    const tagEndIdx = src.indexOf('>', m.index);
    const openTag = src.slice(m.index, tagEndIdx + 1);
    // Bounded by this label's own close. A fixed look-ahead window runs past </label>
    // and finds the next block's checkbox, which marks every field label as a checkbox.
    const closeIdx = src.indexOf('</label>', tagEndIdx);
    const after = src.slice(tagEndIdx + 1, closeIdx === -1 ? tagEndIdx + 400 : closeIdx);
    // Index scan, not a tag regex: [^>]* cannot cross the '>' in an onChange arrow
    // function, so a multi-line checkbox input never matched.
    const lastInput = before.lastIndexOf('<input');
    const follows = lastInput !== -1
      && /type=["']checkbox["']/.test(before.slice(lastInput))
      && !before.slice(lastInput).includes('</div>');
    const declares = /checkbox/i.test(openTag);
    const wrapsIdx = after.indexOf('<input');
    const wraps = wrapsIdx !== -1 && /type=["']checkbox["']/.test(after.slice(wrapsIdx));
    if (follows || declares || wraps) continue;
    report('form', file, lineOf(src, m.index),
      'hand-rolled field label',
      'use <Field label="..."> — a bare <label> renders sentence case beside Field’s mono caps');
  }
}

/* A second icon library. docs/ICONS.md has forbidden this from the start, but both apps
 * added one anyway and for the same reason: Lucide 1.x carries no brand glyphs, so a
 * footer with a Facebook link had nowhere to go. BrandMark covers that case now, which is
 * what makes this checkable rather than merely stated. */
for (const file of tsx) {
  const src = readFileSync(file, 'utf8');
  const m = /from\s+['"]@phosphor-icons\/[^'"]*['"]/.exec(src);
  if (!m) continue;
  /* One case is genuinely not fixable in the markup: an icon name held in the database,
   * where swapping the set needs a data migration first. Waive it at the site with a
   * reason rather than in a config list — the note above CHROME_BASE is right that a
   * per-file allowlist is one nobody updates, and here the reason is the whole point.
   *
   *   /* riser-check-allow icons — iconName is socialMediaType.icon, a DB value * /
   */
  if (/riser-check-allow\s+icons\b/.test(src)) continue;
  report('icons', file, lineOf(src, m.index),
    'second icon library',
    'use Icon with a Lucide glyph, or BrandMark for a third-party logo — see docs/ICONS.md');
}

/* Syncfusion Material has to arrive with the Riser reskin, or Material wins by load
 * order and the same control looks different on different screens. */
for (const file of tsx) {
  const src = readFileSync(file, 'utf8');
  const loadsSyncfusion = /@clever-ui-kit\/[^'"]*\/dist\/style\.css|@syncfusion\/[^'"]*material\.css/.test(src);
  if (!loadsSyncfusion) continue;
  const reskin = config.vendorReskin;
  if (!reskin) continue;
  if (new RegExp(reskin.module).test(src)) continue;
  report('form', file, 1,
    'Syncfusion loaded without the Riser reskin',
    reskin.hint ?? `import the app's reskin entry point (${reskin.module})`);
}

/* ------------------------------------------- forms: one label, one control class

   Three more ways a screen drifts back off the system, each of which was invisible to
   every rule above. All three were found in the codebase after the rules above passed
   it clean, which is the argument for having them. */

/** Every rule in a stylesheet, at every nesting depth.
 *
 *  The @media test ignores comments deliberately. `sel` is everything between the last
 *  `}` and this `{`, so a comment sitting above an @media block put `/*` at the front of
 *  the selector, the `@` test failed, and the walker swallowed the entire block as a
 *  single rule body — every breakpoint override inside it unreachable. */
function* cssRules(src) {
  let i = 0;
  for (;;) {
    const j = src.indexOf('{', i);
    if (j === -1) return;
    let prevClose = src.lastIndexOf('}', j);
    if (prevClose < i) prevClose = -1;
    let prevOpen = src.lastIndexOf('{', j - 1);
    if (prevOpen < i) prevOpen = -1;
    let selStart = Math.max(prevClose, prevOpen, i - 1) + 1;
    // Past the blank lines and comments between rules, so the reported line is the
    // selector's own rather than the previous rule's closing brace.
    while (selStart < j && /\s/.test(src[selStart])) selStart++;
    if (src.startsWith('/*', selStart)) {
      const close = src.indexOf('*/', selStart);
      if (close !== -1 && close < j) {
        selStart = close + 2;
        while (selStart < j && /\s/.test(src[selStart])) selStart++;
      }
    }
    const raw = src.slice(selStart, j);
    const selector = raw.replace(/\/\*[\s\S]*?\*\//g, '').trim().replace(/\s+/g, ' ');
    if (selector.startsWith('@')) { i = j + 1; continue; }
    let k = j + 1;
    let depth = 1;
    while (k < src.length && depth) {
      if (src[k] === '{') depth++;
      else if (src[k] === '}') depth--;
      k++;
    }
    if (selector) yield { index: selStart, selector, body: src.slice(j + 1, k - 1) };
    i = k;
  }
}

/* A bare element selector is not a style, it is an ambush. `label { margin-bottom: .3rem }`
 * sat in a stylesheet six files imported, adding space under every field label in the app,
 * and `input, select, textarea { border: none; border-bottom: 1px }` was the retired
 * underline still alive after the class that carried it had been deleted. */
const BARE_ELEMENT = /(^|,)\s*(label|input|select|textarea)\s*(,|$)/;

for (const file of css) {
  const src = readFileSync(file, 'utf8');
  for (const { index, selector } of cssRules(src)) {
    if (!BARE_ELEMENT.test(selector)) continue;
    report('form', file, lineOf(src, index),
      `bare element selector "${selector}"`,
      'it reaches every control in the app — scope it to a class, or delete it and use Field');
  }
}

/* The label treatment lives in one rule in the design system. A `.thing-group label`
 * descendant is 0-1-1 and beats .riser-field__label at 0-1-0, so a component that had
 * already been migrated to Field silently kept its old label size — which is how three
 * label sizes ended up on one screen. `-label-value` is the value half of a key/value
 * pair and is body copy on purpose. */
const LABEL_SELECTOR = /\.[\w-]*label(?!-value)[\w-]*|\S\s+label\s*$/;
const LABEL_TYPO = /(^|[;{\s])(font-family|font-size|font-weight|color|letter-spacing|text-transform)\s*:/;

for (const file of css) {
  const src = readFileSync(file, 'utf8');
  for (const { index, selector, body } of cssRules(src)) {
    if (!LABEL_SELECTOR.test(selector)) continue;
    if (!LABEL_TYPO.test(body.replace(/\/\*[\s\S]*?\*\//g, ''))) continue;
    report('form', file, lineOf(src, index),
      `label treatment redefined by "${selector}"`,
      'labels come from Field or .riser-label — keep layout here, not typography');
  }
}

/* A control with no design-system class takes whatever a stylesheet happens to reach it
 * with. Stripping the old class's border without adding .riser-input is worse than leaving
 * it: the field renders with no border at all. */
for (const file of tsx) {
  const src = readFileSync(file, 'utf8');
  const comments = commentRanges(src);
  const re = /<(input|select|textarea)(?=[\s/>])/g;
  let m;
  while ((m = re.exec(src))) {
    if (inRanges(comments, m.index)) continue;
    // Brace-aware: `<input onChange={(e) => { … }} />` has nested braces in an attribute,
    // and a [^>]* or \{[^{}]*\} scan cannot cross them — sixteen controls were invisible.
    const tag = src.slice(m.index, m.index + tagEnd(src.slice(m.index)));
    re.lastIndex = m.index + tag.length;

    // A checkbox is a control too. Exempting the type outright let one ship with no class
    // at all and an inline style={{ width: '18px', height: '18px' }} hand-drawing the
    // square .riser-check already draws.
    if (/type=["'](checkbox|radio)["']/.test(tag)) {
      if (/riser-check(?![\w-])/.test(tag)) continue;
      report('form', file, lineOf(src, m.index),
        '<input type=checkbox> with no design-system class',
        'add riser-check, and riser-check-row on the label that wraps it');
      continue;
    }
    if (/type=["'](file|hidden|submit|button)["']/.test(tag)) continue;
    if (/riser-(input|select|textarea|search)/.test(tag)) continue;
    report('form', file, lineOf(src, m.index),
      `<${m[1]}> with no design-system class`,
      'add riser-input / riser-select / riser-textarea, or use Field’s Input / Select');
  }
}

/* --------------------------------------- accessibility: name the icon buttons */
for (const file of tsx) {
  const src = readFileSync(file, 'utf8');
  for (const { index, block, inner } of rawButtons(src)) {
    if (visibleText(inner)) continue;
    // A brace expression may be a dynamic label ({CTAtext}) rather than an icon. Skip the
    // accessible-name check for those — but they are still buttons, and rule 4 below now
    // treats them as labelled, because "invisible to both rules" is how the Add venue
    // button kept a hand-rolled ink fill through a whole button migration.
    if (hasDynamicChild(inner)) continue;
    const hasIcon = /<[A-Z][A-Za-z0-9_]*[\s/]|<svg/.test(block);
    const named = /aria-label|aria-labelledby|title=/.test(block);
    if (hasIcon && !named) {
      report('a11y', file, lineOf(src, index),
        'icon-only button has no accessible name',
        'add aria-label — it announces as nothing without one');
    }
  }
}

/* ----------------------------------------- rule 9: the primary action goes last

 * Cancel then Save. The eye finishes on the right and that is where the action that
 * commits belongs — a row rendered Save-then-Cancel puts the escape hatch under the
 * pointer at the moment of committing. FormActions and Modal's primaryAction take the
 * buttons rather than their order and cannot get this wrong; a hand-rolled row can. */
const ACTION_ROW = /<(?:div className="(?:riser-form-actions|riser-modal__actions)[^"]*"|CUFButtonRow)\s*>/g;

for (const file of tsx) {
  const src = readFileSync(file, 'utf8');
  const comments = commentRanges(src);
  let m;
  while ((m = ACTION_ROW.exec(src))) {
    if (inRanges(comments, m.index)) continue;
    const isCuf = m[0].startsWith('<CUFButtonRow');
    const closer = isCuf ? '</CUFButtonRow>' : '</div>';
    const close = src.indexOf(closer, m.index);
    if (close === -1) continue;
    const row = src.slice(m.index, close);
    const variants = [...row.matchAll(/variant="(\w+)"/g)].map((v) => v[1]);
    const commits = variants.findIndex((v) => v === 'ink' || v === 'primary' || v === 'danger');
    const backs = variants.findIndex((v) => v === 'secondary' || v === 'ghost');
    if (commits !== -1 && backs !== -1 && commits < backs) {
      report(9, file, lineOf(src, m.index),
        'primary action rendered before the secondary',
        'Cancel then Save — or pass FormActions primary/secondary and stop deciding');
    }
  }
}

/* ------------------------------------------ rule 2: the orange is not an error

 * The accent marks the commercial action. An invalid field drawn in it puts the orange
 * on the thing that is broken as well as the thing to press, and a form with three empty
 * required fields breaks one-orange-per-view four times over. --error exists for this. */
const ERROR_SELECTOR = /error|invalid|danger|required-field/i;
// A class with btn/button in it is a button, and a button's fill is rule 2's own
// business — .error-screen-btn is the action on an error page, not error styling.
const IS_BUTTON = /btn|button/i;
const ACCENT_VALUE = /var\(--(accent|orange|color-warning)\b/;

for (const file of css) {
  const src = readFileSync(file, 'utf8');
  for (const { index, selector, body } of cssRules(src)) {
    if (!ERROR_SELECTOR.test(selector) || IS_BUTTON.test(selector)) continue;
    if (!ACCENT_VALUE.test(body.replace(/\/\*[\s\S]*?\*\//g, ''))) continue;
    report(2, file, lineOf(src, index),
      `error styling painted with the accent in "${selector.trim().slice(0, 46)}"`,
      'use var(--error) — the orange belongs to the commercial action');
  }
}

/* --------------------------------------- rule 10: one page measure, and it is a class

 * Every page's content lines up with the navbar because both are .riser-measure. Written
 * out by hand it drifts: this codebase had twenty-seven copies of `calc(100% - 6rem)` at
 * five different caps, and where one nested inside another the gutter was subtracted twice
 * and the card came out 96px narrower than the navbar above it.
 *
 * A band that spans the viewport gives up its horizontal padding to the measure inside it,
 * for the same reason — the padding is the gutter, spelled differently. */
const HAND_GUTTER = /width\s*:\s*calc\(\s*100%\s*-\s*6rem\s*\)/;
const PAGE_CAP = /max-width\s*:\s*(1440px|1200px|1280px|1550px|80rem)\b/;

/* Classes that share an element with riser-measure in the markup. A width on one of them
 * beats the measure at equal specificity and decides on import order, which is the same
 * silent defeat as writing the measure out by hand — and it hides in a media query, where
 * it only shows at the sizes that matter. */
const measureCarriers = carriersOf('riser-measure');
const CARRIER_WIDTH = /(?:^|[;{\s])(?:max-)?width\s*:/;

/** Classes that share an element with `base` in a className, literal or template. */
function carriersOf(base) {
  const found = new Set();
  const ATTR = /className=(?:"([^"]*)"|\{`([^`]*)`\}|\{'([^']*)'\})/g;
  for (const file of tsx) {
    const src = readFileSync(file, 'utf8');
    let m;
    while ((m = ATTR.exec(src))) {
      const val = m[1] ?? m[2] ?? m[3] ?? '';
      if (!new RegExp(`(?:^|[\\s{])${base}(?:$|[\\s}])`).test(val)) continue;
      for (const name of val.split(/[\s${}?:'"()!&|=.]+/)) {
        if (name && name !== base && /^[a-z][\w-]*$/.test(name)) found.add(name);
      }
    }
  }
  return found;
}

/** The carrier a rule styles directly, if any. Only the subject of each selector counts:
 *  `.card > *` styles the card's children, and a width there is not a width on the card. */
function carrierStyled(selector, carriers) {
  const subjects = selector.split(',').map((s) => s.trim().split(/\s*[>+~]\s*|\s+/).pop() ?? '');
  return [...carriers].find((c) => subjects.some((subject) => {
    // Plain indexOf, not a built regex: the class name goes into the pattern and
    // getting one backslash wrong turns the leading dot into "any character", which
    // silently matches .organizer-dashboard-container for the carrier dashboard-container.
    const at = subject.indexOf('.' + c);
    if (at === -1) return false;
    const after = subject[at + c.length + 1];
    return after === undefined || !/[\w-]/.test(after);
  }));
}

for (const file of css) {
  const src = readFileSync(file, 'utf8');
  for (const { index, selector, body } of cssRules(src)) {
    const clean = body.replace(/\/\*[\s\S]*?\*\//g, '');
    const gutter = HAND_GUTTER.test(clean);
    const cap = PAGE_CAP.exec(clean);
    if (!gutter && !cap) {
      if (!CARRIER_WIDTH.test(clean)) continue;
      const hit = carrierStyled(selector, measureCarriers);
      if (!hit) continue;
      report(10, file, lineOf(src, index),
        `width on ".${hit}", which carries riser-measure`,
        'the measure owns the width — remove it, or take riser-measure off that element');
      continue;
    }
    report(10, file, lineOf(src, index),
      gutter
        ? `page gutter written by hand in "${selector.trim().slice(0, 44)}"`
        : `page measure ${cap[1]} written by hand in "${selector.trim().slice(0, 40)}"`,
      'add riser-measure to the element and drop the width/max-width here');
  }
}

/* --------------------------------------------- rule 12: nothing opens over the page
 * A dialog is a ConfirmModal or a LoadingModal, nothing else. <Modal> in app code is a
 * form or a detail that belongs in an Expander under its control. A hand-rolled dialog
 * is the same thing wearing a class name: anything called modal, dialog or lightbox that
 * is not the design system's own riser-modal. A genuine critical interruption that is
 * neither a confirmation nor a wait is waived at the site, with the reason:
 *
 *   /* riser-check-allow modal — account deletion needs a typed confirmation * /
 */
const DIALOG_CLASS = /[\w-]*(?:modal|dialog|lightbox)[\w-]*/gi;
for (const file of tsx) {
  const src = readFileSync(file, 'utf8');
  if (/riser-check-allow\s+modal\b/.test(src)) continue;
  const comments = commentRanges(src);
  const reported = new Set();
  const modal = /<Modal(?=[\s/>])/g;
  let m;
  while ((m = modal.exec(src))) {
    if (inRanges(comments, m.index)) continue;
    const line = lineOf(src, m.index);
    reported.add(line);
    report(12, file, line,
      'a dialog that is not a confirmation or a wait',
      'open it in place with Expander — Modal is for ConfirmModal and LoadingModal only');
  }
  // A className, literal or expression, that names a dialog. Brace-aware for the same
  // reason the control scan is: a template literal with a ternary has nested braces.
  // One finding per file: a hand-rolled dialog is seven class names on seven lines, and
  // it is one dialog. A file already reported for <Modal> is not reported again for the
  // class it hung on that Modal.
  if (reported.size > 0) continue;
  const attr = /className=(?:"[^"]*"|'[^']*'|\{)/g;
  while ((m = attr.exec(src))) {
    if (inRanges(comments, m.index)) continue;
    let value = m[0];
    if (value.endsWith('{')) {
      const rest = src.slice(m.index + m[0].length - 1);
      value = rest.slice(0, tagEnd('<' + rest) - 1);
    }
    const hit = [...value.matchAll(DIALOG_CLASS)].map((h) => h[0]).find((token) => !token.startsWith('riser-'));
    if (!hit) continue;
    const line = lineOf(src, m.index);
    if (reported.has(line)) continue;
    report(12, file, line,
      `hand-rolled dialog "${hit}"`,
      'a form or a detail opens in place with Expander; a confirmation is ConfirmModal, a wait is LoadingModal');
    break;
  }
}

/* ------------------------------- rule 13: an event's facts carry fixed glyphs
 * Calendar is a date, MapPin is a venue, Ticket is a price — on every screen, at one
 * size, on the baseline. `Fact` holds the mapping and the baseline, so a screen that
 * imports one of the three from Lucide is picking a glyph it does not get to pick, and
 * will sooner or later pick a different size or a different glyph from the screen next
 * to it. That is how the event page came to draw all three at 22px while the cards on
 * the dashboard drew none.
 *
 * Where one of the three genuinely means something else — a date-picker's own trigger,
 * a control on a map — waive it at the site, with the reason:
 *
 *   /* riser-check-allow fact — Calendar is the picker's trigger, not an event date * /
 */
const FACT_GLYPHS = new Set(['Calendar', 'MapPin', 'Ticket']);
for (const file of tsx) {
  const src = readFileSync(file, 'utf8');
  if (/riser-check-allow\s+fact\b/.test(src)) continue;
  const comments = commentRanges(src);
  // The braces of an import list hold no nested braces, and the list may wrap over
  // several lines, so [^}]* is both sufficient and multiline-safe here.
  const imports = /import\s*\{([^}]*)\}\s*from\s*['"]lucide-react['"]/g;
  let m;
  while ((m = imports.exec(src))) {
    if (inRanges(comments, m.index)) continue;
    // `Calendar as CalendarIcon` is still Calendar; it is the imported name that counts.
    const hit = m[1]
      .split(',')
      .map((name) => name.trim().split(/\s+as\s+/)[0].trim())
      .find((name) => FACT_GLYPHS.has(name));
    if (!hit) continue;
    report(13, file, lineOf(src, m.index),
      `"${hit}" chosen by the screen`,
      'an event\'s date, venue and price are <Fact kind="when|where|tickets"> — see docs/ICONS.md');
    break; // One finding per file: it is one decision, however many rows it draws.
  }
}

/* ------------------------------------------------ rule 14: a page starts at the top
 * The first block carries .riser-page, which puts it one gap below the navbar at every
 * width. Three ways a screen drifts off that, each found in riser.events on the day the
 * rule was written:
 *
 *   - A box a screen tall that centres what is inside it. The sign-in card sat 200px below
 *     the navbar on a desktop, and five static pages floated their text in half the
 *     screen. An overlay is exempt, because it covers the page rather than sits in it; it
 *     is fixed or absolute. Anything else that has a reason is waived in its stylesheet:
 *
 *       /* riser-check-allow centred — the reason * /
 *
 *   - The navbar's clearance written by hand. var(--navbar-height) outside this package
 *     is somebody working out, again, where the page starts.
 *
 *   - A top margin on an element that carries riser-page. `margin: 0 auto` beats the class
 *     at equal specificity once the app's stylesheet loads, and quietly puts the page back
 *     under the navbar. */
const pageCarriers = carriersOf('riser-page');
const SCREEN_TALL = /(?:^|[;{\s])(?:min-)?height\s*:\s*(\d+(?:\.\d+)?)[dsl]?vh\b/;
const OVERLAY = /position\s*:\s*(?:fixed|absolute)/;
const HAND_CLEARANCE = /var\(\s*--navbar-height\s*\)/;
const TOP_MARGIN = /(?:^|[;{\s])margin(?:-top|-block|-block-start)?\s*:/;

for (const file of css) {
  const src = readFileSync(file, 'utf8');
  const waived = /riser-check-allow\s+centred\b/.test(src);
  for (const { index, selector, body } of cssRules(src)) {
    const clean = body.replace(/\/\*[\s\S]*?\*\//g, '');
    const name = selector.trim().replace(/\s+/g, ' ').slice(0, 44);

    const tall = SCREEN_TALL.exec(clean);
    if (!waived && tall && Number(tall[1]) >= 50 && !OVERLAY.test(clean)) {
      const column = /flex-direction\s*:\s*column/.test(clean);
      const centred = (!column && /align-items\s*:\s*center/.test(clean))
        || (column && /justify-content\s*:\s*center/.test(clean))
        || /(?:place-items|place-content|align-content)\s*:\s*center/.test(clean);
      if (centred) {
        report(14, file, lineOf(src, index),
          `"${name}" centres its content in the height of the screen`,
          'start it at the top: drop the vertical centring, and put riser-page on the first block');
      }
    }

    if (HAND_CLEARANCE.test(clean)) {
      report(14, file, lineOf(src, index),
        `navbar clearance written by hand in "${name}"`,
        'put riser-page on the first block on the page and drop this');
    }

    if (TOP_MARGIN.test(clean)) {
      const hit = carrierStyled(selector, pageCarriers);
      if (hit) {
        report(14, file, lineOf(src, index),
          `top margin on ".${hit}", which carries riser-page`,
          'riser-page owns the top margin — use margin-bottom or margin-inline, not a shorthand');
      }
    }
  }
}

/* ------------------------------ rule 15: a page is one stack, one gap, one edge
 * The page's blocks sit in .riser-stack--page, which owns the gap between them and the gap
 * before the footer; a panel is a Card with riser-measure--bleed, and the package gives it
 * its phone padding. Two ways a screen drifts off that, both found in riser.events on the
 * day the rule was written:
 *
 *   - A vertical margin on the block itself. `margin: 10px auto` on every panel,
 *     `margin: 0` on two of them below 800px — which also cancels the measure's
 *     `margin-inline: auto`, so the box hugged the left edge and stopped 32px short of
 *     the right — and `margin-bottom: 40px` on a third. One page measured gaps of 0, 9,
 *     10, 12, 50 and 60px between its blocks on a phone. The stack owns the gap; the
 *     block carries none. A stylesheet with a reason waives it:
 *
 *       /* riser-check-allow rhythm — the reason * /
 *
 *   - A breakpoint of the stylesheet's own. Fourteen different widths in one app: 350,
 *     400, 480, 600, 640, 700, 780, 800, 1024, 1300 and more. The navbar collapses at 960
 *     and the form grid stacks at 768, so a page that switched at 800 was half a phone
 *     page between 800 and 960. Layout changes at the package's widths and nowhere else:
 *     360, 500, 768, 960, 1200, 1440. Waived per file with
 *     `riser-check-allow breakpoint — the reason`. */
const BREAKPOINTS = new Set([360, 500, 768, 960, 1200, 1440]);
const MEDIA_WIDTH = /\(\s*(?:min|max)-width\s*:\s*(\d+(?:\.\d+)?)\s*(px|em|rem)\s*\)/g;
const VERTICAL_MARGIN = /(?:^|[;{\s])margin(?:-top|-bottom|-block|-block-start|-block-end)?\s*:/;

for (const file of css) {
  const src = readFileSync(file, 'utf8');
  /* Comments become spaces of the same length, so offsets and line numbers survive. */
  const bare = src.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));

  if (!/riser-check-allow\s+breakpoint\b/.test(src)) {
    const media = /@media[^{]*/g;
    let m;
    while ((m = media.exec(bare))) {
      MEDIA_WIDTH.lastIndex = 0;
      let w;
      while ((w = MEDIA_WIDTH.exec(m[0]))) {
        const px = w[2] === 'px' ? Number(w[1]) : Number(w[1]) * 16;
        if (BREAKPOINTS.has(px)) continue;
        report(15, file, lineOf(bare, m.index + w.index),
          `breakpoint ${w[1]}${w[2]} in "${m[0].trim().slice(0, 44)}"`,
          'layout changes only at 360, 500, 768, 960, 1200 or 1440px — move the rule to the next of those up, or delete it');
      }
    }
  }

  if (!/riser-check-allow\s+rhythm\b/.test(src)) {
    for (const { index, selector, body } of cssRules(src)) {
      const clean = body.replace(/\/\*[\s\S]*?\*\//g, '');
      if (!VERTICAL_MARGIN.test(clean)) continue;
      const hit = carrierStyled(selector, measureCarriers);
      if (!hit) continue;
      report(15, file, lineOf(src, index),
        `vertical margin on ".${hit}", which carries riser-measure`,
        'the page stack (riser-stack--page) owns the gap between blocks — delete the margin; the measure already centres itself');
    }
  }
}

/* ------------------------------------------------------------------- output */

findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

if (findings.length === 0) {
  console.log('design rules: clean');
  process.exit(0);
}

const byRule = new Map();
for (const f of findings) byRule.set(f.rule, (byRule.get(f.rule) ?? 0) + 1);

for (const f of findings) {
  console.log(`${f.file}:${f.line}`);
  console.log(`  [rule ${f.rule}] ${f.message}`);
  console.log(`  ${f.detail}`);
  console.log('');
}

const summary = [...byRule.entries()].map(([r, n]) => `rule ${r}: ${n}`).join(', ');
console.log(`${findings.length} finding(s) — ${summary}`);
console.log('Rules: SKILL.md in Glasvey-Group/riser-design-system');
process.exit(1);
