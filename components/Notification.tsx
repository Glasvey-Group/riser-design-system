'use client';

import React, { useEffect } from 'react';

/**
 * NotificationStack.
 *
 * Canonical source: RiserEvents `components/ui/NotificationSlider.tsx` — the
 * shape (id, type, header, message, note, duration) and the auto-dismiss timers
 * are kept. Promo's copy is the same file with different colours.
 *
 * What changed: both used a four-colour notification palette in globals.css
 * (green / red / light blue / orange fills with black or white text). That is
 * four colours the brand does not have. Notifications are now ink blocks with a
 * 2px leading rule; only warning and error spend the orange, because those are
 * the two that must be noticed.
 *
 * Entry is the standard rise — 8px up over 200ms — not a scale-and-slide.
 * This component is presentational: keep the store (Events and Promo both use
 * `useNotificationStore`) in the app.
 */

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  header: string;
  message: string;
  note?: string;
  /** Milliseconds. Omit to require manual dismissal. */
  duration?: number;
}

export interface NotificationStackProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
  /** Rendered inside each notification's close button. */
  closeIcon?: React.ReactNode;
}

export const NotificationStack: React.FC<NotificationStackProps> = ({
  notifications,
  onDismiss,
  closeIcon,
}) => {
  useEffect(() => {
    const timers = notifications
      .filter((notification) => notification.duration)
      .map((notification) =>
        setTimeout(() => onDismiss(notification.id), notification.duration)
      );
    return () => timers.forEach(clearTimeout);
  }, [notifications, onDismiss]);

  if (notifications.length === 0) return null;

  return (
    <div className="riser-notifications" role="region" aria-label="Notifications">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`riser-notification riser-notification--${notification.type}`}
          role={notification.type === 'error' ? 'alert' : 'status'}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="riser-notification__header">{notification.header}</p>
            <p className="riser-notification__message">{notification.message}</p>
            {notification.note ? (
              <p className="riser-notification__note">{notification.note}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="riser-notification__close"
            onClick={() => onDismiss(notification.id)}
            aria-label="Dismiss"
          >
            {closeIcon ?? '×'}
          </button>
        </div>
      ))}
    </div>
  );
};
