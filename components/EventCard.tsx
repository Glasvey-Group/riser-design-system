import React from 'react';
import { StatusBadge, StatusTone } from './StatusBadge';

/**
 * EventCard.
 *
 * Canonical source: RiserEvents `components/ui/EventCard.tsx`. Its prop surface
 * had grown to 24 props, several of which were whole unfiltered collections
 * (`allTickets`, `allCities`, `allCountries`, `allLocations`, `allEventFeatures`)
 * that the card filtered itself in three useEffects — a presentational component
 * doing data joins on every render.
 *
 * That is resolved here: the card takes resolved strings. Do the joins in the
 * screen or the loader. `cardType`, `isDashboard`, `status`, `showDetails` and
 * `showSharing` collapse into `variant`, `status` and `detail`.
 *
 * The image runs full-bleed to the card edge, square, no radius and no inset.
 * The status badge sits on the image over an ink block — the one place a badge
 * gets a fill, because an underline will not read over a photograph.
 */

export type EventCardVariant = 'event' | 'organizer' | 'brand';

export interface EventCardProps {
  id: string;
  title: string;
  /** Resolved image URL. */
  image?: string | null;
  /** Already formatted, e.g. "Fri 12 Sep, 9:00 PM". */
  date?: string;
  /** Already resolved, e.g. "Limelight, Belfast". */
  location?: string;
  /** Already formatted, e.g. "£12 – £28". */
  price?: string;
  description?: string;
  features?: string[];
  variant?: EventCardVariant;
  /** Shown as a badge on the image. Dashboard lists only. */
  status?: { label: string; tone: StatusTone };
  /** Show price, description and features. The old `showDetails`. */
  detail?: boolean;
  /** Footer action. Omit for a card that is itself the link. */
  action?: React.ReactNode;
  onClick?: (id: string) => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  image,
  date,
  location,
  price,
  description,
  features = [],
  variant = 'event',
  status,
  detail = false,
  action,
  onClick,
  className = '',
}) => {
  const hasImage = Boolean(image && image !== 'null');

  return (
    <article
      className={`riser-event-card ${className}`.trim()}
      onClick={onClick ? () => onClick(id) : undefined}
    >
      <div className="riser-event-card__media">
        {hasImage ? (
          <img src={image as string} alt="" loading="lazy" />
        ) : (
          <div className="riser-event-card__placeholder" aria-hidden />
        )}
        {status ? (
          <span className="riser-event-card__badge">
            <StatusBadge tone={status.tone} onImage>{status.label}</StatusBadge>
          </span>
        ) : null}
      </div>

      <div className="riser-event-card__body">
        <h3 className="riser-event-card__title">{title}</h3>

        {(location || date) && (
          <div className="riser-event-card__meta">
            {location ? <span className="riser-event-card__meta-item">{location}</span> : null}
            {date ? <span className="riser-event-card__meta-item">{date}</span> : null}
          </div>
        )}

        {detail && price ? <span className="riser-event-card__price">{price}</span> : null}

        {detail && description ? (
          <p className="riser-event-card__description">{description}</p>
        ) : null}

        {detail && variant === 'event' && features.length > 0 ? (
          <div className="riser-event-card__features">
            {features.map((feature) => (
              <span key={feature} className="riser-label">{feature}</span>
            ))}
          </div>
        ) : null}
      </div>

      {action ? <div className="riser-event-card__footer">{action}</div> : null}
    </article>
  );
};

/** Placeholder card for a loading grid. Matches EventCard's shape exactly. */
export const EventCardSkeleton: React.FC = () => (
  <div className="riser-event-card" aria-hidden>
    <div className="riser-skeleton riser-skeleton--media" />
    <div className="riser-event-card__body">
      <span className="riser-skeleton riser-skeleton--title" style={{ width: '70%' }} />
      <span className="riser-skeleton riser-skeleton--text" style={{ width: '50%' }} />
      <span className="riser-skeleton riser-skeleton--text" style={{ width: '40%' }} />
    </div>
  </div>
);
