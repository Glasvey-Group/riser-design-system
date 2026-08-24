'use client';

import React from 'react';

/**
 * Navbar.
 *
 * Canonical source: RiserEvents `NavbarClient` — menu button, centred logo, auth
 * slot on the right, with a drawer behind the menu button. Promo's Navbar is the
 * same bar plus an "as {organizer}" context string; that is the `context` prop.
 *
 * What changed: both codebases rendered a floating pill — `position: fixed`,
 * `calc(100% - 6rem)` wide, 4px radius, `backdrop-filter: blur(10px)` and
 * `box-shadow: 0 4px 30px rgba(0,0,0,0.1)`. Flat, square and hairline-ruled
 * means a bar that sits on the page: sticky, full width, one hairline
 * underneath, no blur and no shadow.
 *
 * The logo moves from centre to left. Left-aligned is the layout rule, and a
 * centred lockup in a left-aligned page reads as a different system.
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
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  logo,
  onMenuClick,
  menuIcon,
  context,
  children,
  tone = 'paper',
  className = '',
}) => (
  <nav
    className={['riser-navbar', tone === 'ink' && 'riser-navbar--ink', className]
      .filter(Boolean).join(' ')}
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
        <span className="riser-navbar__logo">{logo}</span>
      </div>

      <div className="riser-navbar__right">
        {context ? <span className="riser-navbar__context">{context}</span> : null}
        {children}
      </div>
    </div>
  </nav>
);
