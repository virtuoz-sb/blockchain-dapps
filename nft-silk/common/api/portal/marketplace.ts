import api from '@common/api';
import { CoinTypeEnum } from '@common/enum/CoinTypeEnum';
import { getNftMarketplaceDetailRoute } from '@common/getInformationPerNftCollectionEnum';
import { ContractTypeEnum } from '@hooks/useContractAddressStore';

export const getAllCollections = async (ownerWalletAddress = '') => {
  const { data: collectionModel } = await api.get<getAllCollections[]>(
    `/api/MarketPlace/GetAllCollections/${ownerWalletAddress}`
  );

  if (collectionModel) {
    return collectionModel;
  } else {
    return undefined;
  }
};

export const getCollectionTotalsCountModel = async (
  contractType: ContractTypeEnum,
  ownerWalletAddress: string
): Promise<IGetCollectionTotalsCountResponseModel> => {
  const url = '/api/MarketPlace/GetCollectionTotalsCountModel';
  const payload = {
    contractType: contractType,
    ownerWalletAddress: ownerWalletAddress,
  };
  // console.log('getCollectionTotalsCountModel payload', payload);

  let { data: collectionTotals } = await api.post<IGetCollectionTotalsCountResponseModel>(url, payload);

  // console.log('getCollectionTotalsCountModel response', collectionTotals);

  return collectionTotals || undefined;
};

export const gethorseNFTVWStable = async (
  horseIds: string[],
  pageSize = 9999,
  userWalletAddress: string = ''
): Promise<IGetHorseNftVWStableModel> => {
  let payload = '';

  if (horseIds.length > 1) {
    payload = horseIds.join(',');
  } else {
    payload = horseIds[0];
  }

  const { data: horseModel } = await api.get<IGetHorseNftVWStableModel>(
    `/api/MarketPlace/horseNFTVW/stable?Ids=${payload}&PageSize=${pageSize}&walletAddress=${userWalletAddress}`
  );

  if (horseModel) {
    return horseModel;
  } else {
    return undefined;
  }
};

export const getHorseInfo = async (horseId: number): Promise<IGetHorseNFTVWItemModel> => {
  const { data: horseModel } = await api.get<IGetHorseNFTVWItemModel>(`/api/MarketPlace/horseNFTVW/${horseId}`);

  if (horseModel) {
    return horseModel;
  } else {
    return undefined;
  }
};

export const getTokenMetadataByCollectionType = async (contractType: ContractTypeEnum, tokenId): Promise<any> => {
  const url = '/api/MarketPlace/GetTokenMetadataByCollectionType';
  const payload = {
    contractType: contractType,
    tokenId: tokenId,
  };
  console.log('getTokenMetadataByCollectionType payload', payload);

  switch (contractType) {
    case ContractTypeEnum.Farm: {
      const { data: tokenMetadata } = await api.post<IFarmNFTsVWEntityModel[]>(url, payload);
      return tokenMetadata || undefined;
    }
    case ContractTypeEnum.Land: {
      const { data: tokenMetadata } = await api.post<ILandNFTsVWEntityModel[]>(url, payload);
      return tokenMetadata || undefined;
    }
    case ContractTypeEnum.Horse: {
      const { data: tokenMetadata } = await api.post<IHorseNFTsVWEntityModel[]>(url, payload);
      return tokenMetadata || undefined;
    }
    case ContractTypeEnum.HorseGovernance: {
      const { data: tokenMetadata } = await api.post<ISyndicateEntityModel[]>(url, payload);
      return tokenMetadata || undefined;
    }
    case ContractTypeEnum.HorsePartnership: {
      const { data: tokenMetadata } = await api.post<ISyndicateEntityModel[]>(url, payload);
      return tokenMetadata || undefined;
    }
    default: {
      return undefined;
    }
  }
};

export const getNftsMetadataForSellByCollectionType = async (
  contractType: ContractTypeEnum,
  walletAddress = undefined
) => {
  const url = '/api/MarketPlace/GetNftsMetadataForSellByCollectionType';
  const payload = {
    contractType: contractType,
    walletAddress: walletAddress,
  };
  console.log('getNftsMetadataForSellByCollectionType payload', payload);

  switch (contractType) {
    case ContractTypeEnum.Farm: {
      const { data: tokenMetadata } = await api.post<IFarmNFTsVWEntityModel[]>(url, payload);
      return tokenMetadata || undefined;
    }
    case ContractTypeEnum.Land: {
      const { data: tokenMetadata } = await api.post<ILandNFTsVWEntityModel[]>(url, payload);
      return tokenMetadata || undefined;
    }
    case ContractTypeEnum.Horse: {
      const { data: tokenMetadata } = await api.post<IHorseNFTsVWEntityModel[]>(url, payload);
      return tokenMetadata || undefined;
    }
    default: {
      return undefined;
    }
  }
};

