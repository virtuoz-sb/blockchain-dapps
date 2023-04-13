import { useEffect, FunctionComponent, useMemo } from 'react';
import { useMoralis } from 'react-moralis';

import useTranslation from '@hooks/useTranslation';
import ActionDrawer from '@components/horse-action/action-drawer';
import { useMemoizedCallback } from '@hooks/useMemoizedCallback';

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

//helper consolidate action handlers for  Stable Requests Actions

export function useDeclineStableRequestConfirm(currentFarm, actionId) {
  const [actionState, actionDispatch] = useActionConfirm({ id: actionId });
  const { Moralis } = useMoralis();

  const confirmDecline = useMemoizedCallback(requestParams => {
    return confirm(actionDispatch, Moralis, { farmID: currentFarm.tokenId, requestParams });
  });

  const startDecline = useMemoizedCallback(request => actionDispatch(startAction({ requestParams: request })));

  return {
    declineActionState: actionState,
    confirmDecline,
    startDecline,
    resetDecline: useMemoizedCallback(() => actionDispatch(resetAction())),
  };
}

type DeclineStableRequestConfirmProps = {
  actionState: any;
  //onAfterActionClose?: Function;
  onActionConfirm?: Function;
};

const DeclineStableRequestConfirm: FunctionComponent<DeclineStableRequestConfirmProps> = ({
  onActionConfirm,
  actionState,
}) => {
  const { isActionActive, isActionProcessing, isActionConfirmed, actionData, status } = actionState;

  const { t } = useTranslation();

  const { showStatus, statusMsg } = useMemo(() => {
    if (status === 'error') {
      return {
        showStatus: true,
        statusMsg: t('horseaction.declineStableRequest.confirmError'),
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

  useEffect(() => {
    if (isActionActive && !isActionConfirmed) {
      //console.log('confirming decline action on start');
      onHandleAction('confirm');
    }
  }, [isActionActive, isActionConfirmed, onHandleAction]);

  return (
    <ActionDrawer
      title={
        isActionConfirmed
          ? t('horseaction.declineStableRequest.success')
          : t('horseaction.declineStableRequest.confirm')
      }
      subtitle={
        isActionConfirmed ? null : renderLabelValue(t('horseaction.horse'), actionData?.requestParams?.horseName)
      }
      isActionActive={isActionActive}
      isActionProcessing={isActionProcessing}
      onHandleClose={() => onHandleAction('close')}
      contentCls={isActionConfirmed ? 'text-center' : 'max-w-lg text-left'}
    >
      <div>
        {isActionConfirmed ? (
          <div className="flex flex-col items-center">
            <div className="mt-16">
              <div className="font-medium max-w-lg text-white text-lg">
                {t('horseaction.declineStableRequest.submitted')}
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

export default DeclineStableRequestConfirm;
