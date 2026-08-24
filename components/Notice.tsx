import React from 'react';

/**
 * Notice — an inline advisory bar.
 *
 * Promo rendered the same "Operating as a {organizer} Team Member — Organizer"
 * string in two places with two different sets of inline classes: inside
 * DataGrid and again on the credit screen. Both used a filled warning icon in
 * `--notification-error-bg`, which is a red that is not in the palette.
 *
 * Here it is one component with a `tone`, marked by a 2px leading rule.
 */

export type NoticeTone = 'neutral' | 'attention' | 'ink';

export interface NoticeProps {
  children: React.ReactNode;
  tone?: NoticeTone;
  icon?: React.ReactNode;
  className?: string;
}

export const Notice: React.FC<NoticeProps> = ({
  children,
  tone = 'neutral',
  icon,
  className = '',
}) => (
  <div
    className={['riser-notice', `riser-notice--${tone}`, className].filter(Boolean).join(' ')}
    role="status"
  >
    {icon}
    <div className="riser-notice__text">{children}</div>
  </div>
);
