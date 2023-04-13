import { useMemo, useCallback, useReducer, useState } from 'react';
import moment from 'moment';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import useWalletStore from '@hooks/useWalletStore';
import { getAllCollections, gethorseNFTVWStable } from '@common/api/portal/marketplace';
import { fetchStabledHorses } from '@common/mock/mockStabledHorses';
import { convertHorseData } from '@components/horse-list';

export function useHorseNFTTokenIds() {
  const { isAuthenticated, isInitialized, Moralis, chainId, account } = useMoralis();
  const { native } = useMoralisWeb3Api();
  const { getContractAddress } = useContractAddressStore();
  const { getAllNFTsForContract, getMarketplaceHorsesForSale } = useWalletStore();

  const [allHorseIds, setAllHorseIds] = useState([]);

  const returnMarketplaceItems = async (): Promise<IFetchMarketItems[]> => {
    let marketplaceItems: IFetchMarketItems[] = await getMarketplaceHorsesForSale(native);
    marketplaceItems = marketplaceItems.filter(m => m.sold == false && m.seller.toLowerCase() == account.toLowerCase());
    //console.log('marketplace item result, ', marketplaceItems);
    return marketplaceItems;
  };

  const getUserHorseTokenIds = async (): Promise<any> => {
    let nftTokenIdsFromUserWallet = [];
    const horseTokenAddress = await getContractAddress(ContractTypeEnum.Horse);
    const horsesFromWallet = await getAllNFTsForContract(Moralis, horseTokenAddress, chainId);
    const horseIds: [] =
      horsesFromWallet
        ?.sort((a, b) => moment(a.last_metadata_sync).diff(b.last_metadata_sync, 'seconds'))
        .map(h => h.token_id) || [];
    // console.log('horses ids from wallet result', avatarsFromWallet);
    const marketplaceItems = await returnMarketplaceItems();

    horseIds.forEach(h => {
      nftTokenIdsFromUserWallet.push(h);
    });

    marketplaceItems.forEach(mktItem => {
      if (!nftTokenIdsFromUserWallet.includes(mktItem.tokenId)) {
        nftTokenIdsFromUserWallet.push(mktItem.tokenId);
      }
    });
    console.log('horse tokenId list', nftTokenIdsFromUserWallet);

    nftTokenIdsFromUserWallet = nftTokenIdsFromUserWallet.sort(function (a, b) {
      return b - a;
    });
    setAllHorseIds(nftTokenIdsFromUserWallet);
    return nftTokenIdsFromUserWallet;
  };

  return {
    allHorseIds,
    getHorseIds: getUserHorseTokenIds,
  };
}

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

function useHorses() {
  const [state, dispatch] = useReducer(reducer, initialTableState);

  const tableState = useMemo(() => state, [state]);

  const fetchHorses = useCallback(async () => {
    dispatch({ type: REQUEST_STARTED });

    await fetchStabledHorses()
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
  }, []);

  const resetTable = useCallback(() => dispatch({ type: RESET_TABLE }), []);

  return {
    tableState,
    resetTable,
    fetchHorses,
  };
}
export default useHorses;
