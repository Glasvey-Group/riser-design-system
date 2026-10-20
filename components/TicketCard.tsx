'use client';

import React, { useId, useState } from 'react';
import { ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { StatusBadge, StatusTone } from './StatusBadge';
import { Expander } from './Expander';
import { Fact } from './Fact';
import { Icon } from './Icon';

/**
 * TicketCard.
 *
 * Canonical source: RiserEvents `OrganizerTicketCard` (name, type, status,
 * price, quantity, order limits, sales window, refundable / service-charge
 * flags) merged with `TicketsList`'s buyer row, which adds a quantity stepper.
 * `mode` picks which of the two you get.
 *
 * What changed: the organiser card labelled every row with an emoji — 💰 price,
 * 📦 quantity, 🛒 order limit, 📅 sales period, ↩️ refundable, 💳 service
 * charge — and marked status with a "●" bullet. The brief is explicit: no
 * emoji, and Unicode symbols are not used as icons. The mono caps label carries
 * the meaning, which is also what makes the spec block scan as a spec block.
 *
 * The terms sit under a dashed hairline, because dashed marks specification.
 *
 * Two layouts. `card`, the default, is a box per ticket with its terms on show:
 * the organiser's view. `row` is one ticket in a buyer's list inside a panel. It
 * has no box of its own and a hairline between it and the next. The price and the
 * quantity share a line, and the terms wait behind "More information", the
 * ticket's last line, at the right, which opens them in an Expander underneath
 * (rule 12). Below 768px the name has a line to itself; from 768px the name, the
 * price and the quantity share one. riser.events drew this list itself: a 44px
 * select beside a 26px price line, a "More" button for each layout, and a click
 * handler on the whole ticket that opened the details whenever someone picked a
 * quantity.
 *
 * The stepper. Its − and + were text characters (rule 7) on 36px buttons
 * (rule 8). Each is now a 44px touch area drawn as a 28px square holding Lucide's
 * Minus or Plus, so the stepper sits at the height of the price beside it and a
 * thumb still gets 44px. 0 is always allowed, because not buying is; a ticket
 * with a per-order minimum steps from 0 straight to that minimum and back.
 *
 * A ticket that can't be bought right now shows its `status` where the stepper
 * would be: "On sale Fri 12 Sep, 9:00 AM", "Sales ended", "Sold out". Give it a
 * tone other than `live`; the page's orange belongs to its Buy (rule 1).
 */

export interface TicketSpec {
  label: string;
  value: string;
}

export interface TicketCardProps {
  name: string;
  /** Ticket type, e.g. "Early bird". A mono label. */
  type?: string;
  /** Already formatted with its currency symbol, or "Free". */
  price: string;
  /** Under the price, what it includes: "incl. $0.70 fee". */
  priceNote?: string;
  description?: string;
  /** When the ticket is on sale, already formatted. Drawn as a `when` fact (rule 13). */
  salesWindow?: string;
  status?: { label: string; tone: StatusTone };
  /** Quantity, order limits, sales window. Rendered in mono under a dashed rule. */
  spec?: TicketSpec[];
  /** Refundable, service charge — mono caps, no icon. */
  flags?: string[];
  mode?: 'organizer' | 'buyer';
  /** `card`, a box with its terms on show, or `row`, one of a buyer's list in a panel. */
  layout?: 'card' | 'row';
  /** Buyer mode: current quantity and its setter. */
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  maxQuantity?: number;
  /** The fewest a buyer can take when they take any. 0 is always allowed. */
  minQuantity?: number;
  /** Card layout only: a control at the end of the card, e.g. its own Buy. */
  action?: React.ReactNode;
  className?: string;
}

interface StepperProps {
  name: string;
  quantity: number;
  min: number;
  max: number;
  onChange: (quantity: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ name, quantity, min, max, onChange }) => {
  const floor = Math.max(1, min);
  const fewer = quantity <= floor ? 0 : quantity - 1;
  const more = quantity === 0 ? floor : quantity + 1;
  return (
    <div className="riser-ticket__quantity" role="group" aria-label={`${name} quantity`}>
      <button
        type="button"
        className="riser-ticket__step"
        onClick={() => onChange(fewer)}
        disabled={quantity <= 0}
        aria-label={quantity - fewer > 1 ? `Remove ${quantity} ${name}` : `Remove one ${name}`}
      >
        <Icon as={Minus} size={16} />
      </button>
      <output className="riser-ticket__count" aria-live="polite">{quantity}</output>
      <button
        type="button"
        className="riser-ticket__step"
        onClick={() => onChange(more)}
        disabled={more > max}
        aria-label={more - quantity > 1 ? `Add ${more} ${name}` : `Add one ${name}`}
      >
        <Icon as={Plus} size={16} />
      </button>
    </div>
  );
};

export const TicketCard: React.FC<TicketCardProps> = ({
  name,
  type,
  price,
  priceNote,
  description,
  salesWindow,
  status,
  spec = [],
  flags = [],
  mode = 'organizer',
  layout = 'card',
  quantity = 0,
  onQuantityChange,
  maxQuantity = 10,
  minQuantity = 0,
  action,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const termsId = useId();

  const stepper = mode === 'buyer' && onQuantityChange ? (
    <Stepper name={name} quantity={quantity} min={minQuantity} max={maxQuantity} onChange={onQuantityChange} />
  ) : null;

  const priceBlock = (
    <div className="riser-ticket__price">
      {price}
      {priceNote ? <span className="riser-ticket__price-note">{priceNote}</span> : null}
    </div>
  );

  const terms = (
    <>
      {description ? <p className="riser-small riser-ticket__description">{description}</p> : null}
      {salesWindow ? (
        <Fact kind="when" size={16} label={false} className="riser-small">On sale {salesWindow}</Fact>
      ) : null}
      {spec.length > 0 ? (
        <div className="riser-ticket__spec">
          {spec.map((item) => (
            <div key={item.label} className="riser-ticket__spec-item">
              <span className="riser-ticket__spec-label">{item.label}</span>
              <span className="riser-ticket__spec-value">{item.value}</span>
            </div>
          ))}
        </div>
      ) : null}
      {flags.length > 0 ? (
        <div className="riser-ticket__flags">
          {flags.map((flag) => (
            <span key={flag} className="riser-label riser-label--ink">{flag}</span>
          ))}
        </div>
      ) : null}
    </>
  );

  if (layout === 'row') {
    const hasTerms = Boolean(description || salesWindow || spec.length || flags.length);
    return (
      <div className={`riser-ticket riser-ticket--row ${className}`.trim()}>
        <div className="riser-ticket__head">
          <h3 className="riser-ticket__title">{name}</h3>
          {type ? <span className="riser-label riser-ticket__type">{type}</span> : null}
          {stepper && status ? <StatusBadge tone={status.tone}>{status.label}</StatusBadge> : null}
        </div>
        {priceBlock}
        {stepper ?? (status ? (
          <StatusBadge tone={status.tone} className="riser-ticket__status">{status.label}</StatusBadge>
        ) : null)}
        {hasTerms ? (
          <>
            <button
              type="button"
              className="riser-ticket__toggle"
              aria-expanded={open}
              aria-controls={termsId}
              onClick={() => setOpen((was) => !was)}
            >
              {open ? 'Hide information' : 'More information'}
              <Icon as={open ? ChevronUp : ChevronDown} size={16} />
            </button>
            <Expander id={termsId} open={open} className="riser-ticket__more">
              <div className="riser-ticket__terms">{terms}</div>
            </Expander>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`riser-ticket ${className}`.trim()}>
      <div className="riser-ticket__header">
        <div>
          <h3 className="riser-ticket__title">{name}</h3>
          {type ? <div className="riser-label riser-ticket__type">{type}</div> : null}
        </div>
        {status ? <StatusBadge tone={status.tone}>{status.label}</StatusBadge> : null}
      </div>

      {priceBlock}
      {terms}

      {stepper || action ? (
        <div className={stepper ? 'riser-ticket__actions' : 'riser-ticket__actions riser-ticket__actions--end'}>
          {stepper}
          {action}
        </div>
      ) : null}
    </div>
  );
};
