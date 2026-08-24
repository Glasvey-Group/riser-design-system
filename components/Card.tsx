import React from 'react';

/**
 * Card.
 *
 * Cards are 1px hairlines on paper, or solid ink blocks. Square corners, no
 * shadows, no gradients, no tints of the orange. `dashed` marks measurement and
 * specification — a spec panel, a placeholder, a dropzone — never decoration.
 *
 * Canonical source: RiserEvents `.pru-stat-card` / `.dru-description-section`
 * and Promo's `bg-content-bg border border-content-border rounded-lg p-6`, which
 * are the same card with different radii. The radius is now 0 in both.
 */

export type CardTone = 'paper' | 'ink' | 'accent';
export type CardPadding = 'default' | 'tight' | 'none';

export interface CardProps {
  children: React.ReactNode;
  tone?: CardTone;
  padding?: CardPadding;
  /** Dashed hairline. For specification and measurement only. */
  dashed?: boolean;
  /** Whole-card click target. Hover takes the rule to solid ink — no lift. */
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

const TONE_CLASS: Record<CardTone, string> = {
  paper: '',
  ink: 'riser-card--ink',
  accent: 'riser-card--accent',
};

const PADDING_CLASS: Record<CardPadding, string> = {
  default: '',
  tight: 'riser-card--tight',
  none: 'riser-card--flush',
};

export const Card: React.FC<CardProps> = ({
  children,
  tone = 'paper',
  padding = 'default',
  dashed = false,
  interactive = false,
  onClick,
  className = '',
}) => {
  const classes = [
    'riser-card',
    TONE_CLASS[tone],
    PADDING_CLASS[padding],
    dashed && 'riser-card--dashed',
    interactive && 'riser-card--interactive',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ title: React.ReactNode; actions?: React.ReactNode }> = ({
  title,
  actions,
}) => (
  <div className="riser-card__header">
    <h2 className="riser-card__title">{title}</h2>
    {actions ? <div className="riser-card__actions">{actions}</div> : null}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="riser-card__footer">{children}</div>
);
