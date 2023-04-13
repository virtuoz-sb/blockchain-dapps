import React, { FunctionComponent, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import clsx from 'clsx';
import { ColumnDef, Row, RowData } from '@tanstack/react-table';

import { Icon } from '@components/icons';
import { Loader } from '@components/loader';
import { ConfirmModal } from '@components/modals/confirm-modal';
import adminApi from '@common/api/admin/adminApi';
import useTranslation from '@hooks/useTranslation';
import Address from '@components/ethereum/Address/Address';
import { ActionButton, StatusPill } from '@components/table/cells';
import { useSkipper, updateData, TableSkeleton } from '@components/table/helpers';
import SearchInput from '@components/table/search';
import UsersTable from './table';

const transKey = 'admin.portalUsers';

async function getUsers(): Promise<IUserStatus[]> {
  const { data: users } = await adminApi.get<IUserStatus[]>('/api/UserStatus?page=0&pageSize=10000');
  return users || undefined;
}

async function setUserStatus({ userRegistrationId, isActive }): Promise<any> {
  const response = await adminApi.put<IUserStatus>('/api/UserStatus', { userRegistrationId, isActive });
  return response;
}

const initialActionState = {
  rowIndex: null,
  rowData: null,
  isActionActive: false,
  message: '',
};

function setRowActionState(row: Row<IUserStatus>, action?: string) {
  if (!row) {
    return { ...initialActionState };
  }
  const { original, index } = row;
  return {
    rowData: { ...original },
    message: `${action}: ${original?.username}`,
    isActionActive: true,
    rowIndex: index,
  };
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    getTrans: (key: string, empty: string) => void;
  }
}

type PortalUsersProps = {
  className?: string;
  title?: string;
};

const defaultColumn: Partial<ColumnDef<IUserStatus>> = {
  header: ({ column: { id }, table }) => {
    return table.options.meta?.getTrans(`columns.${id}`, id.toUpperCase());
  },
};

//height in parent page set to calc based on header and breadcrumb list
export const PortalUsers: FunctionComponent<PortalUsersProps> = ({ className, title }) => {
  const isMounted = useRef<boolean>(false);
  const { t } = useTranslation();
  const [data, setData] = useState<IUserStatus[]>(() => []);
  const [actionState, setActionState] = useState({ ...initialActionState });
  const [globalFilter, setGlobalFilter] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  useEffect(() => {
    if (!isMounted.current) {
      getUsers()
        .then(users => {
          //console.log('Loaded Users', users);
          if (users) {
            setData(users);
          }
        })
        .catch(error => {
          console.log('error', error);
        })
        .finally(() => setIsLoading(false));
    }
    isMounted.current = true;
  }, []);

  //translations for table - passed as meta to table
  const getTableTrans = useCallback((key: string, empty = '') => t(`${transKey}.${key}`, empty), [t]);

  const handleUserStatusAction = useCallback(async () => {
    setIsProcessing(true);
    // Skip page index reset until after next rerender
    skipAutoResetPageIndex();
    const {
      rowIndex,
      rowData: { isActive, userRegistrationId },
    } = actionState;
    await setUserStatus({ isActive: !isActive, userRegistrationId })
      .then(resp => {
        if (resp.status == 200) {
          //console.log('Change User Status Response', resp);
          //either update the current data with response.data or reload
          setData(old => updateData(rowIndex, old, { ...resp.data }));
          /* getUsers().then(users => {
            if (users) {
              setData(users);
            }
          }); */
        } else {
          console.log('Change User Status Invalid', resp);
        }
      })
      .catch(error => {
        console.log('Change User Status Error', error);
      })
      .finally(() => setIsProcessing(false));
  }, [actionState, skipAutoResetPageIndex]);

  //use translations from table meta table.options.meta?.getTrans
  const columns = useMemo<ColumnDef<IUserStatus, any>[]>(
    () => [
      {
        accessorKey: 'username',
        cell: info => <span className="text-white font-medium">{info.getValue()}</span>,
        //minSize: 300
        //header: 'Username',
        //footer: props => props.column.id,
      },
      {
        accessorKey: 'walletAddress',
        //maxSize: 100,
        cell: info => (
          <div className="w-44 flex items-center justify-start space-x-1">
            <Icon name="eth-gray-rounded" className="h-6 w-6" />
            <Address copyable={info.row.getIsSelected()} address={info.getValue()} size={6} />
          </div>
        ),
      },
      {
        accessorKey: 'email',
        enableSorting: true,
      },
      {
        accessorKey: 'isActive',
        enableGlobalFilter: false,
        maxSize: 100,
        cell: ({ getValue, table }) => {
          const active = getValue();
          const sTxt = table.options.meta?.getTrans(
            `status.${active ? 'active' : 'suspended'}`,
            'Unknown'
          ) as unknown as string;
          return <StatusPill statusTxt={sTxt} status={active ? 'success' : 'danger'} />;
        },
      },
      {
        id: 'action',
        maxSize: 100,
        cell: ({ row, table }) => {
          const active = row.getValue('isActive');
          const aTxt = table.options.meta?.getTrans(
            `actions.${active ? 'suspend' : 'reactivate'}`,
            'Action'
          ) as unknown as string;
          const handleToggle = () => {
            const newState = setRowActionState(row, aTxt);
            setActionState(newState);
            //console.log('TOGGLE ACTION', row, table, table, table.getSelectedRowModel());
          };
          return <ActionButton onHandleAction={handleToggle} actionTxt={aTxt} />;
        },
      },
    ],
    []
  );

  return (
    <>
      <div className={clsx('max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pt-2 sm:pt-6 flex flex-col h-full', className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-3xl font-medium">{title}</h2>
          <div className="flex items-center justify-end flex-auto">
            <SearchInput
              initialValue={globalFilter ?? ''}
              className="ml-3 sm:ml-0"
              onSearchChange={value => setGlobalFilter(String(value))}
              placeholder={t(`${transKey}.search`)}
              disabled={isLoading}
            />
          </div>
        </div>
        {isLoading ? (
          <TableSkeleton rowsCount={5} columns={[{ containerClassName: 'w-32 space-y-4' }, '', '', '', '']} />
        ) : (
          <UsersTable
            data={data}
            columns={columns}
            autoResetPageIndex={autoResetPageIndex}
            globalFilter={globalFilter}
            getTrans={getTableTrans}
            //defaultColumn={defaultColumn}
            tableOptions={{ getRowId: originalRow => originalRow.userRegistrationId, defaultColumn: defaultColumn }}
          />
        )}
      </div>
      {isProcessing && <Loader className="mb-20" />}
      <ConfirmModal
        isOpen={actionState.isActionActive}
        title={t(`${transKey}.actions.confirm`)}
        confirmButtonText="Yes"
        cancelButtonText="No"
        onClose={result => {
          if (result === true) {
            handleUserStatusAction();
          }
          setActionState(setRowActionState(null));
        }}
      >
        {actionState.message}
      </ConfirmModal>
    </>
  );
};
