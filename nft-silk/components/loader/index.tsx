import clsx from 'clsx';
import React, { FunctionComponent } from 'react';

import styles from './loader.module.scss';

export type LoaderProps = {
  fullscreen?: boolean;
  className?: string;
  customWidth?: number;
  customHeight?: number;
  [props: string]: any; // all other props
};

export const Loader: FunctionComponent<LoaderProps> = ({
  fullscreen = true,
  className,
  customWidth = 5,
  customHeight = 5,
  ...props
}) => {
  const outsideWidth = customWidth * 2;
  const outsideHeight = customHeight * 2;
  return fullscreen ? (
    <div
      className={clsx(
        'fixed inset-0 bg-blue-900 bg-opacity-75 transition-opacity place-content-center justify-center items-center flex',
        styles.overlay
      )}
      {...props}
    >
      <span
        className={clsx(
          styles.loader,
          className,
          `w-${outsideWidth} h-${outsideHeight} after:w-${customWidth} after:h-${customHeight}`
        )}
      ></span>
    </div>
  ) : (
    <div
      className={clsx(
        styles.loader,
        className,
        `w-${outsideWidth} h-${outsideHeight} after:w-${customWidth} after:h-${customHeight}`
      )}
      {...props}
    ></div>
  );
};
