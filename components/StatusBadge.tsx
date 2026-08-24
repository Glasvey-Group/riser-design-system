import React from 'react';

/**
 * StatusBadge.
 *
 * Status is a mono caps label over a 2px rule — not a pill, and not a palette of
 * hues. Both codebases had drifted: Events used `rounded-full` pills and Promo
 * had a commented-out six-shade grey ramp (`.status-draft`, `.status-running`,
 * …) in globals.css. Six greys cannot be told apart at 11px, and the identity
 * has one signal colour, so the rule underneath carries the state and only
 * `live` spends the orange.
 *
 * The mapping from Promo's numeric CampaignStatus is exported as
 * `CAMPAIGN_STATUS_TONE` so screens stop re-deriving it.
 */

export type StatusTone = 'live' | 'neutral' | 'done' | 'stopped';

export interface StatusBadgeProps {
  children: React.ReactNode;
  tone?: StatusTone;
  /** Box the label. For ink surfaces and over photography, where an underline alone will not read. */
  boxed?: boolean;
  /** Ink block behind the label. For badges sitting on an image. */
  onImage?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  tone = 'neutral',
  boxed = false,
  onImage = false,
  className = '',
}) => {
  const classes = [
    'riser-badge',
    `riser-badge--${tone}`,
    boxed && 'riser-badge--boxed',
    onImage && 'riser-badge--on-image',
    className,
  ].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
};

/** promo.riser.events CampaignStatus → label and tone. Recreated from the enum in
 *  src/app/organizer/[slug]/campaigns/page.tsx. */
export const CAMPAIGN_STATUS = {
  NONE: 0,
  DRAFT: 1,
  SCHEDULED: 2,
  RUNNING: 3,
  COMPLETE: 4,
  CANCELLED: 5,
} as const;

export const CAMPAIGN_STATUS_TONE: Record<number, { label: string; tone: StatusTone }> = {
  0: { label: 'None',      tone: 'neutral' },
  1: { label: 'Draft',     tone: 'neutral' },
  2: { label: 'Scheduled', tone: 'neutral' },
  3: { label: 'Running',   tone: 'live'    },
  4: { label: 'Complete',  tone: 'done'    },
  5: { label: 'Cancelled', tone: 'stopped' },
};

/** promo.riser.events DeliveryStatus → label and tone. */
export const DELIVERY_STATUS_TONE: Record<number, { label: string; tone: StatusTone }> = {
  0: { label: 'None',      tone: 'neutral' },
  1: { label: 'Pending',   tone: 'neutral' },
  2: { label: 'Queued',    tone: 'neutral' },
  3: { label: 'Sent',      tone: 'done'    },
  4: { label: 'Delivered', tone: 'done'    },
  5: { label: 'Opened',    tone: 'live'    },
  6: { label: 'Bounced',   tone: 'stopped' },
  7: { label: 'Failed',    tone: 'stopped' },
};

export const campaignStatus = (value: number) =>
  CAMPAIGN_STATUS_TONE[value] ?? { label: 'Unknown', tone: 'neutral' as StatusTone };

export const deliveryStatus = (value: number) =>
  DELIVERY_STATUS_TONE[value] ?? { label: 'Unknown', tone: 'neutral' as StatusTone };
