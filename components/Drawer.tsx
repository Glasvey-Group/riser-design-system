'use client';

import React, { useEffect } from 'react';

/**
 * Drawer — the sidebar shell, and the pieces that go in it.
 *
 * Canonical source: RiserEvents `SidebarShell` + `SidebarSection` + `SidebarLink`.
 * Promo's Sidebar is the same drawer with a different link list (Home,
 * Campaigns, Credits, Message Templates, Audiences) and an "as {organizer}"
 * line; both are content, so they stay in the app.
 *
 * The active link is marked by a 2px orange rule on its leading edge. Hover
 * takes the rule to ink. Nothing slides sideways on hover.
 */

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** LogoLockup or LogoMark. */
  logo?: React.ReactNode;
  closeIcon?: React.ReactNode;
  children: React.ReactNode;
  tone?: 'paper' | 'ink';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  logo,
  closeIcon,
  children,
  tone = 'paper',
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={['riser-drawer__overlay', isOpen && 'riser-drawer__overlay--open']
          .filter(Boolean).join(' ')}
        onClick={onClose}
        role="presentation"
      />
      <aside
        className={[
          'riser-drawer',
          isOpen && 'riser-drawer--open',
          tone === 'ink' && 'riser-drawer--ink',
        ].filter(Boolean).join(' ')}
        aria-hidden={!isOpen}
      >
        <div className="riser-drawer__header">
          {logo}
          <button type="button" className="riser-drawer__close" onClick={onClose} aria-label="Close menu">
            {closeIcon ?? '×'}
          </button>
        </div>
        {children}
      </aside>
    </>
  );
};

export const DrawerSection: React.FC<{ title?: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="riser-drawer__section">
    {title ? <div className="riser-drawer__section-title">{title}</div> : null}
    <ul className="riser-drawer__list">{children}</ul>
  </div>
);

export interface DrawerLinkProps {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  /** Your router's Link. Defaults to a plain anchor. */
  as?: React.ElementType;
}

export const DrawerLink: React.FC<DrawerLinkProps> = ({
  href,
  active = false,
  children,
  onClick,
  as: Tag = 'a',
}) => (
  <li>
    <Tag
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={['riser-drawer__link', active && 'riser-drawer__link--active']
        .filter(Boolean).join(' ')}
    >
      {children}
    </Tag>
  </li>
);
