import React from 'react';
import { StatusBadge, StatusTone } from './StatusBadge';

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
 */

export interface TicketSpec {
  label: string;
  value: string;
}

export interface TicketCardProps {
  name: string;
  /** Ticket type, e.g. "Early bird". */
  type?: string;
  /** Already formatted with its currency symbol. */
  price: string;
  description?: string;
  status?: { label: string; tone: StatusTone };
  /** Quantity, order limits, sales window. Rendered in mono under a dashed rule. */
  spec?: TicketSpec[];
  /** Refundable, service charge — mono caps, no icon. */
  flags?: string[];
  mode?: 'organizer' | 'buyer';
  /** Buyer mode: current quantity and its setter. */
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  maxQuantity?: number;
  minQuantity?: number;
  action?: React.ReactNode;
  className?: string;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  name,
  type,
  price,
  description,
  status,
  spec = [],
  flags = [],
  mode = 'organizer',
  quantity = 0,
  onQuantityChange,
  maxQuantity = 10,
  minQuantity = 0,
  action,
  className = '',
}) => (
  <div className={`riser-ticket ${className}`.trim()}>
    <div className="riser-ticket__header">
      <div>
        <h3 className="riser-ticket__title">{name}</h3>
        {type ? <div className="riser-ticket__type">{type}</div> : null}
      </div>
      {status ? <StatusBadge tone={status.tone}>{status.label}</StatusBadge> : null}
    </div>

    <div className="riser-ticket__price">{price}</div>

    {description ? <p className="riser-small">{description}</p> : null}

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

    {mode === 'buyer' && onQuantityChange ? (
      <div className="riser-row" style={{ justifyContent: 'space-between' }}>
        <div className="riser-ticket__quantity">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(minQuantity, quantity - 1))}
            disabled={quantity <= minQuantity}
            aria-label={`Fewer ${name}`}
          >
            −
          </button>
          <output aria-label={`${name} quantity`}>{quantity}</output>
          <button
            type="button"
            onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity}
            aria-label={`More ${name}`}
          >
            +
          </button>
        </div>
        {action}
      </div>
    ) : action ? (
      <div className="riser-row" style={{ justifyContent: 'flex-end' }}>{action}</div>
    ) : null}
  </div>
);
