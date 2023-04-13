import React, { FunctionComponent, PropsWithChildren } from 'react';
import { default as RLSkeleton } from 'react-loading-skeleton';

export type SkeletonProps = {
  count?: number;
  wrapper?: React.FunctionComponent<PropsWithChildren<unknown>>;
  circle?: boolean;
  className?: string;
  containerClassName?: string;
  containerTestId?: string;
  style?: React.CSSProperties;
  baseColor?: string;
  highlightColor?: string;
  [props: string]: any; // all other props
};

export const Skeleton: FunctionComponent<PropsWithChildren<SkeletonProps>> = ({
  baseColor = '#0a0a0b3b',
  highlightColor = '#0a0a0b12',
  ...props
}) => {
  return <RLSkeleton {...props} baseColor={baseColor} highlightColor={highlightColor}></RLSkeleton>;
};
