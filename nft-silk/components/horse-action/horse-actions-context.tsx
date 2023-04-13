import { createContext, useEffect, useReducer, useMemo, useContext, useRef, useCallback, ReactNode } from 'react';
import { map as lMap, compact, intersection, filter as lFilter, difference, some } from 'lodash-es';
import useOwnedHorses from '@components/horse-list/useOwnedHorses';
import { useMemoizedCallback } from '@hooks/useMemoizedCallback';
import { getHorseActions } from './action-config';

const isDebug = false;

const HorseActionsStateContext = createContext(undefined);
const HorseActionsDispatchContext = createContext(undefined);

//initialize horse ids in farm; todo get stables, add context
//stableUserCancel
const horseActions = getHorseActions(true);

//tbd get avaialble actions based on conditions
//for destable check horseIds to stable horseTokenId
//requests; horses with request farmId, horseId on public; exclude from stable/destable
//horseIds not all stabled; owner has stalls; not currently requested
export const getActions = (farmInfo, stakedHorses, allHorseIds, stableRequests, isStablingOpen) => {
  const { isUserFarmOwner, currentFarm } = farmInfo; //currentFarm
  //requests with user horse ids
  const matchRequests = lFilter(
    stableRequests,
    sr => sr.farmID === currentFarm.tokenId && allHorseIds.includes(String(sr.horseID))
  );

  let adjustAllHorseIds = allHorseIds;
  const checkPublic = isUserFarmOwner ? false : currentFarm.isPublic;
  //horsetokenID represents real horse
  let realStaked = lMap(stakedHorses, 'horsetokenID');
  realStaked = compact(realStaked);
  //console.log('REAL STAKED', stakedHorses, realStaked);
  let canDestable = false;
  let canStable = isStablingOpen;
  let canCancel = false;
  let validTypes = [];
  if (matchRequests.length > 0) {
    //determine if effects stable/destable; remove requestIds from all ids
    const matchRequestIds = lMap(matchRequests, mr => String(mr.horseID));
    adjustAllHorseIds = difference(allHorseIds, matchRequestIds);
    canCancel = true;
  }
  if (realStaked.length > 0) {
    const matchStables = intersection(realStaked, adjustAllHorseIds);
    canDestable = matchStables.length > 0;
    canStable = isStablingOpen && adjustAllHorseIds.length > matchStables.length;
  }
  if (canStable) validTypes.push('stable');
  if (canDestable) validTypes.push('deStable');
  if (canCancel) validTypes.push('request');

  const acts = horseActions.filter(
    ac =>
      ac.isEnabled &&
      ac.requiresFarmOwner === isUserFarmOwner &&
      ac.isPublicOnly === checkPublic &&
      validTypes.includes(ac.type)
  );
  return acts;
};

const initialActionsState = {
  horseActions: [],
  isInitialized: false,
  activeAction: null,
  isActionActivated: false,
  hasValidActions: false,
  status: 'ready',
};

