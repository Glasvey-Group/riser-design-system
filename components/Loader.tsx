import React from 'react';

/**
 * Loader, LoadingScreen and Skeleton.
 *
 * Four bars rising in sequence, sheared on the same 10-unit shear as the mark,
 * the last one orange, over the mark's baseline rule. Both codebases used a
 * rotating ring — nothing in this identity rotates, and the mark is already a
 * sequence of rising bars, so the loading state is the mark in motion.
 *
 * The geometry is taken from `assets/logo/riser-mark-primary.svg` rather than
 * approximated: 16-unit bars on 8-unit gaps, each cut on the same shear, a
 * 5-unit stage rule below the baseline, on the mark's 88 x 84 box. Everything
 * scales from `size`.
 *
 * Replaces: Events `LoadingScreen` + `LoadingModal` (logo pulse + spinner),
 * Promo `LoadingScreen` + `LoadingModal` (same, plus a shimmer sweep).
 */

export type LoaderVariant = 'full' | 'mono' | 'on-ink';

export interface LoaderProps {
  /**
   * `full` uses the mark's own colours — ink bars with the orange fourth.
   * `mono` inherits currentColor, for use inside a filled button.
   * `on-ink` is paper bars keeping the orange fourth, for ink surfaces.
   */
  variant?: LoaderVariant;
  /** Height of the mark in px. Everything else scales from it. */
  size?: number;
  /** Accessible name announced to screen readers. */
  label?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  variant = 'full',
  size = 64,
  label = 'Loading',
  className = '',
}) => (
  <span
    className={`riser-loader riser-loader--${variant} ${className}`.trim()}
    style={{ '--rl-size': `${size}px` } as React.CSSProperties}
    role="status"
    aria-label={label}
  >
    <span className="riser-loader-bars">
      <span className="riser-loader-bar" />
      <span className="riser-loader-bar" />
      <span className="riser-loader-bar" />
      <span className="riser-loader-bar" />
    </span>
    <span className="riser-loader-stage" />
  </span>
);

export interface LoadingScreenProps {
  /** Mono caps line under the bars, e.g. "Loading campaigns". */
  text?: string;
  /** Renders the loader for an ink surface — paper bars, orange fourth. */
  onInk?: boolean;
  /** Height of the mark in px. */
  size?: number;
  /**
   * Cover the viewport instead of sitting inline. For a route that cannot render
   * anything useful yet. The bars are the whole of it — no logo above them: the
   * loader already is the mark, in motion, and stacking a lockup on top of it
   * says the same thing twice.
   */
  overlay?: boolean;
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  text = 'Loading',
  onInk = false,
  size = 64,
  overlay = false,
  className = '',
}) => (
  <div
    className={[
      'riser-loading-screen',
      overlay && 'riser-loading-screen--overlay',
      className,
    ].filter(Boolean).join(' ')}
  >
    <Loader variant={onInk ? 'on-ink' : 'full'} size={size} label={text} />
    <span className="riser-loading-screen__text">{text}</span>
  </div>
);

/** Skeleton block. Pulses in opacity; nothing travels across it. */
export const Skeleton: React.FC<{
  variant?: 'text' | 'title' | 'media';
  width?: string;
  className?: string;
}> = ({ variant = 'text', width, className = '' }) => (
  <span
    className={`riser-skeleton riser-skeleton--${variant} ${className}`.trim()}
    style={{ width, display: 'block' }}
    aria-hidden
  />
);
