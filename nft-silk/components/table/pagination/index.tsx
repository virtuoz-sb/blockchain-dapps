import React, { useMemo, ReactNode, ChangeEvent } from 'react';
import { Table } from '@tanstack/react-table';
import {
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/solid';
import useTranslation from '@hooks/useTranslation';
import clsx from 'clsx';

const transKey = 'table.pagination';

export function getNumberOfPages(rowCount: number, rowsPerPage: number): number {
  return Math.ceil(rowCount / rowsPerPage);
}

export function getRowsRangeCount(totalRowsCnt, pageIndex, pageSize) {
  const isEmpty = totalRowsCnt < 1;
  let range = '0-0';
  if (!isEmpty) {
    const numPages = getNumberOfPages(totalRowsCnt, pageSize);
    const currentPage = pageIndex + 1;
    const lastIndex = currentPage * pageSize;
    const firstIndex = lastIndex - pageSize + 1;

    range = currentPage >= numPages ? `${firstIndex}-${totalRowsCnt}` : `${firstIndex}-${lastIndex}`;
  }

  return {
    range,
    isEmpty,
  };
}

export function CountDisplay({
  label,
  ofTxt = 'of',
  sub = 0,
  total = 0,
  after,
}: {
  label?: string;
  ofTxt?: string;
  sub: Number | string;
  total: Number;
  after?: string;
}) {
  return (
    <span className="text-sm text-[color:var(--color-royal-white)]">
      {label && label} <span className="font-medium">{sub.toString()}</span> {ofTxt}{' '}
      <span className="font-medium">{total.toString()}</span> {after && after}
    </span>
  );
}

export function PageButton({
  children,
  className,
  ...rest
}: {
  className?: string;
  children: ReactNode;
  [rest: string]: any;
}) {
  return (
    <button
      type="button"
      className={clsx(
        'relative inline-flex items-center font-bold py-1.5 px-1.5 border border-primary enabled:hover:bg-primary text-primary enabled:hover:text-white text-sm disabled:opacity-50',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export type PaginationProps = {
  className?: string;
  table: Table<any>;
  rowsPerPageOptions?: number[];
  isShowPageSize?: boolean;
  rowCountLabel?: string | boolean;
  rowCountAfter?: string;
};

export default function TablePagination({
  className,
  table,
  rowsPerPageOptions = [10, 25, 50],
  isShowPageSize = true,
  rowCountLabel = true,
  rowCountAfter,
}: PaginationProps) {
  const { t } = useTranslation();
  const {
    getPageCount,
    setPageSize,
    setPageIndex,
    getCanPreviousPage,
    getCanNextPage,
    nextPage,
    previousPage,
    getState,
    getPrePaginationRowModel,
  } = table;

  const {
    pagination: { pageSize = 10, pageIndex = 0 },
  } = getState();

  const totalRowsCnt = getPrePaginationRowModel().rows.length || 0;
  const oTxt = t(`${transKey}.of`, 'of');
  const rowLabel = rowCountLabel === true ? t(`${transKey}.showing`, 'Showing') : rowCountLabel;
  const { isEmpty, range } = useMemo(
    () => getRowsRangeCount(totalRowsCnt, pageIndex, pageSize),
    [pageIndex, pageSize, totalRowsCnt]
  );

  const handleChangeRowsPerPage = (e: ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value ? Number(e.target.value) : 10;
    setPageSize(size);
  };
  return (
    <>
      <div className={clsx('flex items-center mb-4 mt-3 px-3 justify-between', className)}>
        <div className={clsx('hidden', isShowPageSize && 'sm:flex gap-x-4 items-baseline')}>
          <CountDisplay label={t(`${transKey}.page`, 'Page')} ofTxt={oTxt} sub={pageIndex + 1} total={getPageCount()} />
          {/*  <span className="flex items-center gap-2 text-sm">
            | {getTrans('goto', 'Go to')}:
            <input
              type="number"
              defaultValue={table.getState().pagination.pageIndex + 1}
              disabled={table.getPageCount() < 2}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="w-16 rounded-md block appearance-none bg-blue-700 border border-blue py-2 pl-3 pr-2 text-base text-white focus:border-blue focus:outline-none focus:ring-blue sm:text-sm"
            />
          </span> */}
          <select
            value={pageSize}
            className="rounded-md block appearance-none bg-blue-700 border border-blue py-1.5 pl-3 pr-8 text-base text-white focus:border-blue focus:outline-none focus:ring-blue sm:text-sm"
            onChange={handleChangeRowsPerPage}
          >
            {rowsPerPageOptions.map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {t(`${transKey}.show`, 'Show')} {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-0 mr-0 sm:ml-auto sm:mr-4">
          <CountDisplay label={rowLabel} ofTxt={oTxt} sub={range} total={totalRowsCnt} after={rowCountAfter} />
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <PageButton className="rounded-l-md" onClick={() => setPageIndex(0)} disabled={!getCanPreviousPage()}>
              <ChevronDoubleLeftIcon className="h-5 w-5" aria-hidden="true" />
            </PageButton>
            <PageButton onClick={() => previousPage()} disabled={!getCanPreviousPage()}>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </PageButton>
            <PageButton onClick={() => nextPage()} disabled={!getCanNextPage()}>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </PageButton>
            <PageButton
              className="rounded-r-md"
              onClick={() => setPageIndex(getPageCount() - 1)}
              disabled={!getCanNextPage()}
            >
              <ChevronDoubleRightIcon className="h-5 w-5" aria-hidden="true" />
            </PageButton>
          </nav>
        </div>
      </div>
    </>
  );
}
