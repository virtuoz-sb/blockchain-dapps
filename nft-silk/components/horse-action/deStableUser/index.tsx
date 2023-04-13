import { useEffect, FunctionComponent, useMemo, useRef } from 'react';
import { useMoralis } from 'react-moralis';
import useTranslation from '@hooks/useTranslation';
import ActionDrawer, { ActionConfirmButtons } from '@components/horse-action/action-drawer';
import { useMemoizedCallback } from '@hooks/useMemoizedCallback';
import {
  useActionConfirm,
  useAfterConfirmCountDown,
  renderLabelValue,
  renderLabelValueColumn,
  startAction,
  resetAction,
  ActionStatus,
  ActionConfirmProps,
  notifyDeStable,
} from '../helpers';
import CountDown from '@components/horse-action/components/count-down';

import { init, confirm } from './actions';

//helper consolidate action handlers

export function useDeStableUserConfirm(currentFarm, actionId) {
  const [actionState, actionDispatch] = useActionConfirm({ id: actionId });
  const { Moralis } = useMoralis();

  const initAct = useMemoizedCallback(() => {
    return init(actionDispatch, Moralis, currentFarm.tokenId);
  });

  const confirmAct = useMemoizedCallback(horseID => {
    return confirm(actionDispatch, Moralis, { horseID, farmID: currentFarm.tokenId });
  });

  const getStart = useMemoizedCallback(() => ({
    meta: currentFarm,
    start: row => actionDispatch(startAction(row.original)),
  }));

  return {
    actionState,
    //actionDispatch,
    initAct,
    confirmAct,
    getStart,
    reset: useMemoizedCallback(() => actionDispatch(resetAction())),
  };
}

const DeStableUserConfirm: FunctionComponent<ActionConfirmProps> = ({
  //actionState,
  farmInfo,
  onAfterActionConfirm,
  onAfterActionClose,
  onActivate,
  actionId,
}) => {
  const isMounted = useRef<boolean>(false);
  const { currentFarm } = farmInfo;
  const { actionState, initAct, confirmAct, getStart, reset } = useDeStableUserConfirm(currentFarm, actionId);
  const {
    isActionActive,
    isActionProcessing,
    isActionConfirmed,
    isActionInitialized,
    actionData,
    actionParams: farmParams,
    status,
  } = actionState;

  const { t } = useTranslation();

  const { showStatus, statusMsg } = useMemo(() => {
    if (status === 'error') {
      return {
        showStatus: true,
        statusMsg: isActionInitialized
          ? t('horseaction.deStableUser.confirmError')
          : t('horseaction.deStableUser.initError'),
      };
    }
    if (status === 'processing') {
      return {
        showStatus: true,
        statusMsg: isActionInitialized ? t('horseaction.processing') : t('horseaction.initializing'),
      };
    }
    return { showStatus: false, statusMsg: '' };
  }, [isActionInitialized, status, t]);

  const onHandleAction = useMemoizedCallback(type => {
    if (type === 'confirm') {
      //may be rejection
      confirmAct(actionData.tokenId).then(resp => onAfterActionConfirm(type, resp));
    } else {
      onAfterActionClose('close', { isActionConfirmed, farmId: currentFarm.tokenId });
      if (isActionConfirmed) {
        //notify farm and horse owner
        notifyDeStable(currentFarm, actionData.tokenId);
      }
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
    if (isActionActive && !isActionInitialized) {
      //console.log('initializing action');
      initAct();
    }
  }, [initAct, isActionActive, isActionInitialized]);

  return (
    <ActionDrawer
      title={isActionConfirmed ? t('horseaction.deStableUser.success') : t('horseaction.deStableUser.confirm')}
      subtitle={isActionConfirmed ? null : renderLabelValue(t('horseaction.horse'), actionData?.name)}
      isActionActive={isActionActive}
      isActionProcessing={isActionProcessing}
      onHandleClose={() => onHandleAction('close')}
      contentCls={isActionConfirmed ? 'text-center' : 'max-w-sm text-left'}
    >
      <div>
        {isActionInitialized ? (
          isActionConfirmed ? (
            <div className="mt-9 flex flex-col items-center">
              <div className="mt-4">
                <div className="font-normal max-w-lg text-white text-lg">{t('horseaction.deStableUser.submitted')}</div>
              </div>
              <CountDown count={timeLeft / 1000} className="mt-14" />
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-3xl font-bold leading-tight text-white">{t('horseaction.terms')}</h3>
                <div className="flex space-x-4 whitespace-nowrap">
                  {renderLabelValue(t('horseaction.farm'), currentFarm?.name)}
                  {renderLabelValue(t('horseaction.region'), currentFarm?.type)}
                </div>
              </div>
              <div className="mb-6">
                <div className="font-medium text-[color:var(--color-light-gray)] mb-3">{t('horseaction.period')}</div>
                <div className="flex flex-col gap-6 ml-3">
                  {farmParams && renderLabelValueColumn(t('horseaction.full'), `${farmParams.maxTerm} months`)}
                  {farmParams && renderLabelValueColumn(t('horseaction.stableFee'), `${farmParams.ownerFee}%`)}
                  {farmParams &&
                    renderLabelValueColumn(t('horseaction.deStableFee'), `${farmParams.destablingFee} ETH`)}
                </div>
              </div>
              <div className="mb-0">
                <div className="font-bold text-white text-lg">{t('horseaction.deStableUser.confirmMsg')}</div>
              </div>

              <ActionConfirmButtons
                onActionClose={() => onHandleAction('close')}
                onActionConfirm={() => onHandleAction('confirm')}
              />
            </div>
          )
        ) : null}
        <ActionStatus isActive={showStatus} status={status} msg={statusMsg} />
      </div>
    </ActionDrawer>
  );
};

export default DeStableUserConfirm;
