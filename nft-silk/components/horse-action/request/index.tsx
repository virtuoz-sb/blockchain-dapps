import { FunctionComponent } from 'react';
//import useTranslation from '@hooks/useTranslation';
import { useMemoizedCallback } from '@hooks/useMemoizedCallback';
import { useHorseActionsState } from '@components/horse-action/horse-actions-context';
import { notifyAcceptRequest, notifyDeclineRequest } from '@components/horse-action/helpers';
import DeclineStableRequestConfirm, { useDeclineStableRequestConfirm } from './declineStableRequest';
import AcceptStableRequestConfirm, { useAcceptStableRequestConfirm } from './acceptStableRequest';
import { StableRequests } from '@components/stable-requests';

type StableRequestActionsProps = {
  stableRequests: IStableRequest[];
  currentFarm: IFarm;
};

const StableRequestActions: FunctionComponent<StableRequestActionsProps> = ({ stableRequests, currentFarm }) => {
  //const { t } = useTranslation();
  //CHECK stakedRequests if full?
  const { refreshActions } = useHorseActionsState();
  const { acceptActionState, confirmAccept, startAccept, resetAccept } = useAcceptStableRequestConfirm(
    currentFarm,
    'acceptStableRequest'
  );
  const { declineActionState, confirmDecline, startDecline, resetDecline } = useDeclineStableRequestConfirm(
    currentFarm,
    'declineStableRequest'
  );

  const onHandleRequestAction = useMemoizedCallback((type, request) => {
    console.log('REQUEST ACTION', type, request);
    if (type === 'accept') {
      startAccept(request);
    } else if (type === 'decline') {
      startDecline(request);
    }
  });

  const onHandleDeclineConfirm = useMemoizedCallback((params, isClose = false) => {
    console.log('onHandleDeclineConfirm', isClose, params);
    if (isClose) {
      resetDecline();
      if (params.isActionConfirmed) {
        //notify user
        const { horseID } = params.requestParams;
        notifyDeclineRequest(currentFarm, horseID);
        //refreshStakedHorses(currentFarm.tokenId);
        //refreshStableRequests(currentFarm.tokenId);
        refreshActions(currentFarm.tokenId, true);
      }
    } else {
      confirmDecline(params.requestParams);
    }
  });
  const onHandleAcceptConfirm = useMemoizedCallback((params, isClose = false) => {
    console.log('onHandleAcceptConfirm', isClose, params);
    if (isClose) {
      resetAccept();
      if (params.isActionConfirmed) {
        //notify user
        const { horseID } = params.requestParams;
        notifyAcceptRequest(currentFarm, horseID);
        //refreshStakedHorses(currentFarm.tokenId);
        //refreshStableRequests(currentFarm.tokenId);
        refreshActions(currentFarm.tokenId, true);
      }
    } else {
      confirmAccept(params.requestParams);
    }
  });
  //in future possibly add header buttons - accept/decline all
  return (
    <>
      <div className="bg-[#201F33] flex justify-center items-center w-full h-16 gap-x-0 xl:gap-x-6 2xl:gap-x-11 rounded-t"></div>
      <StableRequests
        stableRequests={stableRequests}
        hasRequestActions={true}
        onRequestAction={onHandleRequestAction}
      />
      <AcceptStableRequestConfirm actionState={acceptActionState} onActionConfirm={onHandleAcceptConfirm} />
      <DeclineStableRequestConfirm actionState={declineActionState} onActionConfirm={onHandleDeclineConfirm} />
    </>
  );
};

export default StableRequestActions;
