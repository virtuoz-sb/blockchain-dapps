import { useReducer, useMemo, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import { getNftImageThumbnail, getNftImageThumbnailFromS3 } from '@common/getInformationPerNftCollectionEnum';
import {
  requestToStableHorseNotification,
  acceptStableRequestNotification,
  declineStableRequestNotification,
  deStablingHorseNotification,
} from '@common/api/portal/marketplace';
import { useCountDown } from '@hooks/useTimeoutFn';

const contractType = ContractTypeEnum.Horse;

const successTimeout = 5000;

export type ActionConfirmProps = {
  //actionState: any;
  farmInfo: any;
  onAfterActionClose?: Function;
  onAfterActionConfirm?: Function;
  onActivate?: Function;
  actionId?: string;
};

export const renderLabelValue = (label, val, cls = '') => (
  <div className={clsx('font-medium text-white', cls)}>
    <span className="mr-2 font-normal text-[color:var(--color-light-gray)]">{label}:</span>
    <span>{val}</span>
  </div>
);

export const renderLabelValueColumn = (label, val, cls = '') => (
  <div className={clsx('text-white text-sm flex flex-col font-medium', cls)}>
    <span className="text-xs font-normal text-[color:var(--color-light-gray)]">{label}</span>
    <span>{val}</span>
  </div>
);

export const getImageThumbnail = tokenId => {
  const thumb = getNftImageThumbnailFromS3(contractType, tokenId);
  return thumb ? thumb : getNftImageThumbnail(contractType);
};

export function ActionStatus({ isActive = false, status, msg }: { isActive: boolean; msg?: string; status?: string }) {
  const cls = status === 'error' ? 'text-red-500 font-bold' : '';
  return isActive ? (
    <div className={clsx('font-medium text-[color:var(--color-light-gray)] mt-5 text-center', cls)}>{msg}</div>
  ) : null;
}

export const initialActionConfirmState = {
  actionData: null,
  isActionActive: false,
  isActionInitialized: false,
  isActionConfirmed: false,
  actionResponse: null,
  actionParams: null,
  isActionProcessing: false,
  status: 'ready',
  id: '',
};

export function actionConfirmReducer(state, action) {
  switch (action.type) {
    case 'start': {
      return {
        ...state,
        actionData: action?.actionData,
        isActionActive: true,
        status: 'started',
        id: action?.id | state.id,
      };
    }

    case 'init': {
      const { success, actionParams } = action;
      return {
        ...state,
        actionParams: actionParams,
        isActionProcessing: false,
        isActionInitialized: success,
        status: success ? 'initialized' : 'error',
      };
    }

    case 'process': {
      return {
        ...state,
        status: action.isStart ? 'processing' : 'cancelled',
        isActionProcessing: action.isStart,
      };
    }

    case 'confirm': {
      const { success, actionResponse } = action;
      return {
        ...state,
        actionResponse: actionResponse,
        isActionProcessing: false,
        status: success ? 'confirmed' : 'error',
        isActionConfirmed: success,
      };
    }
    case 'reset': {
      return {
        ...initialActionConfirmState,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export function startAction(actionData) {
  return {
    type: 'start',
    actionData: actionData,
  };
}

export function processAction(isStart = true) {
  return {
    type: 'process',
    isStart,
  };
}

export function initAction({ success, actionParams }) {
  return {
    type: 'init',
    success,
    actionParams,
  };
}

export function confirmAction({ success, actionResponse }) {
  return {
    type: 'confirm',
    success,
    actionResponse,
  };
}

export function resetAction() {
  return {
    type: 'reset',
  };
}

export function useActionConfirm(startState = {}) {
  const [state, actionDispatch] = useReducer(actionConfirmReducer, {
    ...initialActionConfirmState,
    ...startState,
  });
  const actionState = useMemo(() => state, [state]);
  return [actionState, actionDispatch];
}

export function useAfterConfirmTimeout(cb: () => void, isActionConfirmed: boolean, ms: number = successTimeout) {
  const savedRefCallback = useRef<() => any>();
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    savedRefCallback.current = cb;
  }, [cb]);
  useEffect(() => {
    if (isActionConfirmed) {
      timeout.current = setTimeout(() => savedRefCallback.current(), ms);
      //return () => clearTimeout(idle);
    }
  }, [isActionConfirmed, ms]);

  return timeout.current;
}

export function useAfterConfirmCountDown(cb: () => void, isActionConfirmed: boolean, ms: number = successTimeout) {
  const [timeLeft, { start }] = useCountDown(cb, ms);

  useEffect(() => {
    if (isActionConfirmed) {
      start();
    }
  }, [isActionConfirmed, start]);

  return timeLeft;
}

export async function notifyRequestToStable(currentFarm) {
  const {
    tokenId,
    addressInformation: { farmOwnerWalletAddress },
  } = currentFarm;
  return await requestToStableHorseNotification(farmOwnerWalletAddress, tokenId);
}

export async function notifyDeStable(currentFarm, horseTokenId) {
  const {
    tokenId,
    name,
    addressInformation: { farmOwnerWalletAddress, userWalletAddress },
  } = currentFarm;
  return await deStablingHorseNotification(tokenId, name, farmOwnerWalletAddress, userWalletAddress, horseTokenId);
}

export async function notifyAcceptRequest(currentFarm, horseTokenId) {
  const {
    tokenId,
    name,
    addressInformation: { userWalletAddress },
  } = currentFarm;
  return await acceptStableRequestNotification(tokenId, name, userWalletAddress, horseTokenId);
}

export async function notifyDeclineRequest(currentFarm, horseTokenId) {
  const {
    tokenId,
    name,
    addressInformation: { userWalletAddress },
  } = currentFarm;
  return await declineStableRequestNotification(tokenId, name, userWalletAddress, horseTokenId);
}
