import { FunctionComponent, useMemo } from 'react';
import { useMoralis } from 'react-moralis';

import useTranslation from '@hooks/useTranslation';
import ActionDrawer, { ActionConfirmButtons } from '@components/horse-action/action-drawer';
import { useMemoizedCallback } from '@hooks/useMemoizedCallback';
import { useHorseActionsState } from '@components/horse-action/horse-actions-context';
import {
  useActionConfirm,
  useAfterConfirmCountDown,
  renderLabelValue,
  startAction,
  resetAction,
  ActionStatus,
} from '@components/horse-action/helpers';
import CountDown from '@components/horse-action/components/count-down';

import { confirm } from './actions';

//helper consolidate action handlers for Stable Requests Actions

export function useAcceptStableRequestConfirm(currentFarm, actionId) {
  const [actionState, actionDispatch] = useActionConfirm({ id: actionId });
  const { Moralis } = useMoralis();

  const confirmAccept = useMemoizedCallback(requestParams => {
    return confirm(actionDispatch, Moralis, { farmID: currentFarm.tokenId, requestParams });
  });

  const startAccept = useMemoizedCallback(request => actionDispatch(startAction({ requestParams: request })));

  return {
    acceptActionState: actionState,
    confirmAccept,
    startAccept,
    resetAccept: useMemoizedCallback(() => actionDispatch(resetAction())),
  };
}

type AcceptStableRequestConfirmProps = {
  actionState: any;
  //onAfterActionClose?: Function;
  onActionConfirm?: Function;
};

const AcceptStableRequestConfirm: FunctionComponent<AcceptStableRequestConfirmProps> = ({
  onActionConfirm,
  //onAfterActionClose,
  actionState,
}) => {
  const {
    isActionActive,
    isActionProcessing,
    isActionConfirmed,
    //isActionInitialized,
    actionData,
    //actionParams: farmParams,
    status,
  } = actionState;
  const { isStablingOpen } = useHorseActionsState();

  const { t } = useTranslation();

  const { showStatus, statusMsg } = useMemo(() => {
    if (status === 'error') {
      return {
        showStatus: true,
        statusMsg: t('horseaction.acceptStableRequest.confirmError'),
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

  const onHandleAction = useMemoizedCallback(type => {
    if (type === 'confirm') {
      //may be rejection
      onActionConfirm({ requestParams: actionData.requestParams }, false);
    } else {
      onActionConfirm({ isActionConfirmed, requestParams: actionData.requestParams }, true);
    }
  });

  //close success after 5 seconds countdown
  const timeLeft = useAfterConfirmCountDown(() => onHandleAction('close'), isActionConfirmed);

  return (
    <ActionDrawer
      title={
        isActionConfirmed ? t('horseaction.acceptStableRequest.success') : t('horseaction.acceptStableRequest.confirm')
      }
      subtitle={
        isActionConfirmed ? null : renderLabelValue(t('horseaction.horse'), actionData?.requestParams?.horseName)
      }
      isActionActive={isActionActive}
      isActionProcessing={isActionProcessing}
      onHandleClose={() => onHandleAction('close')}
      contentCls={isActionConfirmed ? 'text-center' : 'max-w-sm text-left'}
    >
      <div>
        {isActionConfirmed ? (
          <div className="mt-9 flex flex-col items-center">
            <div className="mt-4">
              <div className="font-normal max-w-lg text-white text-lg">
                {t('horseaction.acceptStableRequest.submitted')}
              </div>
            </div>
            <CountDown count={timeLeft / 1000} className="mt-20" />
          </div>
        ) : (
          <div>
            {isStablingOpen ? (
              <>
                <div className="mt-8">
                  <div className="font-medium text-white text-lg">
                    {t('horseaction.acceptStableRequest.confirmMsg')}
                  </div>
                </div>
                <ActionConfirmButtons
                  onActionClose={() => onHandleAction('close')}
                  onActionConfirm={() => onHandleAction('confirm')}
                />
              </>
            ) : (
              <div className="mt-8">
                <div className="font-medium text-lg text-red-500">
                  {t('horseaction.acceptStableRequest.stableFull')}
                </div>
              </div>
            )}
          </div>
        )}
        <ActionStatus isActive={showStatus} status={status} msg={statusMsg} />
      </div>
    </ActionDrawer>
  );
};

export default AcceptStableRequestConfirm;
