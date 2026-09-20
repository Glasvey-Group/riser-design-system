import React from 'react';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Icon } from './Icon';

/**
 * Fact — an event's when, where and how much, with its glyph.
 *
 * Three facts recur on every surface that shows an event: the date, the venue
 * and the ticket price. Before this component each screen picked its own glyph
 * and its own size, so the event page drew Calendar, MapPin and Ticket at 22px,
 * the event card drew two of them at 20, the cards on the dashboard drew none,
 * and the compact and slider card layouts drew none either. Same three facts,
 * four answers.
 *
 * The caller states what the fact *is*, not which glyph to draw:
 *
 *   <Fact kind="when">Fri 12 Sep, 9:00 PM</Fact>
 *   <Fact kind="where" href="/venues/limelight">Limelight, Belfast</Fact>
 *   <Fact kind="tickets">£12 – £28</Fact>
 *
 * `label` renames the fact for assistive tech where the default is wrong — a
 * ticket's on-sale window is still a `when`, but it is not the event's date — and
 * `label={false}` drops it where the visible text already names the fact, so a
 * screen reader does not hear "On sale: On sale: 1 – 12 September":
 *
 *   <Fact kind="when" label="On sale">{salesWindow}</Fact>
 *   <Fact kind="when" label={false}>On sale: {salesWindow}</Fact>
 *
 * ## The baseline
 *
 * The icon sits on the baseline of the *first* line of text, and text that
 * wraps hangs under the text above it, never under the icon. That is a
 * two-column grid with `align-items: baseline`: a replaced element takes its
 * baseline from the bottom of its box, so the SVG's bottom edge lands on the
 * text baseline on its own.
 *
 * What CSS cannot know is that the box and the drawing are not the same thing.
 * Lucide draws inside a 24-unit box and leaves a margin below the glyph, and
 * that margin differs per glyph: with a 1.5 stroke the calendar's drawn edge
 * ends at 21.75, the pin at 22.55, and the ticket — a wide capsule centred in
 * its box — at 19.75. Align the boxes and the ticket floats a visible 3.5px
 * above a line the calendar sits on. So each kind carries its own drop, in
 * grid units, and the CSS scales it to whichever icon size is in use. The
 * drawing sits on the line; the box is nobody's business.
 */

export type FactKind = 'when' | 'where' | 'tickets';

/** 20 reads with body text; 16 belongs beside small or mono text, as on a card. */
export type FactSize = 16 | 20;

const GLYPH: Record<FactKind, React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>> = {
  when: Calendar,
  where: MapPin,
  tickets: Ticket,
};

/* The glyph is the only thing naming the fact on screen, and a glyph is hidden
   from assistive tech. Without this, a venue reads as a bare place name in the
   middle of a stack of unlabelled strings. */
const LABEL: Record<FactKind, string> = {
  when: 'Date',
  where: 'Venue',
  tickets: 'Tickets',
};

export interface FactProps {
  kind: FactKind;
  size?: FactSize;
  /** Renders the row as a link. The venue usually is one. */
  href?: string;
  /** Renames the fact for assistive tech, e.g. "On sale". `false` where the visible
   *  text already names it. */
  label?: string | false;
  children: React.ReactNode;
  className?: string;
}

export const Fact: React.FC<FactProps> = ({
  kind,
  size = 20,
  href,
  label,
  children,
  className = '',
}) => {
  const classes = [
    'riser-fact',
    `riser-fact--${kind}`,
    size === 16 && 'riser-fact--sm',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const name = label === false ? null : label ?? LABEL[kind];

  const content = (
    <>
      <Icon as={GLYPH[kind]} size={size} className="riser-fact__icon" />
      <span className="riser-fact__text">
        {name ? <span className="riser-visually-hidden">{name}: </span> : null}
        {children}
      </span>
    </>
  );

  return href ? (
    <a className={classes} href={href}>{content}</a>
  ) : (
    <span className={classes}>{content}</span>
  );
};
