import { useEffect, FunctionComponent, useMemo, useRef } from 'react';
import { useMoralis } from 'react-moralis';
import { keyBy } from 'lodash-es';
//import useWalletStore from '@hooks/useWalletStore';
import useTranslation from '@hooks/useTranslation';
import ActionDrawer, { ActionConfirmButtons } from '@components/horse-action/action-drawer';
import { useMemoizedCallback } from '@hooks/useMemoizedCallback';
import { useHorseActionsState } from '@components/horse-action/horse-actions-context';
import {
  useActionConfirm,
  useAfterConfirmCountDown,
  renderLabelValue,
  renderLabelValueColumn,
  getImageThumbnail,
  startAction,
  resetAction,
  ActionStatus,
  ActionConfirmProps,
} from '../helpers';
import CountDown from '@components/horse-action/components/count-down';

import { init, confirm } from './actions';

const successTimeout = 5000;

//helper consolidate action handlers

export function useStableOwnedConfirm(currentFarm, actionId) {
  const [actionState, actionDispatch] = useActionConfirm({ id: actionId });
  const { Moralis } = useMoralis();
  const { stableRequests } = useHorseActionsState();

  const initAct = useMemoizedCallback(() => {
    return init(actionDispatch, Moralis, currentFarm.tokenId);
  });

  const confirmAct = useMemoizedCallback((horseID, farmTerm) => {
    return confirm(actionDispatch, Moralis, { horseID, farmTerm, farmID: currentFarm.tokenId });
  });
  //NA here as requests on other farms
  //deal with requests via mapped object - returns requests keyed by horseId
  const getStart = useMemoizedCallback(() => ({
    meta: keyBy(stableRequests, 'horseID'),
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

/* export type StableOwnedConfirmProps = {
  //actionState: any;
  farmInfo: any;
  onAfterActionClose?: Function;
  onAfterActionConfirm?: Function;
  onActivate?: Function;
  actionId?: string;
}; */

const StableOwnedConfirm: FunctionComponent<ActionConfirmProps> = ({
  //actionState,
  farmInfo,
  onAfterActionConfirm,
  onAfterActionClose,
  onActivate,
  actionId,
}) => {
  const isMounted = useRef<boolean>(false);
  const { currentFarm } = farmInfo;
  const { actionState, initAct, confirmAct, getStart, reset } = useStableOwnedConfirm(currentFarm, actionId);
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

  //const [timeLeft, { start }] = useCountDown(() => onHandleAction('close'), successTimeout);

  const { showStatus, statusMsg } = useMemo(() => {
    if (status === 'error') {
      return {
        showStatus: true,
        statusMsg: isActionInitialized
          ? t('horseaction.stableOwned.confirmError')
          : t('horseaction.stableOwned.initError'),
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

  //possibly reload stable horses etc?
  const onHandleAction = useMemoizedCallback(type => {
    if (type === 'confirm') {
      //may be rejection
      confirmAct(actionData.tokenId, farmParams.maxTerm).then(resp => {
        return onAfterActionConfirm(type, resp);
      });
    } else {
      onAfterActionClose('close', { isActionConfirmed, farmId: currentFarm.tokenId });
      reset();
    }
  });

  //close success after 5 seconds countdown
  const timeLeft = useAfterConfirmCountDown(() => onHandleAction('close'), isActionConfirmed, successTimeout);

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
      title={isActionConfirmed ? t('horseaction.stableOwned.success') : t('horseaction.stableOwned.action')}
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
              <div className="h-52 w-52">
                <img
                  src={getImageThumbnail(actionData?.tokenId)}
                  className="w-full h-full rounded"
                  alt={actionData?.name}
                />
              </div>
              <div className="mt-4">
                <div className="font-medium text-white text-lg">{`${actionData?.name} ${t(
                  'horseaction.stableOwned.isStabled'
                )} ${currentFarm?.name}`}</div>
                <div className="font-normal px-8 text-[color:var(--color-light-gray)]">
                  {t('horseaction.stableOwned.submitted')}
                </div>
              </div>
              <CountDown count={timeLeft / 1000} className="mt-9" />
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
              <div className="mb-8">
                <div className="font-medium text-[color:var(--color-light-gray)] mb-3">{t('horseaction.period')}</div>
                <div className="flex flex-col gap-6 ml-3">
                  {farmParams && renderLabelValueColumn(t('horseaction.full'), `${farmParams.maxTerm} months`)}
                  {farmParams && renderLabelValueColumn(t('horseaction.stableFee'), `${farmParams.ownerFee}%`)}
                  {farmParams &&
                    renderLabelValueColumn(t('horseaction.deStableFee'), `${farmParams.destablingFee} ETH`)}
                </div>
              </div>

              <div className="text-sm text-[color:var(--color-light-gray)]">
                {t('horseaction.stableOwned.ownerNofee')}
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

export default StableOwnedConfirm;
