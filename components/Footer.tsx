import React from 'react';
import { LogoLockup } from './Logo';
import { BrandMark, type BrandName } from './BrandMark';

/**
 * Footer — the ink band at the foot of every Riser site.
 *
 * Canonical source: RiserEvents `components/Footer.tsx` plus ~150 lines of `.footer*`
 * rules in its `app/index.css`. Promo had a different footer entirely, on the
 * pre-rebrand logo. Academy has none yet. Three apps, so it comes here.
 *
 * ---- What this component does NOT take on ----
 *
 * Events' footer is 171 lines, and about 110 of them are Events: a `LogoSection` that
 * resolves a white-label brand or organizer logo out of `useAllBrands` /
 * `useAllOrganizers` against four pathname patterns, and an
 * `isNotPublicBrandOrOrganizerPage()` that hides two columns on those same routes.
 * That is data shape and routing, which section 11 puts in the app.
 *
 * So the seam is the same one `Navbar` uses: this component owns the skeleton and the
 * treatment, and every link arrives as a node the app built with its own router. Events
 * keeps its white-label logic and passes the result as `logo`; nothing about brands or
 * organizers reaches this file.
 *
 *   <Footer
 *     logo={<Link href="/"><LogoLockup variant="knockout" width={165} /></Link>}
 *     columns={[{ title: 'Explore', children: <><Link href="/sign-in">Sign in</Link></> }]}
 *     legal={<><Link href="/privacy">Privacy Policy</Link></>}
 *   />
 *
 * The Riser column, the contact address and the social accounts are the same on every
 * site, so they are defaults here rather than three copies. Adding a fourth property is
 * then one edit and a version bump, not an edit in each app.
 */

export interface FooterColumn {
  /** Mono caps heading. */
  title: string;
  /** The app's own links, in the app's own Link component. */
  children: React.ReactNode;
}

export interface FooterSocial {
  name: BrandName;
  href: string;
}

/* The Riser properties. Public sites only — promo.riser.events is an organizer tool and
   is not listed anywhere public. */
export const RISER_NETWORK: { label: string; href: string }[] = [
  { label: 'Riser Events', href: 'https://www.riser.events' },
  { label: 'Riser Solutions', href: 'https://solutions.riser.events' },
  { label: 'Riser Academy', href: 'https://academy.riser.events' },
];

const DEFAULT_SOCIAL: FooterSocial[] = [
  { name: 'facebook', href: 'https://facebook.com/riservevents' },
  { name: 'instagram', href: 'https://instagram.com/riserevents' },
];

export interface FooterProps {
  /**
   * The lockup, wrapped in whatever the app uses for links. Defaults to a knockout
   * lockup with no link — the band is ink, so `primary` would put ink bars on ink.
   */
  logo?: React.ReactNode;
  /** Columns before the Riser one. Each supplies its own links. */
  columns?: FooterColumn[];
  /** Replaces the shipped Riser column. `null` omits it. */
  network?: FooterColumn | null;
  /** Contact address. `null` omits the column. */
  email?: string | null;
  /** Social accounts. `null` omits the column. */
  social?: FooterSocial[] | null;
  /** Legal links for the bottom bar, in the app's own Link component. */
  legal?: React.ReactNode;
  /** Defaults to the current year. */
  year?: number;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  logo,
  columns = [],
  network,
  email = 'info@riser.events',
  social = DEFAULT_SOCIAL,
  legal,
  year = new Date().getFullYear(),
  className = '',
}) => {
  const networkColumn =
    network === null
      ? null
      : network ?? {
          title: 'Riser',
          children: RISER_NETWORK.map((site) => (
            <a key={site.href} href={site.href} target="_blank" rel="noopener">
              {site.label}
            </a>
          )),
        };

  return (
    <footer className={`riser-footer ${className}`.trim()}>
      <div className="riser-measure riser-footer__inner">
        <div className="riser-footer__top">
          <div className="riser-footer__brand">
            {logo ?? <LogoLockup variant="knockout" width={165} />}
          </div>

          <div className="riser-footer__columns">
            {columns.map((column) => (
              <div className="riser-footer__section" key={column.title}>
                <h3 className="riser-footer__title">{column.title}</h3>
                <nav className="riser-footer__nav">{column.children}</nav>
              </div>
            ))}

            {networkColumn ? (
              <div className="riser-footer__section">
                <h3 className="riser-footer__title">{networkColumn.title}</h3>
                <nav className="riser-footer__nav">{networkColumn.children}</nav>
              </div>
            ) : null}

            {email ? (
              <div className="riser-footer__section">
                <h3 className="riser-footer__title">Contact</h3>
                <nav className="riser-footer__nav">
                  <a href={`mailto:${email}`}>
                    {/* Inlined rather than Icon+Lucide: this package has no icon
                        dependency, and adding one for a single envelope would be the
                        second icon library docs/ICONS.md forbids. Square caps and
                        1.5 stroke, same as the set. */}
                    <svg
                      width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="square" strokeLinejoin="miter"
                      aria-hidden="true"
                    >
                      <rect x="2" y="4" width="20" height="16" />
                      <path d="m2 7 10 6 10-6" />
                    </svg>
                    {email}
                  </a>
                </nav>
              </div>
            ) : null}

            {social && social.length ? (
              <div className="riser-footer__section">
                <h3 className="riser-footer__title">Follow</h3>
                <div className="riser-footer__social">
                  {social.map((account) => (
                    <a
                      key={account.name}
                      href={account.href}
                      target="_blank"
                      rel="noopener"
                    >
                      <BrandMark name={account.name} size={20} />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="riser-footer__bottom">
          <p className="riser-footer__copyright">
            © {year} Riser. All rights reserved.
          </p>
          {legal ? <nav className="riser-footer__legal">{legal}</nav> : null}
        </div>
      </div>
    </footer>
  );
};
