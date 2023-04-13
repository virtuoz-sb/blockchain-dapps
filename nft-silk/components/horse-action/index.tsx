import { FunctionComponent, useState, useMemo } from 'react';
//import clsx from 'clsx';
import useTranslation from '@hooks/useTranslation';
import {
  useHorseActionsState,
  useHorseActionsDispatch,
  //activateAction,
  deactivateAction,
  //resetActions,
} from '@components/horse-action/horse-actions-context';
import useOwnedHorses from '@components/horse-list/useOwnedHorses';
import HorseList from '@components/horse-list';
import { TableSkeleton } from '@components/table/helpers';
import { Drawer } from '@components/modals/drawer';
import { useMemoizedCallback } from '@hooks/useMemoizedCallback';
//import StableOwnedConfirm from './stableOwned';
import { getHorseActionContent } from './action-config';

const altSkeletonCol = { containerClassName: 'w-12 space-y-4' };
const horseSkeletonCols = [altSkeletonCol, altSkeletonCol, '', altSkeletonCol, '', '', '', '', '', ''];

export function useHorseActionContent(actionsState) {
  const { isActionActivated, activeAction } = actionsState;

  const { ConfirmComponent, renderActionColumn } = useMemo(() => {
    const actionContent = isActionActivated && activeAction?.id ? getHorseActionContent(activeAction.id) : null;
    return {
      ConfirmComponent: actionContent?.actionConfirm || null,
      renderActionColumn: actionContent?.renderActionColumn || null,
    };
  }, [activeAction?.id, isActionActivated]);

  /* const getRenderColumn = useMemoizedCallback((cb: (arg0: any, arg1: any) => void, t: any, meta?: any) => {
    if (actionContent.current) {
      const onAction = (row, meta) => {
        cb(row, meta);
      };
      return actionContent.current?.renderActionColumn(onAction, t, meta);
    }
  }); */

  return {
    ConfirmComponent,
    renderActionColumn,
  };
}

const HorseActions: FunctionComponent<any> = () => {
  const { t } = useTranslation();
  const { actionsState, farmInfo, refreshActions } = useHorseActionsState();
  const dispatch = useHorseActionsDispatch();
  const { tableState, resetTable, fetchHorses } = useOwnedHorses(false);
  const { ConfirmComponent, renderActionColumn } = useHorseActionContent(actionsState);
  const { hasValidActions, activeAction } = actionsState;
  const { isTableActive, isLoading, data } = tableState;
  const [actionColumn, setActionColumn] = useState({});
  //const { id, hasHorseList } = activeAction;/

  /* useEffect(() => {
    if (isActionActivated && activeAction) {
      console.log('ACTIVATING', activeAction);
    }
  }, [activeAction, isActionActivated]); */

  const handleAfterAction = useMemoizedCallback((type, resp = null) => {
    console.log('After action', type, resp);

    if (type === 'close') {
      resetTable();
      dispatch(deactivateAction());
      if (resp && resp.isActionConfirmed) {
        //refresh staked/stable horses if confirmed - then check actions
        //refreshStakedHorses(resp.farmId); //then resetActions or init?
        //refreshStableRequests(resp.farmId);
        refreshActions(resp.farmId, true);
      }
    }
  });

  const onActivate = useMemoizedCallback(actionProps => {
    //if hasHorseList td
    const { start, meta } = actionProps;
    const actColumn = renderActionColumn
      ? renderActionColumn(
          (row, meta) => {
            resetTable();
            start(row, meta);
          },
          t,
          meta
        )
      : {};
    setActionColumn(actColumn);
    if (actColumn) fetchHorses();

    //console.log('Activate', actColumn, meta);
  });

  return hasValidActions ? (
    <>
      <Drawer
        title={t(`horseaction.${activeAction?.id}.title`)}
        isOpen={isTableActive}
        onClose={() => handleAfterAction('close')}
        width="max-w-[1440px]"
        //containerCls="mt-32"
        wrapperCls="right-0 sm:right-2 top-0 sm:top-28 md:top-32 2xl:top-36"
      >
        {isTableActive && isLoading && <TableSkeleton rowsCount={5} columns={horseSkeletonCols} />}
        {isTableActive && !isLoading && <HorseList data={data} actionColumn={actionColumn} />}
      </Drawer>
      {ConfirmComponent && (
        <ConfirmComponent
          onActivate={onActivate}
          onAfterActionClose={handleAfterAction}
          onAfterActionConfirm={handleAfterAction}
          farmInfo={farmInfo}
          actionId={activeAction?.id}
        />
      )}
    </>
  ) : null;
};

export default HorseActions;
