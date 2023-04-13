import { useMemo, useEffect, useState, useRef } from 'react';
import { useMoralis } from 'react-moralis';
import useWalletStore from '@hooks/useWalletStore';
import { getTokenOffersByCollectionType } from '@common/api/portal/marketplace';
import { getTabsByType } from './nft-tabs-cfg';
import type { NFTTabCFg } from './nft-tabs-cfg';
import { isOfferDisabled } from '@common/contractStateCfg';

async function getTokenOffers(currentNFT) {
  const tokenOffers = await getTokenOffersByCollectionType(currentNFT.collectionType, currentNFT.tokenId);
  //console.log('GET OFFERS', tokenOffers);
  return tokenOffers;
}
//get offers - reset changes on tokenId change
// allow return empty if not enabled
export function useOffers(currentNFT, isReset = false) {
  const [offers, setOffers] = useState<IOffer[]>([]);
  const isMounted = useRef<boolean>(false);

  useEffect(() => {
    if (!isOfferDisabled && currentNFT?.tokenId && !isMounted.current) {
      isMounted.current = !isReset;
      getTokenOffers(currentNFT).then(offers => setOffers(offers));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNFT.tokenId]);

  return {
    offers,
  };
}

//get token price
export function useTokenPrice() {
  const isMounted = useRef<boolean>(false);
  const [baseTokenPrice, setBaseTokenPrice] = useState<any>();
  const { Moralis, isInitialized } = useMoralis();
  const { getTokenPrice } = useWalletStore();

  useEffect(() => {
    if (isInitialized && !isMounted.current) {
      isMounted.current = true;
      moralisGetTokenPrice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  const moralisGetTokenPrice = async () => {
    const tokenPrice = await getTokenPrice(Moralis);
    //console.log('GET TOKEN PRICE', tokenPrice);
    setBaseTokenPrice(tokenPrice);
  };

  return {
    baseTokenPrice,
  };
}

//get tab set based on NFTType; id cause rerun
export function useNFTTabsCfg(NFTType, id = null): NFTTabCFg[] {
  const NFTTabsCfg = useMemo(() => {
    const tabs = NFTType ? getTabsByType(NFTType) : [];
    //console.log('SETTING TABS CFG', tabs, NFTType, id);
    return tabs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [NFTType, id]);

  return NFTTabsCfg;
}
