'use client';

import React from 'react';

/**
 * Navbar.
 *
 * Canonical source: RiserEvents `NavbarClient` — menu button, centred logo, auth
 * slot on the right, with a drawer behind the menu button. Promo's Navbar is the
 * same bar plus an "as {organizer}" context string; that is the `context` prop.
 *
 * Two treatments. `bar` is full-bleed on a hairline, sticky at the top of the scroll.
 * `floating` is detached: fixed, held off the top edge, ruled on all four sides, and
 * bounded to the page measure so its edges land where the content's do.
 *
 * This component originally offered only `bar`, because both codebases rendered a pill
 * with a 4px radius, a 10px backdrop blur and a 30px shadow — none of which this identity
 * permits. That objection was to the ornament, not to the position. Square, opaque and
 * unshadowed, a floating bar is just a bar that starts 16px down the page, and it is the
 * treatment Riser uses across its surfaces. Below --bp-lg it collapses to `bar`: a
 * detached pill on a phone spends horizontal room the content needs.
 *
 * The lockup is centred, between the menu button and the auth slot. An earlier version of
 * this component put it left, on the argument that left-aligned is the layout rule and a
 * centred lockup reads as a different system. Riser's surfaces disagree in practice — the
 * mark is the identity and it sits in the middle of the bar — so centred is the treatment,
 * and it is the treatment everywhere rather than a per-app choice.
 *
 * The outer tracks are equal-width so the mark is optically centred in the bar rather than
 * merely between two unequal ends.
 */

export interface NavbarProps {
  /** LogoLockup, wrapped in whatever your router uses for links. */
  logo: React.ReactNode;
  /** Drawer toggle. Omit to hide the menu button. */
  onMenuClick?: () => void;
  menuIcon?: React.ReactNode;
  /** Promo's "as {organizer}" string. Mono caps, hidden below 768px. */
  context?: React.ReactNode;
  /** Sign-in link, user menu, credit balance. */
  children?: React.ReactNode;
  tone?: 'paper' | 'ink';
  /**
   * Where the bar sits. `bar` is sticky and full-bleed; `floating` is fixed, inset from
   * the top and bounded to the page measure. Both collapse to `bar` on small screens.
   */
  variant?: 'bar' | 'floating';
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  logo,
  onMenuClick,
  menuIcon,
  context,
  children,
  tone = 'paper',
  variant = 'bar',
  className = '',
}) => (
  <nav
    className={[
      'riser-navbar',
      // The measure lives on the nav itself when floating, because the nav is what the
      // reader sees the edge of. In `bar` it belongs to __inner, which holds the content
      // to the measure while the background runs full-bleed.
      variant === 'floating' && 'riser-navbar--floating riser-measure',
      tone === 'ink' && 'riser-navbar--ink',
      className,
    ].filter(Boolean).join(' ')}
  >
    <div className="riser-navbar__inner">
      <div className="riser-navbar__left">
        {onMenuClick ? (
          <button
            type="button"
            className="riser-navbar__menu-btn"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            {menuIcon ?? '≡'}
          </button>
        ) : null}
      </div>

      <span className="riser-navbar__logo">{logo}</span>

      <div className="riser-navbar__right">
        {context ? <span className="riser-navbar__context">{context}</span> : null}
        {children}
      </div>
    </div>
  </nav>
);
