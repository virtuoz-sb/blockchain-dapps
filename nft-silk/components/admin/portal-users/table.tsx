import React, { FunctionComponent } from 'react';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  //flexRender,
  TableOptions,
  RowData,
} from '@tanstack/react-table';

import clsx from 'clsx';
import TablePagination from '@components/table/pagination';
import SortingHeader from '@components/table/header';
import TableRow from '@components/table/row';

type TableProps = {
  className?: string;
  data?: RowData[];
  autoResetPageIndex?: boolean;
  globalFilter?: string;
  getTrans?: any;
  columns: ColumnDef<any>[];
  defaultColumn?: any;
  tableOptions?: Partial<TableOptions<any>>;
};

const UsersTable: FunctionComponent<TableProps> = ({
  data,
  columns,
  autoResetPageIndex,
  globalFilter,
  getTrans,
  defaultColumn,
  tableOptions = {},
}) => {
  const table = useReactTable({
    data,
    columns,
    // Pipeline
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    autoResetPageIndex,
    defaultColumn,
    enableMultiRowSelection: false,
    //getRowId: originalRow => originalRow.userRegistrationId,
    state: {
      globalFilter,
    },
    meta: {
      getTrans,
    },
    //
    debugTable: true,
    ...tableOptions,
  });

  //table sticky may need border-separate" style={{ borderSpacing: 0 }} or overflow-x-auto with hidden margin offset padd
  return (
    <>
      <div className="mt-2 sm:mt-4 flex flex-col overflow-y-auto flex-1 border-y-2 border-blue-700">
        <div className="bg-[#201f33]/50 px-2.5">
          <div className="inline-block min-w-full py-0 align-middle">
            <div className="">
              <table className="min-w-full divide-y divide-[color:var(--color-dark-gray)] text-[color:var(--color-royal-white)]">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => {
                        return <SortingHeader key={header.id} header={header} isSticky={true} />;
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-[color:var(--color-dark-gray)]">
                  {table.getRowModel().rows.map(row => {
                    return (
                      <TableRow
                        key={row.id}
                        row={row}
                        className={clsx(row.getIsSelected() ? 'bg-blue-700/80' : 'hover:bg-blue-700/30 cursor-pointer')}
                        onClick={() => {
                          return row.toggleSelected(true);
                        }}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <TablePagination table={table} isShowPageSize={true} rowCountLabel={true} rowCountAfter="" />
    </>
  );
};

export default UsersTable;
