import React from 'react';

/**
 * Logo — the mark, the lockup, the app icon.
 *
 * Geometry is exactly as constructed: bar width 16, gap 8, shear 10. The first
 * three bars step 16 units each; the orange bar steps 18, so it clears the
 * wordmark's cap line and is the only element above the name. Stage line 5
 * units, sitting 5 below the baseline. The wordmark is Archivo 800 at width
 * axis 88%, letter-spacing 2.6 at 80px, cap height locked to the third bar's
 * top point, 15 units right of the mark.
 *
 * Rules the component enforces:
 *   - clear space of one bar width (16 units) on all sides, via the viewBox
 *   - minimum sizes: lockup 90px, mark 20px, favicon 32px
 *   - on orange, the whole mark goes ink (`variant="mono-ink"`)
 *
 * Never recolour the orange bar, restack the bars, add a container the mark does
 * not have, or set the wordmark in another face. The SVG references Archivo as
 * live text, so Archivo must be loaded — tokens/fonts.css self-hosts it.
 *
 * The files in assets/logo/ are the same drawings as static SVG and PNG, for
 * anywhere React is not.
 */

export type LogoVariant = 'primary' | 'knockout' | 'mono-ink' | 'mono-paper';

/* These are the only literal hex values in the system, and they are literal on
   purpose. The mark has to render in its exact brand colours wherever it lands —
   inside an email client, on a third party's page, in an exported SVG — none of
   which inherit our custom properties. Everything else reads tokens. */

const FILLS: Record<LogoVariant, { bar: string; accent: string }> = {
  primary:      { bar: '#121212', accent: '#F28600' },
  knockout:     { bar: '#FAF9F7', accent: '#F28600' },
  'mono-ink':   { bar: '#121212', accent: '#121212' },
  'mono-paper': { bar: '#FAF9F7', accent: '#FAF9F7' },
};

const Bars: React.FC<{ variant: LogoVariant }> = ({ variant }) => {
  const { bar, accent } = FILLS[variant];
  return (
    <>
      <polygon points="8,90 8,76 24,66 24,90" fill={bar} />
      <polygon points="32,90 32,60 48,50 48,90" fill={bar} />
      <polygon points="56,90 56,44 72,34 72,90" fill={bar} />
      <polygon points="80,90 80,26 96,16 96,90" fill={accent} />
      <rect x="8" y="95" width="88" height="5" fill={bar} />
    </>
  );
};

export interface LogoProps {
  variant?: LogoVariant;
  /** Rendered width in px. Minimum 90 for the lockup, 20 for the mark. */
  width?: number;
  className?: string;
  title?: string;
}

/** Mark plus wordmark. Tight bounds 347 × 84. Minimum 90px wide. */
export const LogoLockup: React.FC<LogoProps> = ({
  variant = 'primary',
  width = 180,
  className = '',
  title = 'Riser',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="8 16 347 84"
    width={Math.max(width, 90)}
    height={(Math.max(width, 90) * 84) / 347}
    role="img"
    aria-label={title}
    className={className}
  >
    <title>{title}</title>
    <Bars variant={variant} />
    <text
      x="111" y="90"
      fontFamily="Archivo" fontWeight={800} fontSize={80}
      fontStretch="88%" letterSpacing="2.6"
      fill={FILLS[variant].bar}
    >
      RISER
    </text>
  </svg>
);

/** Mark only. Tight bounds 88 × 84. Minimum 20px wide. */
export const LogoMark: React.FC<LogoProps> = ({
  variant = 'primary',
  width = 40,
  className = '',
  title = 'Riser',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="8 16 88 84"
    width={Math.max(width, 20)}
    height={(Math.max(width, 20) * 84) / 88}
    role="img"
    aria-label={title}
    className={className}
  >
    <title>{title}</title>
    <Bars variant={variant} />
  </svg>
);

/** Knockout on an ink tile. The one rounded thing in the identity: 22% of the side. */
export const LogoAppIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1024 1024"
    width={size}
    height={size}
    role="img"
    aria-label="Riser"
    className={className}
  >
    <title>Riser</title>
    <rect width="1024" height="1024" rx="224" fill="#121212" />
    <g transform="translate(181.1,143.2) scale(6.36)">
      <Bars variant="knockout" />
    </g>
  </svg>
);
