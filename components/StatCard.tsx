import React from 'react';

/**
 * StatCard — a mono label, a tabular figure, an optional note.
 *
 * Canonical source: RiserEvents `PRUStatsSection` (icon + number + label) and
 * Promo's upload-audience statistics row (Total / Ready / Failed / Duplicates /
 * Bad phone numbers) and the WelcomeBanner credit balance. Those were three
 * shapes doing one job; this is the one shape.
 *
 * The icon is gone on purpose. Events put a 40px icon in a tinted rounded tile
 * beside every figure, which the brief rules out twice over — icons are never
 * boxed in a tinted tile, and they are never decorative beside a heading. The
 * label carries the meaning.
 *
 * `live` sets the figure in orange. It is only available to a view that has no
 * primary action — a listing, a public profile, a delivery log. If the view has
 * a primary button, that button is the orange and every figure stays ink. Never
 * both: one orange thing per view.
 */

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  /** Set the figure in orange. At most one per view. */
  live?: boolean;
  tone?: 'paper' | 'ink';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  note,
  live = false,
  tone = 'paper',
  className = '',
}) => {
  const classes = [
    'riser-stat',
    live && 'riser-stat--live',
    tone === 'ink' && 'riser-stat--ink',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <span className="riser-stat__label">{label}</span>
      <span className="riser-stat__value">{value}</span>
      {note ? <span className="riser-stat__note">{note}</span> : null}
    </div>
  );
};