//need a change action
function actionsReducer(state, action) {
  switch (action.type) {
    case 'init': {
      return {
        ...state,
        isInitialized: true,
        status: 'initialized',
      };
    }
    case 'set': {
      //possibly set invalid as well
      const isValid = action.horseActions && action.horseActions.length > 0;
      return {
        ...state,
        horseActions: action.horseActions,
        status: isValid ? 'enabled' : 'disabled',
        hasValidActions: isValid,
      };
    }
    case 'activate': {
      //and deactivate when complete but actions still set
      return {
        ...state,
        activeAction: action.activeAction,
        status: 'activated',
        isActionActivated: true,
      };
    }
    case 'deactivate': {
      return {
        ...state,
        activeAction: null,
        status: 'deactivated',
        isActionActivated: false,
      };
    }
    case 'reset': {
      return {
        ...initialActionsState,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export function initActions() {
  return {
    type: 'init',
  };
}

export function setActions(actions) {
  return {
    type: 'set',
    horseActions: actions,
  };
}

export function activateAction(action) {
  return {
    type: 'activate',
    activeAction: action,
  };
}

export function deactivateAction() {
  return {
    type: 'deactivate',
  };
}

export function resetActions() {
  return {
    type: 'reset',
  };
}

export type HorseActionProviderProps = {
  isFarmOrLandOwner?: boolean;
  isUserFarmOwner?: boolean;
  isFarmReady?: boolean;
  currentNFT: IFarm;
  stakedHorses?: IStakedHorse[];
  stableRequests?: IStableRequest[];
  getStakedHorses?: (farmId) => Promise<any[]>;
  getStableRequests?: (farmId) => Promise<any>;
  children?: ReactNode;
};

//isInitialized based on Farm done farm details isLoading
//TODO NEEDS TO HANDLE CHANGES owner?
//adding staked horses and getStakedHorses from Farm page (use Hook/context?)
function HorseActionsProvider({
  children,
  currentNFT,
  isFarmOrLandOwner,
  isUserFarmOwner,
  isFarmReady,
  stakedHorses,
  getStakedHorses,
  stableRequests,
  getStableRequests,
}: HorseActionProviderProps) {
  const isMounted = useRef<boolean>(false);
  const farmInfo = useRef<any>(null);
  // or use useHorsesNFTTokensStore
  const { hasHorses, allHorseIds } = useOwnedHorses(true);
  const [state, dispatch] = useReducer(actionsReducer, {
    ...initialActionsState,
  });

  useEffect(() => {
    farmInfo.current = { isFarmOrLandOwner, isUserFarmOwner, currentFarm: currentNFT };
  }, [isFarmOrLandOwner, currentNFT, isUserFarmOwner]);

  useEffect(() => {
    if (!isMounted.current && isFarmReady) {
      isMounted.current = true;
      if (isDebug) console.log('INIT ACTION');
      dispatch(initActions());
    }
  }, [isFarmReady]);

  //available stalls - marked with horseID = 0
  const isStablingOpen = useMemo(
    () => (stakedHorses ? some(stakedHorses, ['horsetokenID', 0]) : false),
    [stakedHorses]
  );

  const checkActions = useCallback(() => {
    const actions = getActions(farmInfo.current, stakedHorses, allHorseIds, stableRequests, isStablingOpen);
    if (isDebug) console.log('SET ACTIONS', stableRequests, stakedHorses, actions, farmInfo.current, isStablingOpen);
    dispatch(setActions(actions));
  }, [allHorseIds, isStablingOpen, stableRequests, stakedHorses]);

  //needs to update after changes
  useEffect(() => {
    if (state.status === 'initialized' && hasHorses && stakedHorses) {
      //const actions = getActions(farmInfo.current, stakedHorses, allHorseIds, stableRequests, isStablingOpen);
      //if (isDebug) console.log('SET ACTIONS', stableRequests, stakedHorses, actions, farmInfo.current);
      //dispatch(setActions(actions));
      checkActions();
    }
  }, [checkActions, hasHorses, stakedHorses, state.status]);

  useEffect(() => {
    if (isDebug) console.log('Active Action Change', state.activeAction);
  }, [state.activeAction]);

  const refreshStakedHorses = useMemoizedCallback(farmId => getStakedHorses(farmId));
  const refreshStableRequests = useMemoizedCallback(farmId => getStableRequests(farmId));

  //refresh actions - reload staked/requests - check actions
  const refreshActions = useMemoizedCallback(async (farmId, isCheck = true) => {
    const stakedHorses = await getStakedHorses(farmId);
    const stableRequests = await getStableRequests(farmId);
    if (isCheck && stakedHorses && stableRequests) {
      checkActions();
    }
  });

  const actionsContent = useMemo(() => {
    //console.log(state);
    return {
      actionsState: state,
      farmInfo: farmInfo.current,
      refreshStakedHorses,
      stakedHorses,
      refreshStableRequests,
      stableRequests,
      refreshActions,
      isStablingOpen,
    };
  }, [isStablingOpen, refreshActions, refreshStableRequests, refreshStakedHorses, stableRequests, stakedHorses, state]);
  return (
    <HorseActionsStateContext.Provider value={actionsContent}>
      <HorseActionsDispatchContext.Provider value={dispatch}>{children}</HorseActionsDispatchContext.Provider>
    </HorseActionsStateContext.Provider>
  );
}

export function useHorseActionsState() {
  const context = useContext(HorseActionsStateContext);
  if (!context) {
    throw new Error('HorseActionsStateContext must be used within the HorseActionProvider');
  }
  return context;
}

export function useHorseActionsDispatch() {
  const context = useContext(HorseActionsDispatchContext);
  if (!context) {
    throw new Error('useAppDispatch must be used within the AppProvider');
  }
  return context;
}

export default HorseActionsProvider;
