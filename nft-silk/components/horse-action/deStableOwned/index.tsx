import { useEffect, FunctionComponent, useMemo, useRef } from 'react';
import { useMoralis } from 'react-moralis';
//import useWalletStore from '@hooks/useWalletStore';
import useTranslation from '@hooks/useTranslation';
import ActionDrawer, { ActionConfirmButtons } from '@components/horse-action/action-drawer';
import { useMemoizedCallback } from '@hooks/useMemoizedCallback';
import {
  useActionConfirm,
  useAfterConfirmCountDown,
  renderLabelValue,
  startAction,
  resetAction,
  ActionStatus,
  ActionConfirmProps,
} from '../helpers';
import CountDown from '@components/horse-action/components/count-down';

import { confirm } from './actions';

//helper consolidate action handlers

export function useDeStableOwnedConfirm(currentFarm, actionId) {
  const [actionState, actionDispatch] = useActionConfirm({ id: actionId });
  const { Moralis } = useMoralis();

  const confirmAct = useMemoizedCallback(horseID => {
    return confirm(actionDispatch, Moralis, { horseID, farmID: currentFarm.tokenId });
  });

  const getStart = useMemoizedCallback(() => ({
    //renderActionColumn: renderActionColumn,
    meta: currentFarm,
    start: row => actionDispatch(startAction(row.original)),
  }));

  return {
    actionState,
    //actionDispatch,
    //initAct,
    confirmAct,
    getStart,
    reset: useMemoizedCallback(() => actionDispatch(resetAction())),
  };
}

const DeStableOwnedConfirm: FunctionComponent<ActionConfirmProps> = ({
  //actionState,
  farmInfo,
  onAfterActionConfirm,
  onAfterActionClose,
  onActivate,
  actionId,
}) => {
  const isMounted = useRef<boolean>(false);
  const { currentFarm } = farmInfo;
  const { actionState, confirmAct, getStart, reset } = useDeStableOwnedConfirm(currentFarm, actionId);
  const {
    isActionActive,
    isActionProcessing,
    isActionConfirmed,
    //isActionInitialized,
    actionData,
    //actionParams: farmParams,
    status,
  } = actionState;

  const { t } = useTranslation();

  const { showStatus, statusMsg } = useMemo(() => {
    if (status === 'error') {
      return {
        showStatus: true,
        statusMsg: t('horseaction.deStableOwned.confirmError'),
      };
    }
    if (status === 'processing') {
      return {
        showStatus: true,
        statusMsg: t('horseaction.processing'),
      };
    }
    return { showStatus: false, statusMsg: '' };
  }, [status, t]);

  //possibly reload stable horses etc?
  const onHandleAction = useMemoizedCallback(type => {
    if (type === 'confirm') {
      //may be rejection
      confirmAct(actionData.tokenId).then(resp => onAfterActionConfirm(type, resp));
    } else {
      onAfterActionClose('close', { isActionConfirmed, farmId: currentFarm.tokenId });
      reset();
    }
  });

  //close success after 5 seconds countdown
  const timeLeft = useAfterConfirmCountDown(() => onHandleAction('close'), isActionConfirmed);

  useEffect(() => {
    if (!isMounted.current) {
      onActivate(getStart());
      isMounted.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ActionDrawer
      title={isActionConfirmed ? t('horseaction.deStableOwned.success') : t('horseaction.deStableOwned.confirm')}
      subtitle={isActionConfirmed ? null : renderLabelValue(t('horseaction.horse'), actionData?.name)}
      isActionActive={isActionActive}
      isActionProcessing={isActionProcessing}
      onHandleClose={() => onHandleAction('close')}
      contentCls={isActionConfirmed ? 'text-center' : 'max-w-sm text-left'}
    >
      <div>
        {isActionConfirmed ? (
          <div className="mt-9 flex flex-col items-center">
            <div className="mt-4">
              <div className="font-normal max-w-lg text-white text-lg">{t('horseaction.deStableOwned.submitted')}</div>
            </div>
            <CountDown count={timeLeft / 1000} className="mt-14" />
          </div>
        ) : (
          <div>
            <div className="mb-6 mt-4">
              <div className="font-bold text-white text-lg">{t('horseaction.deStableOwned.confirmMsg')}</div>
            </div>
            <ActionConfirmButtons
              onActionClose={() => onHandleAction('close')}
              onActionConfirm={() => onHandleAction('confirm')}
            />
          </div>
        )}
        <ActionStatus isActive={showStatus} status={status} msg={statusMsg} />
      </div>
    </ActionDrawer>
  );
};

export default DeStableOwnedConfirm;