export const getTokenTypeByCollectionType = async (contractType: ContractTypeEnum): Promise<ITokenTypeEntityModel> => {
  const url = '/api/MarketPlace/GetTokenTypeByCollectionType';
  const payload = {
    contractType: contractType,
  };
  console.log('getTokenTypeByCollectionType payload', payload);

  let { data: tokenType } = await api.post<ITokenTypeEntityModel>(url, payload);

  return tokenType || undefined;
};

export const getAllSyndicatedTokensIdForUserWallet = async (userWalletAddress: string = ''): Promise<[]> => {
  const { data: syndicatedTokens } = await api.get<[]>(
    `/api/MarketPlace/GetAllSyndicatedTokensIdForUserWallet?walletAddress=${userWalletAddress}`
  );

  if (syndicatedTokens) {
    return syndicatedTokens;
  } else {
    return undefined;
  }
};

export const buyNFTNotification = async (
  sellerWalletAddress,
  newOwnerUserRegistrationId,
  contractName,
  tokenId,
  tokenName,
  tokenPrice,
  coinType,
  tokenType: ContractTypeEnum,
  tokenImageThumbnailUrl
) => {
  const url = '/api/MarketPlace/BuyNFTNotification';
  const tokenMarketplacePartialUrl = getNftMarketplaceDetailRoute(tokenType, tokenId);
  const payload: IBuyNFTNotificationModel = {
    sellerWalletAddress: sellerWalletAddress,
    newOwnerUserRegistrationId: newOwnerUserRegistrationId,
    contractName: contractName,
    tokenId: tokenId.toString(),
    tokenName: tokenName,
    tokenPrice: tokenPrice,
    coinType: coinType,
    tokenImageThumbnailUrl: tokenImageThumbnailUrl,
    tokenMarketplacePartialUrl: tokenMarketplacePartialUrl,
  };
  console.log('BuyNFTNotification payload', payload);

  let { data: notificationResponse } = await api.post<string>(url, payload);

  return notificationResponse || undefined;
};

export const sellNFTNotification = async (
  userRegistrationId,
  contractName,
  tokenId,
  tokenName,
  tokenPrice,
  coinType,
  tokenType: ContractTypeEnum,
  tokenImageThumbnailUrl
) => {
  const url = '/api/MarketPlace/SellNFTNotification';
  const tokenMarketplacePartialUrl = getNftMarketplaceDetailRoute(tokenType, tokenId);
  const payload: ISellNFTNotificationModel = {
    userRegistrationId: userRegistrationId,
    contractName: contractName,
    tokenId: tokenId.toString(),
    tokenName: tokenName,
    tokenPrice: tokenPrice,
    coinType: coinType,
    tokenImageThumbnailUrl: tokenImageThumbnailUrl,
    tokenMarketplacePartialUrl: tokenMarketplacePartialUrl,
  };
  console.log('SellNFTNotification payload', payload);

  let { data: notificationResponse } = await api.post<string>(url, payload);

  return notificationResponse || undefined;
};

export const cancelNFTSaleNotification = async (
  userRegistrationId,
  contractName,
  tokenId,
  tokenName,
  tokenType: ContractTypeEnum,
  tokenImageThumbnailUrl
) => {
  const url = '/api/MarketPlace/CancelNFTSaleNotification';
  const tokenMarketplacePartialUrl = getNftMarketplaceDetailRoute(tokenType, tokenId);
  const payload: ICancelNFTSaleNotificationModel = {
    userRegistrationId: userRegistrationId,
    contractName: contractName,
    tokenId: tokenId.toString(),
    tokenName: tokenName,
    tokenImageThumbnailUrl: tokenImageThumbnailUrl,
    tokenMarketplacePartialUrl: tokenMarketplacePartialUrl,
  };
  console.log('CancelNFTSaleNotification payload', payload);

  let { data: notificationResponse } = await api.post<string>(url, payload);

  return notificationResponse || undefined;
};

export const syndicateNFT = async (userRegistrationId, tokenId, tokenType: ContractTypeEnum) => {
  const url = '/api/MarketPlace/SyndicateNFT';
  const tokenMarketplaceUrl = getNftMarketplaceDetailRoute(tokenType, tokenId);
  const payload: ISyndicateNFT = {
    userRegistrationId: userRegistrationId,
    tokenId: tokenId.toString(),
    tokenMarketplaceUrl: tokenMarketplaceUrl,
  };
  console.log('syndicateNFT payload', payload);

  let { data: notificationResponse } = await api.post<string>(url, payload);

  return notificationResponse || undefined;
};

