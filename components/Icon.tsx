import React from 'react';

/**
 * Icon — the one place Lucide is wrapped.
 *
 * Lucide ships round caps and joins. `.riser-icon` in components.css squares
 * them (stroke-linecap: square, stroke-linejoin: miter, stroke-width: 1.5),
 * which is what brings the icon set in line with an identity that has no round
 * corners anywhere except the app icon tile.
 *
 * Sizes are 16, 20 and 24 only — the same 4px rhythm as everything else.
 * Icons are ink, or slate when secondary. One icon per view may be orange:
 * it marks the action, it does not decorate. Icons are never filled, never
 * boxed in a circle or a tinted tile, and never used beside a heading for
 * ornament.
 *
 * Emoji are not icons. Unicode symbols are not icons. Where a glyph is genuinely
 * missing from Lucide, add a hand-built SVG on the same grid and stroke and
 * document it in docs/ICONS.md — do not add a second icon library.
 *
 *   import { Play } from 'lucide-react';
 *   <Icon as={Play} size={16} tone="accent" label="Run campaign" />
 */

export type IconSize = 16 | 20 | 24;
export type IconTone = 'default' | 'secondary' | 'accent' | 'on-ink';

export interface IconProps {
  /** A Lucide icon component. */
  as: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
  size?: IconSize;
  tone?: IconTone;
  /** Accessible name. Omit for decorative icons; they are hidden from assistive tech. */
  label?: string;
  className?: string;
}

const TONE_CLASS: Record<IconTone, string> = {
  default: '',
  secondary: 'riser-icon--secondary',
  accent: 'riser-icon--accent',
  'on-ink': 'riser-icon--on-ink',
};

const SIZE_CLASS: Record<IconSize, string> = {
  16: 'riser-icon--sm',
  20: '',
  24: 'riser-icon--lg',
};

export const Icon: React.FC<IconProps> = ({
  as: Glyph,
  size = 20,
  tone = 'default',
  label,
  className = '',
}) => {
  const classes = ['riser-icon', SIZE_CLASS[size], TONE_CLASS[tone], className]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <Glyph size={size} className={classes} aria-hidden={!label} />
      {label ? <span className="riser-visually-hidden">{label}</span> : null}
    </>
  );
};
