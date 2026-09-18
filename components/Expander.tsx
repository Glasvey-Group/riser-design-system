'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Expander.
 *
 * Rule 12: nothing opens over the page. A form or a detail opens in place, under the
 * control that asked for it, and the page grows to hold it. This is the region that
 * grows. The control stays the caller's — a Button carrying `aria-expanded` and
 * `aria-controls`, wherever the layout wants it — because a trigger in the panel's own
 * header is only one of the places a trigger sits: on the user dashboard it is at the
 * far end of the welcome strip, in a list it is on the row.
 *
 * The height animates with `grid-template-rows: 0fr → 1fr`, the one way to transition
 * to a height nobody has measured, and the content rises the 8px the identity moves
 * everything by (rule 11). Closed, the panel is inert and hidden from assistive
 * technology, so its fields are not tab stops; it stays mounted, which is what lets a
 * form keep a half-typed value across a Cancel that is really a "not now".
 *
 * While the region is moving its overflow is hidden, so the content is clipped rather
 * than spilling; once it has settled the overflow is released, so a dropdown inside can
 * open past the panel's edge. On open it scrolls itself into view if it is not, which on
 * a phone is the difference between a form that appeared and one that seems not to have.
 */
export interface ExpanderProps {
  open: boolean;
  /** The id the trigger's `aria-controls` names. */
  id?: string;
  children: React.ReactNode;
  /** Scroll the panel into view once it has opened. Default true. */
  scrollIntoView?: boolean;
  /** Fires once the close transition has finished, for a caller that resets on close. */
  onClosed?: () => void;
  className?: string;
}

export const Expander: React.FC<ExpanderProps> = ({
  open,
  id,
  children,
  scrollIntoView = true,
  onClosed,
  className = '',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [settled, setSettled] = useState(open);

  useEffect(() => {
    setSettled(false);
    const panel = panelRef.current;
    if (!panel) return;
    // `inert` is missing from older React prop types, so it goes on the node.
    (panel as HTMLElement & { inert: boolean }).inert = !open;
  }, [open]);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'grid-template-rows') return;
    setSettled(true);
    if (!open) {
      onClosed?.();
      return;
    }
    if (scrollIntoView) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      event.currentTarget.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }
  };

  return (
    <div
      id={id}
      className={[
        'riser-expander',
        open && 'riser-expander--open',
        settled && 'riser-expander--settled',
        className,
      ].filter(Boolean).join(' ')}
      onTransitionEnd={handleTransitionEnd}
    >
      <div ref={panelRef} className="riser-expander__panel" aria-hidden={!open}>
        <div className="riser-expander__content">{children}</div>
      </div>
    </div>
  );
};
