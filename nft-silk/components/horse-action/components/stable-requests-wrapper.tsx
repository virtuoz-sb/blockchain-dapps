import React, { FunctionComponent, useMemo } from 'react';
import { StableRequests } from '@components/stable-requests';
import StableRequestActions from '@components/horse-action/request';
import { useHorseActionsState } from '@components/horse-action/horse-actions-context';
import { useMoralis } from 'react-moralis';

export type StableRequestsWrapperProps = {
  stableRequests: IStableRequest[];
};

const StableRequestsWrapper: FunctionComponent<StableRequestsWrapperProps> = ({ stableRequests }) => {
  const { farmInfo } = useHorseActionsState();
  const { currentFarm, isUserFarmOwner } = farmInfo;
  const { isAuthenticated } = useMoralis();
  const hasRequestActions = useMemo(() => {
    return isAuthenticated && stableRequests && stableRequests.length > 0 && isUserFarmOwner && currentFarm.isPublic;
  }, [currentFarm.isPublic, isUserFarmOwner, stableRequests, isAuthenticated]);

  return hasRequestActions ? (
    <StableRequestActions stableRequests={stableRequests} currentFarm={currentFarm} />
  ) : (
    <StableRequests stableRequests={stableRequests} hasRequestActions={false} />
  );
};

export default StableRequestsWrapper;
