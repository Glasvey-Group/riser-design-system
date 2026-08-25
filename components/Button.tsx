import React from 'react';

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
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  block = false,
  icon,
  className = '',
  type = 'button',
  ...rest
}) => {
  const classes = [
    'riser-button',
    `riser-button--${variant}`,
    `riser-button--${size}`,
    block && 'riser-button--block',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
};
