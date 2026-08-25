import React from 'react';
import { Loader } from './Loader';

/**
 * Button.
 *
 * Canonical source: RiserEvents `components/ui/button/button.tsx`, which had
 * `variant: 'default' | 'outline'` and `size: 'sm' | 'md' | 'lg'`. The size
 * contract is kept exactly. `default` becomes `primary` and `outline` becomes
 * `secondary`; `ink`, `ghost` and `danger` are added to cover what Promo was
 * doing with inline Tailwind (`bg-black text-white`, bordered cancel buttons,
 * borderless row actions) so those stop being one-off classNames.
 *
 * Orange discipline: `primary` is the orange, and the orange marks the single
 * action that moves the business forward — Promote on the organiser dashboard,
 * Sign up on the marketing site. It is not simply "the most important button on
 * this screen".
 *
 * Everything else commits in `ink`. Editing, updating, saving and cancelling
 * never take the orange, however central they are to the view: a form's submit
 * is `ink` and its cancel is `secondary`. Creating a record is `ink` too unless
 * that create is the view's commercial action. A view can therefore have no
 * orange at all, and most working screens should.
 *
 * One orange thing per view still holds on top of that: at most one primary is
 * on screen at a time. On an ink surface where the orange is already spent,
 * `paper` is the solid action instead.
 *
 * A button takes a leading icon only when it creates a new record, and then it
 * is Lucide `Plus` through `icon` — never a literal "+" in the label, which is
 * a unicode symbol doing an icon's job. Everything else goes without: the verb
 * is the affordance, and an icon restating its own label is ornament.
 *
 * A spinner is not what that rules out. `loading` puts the mono loader in the
 * icon slot while a save is in flight, because a loader reports state the label
 * cannot — it is not an icon restating its own label.
 *
 * Nothing scales on hover and nothing rotates: hover darkens the fill or fills
 * the rule, over 140ms.
 */

export type ButtonVariant = 'primary' | 'ink' | 'paper' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** `primary` spends the view's orange. Default `secondary`. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Fill the container. Used for the stacked mobile actions in Promo. */
  block?: boolean;
  /** Leading icon. Use the Icon component; 16px inside sm and md, 20px inside lg. */
  icon?: React.ReactNode;
  /**
   * Work is in flight. Replaces `icon` with the mono loader, disables the
   * button and sets `aria-busy`. Keep the label steady or move it to its
   * progressive form ("Saving"), but do not empty it — a button that loses its
   * label mid-action leaves the user without the thing they just clicked.
   */
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  block = false,
  icon,
  loading = false,
  className = '',
  type = 'button',
  disabled,
  ...rest
}) => {
  const classes = [
    'riser-button',
    `riser-button--${variant}`,
    `riser-button--${size}`,
    block && 'riser-button--block',
    loading && 'riser-button--loading',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        /* aria-hidden: the button's own aria-busy carries this to AT already,
           and Loader's role="status" would otherwise announce a second time. */
        <span aria-hidden="true" className="riser-button__loader">
          <Loader variant="mono" size={size === 'lg' ? 20 : 16} />
        </span>
      ) : icon}
      {children}
    </button>
  );
};
