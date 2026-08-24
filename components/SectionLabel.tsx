import React from 'react';

/**
 * SectionLabel — the organising device.
 *
 * A small mono label above each section: "01 — CORE". This is load-bearing, not
 * ornament: mono caps at 11px with 0.16em tracking in slate is what keeps the
 * identity reading as infrastructure rather than a flyer.
 *
 *   <SectionLabel index="01">Core</SectionLabel>
 *   <SectionLabel index="04" ruled accent>Live campaigns</SectionLabel>
 */

export interface SectionLabelProps {
  /** Two-digit sequence number. Rendered before an em dash. */
  index?: string;
  children: React.ReactNode;
  /** Draw a hairline under the label. */
  ruled?: boolean;
  /** Set the index in orange. Only when this section holds the view's one orange thing. */
  accent?: boolean;
  as?: 'div' | 'h2' | 'h3';
  className?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({
  index,
  children,
  ruled = false,
  accent = false,
  as: Tag = 'div',
  className = '',
}) => {
  const classes = [
    'riser-section-label',
    ruled && 'riser-section-label--ruled',
    accent && 'riser-section-label--accent',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag className={classes}>
      {index ? <span className="riser-section-label__index">{index} —</span> : null}
      <span>{children}</span>
    </Tag>
  );
};
