import React, { FunctionComponent, useCallback, useMemo } from 'react';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  //getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  TableOptions,
  RowData,
} from '@tanstack/react-table';
import { find } from 'lodash-es';

import clsx from 'clsx';
import { getNftImageThumbnail, getNftImageThumbnailFromS3 } from '@common/getInformationPerNftCollectionEnum';

import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import useTranslation from '@hooks/useTranslation';
import TablePagination from '@components/table/pagination';
import SortingHeader from '@components/table/header';
import TableRow from '@components/table/row';

const contractType = ContractTypeEnum.Horse;

const transKey = 'horselist';

const defaultSorting = [{ id: 'tokenId', desc: false }];

export type TableProps = {
  className?: string;
  data?: RowData[];
  actionColumn: Partial<ColumnDef<any>>;
  tableOptions?: Partial<TableOptions<any>>;
};

export const currNoDecimal = new Intl.NumberFormat('en-us', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function convertHorseData(horseData: any[]): any[] {
  const convData = horseData.map(h => {
    const auction = find(h.properties, { type: 'AuctionPrice' })?.value;
    const displayAuction = auction && String(auction) === '0.00' ? null : auction;

    return {
      tokenId: h.tokenId,
      name: h.name,
      imageThumbnail: h.imageThumbnail,
      farmName: h.farmName,
      sex: find(h.properties, { type: 'sex' })?.value,
      sireName: find(h.properties, { type: 'sire_name' })?.value,
      damName: find(h.properties, { type: 'dam_name' })?.value,
      damSireName: find(h.properties, { type: 'dam_sire_name' })?.value,
      auctionPrice: displayAuction || null,
      record: h,
    };
  });
  return convData;
}

export function CellFormatter({
  val,
  empty = '',
  className = 'text-left',
}: {
  val: any;
  empty?: string;
  className?: string;
}) {
  return <div className={className}>{val || empty}</div>;
}

function getColumns(actionColumn: any): any[] {
  const cols = [
    {
      accessorKey: 'tokenId',
      cell: ({ getValue }) => {
        return <CellFormatter val={getValue()} className="text-right" />;
      },
    },
    {
      id: 'imageThumbnail',
      maxSize: 100,
      cell: ({ row }) => {
        //const imageURL = row?.original?.imageThumbnail;
        const thumb = getNftImageThumbnailFromS3(contractType, row.original?.tokenId);
        return (
          <div className="h-[50px] w-[50px] text-xs">
            <img src={thumb ? thumb : getNftImageThumbnail(contractType)} className="w-full h-full" alt="-thumb" />
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
    },
    {
      accessorKey: 'sex',
      cell: ({ getValue }) => {
        const sexTxt = (getValue() || '') as unknown as string;
        return <CellFormatter val={sexTxt.charAt(0).toUpperCase()} className="text-center" />;
      },
    },
    {
      accessorKey: 'sireName',
    },

    {
      accessorKey: 'damName',
    },
    {
      accessorKey: 'damSireName',
    },

    {
      accessorKey: 'auctionPrice',
      // cell: info => (info.getValue() ? currNoDecimal.format(info.getValue()) : 'N/A'),
      cell: ({ getValue }) => {
        let value = getValue();
        return <CellFormatter val={(value ? currNoDecimal.format(value) : 'N/A')} className={"font-bold"} />;
      }
    },
    {
      accessorKey: 'farmName',
      cell: ({ getValue, table }) => {
        const txt = getValue() || table.options.meta?.getTrans('community', '');
        return txt;
      },
    },
    {
      id: 'action',
      ...actionColumn,
    },
  ];
  return cols;
}

const defaultColumn: Partial<ColumnDef<any>> = {
  header: ({ column: { id }, table }) => {
    return table.options.meta?.getTrans(`columns.${id}`, ' ');
  },
};

const HorseList: FunctionComponent<TableProps> = ({
  data,
  //autoResetPageIndex,
  //globalFilter,
  actionColumn,
  tableOptions = {},
}) => {
  const { t } = useTranslation();
  const columns = useMemo<ColumnDef<any>[]>(() => getColumns(actionColumn), [actionColumn]);
  //translations for table - passed as meta to table
  const getTrans = useCallback((key: string, empty = '') => t(`${transKey}.${key}`, empty), [t]);
  const table = useReactTable({
    data,
    columns,
    // Pipeline
    getCoreRowModel: getCoreRowModel(),
    //getFilteredRowModel: getFilteredRowModel(), if using filters
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    //autoResetPageIndex,
    defaultColumn,
    enableMultiRowSelection: false,
    getRowId: originalRow => originalRow.tokenId,
    /*     state: {
      globalFilter,
    }, */
    meta: {
      getTrans,
    },
    initialState: { sorting: defaultSorting },
    debugTable: true,
    ...tableOptions,
  });

  return (
    <div className="flex flex-col h-full bg-blue-900/80 backdrop-blur-sm ">
      <div className="flex flex-col overflow-y-auto flex-1 border-y border-blue-700">
        <div className="">
          <div className="inline-block min-w-full py-0 align-middle">
            <div className="min-w-full">
              <table className="min-w-full divide-y divide-[color:var(--color-dark-gray)] text-[color:var(--color-royal-white)]">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => {
                        return (
                          <SortingHeader
                            key={header.id}
                            header={header}
                            isSticky={true}
                            className={clsx(
                              `py-2.5 whitespace-nowrap bg-[#201F33]`,
                              header.id==='sex' ? 'flex justify-center' : ''
                            )}
                          />
                        );
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
                        cellClassName="pt-1 pb-1"
                        className={clsx(
                          row.getIsSelected() ? 'bg-blue-700/80' : 'bg-[#201f33]/50 hover:bg-blue-700/30 cursor-pointer'
                        )}
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
      <TablePagination table={table} isShowPageSize={false} rowCountLabel={true} rowCountAfter="" />
    </div>
  );
};

export default HorseList;