export const reconstituteNFT = async (userRegistrationId, tokenId, tokenType: ContractTypeEnum) => {
  const url = '/api/MarketPlace/ReconstituteNFT';
  const tokenMarketplaceUrl = getNftMarketplaceDetailRoute(tokenType, tokenId);
  const payload: IReconstituteNFT = {
    userRegistrationId: userRegistrationId,
    tokenId: tokenId.toString(),
    tokenMarketplaceUrl: tokenMarketplaceUrl,
  };
  console.log('reconstituteNFT payload', payload);

  let { data: notificationResponse } = await api.post<string>(url, payload);

  return notificationResponse || undefined;
};

export const getAllHorseAndGovernanceTokensForUserWallet = async (userWalletAddress: string = ''): Promise<[]> => {
  const { data: syndicatedTokens } = await api.get<[]>(
    `/api/MarketPlace/GetAllHorseAndGovernanceTokensForUserWallet?walletAddress=${userWalletAddress}`
  );

  if (syndicatedTokens) {
    return syndicatedTokens;
  } else {
    return undefined;
  }
};

export const getStallFarmData = async (farmId: number) => {
  const { data } = await api.get<IFarmStakedHorseModelResponse>(`/api/MarketPlace/GetStallFarmData/${farmId}`);
  if (data.items && data.items.length > 0) {
    if (data.items[0].horsetokenID !== 0) {
      const stakedHorses = data.items.map((horseInfo, index) => {
        const stakedHorse: IStakedHorse = {
          id: horseInfo.horsetokenID,
          horsetokenID: String(horseInfo.horsetokenID), //is a real horse
          stall: `#${index + 1}`,
          name: horseInfo.horseName,
          damName: horseInfo.damName,
          price: `${horseInfo.auctionPrice}`,
          usdPrice: `${horseInfo.auctionPrice}`,
        };
        return stakedHorse;
      });

      if (data.items[0].numberOfStallsOpen > 0) {
        for (let i = 0; i < data.items[0].numberOfStallsOpen; i++) {
          stakedHorses.push({
            stall: `#${data.items[0].numberOfStallsTaken + i + 1}`,
            damName: '-',
            usdPrice: '-',
            name: '-',
            id: i + 1,
            horsetokenID: 0, //not real horse; available stall
            price: '-',
          });
        }
      }

      return {
        stakedHorses: stakedHorses,
        openSlots: data.items[0].numberOfStallsOpen,
      };
    } else {
      let emptyStalls = [];
      for (let i = 0; i < data.items[0].numberOfStallsOpen; i++) {
        emptyStalls.push({
          stall: `#${data.items[0].numberOfStallsTaken + i + 1}`,
          damName: '-',
          usdPrice: '-',
          name: '-',
          id: i + 1,
          horsetokenID: 0, //not real horse; available stall
          price: '-',
        });
      }
      return {
        stakedHorses: emptyStalls,
        openSlots: data.items[0].numberOfStallsOpen,
      };
    }
  } else {
    return null;
  }
};

export const checkIfNftHasDifferentOwner = async (
  contractType: ContractTypeEnum,
  tokenId,
  notInWalletAddress
): Promise<boolean> => {
  const url = '/api/MarketPlace/CheckIfNftHasDifferentOwner';
  const payload = {
    contractType: contractType,
    tokenId: tokenId,
    notInWalletAddress: notInWalletAddress,
  };
  // console.log('checkIfNftHasDifferentOwner payload', payload);

  const { data: hasDifferentOwner } = await api.post<boolean>(url, payload);

  // console.log('checkIfNftHasDifferentOwner response', hasDifferentOwner);

  return hasDifferentOwner;
};

export const makeOfferNFTNotification = async (
  offerSentFromWalletAddress,
  ownersList,
  contractType: ContractTypeEnum,
  contractName,
  tokenId,
  tokenName,
  tokenPrice,
  coinType: CoinTypeEnum,
  tokenImageThumbnailUrl
) => {
  const url = '/api/MarketPlace/MakeOfferNFTNotification';
  const tokenMarketplacePartialUrl = getNftMarketplaceDetailRoute(contractType, tokenId);
  const payload: IMakeOfferNFTNotificationModel = {
    offerSentFromWalletAddress,
    ownersList,
    contractName,
    tokenId,
    tokenName,
    tokenPrice,
    coinType,
    tokenImageThumbnailUrl,
    tokenMarketplacePartialUrl,
  };
  console.log('makeOfferNFTNotification notification payload', payload);

  let { data: notificationResponse } = await api.post<string>(url, payload);

  console.log('makeOfferNFTNotification notification response', notificationResponse);

  return notificationResponse || undefined;
};

