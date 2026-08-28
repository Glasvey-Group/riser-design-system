# Icons

Lucide, at 16, 20 and 24px, with one override applied by `.riser-icon` in
`components/components.css`:

```css
.icon, .riser-icon {
  stroke-width: 1.5;
  stroke-linecap: square;
  stroke-linejoin: miter;
}
```

Lucide ships `round` caps and joins as presentation attributes on the SVG elements. CSS
wins over presentation attributes, so this one rule squares the whole set and brings it in
line with an identity that has no round corners anywhere except the app icon tile.

## Rules

- Ink, or slate when secondary. One icon per view may be orange — it marks the action.
- Never filled. Never boxed in a circle or a tinted tile. Never decorative beside a heading.
- Sizes 16, 20, 24 only, on the same 4px rhythm as everything else.
- Emoji are not used. Unicode symbols are not used as icons.

## Custom glyphs

Where a glyph is genuinely unavailable in Lucide, add a hand-built SVG on the same grid
(24×24 viewBox) with the same 1.5 stroke, square caps and mitred joins — then record it in
the table below with the reason it was needed. Do not add a second icon library.

This applies to *interface* icons only. A third-party logo is not one, and must not be
redrawn onto our grid - see **Brand marks are not icons either** below.

| Glyph | File | Why Lucide could not supply it | Added |
| --- | --- | --- | --- |
| _(none yet)_ | | | |

## Brand marks are not icons either

Another company's logo is a third category, and the rule above does not apply to it. It
cannot be redrawn "on the same grid with the same 1.5 stroke": a squared-off Instagram
mark is not a restyled Instagram mark, it is the wrong mark, and the geometry is not ours
to change. Use `BrandMark`.

```tsx
import { BrandMark } from '@riser/design-system';

<a href="https://instagram.com/riserevents" rel="noopener" target="_blank">
  <BrandMark name="instagram" size={24} />
</a>
```

| | Icon | Hand-built glyph | Brand mark |
| --- | --- | --- | --- |
| Source | Lucide | drawn by us | the owner's published geometry |
| Fill | never | never | always |
| Stroke rules | 1.5, square, mitre | 1.5, square, mitre | none - exempt |
| Colour | `currentColor` | `currentColor` | `currentColor`, **never the brand's own** |
| Size | 16 / 20 / 24 | 16 / 20 / 24 | 16 / 20 / 24 |
| Accessible name | optional (decorative) | optional | always - they are links |

Colour is the rule most likely to be argued with. A footer that renders Facebook blue
beside Instagram pink beside TikTok cyan has four accents on a page allowed one, and the
marks stop reading as a set. They take ink, or slate when secondary, like everything else.

Currently shipped: `facebook`, `instagram`, `tiktok` - the three any Riser surface links
to. To add another, put the owner's own path in `BRAND_PATHS`, its proper name in
`BRAND_LABELS`, and a row in the table below. Do not add a mark speculatively, and do not
reach for a second icon library to get one.

| Mark | Added | For |
| --- | --- | --- |
| Facebook | v1.15.0 | riser.events and promo footers |
| Instagram | v1.15.0 | riser.events and promo footers |
| TikTok | v1.15.0 | riser.events footer |

## The mark is not an icon

The four rising bars are the logo. They appear as the loader (`Loader`), the favicon and
the app icon. They are not available as a general-purpose icon and should not be used to
label a menu item, a button or a section.
