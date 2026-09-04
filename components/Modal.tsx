'use client';

import React, { useEffect } from 'react';
import { Button } from './Button';
import type { ButtonVariant } from './Button';
import { Loader } from './Loader';

/**
 * Modal, ConfirmModal, LoadingModal.
 *
 * Canonical source: RiserEvents `ConfirmationModal` (isOpen, title, message,
 * onConfirm, onCancel, confirmText, cancelText). Promo's `ConfirmModal` added a
 * `submessage` and renamed the button props to confirmLabel/cancelLabel; the
 * submessage is kept, the Events prop names are kept, and the Promo names are
 * accepted as aliases so a migration is a rename, not a rewrite.
 *
 * Promo's version also rendered the logo at 150px inside every confirm dialog
 * and used a gradient background, a 20–24px radius, a coloured shadow and a
 * springy `cubic-bezier(0.175, 0.885, 0.32, 1.275)` entrance. All four are out:
 * square corners, flat paper, a firm ease-out with no bounce, and the mark only
 * where it earns its place.
 */

export interface ModalProps {
  isOpen: boolean;
  title: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
  /**
   * Freeform actions row. Prefer `primaryAction` / `secondaryAction`, which put the
   * primary last and on the right for you — the order this took on trust and lost.
   */
  actions?: React.ReactNode;
  /** The action that completes the dialog. Rendered last, on the right. */
  primaryAction?: React.ReactNode;
  /** Cancel or Back. Rendered before the primary. */
  secondaryAction?: React.ReactNode;
  wide?: boolean;
  /** Close on Escape and on overlay click. Off for blocking states. */
  dismissible?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  actions,
  primaryAction,
  secondaryAction,
  wide = false,
  dismissible = true,
  className = '',
}) => {
  useEffect(() => {
    if (!isOpen || !dismissible || !onClose) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, dismissible, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="riser-modal__overlay"
      onClick={dismissible ? onClose : undefined}
      role="presentation"
    >
      <div
        className={['riser-modal', wide && 'riser-modal--wide', className].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="riser-modal__title">{title}</h2>
        {children}
        {primaryAction
          ? <div className="riser-modal__actions">{secondaryAction}{primaryAction}</div>
          : actions ? <div className="riser-modal__actions">{actions}</div> : null}
      </div>
    </div>
  );
};

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  submessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** Events' names. */
  confirmText?: string;
  cancelText?: string;
  /** Promo's names, accepted as aliases. */
  confirmLabel?: string;
  cancelLabel?: string;
  /**
   * Tone of the confirm button. A confirmation inherits the tone of the action
   * it confirms rather than defaulting to the loudest button available:
   * `danger` to destroy, `primary` only where the thing being confirmed is
   * itself the commercial action, `ink` otherwise. Default `ink`.
   */
  confirmVariant?: ButtonVariant;
  /** @deprecated Pass `confirmVariant="danger"`. Kept so existing calls compile. */
  destructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  submessage,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  confirmLabel,
  cancelLabel,
  confirmVariant,
  destructive = false,
}) => (
  <Modal
    isOpen={isOpen}
    title={title}
    onClose={onCancel}
    actions={
      <>
        <Button variant="secondary" onClick={onCancel}>
          {cancelText ?? cancelLabel ?? 'Cancel'}
        </Button>
        <Button variant={confirmVariant ?? (destructive ? 'danger' : 'ink')} onClick={onConfirm}>
          {confirmText ?? confirmLabel ?? 'Confirm'}
        </Button>
      </>
    }
  >
    <p className="riser-modal__message">{message}</p>
    {submessage ? <p className="riser-modal__submessage">{submessage}</p> : null}
  </Modal>
);

export interface LoadingModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  /**
   * The second line — "This may take a few moments. Please don't close this window."
   *
   * ConfirmModal has had this from the start and LoadingModal did not, so promo kept a
   * local copy of this component to get the line back, and rendered it with
   * `riser-modal__message` because that was the only class it knew about. Two lines at
   * the same size, where the second should step down to small and secondary.
   * `.riser-modal__submessage` already existed in components.css; only the prop was
   * missing.
   */
  submessage?: string;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  title,
  message,
  submessage,
}) => (
  <Modal isOpen={isOpen} title={title} dismissible={false} className="riser-modal--loading">
    {message ? <p className="riser-modal__message">{message}</p> : null}
    {submessage ? <p className="riser-modal__submessage">{submessage}</p> : null}
    <div className="riser-modal__loader"><Loader /></div>
  </Modal>
);
