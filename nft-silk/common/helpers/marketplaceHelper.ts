import { ContractTypeEnum } from '@hooks/useContractAddressStore';

export const getNftsForSaleFromMarketplacePerCollectionType = async (
  walletAddress: string,
  contractType: ContractTypeEnum,
  web3API,
  getMarketplaceItemsForSale
) => {
  let marketplaceItems: IFetchMarketItems[] = await getMarketplaceItemsForSale(web3API, contractType);
  if (marketplaceItems) {
    //console.log('market items list', marketplaceItems);
    marketplaceItems = marketplaceItems.filter(
      m => m.sold == false && m.seller.toLowerCase() == walletAddress.toLowerCase()
    );

    return marketplaceItems;
  } else {
    return undefined;
  }
};

export const getNftForSaleFromMarketplacePerTokenIdAndCollectionType = async (
  tokenId: string,
  walletAddress: string,
  contractType: ContractTypeEnum,
  web3API,
  getMarketplaceItemsForSale
) => {
  let marketplaceItems: IFetchMarketItems[] = await getNftsForSaleFromMarketplacePerCollectionType(
    walletAddress,
    contractType,
    web3API,
    getMarketplaceItemsForSale
  );
  if (marketplaceItems) {
    //console.log('market items before the filter', marketplaceItems);
    marketplaceItems = marketplaceItems.filter(m => m.tokenId == tokenId);
    //console.log('market items after the filter', marketplaceItems);
    return marketplaceItems;
  } else {
    return undefined;
  }
};

export const nftForSaleHasDifferentOwner = async (
  tokenId,
  walletAddress: string,
  contractType: ContractTypeEnum,
  web3API,
  getMarketplaceItemsForSale
) => {
  let marketplaceItems: IFetchMarketItems[] = await getMarketplaceItemsForSale(web3API, contractType);
  if (marketplaceItems) {
    marketplaceItems = marketplaceItems.filter(
      m => m.sold == false && m.tokenId == tokenId && m.seller.toLowerCase() != walletAddress.toLowerCase()
    );

    if (marketplaceItems && marketplaceItems.length > 0) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export const nftCanDisplayName = (contractType: ContractTypeEnum): boolean => {
  return contractType == ContractTypeEnum.Horse ||
    contractType == ContractTypeEnum.HorsePartnership ||
    contractType == ContractTypeEnum.HorseGovernance
    ? true
    : false;
};
