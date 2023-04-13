import { useMemo, useCallback, useReducer, useRef, useEffect } from 'react';
import moment from 'moment';
import create from 'zustand';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import { vanillaStore as vanillaContractAddressStore, ContractTypeEnum } from '@hooks/useContractAddressStore';
import { vanillaStore as vanillaWalletStore } from '@hooks/useWalletStore';
import { gethorseNFTVWStable, getAllSyndicatedTokensIdForUserWallet } from '@common/api/portal/marketplace';
import { convertHorseData } from '@components/horse-list';

interface IHorsesNFTTokensState {
  hasHorses?: boolean;
  getAllHorseIds: Function;
  resetHorseIds: Function;
  allHorseIds: any[];
  isLoadingHorses: boolean;
}

export const returnMarketplaceItems = async (native, account): Promise<IFetchMarketItems[]> => {
  let marketplaceItems: IFetchMarketItems[] = await vanillaWalletStore?.getState()?.getMarketplaceHorsesForSale(native);
  marketplaceItems = marketplaceItems.filter(m => m.sold == false && m.seller.toLowerCase() == account.toLowerCase());
  //console.log('marketplace item result, ', marketplaceItems);
  return marketplaceItems;
};

export const getHorsesFromWallet = async (Moralis, chainId): Promise<GetNFTsForContractResultModel[]> => {
  const horseTokenAddress = await vanillaContractAddressStore?.getState()?.getContractAddress(ContractTypeEnum.Horse);
  const horsesFromWallet = await vanillaWalletStore
    ?.getState()
    ?.getAllNFTsForContract(Moralis, horseTokenAddress, chainId);
  //console.log('horses from wallet result, ', horsesFromWallet);
  return horsesFromWallet;
};

export const useHorsesNFTTokensStore = create<IHorsesNFTTokensState>((set, get) => ({
  allHorseIds: get()?.allHorseIds || [],
  //hasHorses: (get()?.allHorseIds && get.length > 0) || false, // not working
  hasHorses: get()?.hasHorses || false,
  isLoadingHorses: get()?.isLoadingHorses || false,
  resetHorseIds: () => {
    set({ isLoadingHorses: false });
    set({ hasHorses: false });
    set({ allHorseIds: [] });
  },
  getAllHorseIds: async (Moralis, chainId, native, account) => {
    try {
      set({ isLoadingHorses: true });
      let nftTokenIdsFromUserWallet = [];
      const horsesFromWallet = await getHorsesFromWallet(Moralis, chainId);
      const horseIds: string[] = ([] =
        horsesFromWallet
          ?.sort((a, b) => moment(a.last_metadata_sync).diff(b.last_metadata_sync, 'seconds'))
          .map(h => h.token_id) || []);
      const marketplaceItems = await returnMarketplaceItems(native, account);
      const syndicatedTokens = await getAllSyndicatedTokensIdForUserWallet(account);
      //console.log('syndicated tokens', syndicatedTokens);

      horseIds.forEach(h => {
        nftTokenIdsFromUserWallet.push(h);
      });

      marketplaceItems.forEach(mktItem => {
        if (!nftTokenIdsFromUserWallet.includes(mktItem.tokenId)) {
          nftTokenIdsFromUserWallet.push(mktItem.tokenId);
        }
      });
      if (syndicatedTokens) {
        syndicatedTokens.forEach(syndicateToken => {
          if (!nftTokenIdsFromUserWallet.includes(syndicateToken)) {
            nftTokenIdsFromUserWallet.push(syndicateToken);
          }
        });
      }
      nftTokenIdsFromUserWallet = nftTokenIdsFromUserWallet.sort(function (a, b) {
        return b - a;
      });
      //console.log('horse tokenId list', nftTokenIdsFromUserWallet);
      set({ allHorseIds: nftTokenIdsFromUserWallet });
      set({ hasHorses: nftTokenIdsFromUserWallet && nftTokenIdsFromUserWallet.length > 0 });
      set({ isLoadingHorses: false });
      return nftTokenIdsFromUserWallet;
    } catch (error) {
      console.log(error);
      set({ isLoadingHorses: false });
      return null;
    }
  },
}));

const initialTableState = {
  data: [],
  isLoading: false,
  isTableActive: false,
  error: null,
  message: '',
};

export const reducer = (state, action) => {
  switch (action.type) {
    case REQUEST_STARTED:
      return {
        ...state,
        isLoading: true,
        error: null,
        isTableActive: true,
      };
    case REQUEST_SUCCESSFUL:
      return {
        ...state,
        isLoading: false,
        error: null,
        data: action.data,
      };
    case REQUEST_FAILED:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };

    case RESET_TABLE:
      return {
        ...initialTableState,
      };

    default:
      return state;
  }
};

export const REQUEST_STARTED = 'REQUEST_STARTED';
export const REQUEST_SUCCESSFUL = 'REQUEST_SUCCESSFUL';
export const REQUEST_FAILED = 'REQUEST_FAILED';
export const RESET_TABLE = 'RESET_REQUEST';

function useOwnedHorses(isInitOnMount = true) {
  const isMounted = useRef<boolean>(false);
  const { isAuthenticated, Moralis, chainId, account } = useMoralis();
  const { native } = useMoralisWeb3Api();
  const [state, dispatch] = useReducer(reducer, initialTableState);
  const { allHorseIds, getAllHorseIds, hasHorses, resetHorseIds, isLoadingHorses } = useHorsesNFTTokensStore();

  const tableState = useMemo(() => state, [state]);

  //const hasHorses = useMemo(() => allHorseIds && allHorseIds.length > 0, [allHorseIds]);

  const init = useCallback(async () => {
    resetHorseIds(); //clear on each start?
    return await getAllHorseIds(Moralis, chainId, native, account);
  }, [Moralis, account, chainId, getAllHorseIds, native, resetHorseIds]);

  //this will only get called initially because has horses will be true
  //need to reset if a different farm ? store in Zustand? allow argument?
  useEffect(() => {
    if (!isMounted.current && isAuthenticated && isInitOnMount && !isLoadingHorses && !hasHorses) {
      isMounted.current = true;
      init()
        .then(ids => {
          //console.log('GET HORSE IDS', ids);
        })
        .catch(error => {
          console.log('error', error);
        });
    }
  }, [hasHorses, init, isAuthenticated, isInitOnMount, isLoadingHorses]);

  const fetchHorses = useCallback(async () => {
    dispatch({ type: REQUEST_STARTED });

    await gethorseNFTVWStable(allHorseIds)
      .then(horseResponse => {
        if (horseResponse) {
          const horsesData = convertHorseData(horseResponse.items);
          dispatch({ type: REQUEST_SUCCESSFUL, data: horsesData });
        }
      })
      .catch(error => {
        dispatch({ type: REQUEST_FAILED, error: error });
        console.log('error', error);
      });
    //.finally(() => setIsLoading(false));
  }, [allHorseIds]);

  const resetTable = useCallback(() => dispatch({ type: RESET_TABLE }), []);
  return {
    tableState,
    resetTable,
    fetchHorses,
    initHorseIds: init,
    hasHorses,
    allHorseIds,
  };
}

export default useOwnedHorses;
