import { useEffect, FunctionComponent, useMemo, useRef } from 'react';
import { useMoralis } from 'react-moralis';
import { keyBy } from 'lodash-es';

import useTranslation from '@hooks/useTranslation';
import ActionDrawer from '@components/horse-action/action-drawer';
import { useMemoizedCallback } from '@hooks/useMemoizedCallback';
import { useHorseActionsState } from '../horse-actions-context';
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

export function useCancelStableUserConfirm(currentFarm, actionId) {
  const [actionState, actionDispatch] = useActionConfirm({ id: actionId });
  const { Moralis } = useMoralis();

  const { stableRequests } = useHorseActionsState();

  const confirmAct = useMemoizedCallback((horseID, requestParams) => {
    return confirm(actionDispatch, Moralis, { horseID, farmID: currentFarm.tokenId, requestParams });
  });
  //deal with requests via mapped object - returns requests keyed by horseId
  const getStart = useMemoizedCallback(() => ({
    meta: keyBy(stableRequests, 'horseID'),
    start: (row, request) => actionDispatch(startAction({ ...row.original, requestParams: request })),
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

//use case no confirm screen - confirm on start
const CancelStableUserConfirm: FunctionComponent<ActionConfirmProps> = ({
  //actionState,
  farmInfo,
  onAfterActionConfirm,
  onAfterActionClose,
  onActivate,
  actionId,
}) => {
  const isMounted = useRef<boolean>(false);
  const { currentFarm } = farmInfo;
  const { actionState, confirmAct, getStart, reset } = useCancelStableUserConfirm(currentFarm, actionId);
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
        statusMsg: t('horseaction.cancelStableUser.confirmError'),
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

  //request params include id which is index
  const onHandleAction = useMemoizedCallback(type => {
    if (type === 'confirm') {
      //may be rejection
      confirmAct(actionData.tokenId, actionData.requestParams).then(resp => onAfterActionConfirm(type, resp));
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

  useEffect(() => {
    if (isActionActive && !isActionConfirmed) {
      //console.log('confirming action on start');
      onHandleAction('confirm');
    }
  }, [isActionActive, isActionConfirmed, onHandleAction]);

  return (
    <ActionDrawer
      title={isActionConfirmed ? t('horseaction.cancelStableUser.success') : t('horseaction.cancelStableUser.confirm')}
      subtitle={isActionConfirmed ? null : renderLabelValue(t('horseaction.horse'), actionData?.name)}
      isActionActive={isActionActive}
      isActionProcessing={isActionProcessing}
      onHandleClose={() => onHandleAction('close')}
      contentCls={isActionConfirmed ? 'text-center' : 'max-w-lg text-left'}
    >
      <div>
        {isActionConfirmed ? (
          <div className="flex flex-col items-center">
            <div className="mt-16">
              <div className="font-bold max-w-lg text-white text-lg">
                {t('horseaction.cancelStableUser.submitted', { horseName: actionData?.name })}
              </div>
            </div>
            <CountDown count={timeLeft / 1000} className="mt-20" />
          </div>
        ) : null}
        <ActionStatus isActive={showStatus} status={status} msg={statusMsg} />
      </div>
    </ActionDrawer>
  );
};

export default CancelStableUserConfirm;