export const getTokenOffersByCollectionType = async (contractType: ContractTypeEnum, tokenId) => {
  const url = '/api/MarketPlace/GetTokenOffersByCollectionType';
  const payload = {
    contractType: contractType,
    tokenId: tokenId,
  };
  console.log('getTokenOffersByCollectionType payload', payload);

  let { data: tokenOffers } = await api.post<IGetTokenOffersByCollectionTypeResponseModel[]>(url, payload);

  console.log('getTokenOffersByCollectionType response', tokenOffers);

  return tokenOffers || undefined;
};

export const acceptOfferSendNotification = async (newNftOwnerWalletAddress, tokenId, tokenType: ContractTypeEnum) => {
  const url = '/api/MarketPlace/AcceptOffer';
  const tokenMarketplaceUrl = getNftMarketplaceDetailRoute(tokenType, tokenId);
  const payload = {
    newNftOwnerWalletAddress: newNftOwnerWalletAddress,
    tokenId: tokenId.toString(),
    tokenMarketplaceUrl: tokenMarketplaceUrl,
  };
  console.log('acceptOffer notification payload', payload);

  let { data: notificationResponse } = await api.post<string>(url, payload);

  console.log('acceptOffer notification response', payload);

  return notificationResponse || undefined;
};

export const declineOfferSendNotification = async (
  offerNftOwnerWalletAddress,
  tokenId,
  tokenType: ContractTypeEnum
) => {
  const url = '/api/marketplace/declineOffer';
  const tokenMarketplaceUrl = getNftMarketplaceDetailRoute(tokenType, tokenId);
  const payload = {
    offerNftOwnerWalletAddress,
    tokenId: tokenId.toString(),
    tokenMarketplaceUrl: tokenMarketplaceUrl,
  };

  try {
    let { data: notificationResponse } = await api.post<string>(url, payload);

    return notificationResponse;
  } catch (error) {}

  return undefined;
};

export const requestToStableHorseNotification = async (farmOwnerWalletAddress, farmTokenId) => {
  const url = '/api/MarketPlace/RequestToStableHorseNotification';
  const tokenMarketplaceUrl = getNftMarketplaceDetailRoute(ContractTypeEnum.Farm, farmTokenId);
  const payload = {
    farmOwnerWalletAddress: farmOwnerWalletAddress,
    farmTokenId: farmTokenId,
    farmMarketplaceUrl: tokenMarketplaceUrl,
  };
  console.log('requestToStableHorseNotification payload', payload);

  let { data: notificationResponse } = await api.post<string>(url, payload);

  return notificationResponse || undefined;
};

export const acceptStableRequestNotification = async (
  farmTokenId,
  farmName,
  requestorOwnerWalletAddress,
  requestorHorseTokenId
) => {
  const url = '/api/MarketPlace/AcceptStableRequestNotification';
  const tokenMarketplaceUrl = getNftMarketplaceDetailRoute(ContractTypeEnum.Farm, farmTokenId);
  const payload = {
    farmName: farmName,
    requestorOwnerWalletAddress: requestorOwnerWalletAddress,
    requestorHorseTokenId: requestorHorseTokenId,
    farmMarketplaceUrl: tokenMarketplaceUrl,
  };
  console.log('acceptStableRequestNotification payload', payload);

  let { data: notificationResponse } = await api.post<string>(url, payload);

  return notificationResponse || undefined;
};

export const declineStableRequestNotification = async (
  farmTokenId,
  farmName,
  requestorOwnerWalletAddress,
  requestorHorseTokenId
) => {
  const url = '/api/MarketPlace/DeclineStableRequestNotification';
  const tokenMarketplaceUrl = getNftMarketplaceDetailRoute(ContractTypeEnum.Farm, farmTokenId);
  const payload = {
    farmName: farmName,
    requestorOwnerWalletAddress: requestorOwnerWalletAddress,
    requestorHorseTokenId: requestorHorseTokenId,
    farmMarketplaceUrl: tokenMarketplaceUrl,
  };
  console.log('declineStableRequestNotification payload', payload);

  let { data: notificationResponse } = await api.post<string>(url, payload);

  return notificationResponse || undefined;
};

export const deStablingHorseNotification = async (
  farmTokenId,
  farmName,
  farmOwnerWalletAddress,
  requestorOwnerWalletAddress,
  requestorHorseTokenId
) => {
  const url = '/api/MarketPlace/DeStablingHorseNotification';
  const tokenMarketplaceUrl = getNftMarketplaceDetailRoute(ContractTypeEnum.Farm, farmTokenId);
  const payload = {
    farmName: farmName,
    farmOwnerWalletAddress: farmOwnerWalletAddress,
    requestorOwnerWalletAddress: requestorOwnerWalletAddress,
    requestorHorseTokenId: requestorHorseTokenId,
    farmMarketplaceUrl: tokenMarketplaceUrl,
  };
  console.log('deStablingHorseNotification payload', payload);

  let { data: notificationResponse } = await api.post<string>(url, payload);

  return notificationResponse || undefined;
};
