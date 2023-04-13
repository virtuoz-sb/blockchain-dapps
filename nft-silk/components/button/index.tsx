import React, { FunctionComponent } from 'react';
import clsx from 'clsx';

import useHover from '@hooks/useHover';
import { Icon } from '@components/icons';

export type ButtonProps = {
  buttonType?: 'button' | 'submit';
  children?: any;
  className?: string;
  disabled?: boolean;
  icon?: any;
  onClick?: any;
  highlight?: boolean;
  color?: 'primary' | 'market' | 'dark' | 'default';
  fill?: 'solid' | 'outline';
  notch?: 'left' | 'right' | 'both' | 'none';
  chevrons?: 'left' | 'right';
  full?: boolean;
  short?: boolean;
  uppercase?: boolean;
  onMouseEnter?: any;
  onMouseLeave?: any;
  [props: string]: any; // all other props
};

export const Button: FunctionComponent<ButtonProps> = ({
  buttonType = 'button',
  children,
  className,
  disabled,
  icon,
  onClick,
  color = 'primary',
  fill = 'outline',
  notch = 'both',
  chevrons,
  full = false,
  short = false,
  uppercase = false,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const [hoverRef, isHovered] = useHover<HTMLDivElement>();

  const renderLeftTopSide = fill =>
    fill == 'solid' ? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 50">
        <path d="M17,50H4c-2.21,0-4-1.79-4-4V21.83c0-.83,.26-1.64,.74-2.31L13.36,1.69C14.11,.63,15.32,0,16.62,0h.38" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 50">
        <path d="M17,48H4.1c-1.1,0-2-0.9-2-2V21.8c0-0.4,0.1-0.8,0.4-1.2L15.4,2.8C15.8,2.3,16.4,2,17,2l0,0V0l0,0 c-1.3,0-2.6,0.6-3.3,1.7L0.8,19.5C0.3,20.2,0,21,0,21.8V46c0,2.2,1.8,4,4.1,4H17C17,50,17,48,17,48z" />
      </svg>
    );

  const renderLeftBottomSide = fill =>
    fill == 'solid' ? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 50">
        <path d="M17,0H4C1.8,0,0,1.8,0,4v24.2c0,0.8,0.3,1.6,0.7,2.3l12.6,17.8c0.8,1.1,2,1.7,3.3,1.7H17" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 50">
        <path d="M17,2H4.1c-1.1,0-2,0.9-2,2v24.2c0,0.4,0.1,0.8,0.4,1.2l12.9,17.8c0.4,0.5,1,0.8,1.7,0.8l0,0v2l0,0 c-1.3,0-2.6-0.6-3.3-1.7L0.8,30.5C0.3,29.8,0,29,0,28.2V4c0-2.2,1.8-4,4.1-4H17C17,0,17,2,17,2z" />
      </svg>
    );

  const renderRightSide = fill =>
    fill == 'solid' ? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 50">
        <path d="M0,0H13c2.21,0,4,1.79,4,4V28.17c0,.83-.26,1.64-.74,2.31L3.64,48.31c-.75,1.06-1.97,1.69-3.26,1.69h-.38" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 50">
        <path d="M13,0H0V2H13c1.1,0,2,.9,2,2V28.17c0,.42-.13,.82-.37,1.16L2.01,47.16c-.37,.53-.98,.84-1.63,.84h-.38v2H.38c1.3,0,2.51-.63,3.26-1.69l12.62-17.83c.48-.68,.73-1.48,.73-2.31V4c0-2.21-1.79-4-4-4Z" />
      </svg>
    );

  const getFillState = (fill, isHovered) => {
    return !isHovered ? fill : fill == 'solid' ? 'outline' : 'solid';
  };

  return (
    <div className={className} ref={hoverRef} {...props}>
      <button
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        type={buttonType}
        onClick={onClick}
        disabled={disabled}
        className={clsx(
          'flex flex-row',
          'btn-base',
          color,
          disabled && 'disabled:opacity-25 cursor-not-allowed',
          full && 'full',
          short && 'short',
          uppercase && 'uppercase'
        )}
      >
        <div className="left">
          {notch == 'both' ? (
            renderLeftTopSide(getFillState(fill, isHovered))
          ) : notch == 'left' ? (
            renderLeftBottomSide(getFillState(fill, isHovered))
          ) : (
            <div className={clsx('full', getFillState(fill, isHovered))}></div>
          )}
        </div>
        <div className={clsx('children', getFillState(fill, isHovered), children == null && icon && 'icon-only')}>
          {icon && (
            <div className={clsx('icon h-6 w-6', children != null && '-ml-2 mr-2 h-4 w-4')} aria-hidden="true">
              {icon}
            </div>
          )}

          {chevrons === 'left' && (
            <div className="flex mr-4 -mt-1">
              <Icon name="chevron-left" className="h-2 w-2" />
              <Icon name="chevron-left" className="h-2 w-2" />
              <Icon name="chevron-left" className="h-2 w-2" />
            </div>
          )}

          {children}

          {chevrons === 'right' && (
            <div className="flex ml-4 -mt-1">
              <Icon name="chevron-right" className="h-2 w-2" />
              <Icon name="chevron-right" className="h-2 w-2" />
              <Icon name="chevron-right" className="h-2 w-2" />
            </div>
          )}
        </div>
        <div className="right">
          {notch == 'both' || notch == 'right' ? (
            renderRightSide(getFillState(fill, isHovered))
          ) : (
            <div className={clsx('full', getFillState(fill, isHovered))}></div>
          )}
        </div>
      </button>
    </div>
  );
};
