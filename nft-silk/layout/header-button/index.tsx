import React, { FunctionComponent } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

import styles from './header-button.module.scss';

export type HeaderButtonProps = {
  title?: string;
  icon?: any;
  href: string;
  target?: string;
  first?: boolean;
  active?: boolean;
  highlight?: boolean;
  className?: string;
  [props: string]: any; // All other props
};

export const HeaderButton: FunctionComponent<HeaderButtonProps> = ({
  title,
  icon,
  href,
  target = '_self',
  active = false,
  first = false,
  highlight = false,
  className,
  ...domProps
}) => {
  return (
    <div className={className}>
      {href !== null && (
        <Link href={href}>
          <a target={target} tabIndex={-1}>
            {getHeaderButton(title, icon, first, active, highlight)}
          </a>
        </Link>
      )}

      {href === null && getHeaderButton(title, icon, first, active, highlight)}
    </div>
  );
};

const getHeaderButton = (title, icon, first, active, highlight) => {
  return (
    <button
      type="button"
      className={clsx(
        styles.headerButton,
        'ml-1',
        first && 'rounded-bl',
        active && styles.active,
        highlight && styles.highlight,
        'focus-visible:ring-inset'
      )}
    >
      <div className="flex skew-fix">
        {icon && (
          <div className={clsx(title && 'mr-2', ' h-4 w-4')} aria-hidden="true">
            {icon}
          </div>
        )}
        <span className="text-xs font-semibold uppercase">{title}</span>
      </div>
    </button>
  );
};
