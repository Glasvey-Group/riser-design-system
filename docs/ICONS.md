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

| Glyph | File | Why Lucide could not supply it | Added |
| --- | --- | --- | --- |
| _(none yet)_ | | | |

## The mark is not an icon

The four rising bars are the logo. They appear as the loader (`Loader`), the favicon and
the app icon. They are not available as a general-purpose icon and should not be used to
label a menu item, a button or a section.
