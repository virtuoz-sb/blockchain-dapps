import { useEffect, useState, useRef, useMemo, useCallback, useReducer } from 'react';
import type { NextPage } from 'next';
import { useMoralis } from 'react-moralis';

import useTranslation from '@hooks/useTranslation';
import { Button } from '@components/button';
import { Drawer } from '@components/modals/drawer';
import { ActionButton } from '@components/table/cells';
import { TableSkeleton } from '@components/table/helpers';
import HorseList, { convertHorseData } from '@components/horse-list';
import { fetchStabledHorses } from '@common/mock/mockStabledHorses';

const stats = [
  { name: 'Total Subscribers', stat: '71,897' },
  { name: 'Avg. Open Rate', stat: '58.16%' },
  { name: 'Avg. Click Rate', stat: '24.57%' },
];

//[{ containerClassName: 'w-32 space-y-4' }, '', '', '', '']}

const altSkeletonCol = { containerClassName: 'w-12 space-y-4' };
const horseSkeletonCols = [altSkeletonCol, altSkeletonCol, '', altSkeletonCol, '', '', '', '', '', ''];

const initialTableState = {
  data: [],
  isLoading: false,
  isOpen: false,
  error: null,
  message: '',
};

export const reducer = (state, action) => {
  switch (action.type) {
    case REQUEST_STARTED:
      return {
        ...state,
        isLoading: true,
        error: null,
        isOpen: true,
      };
    case REQUEST_SUCCESSFUL:
      return {
        ...state,
        isLoading: false,
        error: null,
        data: action.data,
      };
    case REQUEST_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };

    case RESET_REQUEST:
      return {
        ...initialTableState,
      };

    default:
      return state;
  }
};

export const REQUEST_STARTED = 'REQUEST_STARTED';
export const REQUEST_SUCCESSFUL = 'REQUEST_SUCCESSFUL';
export const REQUEST_FAILED = 'REQUEST_FAILED';
export const RESET_REQUEST = 'RESET_REQUEST';

function useHorses() {
  const [state, dispatch] = useReducer(reducer, initialTableState);

  const tableState = useMemo(() => state, [state]);

  const fetchHorses = useCallback(async () => {
    dispatch({ type: REQUEST_STARTED });

    await fetchStabledHorses()
      .then(horseResponse => {
        if (horseResponse) {
          const horsesData = convertHorseData(horseResponse.items);
          dispatch({ type: REQUEST_SUCCESSFUL, data: horsesData });
        }
      })
      .catch(error => {
        dispatch({ type: REQUEST_FAILED, error: error });
        console.log('error', error);
      });
    //.finally(() => setIsLoading(false));
  }, []);

  const resetTable = useCallback(() => dispatch({ type: RESET_REQUEST }), []);

  return {
    tableState,
    resetTable,
    fetchHorses,
  };
}

////

const initialActionState = {
  rowIndex: null,
  rowData: null,
  isActionActive: false,
  message: '',
};

function setRowActionState(row: any, action?: string) {
  if (!row) {
    return { ...initialActionState };
  }
  const { original, index } = row;
  return {
    rowData: { ...original?.record },
    message: `${action}: ${original?.name}`,
    isActionActive: true,
    rowIndex: index,
  };
}

function StablePanel({ rowAction, onHandleClose }: { rowAction: any; onHandleClose?: Function }) {
  return (
    <Drawer
      title={null}
      isOpen={rowAction.isActionActive}
      onClose={() => onHandleClose(false)}
      width="max-w-3xl"
      containerCls="mt-32 mr-2.5"
    >
      {rowAction.isActionActive && rowAction.rowData && (
        <div className="flex flex-col min-h-full items-center justify-center p-6">
          <header>
            <h1 className="text-3xl text-center font-bold leading-tight text-white uppercase mb-4">
              {rowAction.message}
            </h1>
          </header>
          <Button
            color="primary"
            fill="solid"
            notch="right"
            onClick={() => onHandleClose(rowAction)}
            data-test="stable-modal-confirm"
          >
            Confirm
          </Button>
        </div>
      )}
    </Drawer>
  );
}

const Testing: NextPage = () => {
  const isMounted = useRef<boolean>(false);
  const { isAuthenticated } = useMoralis();
  const [isSignedIn, setIsSignedIn] = useState(null);
  //const [open, setOpen] = useState(false);
  //const [isLoading, setIsLoading] = useState<boolean>(true);
  //const [data, setData] = useState([]);
  const [actionState, setActionState] = useState({ ...initialActionState });

  const { tableState, resetTable, fetchHorses } = useHorses();
  const { isOpen, isLoading, data } = tableState;

  const { t } = useTranslation();

  const handleStableConfirmAction = useCallback(stableData => {
    console.log('Stable Data Confirm', stableData);
    setActionState(setRowActionState(null));
  }, []);

  const actionColumn = useMemo(
    () => ({
      cell: ({ row }) => {
        const aTxt = t('horselist.actions.stable');
        const disabled = row?.original?.record?.isStabled || false;
        const handleStable = () => {
          const newState = setRowActionState(row, aTxt);
          //setOpen(false);
          resetTable();
          setActionState(newState);

          //console.log('TOGGLE ACTION', row, table, table, table.getSelectedRowModel());
        };
        return <ActionButton onHandleAction={handleStable} actionTxt={aTxt} disabled={disabled} />;
      },
    }),
    [resetTable, t]
  );

  useEffect(() => {
    setIsSignedIn(isAuthenticated);
  }, [isAuthenticated]);

  /* useEffect(() => {
    if (!isMounted.current) {
      fetchStabledHorses()
        .then(horseResponse => {
          if (horseResponse) {
            const horsesData = convertHorseData(horseResponse.items);
            setData(horsesData);
          }
        })
        .catch(error => {
          console.log('error', error);
        })
        .finally(() => setIsLoading(false));
    }
    isMounted.current = true;
  }, []); */

  return (
    <div className="flex pt-20 h-screen justify-center">
      {isSignedIn && (
        <>
          <div className="flex flex-1">
            <div className="flex items-center justify-center">
              <img src="/images/SKY FALLS NFT TRANSPARENT.png" className="" alt="" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center mr-12 flex-1">
            <h3 className="text-lg font-medium leading-6 text-gray-300">Last 30 days</h3>
            <dl className="my-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {stats.map(item => (
                <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                  <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                  <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{item.stat}</dd>
                </div>
              ))}
            </dl>
            <div className="p-6 bg-blue-900 h-64 w-full">
              <Button color="market" fill="solid" notch="right" uppercase full={false} onClick={() => fetchHorses()}>
                {t('horselist.actions.stable')}
              </Button>
            </div>
          </div>
          <Drawer
            title={t('horselist.actions.stableTitle')}
            isOpen={isOpen}
            onClose={() => resetTable()}
            width="max-w-[1440px]"
            containerCls="mt-32 mx-2.5"
          >
            {isOpen && isLoading && <TableSkeleton rowsCount={5} columns={horseSkeletonCols} />}
            {isOpen && !isLoading && <HorseList data={data} actionColumn={actionColumn} />}
          </Drawer>
          <StablePanel rowAction={actionState} onHandleClose={handleStableConfirmAction} />
        </>
      )}
    </div>
  );
};

export default Testing;
