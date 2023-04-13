import React, { ReactNode } from 'react';
import { Row, flexRender } from '@tanstack/react-table';
import clsx from 'clsx';

export type TableRowProps<T> = {
  cellClassName?: string;
  children?: ReactNode;
  row: Row<T>;
  [trProps: string]: any;
};

/**
   * Table Row;
   * row: ract table row
   * children option ? expanded sub component with fragment
   * tr props: selection
   *  className={clsx(row.getIsSelected() ? 'bg-blue-700/80' : 'hover:bg-blue-700/30 cursor-pointer')}
      onClick={() => {
        return row.toggleSelected(true);
      }}

  */

export default function TableRow<T>({ row, cellClassName, children, ...trProps }: TableRowProps<T>) {
  return (
    <tr {...trProps}>
      {row.getVisibleCells().map(cell => {
        return (
          <td key={cell.id} className={clsx(
            'py-2.5 text-sm whitespace-nowrap',
            cellClassName,
            cell.column.id === 'action' ? '' : 'px-3'
          )}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}
