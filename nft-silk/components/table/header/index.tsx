import React, { ReactNode } from 'react';
import { Header, flexRender } from '@tanstack/react-table';
import clsx from 'clsx';

import { Icon } from '@components/icons';

export type SortingHeaderProps<T> = {
  className?: string;
  children?: ReactNode;
  header: Header<T, unknown>;
  isSticky?: boolean;
};

/**
   * Table sorting header;
   * header: react table header
   * isSticky option
   * children option
   * IE filter:
   * {header.column.getCanFilter() ? (
      <div>
        <Filter column={header.column} table={table} />
      </div>
    ) : null}
  */

export default function SortingHeader<T>({ header, isSticky = true, className, children }: SortingHeaderProps<T>) {
  const { column } = header;
  return (
    <th
      //key={header.id}
      //colSpan={header.colSpan}
      className={clsx(
        isSticky && `sticky top-0 z-10',
        'group px-3 py-3.5 text-sm font-medium bg-[#20253e]`,
        className,
        header.id === 'action' ? 'text-right' : 'text-left'
      )}
    >
      {header.isPlaceholder ? null : (
        <>
          <div
            {...{
              className: clsx(column.getCanSort() && 'cursor-pointer select-none flex items-center'),
              onClick: column.getToggleSortingHandler(),
            }}
          >
            {flexRender(column.columnDef.header, header.getContext())}
            {column.getCanSort() && (
              <>
                {{
                  asc: <Icon name="sort-up" color="currentColor" className="inline-block h-2 w-2 ml-2" />,
                  desc: <Icon name="sort-down" color="currentColor" className="inline-block h-2 w-2 ml-2" />,
                }[column.getIsSorted() as string] ?? (
                  <Icon
                    name="sort"
                    color="currentColor"
                    className="inline-block mb-1 h-2 w-2 ml-2 opacity-20 group-hover:opacity-90"
                  />
                )}
              </>
            )}
          </div>
          {children && children}
        </>
      )}
    </th>
  );
}
