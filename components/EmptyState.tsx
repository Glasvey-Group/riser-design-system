import React from 'react';

/**
 * EmptyState.
 *
 * Replaces the bare `<p>Loading campaigns…</p>` / `<p>No brands found</p>` /
 * `<p>Error: {error}</p>` strings scattered through Promo's screens, and
 * Events' `ErrorScreen` / `InfoScreen`, which were the same block with a 400px
 * logo on top.
 *
 * Left-aligned like everything else, with a mono label above the headline —
 * the same organising device as a section.
 */

export interface EmptyStateProps {
  /** Mono caps line above the headline, e.g. "NO RESULTS" or "ERROR". */
  label?: string;
  headline: string;
  body?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  label,
  headline,
  body,
  actions,
  className = '',
}) => (
  <div className={`riser-empty ${className}`.trim()}>
    {label ? <span className="riser-empty__label">{label}</span> : null}
    <h3 className="riser-empty__headline">{headline}</h3>
    {body ? <p className="riser-empty__body">{body}</p> : null}
    {actions ? <div className="riser-empty__actions">{actions}</div> : null}
  </div>
);
