import React, { useEffect, useCallback, useRef } from 'react';
import clsx from 'clsx';

import { Skeleton } from '@components/skeleton';

export type TableSkeletonProps = {
  className?: string;
  containerClassName?: string;
  wrapClassName?: string;
  rowsCount: number;
  columns: any[];
  [props: string]: any;
};

//Skeleton for inital Table data loading
// pass columns array for each cell with overrides as needed
{
  /* <TableSkeleton rowsCount={5} columns={[{ containerClassName: 'w-32 space-y-4' }, '', '', '', '']} /> */
}

export function TableSkeleton({
  columns,
  rowsCount = 5,
  containerClassName = 'flex-1 space-y-4',
  className = 'h-8',
  wrapClassName,
  ...props
}: TableSkeletonProps): JSX.Element {
  return (
    <div className={clsx('flex mt-8 space-x-5', wrapClassName)} {...props}>
      {columns.map((col, idx) => {
        const contCls = col?.containerClassName || containerClassName;
        const cls = col?.className || className;
        return (
          <Skeleton
            key={`row_cell_${idx}`}
            containerClassName={contCls}
            className={cls}
            enableAnimation={true}
            count={rowsCount}
          />
        );
      })}
    </div>
  );
}

//When updating table data prevent paging reset
export function useSkipper(): readonly [boolean, () => void] {
  const shouldSkipRef = useRef(true);
  const shouldSkip = shouldSkipRef.current;

  // Wrap a function with this to skip a pagination reset temporarily
  const skip = useCallback(() => {
    shouldSkipRef.current = false;
  }, []);

  useEffect(() => {
    shouldSkipRef.current = true;
  });

  return [shouldSkip, skip] as const;
}

//simple funtion to update table data item based on row idx
export function updateData(idx: number, items: any[], vals: any): any[] {
  return items.map((item, index) => {
    if (index !== idx) {
      return item;
    }
    return {
      ...item,
      ...vals,
    };
  });
}
