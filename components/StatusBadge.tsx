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

/**
 * RiserAdmin's `CampaignStatus` → label and tone.
 *
 * The source of truth is the backend enum, not either front end. This was previously
 * "recreated from the enum in Promo's campaigns page", which is how it came to be missing
 * `Saved` and to spell 4 as "Complete": the backend calls it `Completed`, and a badge that
 * says something the API does not is a small lie that costs someone an afternoon.
 *
 * `Saved` is the status a campaign must reach before it can run — with `Scheduled`, the only
 * two `ExecuteCampaignAsync` accepts. Without it here, every saved campaign rendered
 * "Unknown".
 */
export const CAMPAIGN_STATUS = {
  NONE: 0,
  DRAFT: 1,
  SCHEDULED: 2,
  RUNNING: 3,
  COMPLETED: 4,
  CANCELLED: 5,
  SAVED: 6,
} as const;

export const CAMPAIGN_STATUS_TONE: Record<number, { label: string; tone: StatusTone }> = {
  0: { label: 'None',      tone: 'neutral' },
  1: { label: 'Draft',     tone: 'neutral' },
  2: { label: 'Scheduled', tone: 'neutral' },
  3: { label: 'Running',   tone: 'live'    },
  4: { label: 'Completed', tone: 'done'    },
  5: { label: 'Cancelled', tone: 'stopped' },
  6: { label: 'Saved',     tone: 'neutral' },
};

/**
 * The campaign-progress endpoint reports `campaignStatus` as the enum NAME — "Running",
 * "Completed" — while every other payload sends the integer. This maps the name back, so a
 * screen polling progress can compare against CAMPAIGN_STATUS like anything else.
 */
export const CAMPAIGN_STATUS_BY_NAME: Record<string, number> = {
  None: CAMPAIGN_STATUS.NONE,
  Draft: CAMPAIGN_STATUS.DRAFT,
  Scheduled: CAMPAIGN_STATUS.SCHEDULED,
  Running: CAMPAIGN_STATUS.RUNNING,
  Completed: CAMPAIGN_STATUS.COMPLETED,
  Cancelled: CAMPAIGN_STATUS.CANCELLED,
  Saved: CAMPAIGN_STATUS.SAVED,
};

export const campaignStatusFromName = (name: string | null | undefined): number | null => {
  if (!name) return null;
  const value = CAMPAIGN_STATUS_BY_NAME[name];
  return value === undefined ? null : value;
};

/**
 * A campaign in one of these states will never produce another delivery update, so polling it
 * is pointless. Deliberately separate from the progress endpoint's `isComplete`, which stays
 * false forever on campaigns that ran before delivery counts were tracked and left rows
 * stuck at Pending — stop on either.
 */
export const TERMINAL_CAMPAIGN_STATUS_NAMES = ['Completed', 'Cancelled'] as const;

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
