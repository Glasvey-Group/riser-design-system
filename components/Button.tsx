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
 * Orange discipline: `primary` is the orange. One orange thing per view — so at
 * most one primary button is on screen at a time. Everything else is secondary,
 * ghost or ink. On an ink surface where the orange is already spent on something
 * else, `paper` is the solid primary action instead.
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
