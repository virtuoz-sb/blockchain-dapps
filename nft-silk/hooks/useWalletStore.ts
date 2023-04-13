import create from 'zustand';
import createVanilla from 'zustand/vanilla';
import { toNumber } from 'lodash-es';

import { getAbi } from '@common/abi';
import { vanillaStore as vanillaContractAddressStore, ContractTypeEnum } from '@hooks/useContractAddressStore';
import { getHorseInfo } from '@common/api/portal/marketplace';
import { getUserRegistrationByWallet } from '@common/api/portal/userRegistration';

const defaultChainId = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;
interface IWalletState {
  executeMoralisFunction: Function;
  getNFTTokens: Function;
  getNFTsForContract: Function;
  getAllNFTsForContract: Function;
  getNFTTokensOwners: Function;
  getAllNFTTokensOwners: Function;
  getNFTByTokenId: Function;
  getNFTMetadata: Function;
  getMarketplaceItemsForSale: Function;
  getMarketplaceAvatarsForSale: Function;
  getMarketplaceHorsesForSale: Function;
  getMarketplaceLandsForSale: Function;
  getMarketplaceFarmsForSale: Function;
  getTokenPrice: Function;
  getEthInUsd: Function;
  getEthInUsdWithoutTokenPrice: Function;
  getFloorPrice: Function;
  getTotalMarketplaceItems: Function;
  placeNFTForSell: Function;
  buyNFT: Function;
  approveTransactionsForAddress: Function;
  isTransactionsApprovedForAddress: Function;
  moralisReSyncMetadata: Function;
  getNftOwner: Function;
  getNftCollectionName: Function;
  stableHorse: Function;
  deStableHorse: Function;
  pollTransaction: Function;
  fractionalizeHorse: Function;
  reconstituteFractionalizedHorse: Function;
  getFarmParams: Function;
  makeOfferToNFT: Function;
  checkStableRequests: Function;
  approveStableRequest: Function;
  rejectStableRequest: Function;
  acceptOffer: Function;
  declineOffer: Function;
}

const useWalletStore = createVanilla<IWalletState>((set, get) => ({
  executeMoralisFunction: async (
    Moralis,
    contractAddressEnum: ContractTypeEnum,
    functionName,
    abi,
    params,
    chain = defaultChainId,
    withLog = false
  ): Promise<any> => {
    return new Promise<any>(async (resolve, reject) => {
      const contractAddress = await vanillaContractAddressStore?.getState()?.getContractAddress(contractAddressEnum);

      let result = undefined;

      const options = {
        params,
        chain,
        contractAddress,
        functionName,
        abi,
      };

      if (withLog) {
        console.log(`${functionName} (${contractAddress}) request`, options);
      }

      try {
        result = await Moralis.executeFunction(options);

        if (withLog) {
          console.log(`${functionName} (${contractAddress}) response`, result);
        }

        resolve(result);
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  },
  getNftCollectionName: async (Web3API, contractAddress): Promise<string> => {
    let result: string = undefined;

    const options = {
      chain: defaultChainId,
      address: contractAddress,
      function_name: 'name',
      abi: getAbi(ContractTypeEnum.Common)?.name,
    };

    console.log('getNftCollectionName options', options);

    try {
      result = await Web3API.runContractFunction(options);
      console.log('getNftCollectionName result', result);
    } catch (error) {
      console.log(error);
    }

    return result;
  },
  getNftOwner: async (Web3API, contractAddress, tokenId): Promise<string> => {
    let result: string = undefined;

    const options = {
      params: {
        tokenId: tokenId,
      },
      chain: defaultChainId,
      address: contractAddress,
      function_name: 'ownerOf',
      abi: getAbi(ContractTypeEnum.Common)?.ownerOf,
    };

    console.log('OwnerOf options', options);

    try {
      result = await Web3API.runContractFunction(options);
      console.log('OwnerOf result', result);
    } catch (error) {
      console.log(error);
    }

    return result ? result.toLowerCase() : undefined;
  },
  moralisReSyncMetadata: async (Moralis, tokenAddress, tokenId) => {
    let result = undefined;

    const options = {
      address: tokenAddress,
      token_id: tokenId,
    };

    try {
      result = await Moralis.Web3API.token.reSyncMetadata(options);
    } catch (error) {
      console.log(error);
    }

    return result;
  },
  isTransactionsApprovedForAddress: async (
    Web3API,
    walletId,
    contractAddressEnum: ContractTypeEnum,
    operatorAddressEnum: ContractTypeEnum = ContractTypeEnum.Marketplace
  ): Promise<boolean> => {
    const operatorAddress = await vanillaContractAddressStore?.getState()?.getContractAddress(operatorAddressEnum);

    const contractAddress = await vanillaContractAddressStore?.getState()?.getContractAddress(contractAddressEnum);

    let isTransactionsApprovedForAddressResponse = undefined;

    const options = {
      params: {
        owner: walletId,
        operator: operatorAddress,
      },
      chain: defaultChainId,
      address: contractAddress,
      function_name: 'isApprovedForAll',
      abi: getAbi(ContractTypeEnum.Common)?.isApprovedForAll,
    };

    console.log(options);

    try {
      isTransactionsApprovedForAddressResponse = await Web3API.runContractFunction(options);
      console.log('is transactions approved response', isTransactionsApprovedForAddressResponse);
    } catch (error) {
      console.log(error);
    }

    return isTransactionsApprovedForAddressResponse;
  },
  approveTransactionsForAddress: async (
    Moralis,
    contractAddressEnum: ContractTypeEnum,
    operatorAddressEnum: ContractTypeEnum = ContractTypeEnum.Marketplace
  ) => {
    const operatorAddress = await vanillaContractAddressStore?.getState()?.getContractAddress(operatorAddressEnum);
    const contractAddress = await vanillaContractAddressStore?.getState()?.getContractAddress(contractAddressEnum);

    let approveTransactionsForAddressResponse = undefined;

    const options = {
      params: {
        operator: operatorAddress,
        approved: true,
      },
      chain: defaultChainId,
      contractAddress: contractAddress,
      functionName: 'setApprovalForAll',
      abi: getAbi(ContractTypeEnum.Common)?.setApprovalForAll,
    };

    console.log(options);

    try {
      approveTransactionsForAddressResponse = await Moralis.executeFunction(options);
      console.log('approve transactions for address response', approveTransactionsForAddressResponse);
    } catch (error) {
      console.log(error);
    }

    return approveTransactionsForAddressResponse || undefined;
  },
  stableHorse: async (Moralis, horseID, farmID, stableTerm) => {
    const farmContractAddress = await vanillaContractAddressStore
      ?.getState()
      ?.getContractAddress(ContractTypeEnum.Farm);

    let stableHorseResponse = undefined;

    const options = {
      params: {
        horseID: horseID,
        farmID: farmID,
        stableTerm: stableTerm,
      },
      chain: defaultChainId,
      contractAddress: farmContractAddress,
      functionName: 'stableHorse',
      abi: getAbi(ContractTypeEnum.Farm)?.stableHorse,
    };

    console.log(options);

    try {
      stableHorseResponse = await Moralis.executeFunction(options);
      console.log('stable horse response', stableHorseResponse);
    } catch (error) {
      console.log(error);
      if (error?.code === 4001) {
        return error;
      }
    }

    return stableHorseResponse || undefined;
  },
  deStableHorse: async (Moralis, horseID) => {
    const farmContractAddress = await vanillaContractAddressStore
      ?.getState()
      ?.getContractAddress(ContractTypeEnum.Farm);

    let deStableHorseResponse = undefined;

    const options = {
      params: {
        horseID: horseID,
      },
      chain: defaultChainId,
      contractAddress: farmContractAddress,
      functionName: 'destable',
      abi: getAbi(ContractTypeEnum.Farm)?.destable,
    };

    console.log('DESTABLE OPTIONS', options);

    try {
      deStableHorseResponse = await Moralis.executeFunction(options);
      console.log('DESTABLE horse response', deStableHorseResponse);
    } catch (error) {
      console.log(error);
      if (error?.code === 4001) {
        return error;
      }
    }

    return deStableHorseResponse || undefined;
  },
  getFarmParams: async (Moralis, farmID) => {
    const farmContractAddress = await vanillaContractAddressStore
      ?.getState()
      ?.getContractAddress(ContractTypeEnum.Farm);

    let farmParams = undefined;

    const options = {
      params: {
        '': farmID,
      },
      chain: defaultChainId,
      contractAddress: farmContractAddress,
      functionName: 'farmParams',
      abi: getAbi(ContractTypeEnum.Farm)?.farmParams,
    };

    console.log(options);

    try {
      farmParams = await Moralis.executeFunction(options);
      console.log('farmParams response', farmParams);
      if (farmParams) {
        return {
          destablingFee: parseInt(farmParams.destablingFee._hex, 16) / Math.pow(10, 18),
          maxTerm: parseInt(farmParams.maxTerm._hex, 16),
          minTerm: parseInt(farmParams.minTerm._hex, 16),
          openFarm: farmParams.openFarm,
          ownerFee: parseInt(farmParams.ownerFee._hex, 16),
          stableID: parseInt(farmParams.stableID._hex, 16),
        };
      }
    } catch (error) {
      console.log(error);
      return undefined;
    }

    return farmParams || undefined;
  },
  checkStableRequests: async (Moralis, farmID) => {
    const farmContractAddress = await vanillaContractAddressStore
      ?.getState()
      ?.getContractAddress(ContractTypeEnum.Farm);

    let stableRequestResponse = undefined;
    let stableRequests = [];

    const options = {
      params: {
        farmID: farmID,
      },
      chain: defaultChainId,
      contractAddress: farmContractAddress,
      functionName: 'checkStableRequests',
      abi: getAbi(ContractTypeEnum.Farm)?.checkStableRequests,
    };

    try {
      stableRequestResponse = await Moralis.executeFunction(options);
      //NOTE for each does not return async for each await - use for of
      //forEach() expects a synchronous function — it does not wait for promises.
      if (stableRequestResponse && stableRequestResponse.length > 0) {
        for (const [index, request] of stableRequestResponse.entries()) {
          const stableTermDate = new Date(parseInt(request.stableTerm._hex, 16));
          const horseInfo = await getHorseInfo(parseInt(request.horseID._hex, 16));
          const userRegistrationData = await getUserRegistrationByWallet(request.requester);
          const stableRequest = {
            id: index,
            horseID: parseInt(request.horseID._hex, 16),
            horseName: horseInfo.damName,
            farmID: parseInt(request.farmID._hex, 16),
            requester: (userRegistrationData && userRegistrationData.dynastyName) || request.requester,
            stableTerm: stableTermDate.toDateString(),
          };
          stableRequests.push(stableRequest);
        }
        return stableRequests;
      } else {
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  approveStableRequest: async (Moralis, farmID, requestNumber) => {
    const farmContractAddress = await vanillaContractAddressStore
      ?.getState()
      ?.getContractAddress(ContractTypeEnum.Farm);

    let approveRequestResponse = undefined;

    const options = {
      params: {
        farmID: farmID,
        reqnum: requestNumber,
      },
      chain: defaultChainId,
      contractAddress: farmContractAddress,
      functionName: 'approveRequest',
      abi: getAbi(ContractTypeEnum.Farm)?.approveRequest,
    };

    try {
      approveRequestResponse = await Moralis.executeFunction(options);
      console.log('approveStableRequest response', approveRequestResponse);
    } catch (error) {
      console.log(error);
      if (error?.code === 4001) {
        return error;
      }
    }

    return approveRequestResponse || undefined;
  },
  rejectStableRequest: async (Moralis, farmID, requestNumber) => {
    const farmContractAddress = await vanillaContractAddressStore
      ?.getState()
      ?.getContractAddress(ContractTypeEnum.Farm);

    let rejectStableRequestResponse = undefined;

    const options = {
      params: {
        farmID: farmID,
        reqnum: requestNumber,
      },
      chain: defaultChainId,
      contractAddress: farmContractAddress,
      functionName: 'removeRequest',
      abi: getAbi(ContractTypeEnum.Farm)?.removeRequest,
    };

    try {
      rejectStableRequestResponse = await Moralis.executeFunction(options);
      console.log('rejectStableRequest response', rejectStableRequestResponse);
    } catch (error) {
      console.log('REJECT STABLE ERROR', error);
      if (error?.code === 4001) {
        return error;
      }
    }

    return rejectStableRequestResponse || undefined;
  },
  placeNFTForSell: async (
    Moralis,
    contractAddressEnum: ContractTypeEnum,
    nftTokenId,
    nftPriceInETH,
    duration,
    quantity
  ) => {
    const marketPlaceAddress = await vanillaContractAddressStore
      ?.getState()
      ?.getContractAddress(ContractTypeEnum.Marketplace);

    const nftContractAddress = await vanillaContractAddressStore?.getState()?.getContractAddress(contractAddressEnum);

    const nftPriceInWEI = await Moralis.Units.ETH(nftPriceInETH);

    let placeNFTForSell = undefined;

    const options = {
      params: {
        nftContract: nftContractAddress,
        tokenID: nftTokenId,
        price: nftPriceInWEI,
        quantity: quantity,
        exp: duration,
      },
      chain: defaultChainId,
      contractAddress: marketPlaceAddress,
      functionName: 'createMarketItem',
      abi: getAbi(ContractTypeEnum.Marketplace)?.createMarketItem,
    };

    console.log('placeNFTForSell options', options);

    try {
      placeNFTForSell = await Moralis.executeFunction(options);
      console.log('placeNFTForSell response', placeNFTForSell);
    } catch (error) {
      console.log(error);
    }

    return placeNFTForSell || undefined;
  },
  cancelNFTForSale: async (Moralis, nftTokenId) => {
    return await get()?.executeMoralisFunction(
      Moralis,
      ContractTypeEnum.Marketplace,
      'deleteMarketItem',
      getAbi(ContractTypeEnum.Marketplace)?.deleteMarketItem,
      {
        itemID: nftTokenId,
      }
    );
  },
  buyNFT: async (Moralis, itemIdFromMarketplace, itemPriceInETH, quantity) => {
    const marketPlaceAddress = await vanillaContractAddressStore
      ?.getState()
      ?.getContractAddress(ContractTypeEnum.Marketplace);
    let buyNFTresponse = undefined;

    const options = {
      params: {
        itemID: itemIdFromMarketplace,
        quantity: quantity,
      },
      msgValue: Moralis.Units.ETH(itemPriceInETH),
      chain: defaultChainId,
      contractAddress: marketPlaceAddress,
      functionName: 'createMarketSale',
      abi: getAbi(ContractTypeEnum.Marketplace)?.createMarketSale,
    };

    console.log('buyNFT options', options);

    try {
      buyNFTresponse = await Moralis.executeFunction(options);
      console.log('buyNFT response', buyNFTresponse);
    } catch (error) {
      console.log(error);
    }

    return buyNFTresponse || undefined;
  },
  getFloorPrice: async (Moralis, Web3API, collectionType) => {
    let floorPriceInWei = null;

    const marketPlaceAddress = await vanillaContractAddressStore
      ?.getState()
      ?.getContractAddress(ContractTypeEnum.Marketplace);

    if (marketPlaceAddress == null) {
      // console.log('Warning - Marketplace contract not found.');
      return undefined;
    }

    const options = {
      params: {
        collectionType: collectionType,
      },
      chain: defaultChainId,
      address: marketPlaceAddress,
      function_name: 'floorPrices',
      abi: getAbi(ContractTypeEnum.Marketplace)?.floorPrices,
    };

    try {
      floorPriceInWei = await Web3API.runContractFunction(options);
      if (floorPriceInWei && floorPriceInWei > 0) {
        floorPriceInWei = parseFloat(Moralis.Units.FromWei(floorPriceInWei)).toFixed(4);
      }
      // console.log('Floor Price', floorPrice);
    } catch (error) {
      console.log(error);
    }

    return floorPriceInWei || undefined;
  },

  getTotalMarketplaceItems: async (Web3API, contractAddress, chainId = defaultChainId) => {
    // this function is executed from the NFT contract (avatars, horses, lands...)
    let totalMarketplaceItems = null;

    const options = {
      chain: chainId,
      address: contractAddress,
      function_name: 'totalSupply',
      abi: getAbi(ContractTypeEnum.Common)?.totalSupply,
    };

    try {
      totalMarketplaceItems = await Web3API.runContractFunction(options);
      //console.log('Total marketplace items', totalMarketplaceItems);
    } catch (error) {
      console.log(error);
    }

    return totalMarketplaceItems || undefined;
  },

  getNFTTokens: async (Moralis, chainId = defaultChainId, opts) => {
    let tokens = null;

    const options = {
      chain: chainId || defaultChainId,
      ...opts,
    };

    try {
      tokens = await Moralis.Web3API.account.getNFTs(options);
    } catch (error) {
      console.log(error);
    }

    return tokens || { result: [] };
  },

  getNFTsForContract: async (
    Moralis,
    contractAddress,
    chainId = undefined,
    opts,
    tokenId = undefined
  ): Promise<GetNFTsForContractModel> => {
    let tokens: GetNFTsForContractModel = undefined;

    const options = {
      chain: chainId || defaultChainId,
      token_address: contractAddress,
      token_id: tokenId,
      ...opts,
    };

    // console.log('getNFTsForContract options', options);

    try {
      tokens = await Moralis.Web3API.account.getNFTsForContract(options);
    } catch (error) {
      console.log(error);
    }

    return tokens;
  },

  getAllNFTsForContract: async (
    Moralis,
    contractAddress,
    chainId = defaultChainId
  ): Promise<GetNFTsForContractResultModel[]> => {
    try {
      let response: GetNFTsForContractModel = undefined;
      let tokens = [];

      const getBatch = async () => {
        return await get().getNFTsForContract(Moralis, contractAddress, chainId, {
          cursor: response?.cursor,
        });
      };

      // max page size is 100, keep calling api to get all tokens
      while (!response || response.cursor) {
        response = await getBatch();
        tokens = tokens.concat(...response.result);
      }

      // console.log('tokens result', tokens);

      return tokens;
    } catch (error) {
      return undefined;
    }
  },

  getNFTByTokenId: async (
    Moralis,
    contractAddress,
    tokenId,
    chainId = defaultChainId
  ): Promise<IGetNFTByTokenIdResponseModel> => {
    let tokens: IGetNFTByTokenIdResponseModel = undefined;

    const options = {
      token_id: tokenId,
      address: contractAddress,
      chain: chainId || defaultChainId,
      format: 'decimal',
    };

    try {
      tokens = await Moralis.Web3API.token.getTokenIdMetadata(options);
    } catch (error) {
      console.log(error);
    }

    return tokens || undefined;
  },

  getNFTTokensOwners: async (
    Moralis,
    tokenAddress,
    opts,
    chainId = undefined,
    tokenId = undefined
  ): Promise<IGetNFTOwners> => {
    let nftOwners: IGetNFTOwners = null;

    const options = {
      address: tokenAddress,
      chain: chainId || defaultChainId,
      token_id: tokenId,
      ...opts,
    };

    try {
      nftOwners = await Moralis.Web3API.token.getNFTOwners(options);
      console.log('getNFTTokensOwners', nftOwners);
    } catch (error) {
      console.log(error);
    }

    return nftOwners || undefined;
  },

  getAllNFTTokensOwners: async (
    Moralis,
    tokenAddress,
    chainId = undefined,
    tokenId = undefined
  ): Promise<IGetNFTOwnersResult[]> => {
    try {
      let response: IGetNFTOwners = undefined;
      let tokensOwnersResponse: IGetNFTOwnersResult[] = [];

      const getBatch = async () => {
        return await get().getNFTTokensOwners(
          Moralis,
          tokenAddress,
          {
            cursor: response?.cursor,
          },
          chainId,
          tokenId
        );
      };

      // max page size is 100, keep calling api to get all tokens
      while (!response || response.cursor) {
        response = await getBatch();
        tokensOwnersResponse = tokensOwnersResponse.concat(...response.result);
      }

      console.log('getAllNFTTokensOwners result', tokensOwnersResponse);

      return tokensOwnersResponse;
    } catch (error) {
      return undefined;
    }
  },

  getNFTMetadata: async (Moralis, tokenAddress, chainId = defaultChainId) => {
    let tokenData = null;

    const options = {
      address: tokenAddress,
      chain: chainId || defaultChainId,
    };

    try {
      tokenData = await Moralis.Web3API.token.getNFTMetadata(options);
    } catch (error) {
      console.log(error);
    }

    return tokenData || { result: [] };
  },

  getMarketplaceAvatarsForSale: async (Web3API): Promise<IFetchMarketItems[]> => {
    return await useWalletStore.getState().getMarketplaceItemsForSale(Web3API, ContractTypeEnum.Avatar);
  },

  getMarketplaceHorsesForSale: async Web3API => {
    return await useWalletStore.getState().getMarketplaceItemsForSale(Web3API, ContractTypeEnum.Horse);
  },

  getMarketplaceLandsForSale: async Web3API => {
    return await useWalletStore.getState().getMarketplaceItemsForSale(Web3API, ContractTypeEnum.Land);
  },

  getMarketplaceFarmsForSale: async Web3API => {
    return await useWalletStore.getState().getMarketplaceItemsForSale(Web3API, ContractTypeEnum.Farm);
  },

  getMarketplaceItemsForSale: async (Web3API, contractType: ContractTypeEnum): Promise<IFetchMarketItems[]> => {
    const contractAddress = await vanillaContractAddressStore?.getState()?.getContractAddress(contractType);
    let result: IFetchMarketItemsApiResponse[] = null;
    let mappedResult: IFetchMarketItems[] = [];

    const marketPlaceAddress = await vanillaContractAddressStore
      ?.getState()
      ?.getContractAddress(ContractTypeEnum.Marketplace);

    if (marketPlaceAddress == null) {
      // console.log('Warning - Marketplace contract not found.');
      return [];
    }

    const options = {
      params: {
        tokenAddress: contractAddress,
      },
      chain: defaultChainId,
      address: marketPlaceAddress,
      function_name: 'fetchMarketItemsbyAddress',
      abi: getAbi(ContractTypeEnum.Marketplace)?.fetchMarketItemsbyAddress,
    };

    console.log('fetchMarketItemByAddress options', options);

    try {
      result = await Web3API.runContractFunction(options);

      if (result && result?.length > 0) {
        result.forEach(mktItem => {
          mappedResult.push({
            itemId: mktItem[0],
            nftContract: mktItem[1],
            tokenId: mktItem[2],
            seller: mktItem[3],
            owner: mktItem[4],
            priceWeiUnit: mktItem[5],
            sold: mktItem[6],
            quantity: mktItem[7],
            duration: mktItem[8],
          });
        });
      }
      // console.log('fetchMarketItemByAddress result', result);
      console.log('fetchMarketItemByAddress mapped result', mappedResult);
    } catch (error) {
      console.log(error);
    }

    return mappedResult || undefined;
  },

  getEthInUsdWithoutTokenPrice: async (Moralis, ethPrice) => {
    var tokenPrice = await useWalletStore.getState().getTokenPrice(Moralis);
    return await useWalletStore.getState().getEthInUsd(tokenPrice, ethPrice);
  },

  getTokenPrice: async (
    Moralis,
    tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chainId = 'eth'
  ): Promise<IGetTokenPrice> => {
    try {
      let tokenPrice: IGetTokenPrice;

      const getTokenPrice = {
        address: tokenAddress,
        chain: chainId || defaultChainId,
        // exchange: 'uniswap-v3', //if needed we can define an specific exchange
      };

      tokenPrice = await Moralis.Web3API.token.getTokenPrice(getTokenPrice);

      return tokenPrice;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  getEthInUsd: async (tokenPrice: IGetTokenPrice, ethPrice: number, formatToUsd: boolean = true) => {
    let usdValue: number;

    try {
      if (tokenPrice) {
        // formula = ( (1/74917135470238) *10^18) *0.0006 ) => ((dollarUnit/ethNativePrice)*10^18)*ethPriceToDiscover
        const pot2 = Math.pow(10, 18);
        const div = tokenPrice.usdPrice / toNumber(tokenPrice.nativePrice.value);
        const multiplyPot = div * pot2;
        usdValue = multiplyPot * ethPrice;

        if (formatToUsd) {
          const dollarUSLocale = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
          return dollarUSLocale.format(usdValue);
        } else {
          return usdValue.toFixed(2);
        }
      }

      return usdValue;
    } catch (error) {
      console.log(error);
      return '0';
    }
  },
  pollTransaction: async (Moralis, abiOptions = {}, maxCallCount = 10, interval = 10000) => {
    let callCount = 0;
    let wasSuccessfull = false;
    let isLoading = false;

    const promise = new Promise((resolve, reject) => {
      const check = setInterval(async () => {
        if (!wasSuccessfull && !isLoading) {
          if (callCount <= maxCallCount) {
            callCount++;
            isLoading = true;

            try {
              const result = await Moralis.executeFunction({
                ...abiOptions,
              });

              console.log(result);

              wasSuccessfull = true;
              clearInterval(check);
              resolve(result);
            } catch (error) {
              // error code 4001 means user rejected transaction, clearInterval
              if (error?.code === 4001) {
                wasSuccessfull = true;
                clearInterval(check);
                reject(error);
              }

              console.log(error);
            } finally {
              isLoading = false;
            }
          } else {
            console.log('could not successfully call contract');
            isLoading = false;
            clearInterval(check);
            reject('could not successfully call contract');
          }
        }
      }, interval);
    });

    return promise;
  },
  fractionalizeHorse: async (Moralis, horseTokenId) => {
    const horsePartnershipContract = await vanillaContractAddressStore
      ?.getState()
      ?.getContractAddress(ContractTypeEnum.HorsePartnership);

    let fractionalizeHorseResponse = undefined;

    const options = {
      params: {
        horseID: horseTokenId,
      },
      chain: defaultChainId,
      contractAddress: horsePartnershipContract,
      functionName: 'fractionalize',
      abi: getAbi(ContractTypeEnum.HorsePartnership)?.fractionalize,
    };

    console.log('fractionalizeHorse options', options);

    try {
      fractionalizeHorseResponse = await Moralis.executeFunction(options);
      console.log('fractionalizeHorse response', fractionalizeHorseResponse);
    } catch (error) {
      console.log(error);
    }

    return fractionalizeHorseResponse || undefined;
  },
  reconstituteFractionalizedHorse: async (Moralis, horseTokenId) => {
    const horsePartnershipContract = await vanillaContractAddressStore
      ?.getState()
      ?.getContractAddress(ContractTypeEnum.HorsePartnership);

    let reconstituteResponse = undefined;

    const options = {
      params: {
        horseID: horseTokenId,
      },
      chain: defaultChainId,
      contractAddress: horsePartnershipContract,
      functionName: 'reconstitute',
      abi: getAbi(ContractTypeEnum.HorsePartnership)?.reconstitute,
    };

    console.log('reconstituteFractionalizedHorse options', options);

    try {
      reconstituteResponse = await Moralis.executeFunction(options);
      console.log('reconstituteFractionalizedHorse response', reconstituteResponse);
    } catch (error) {
      console.log(error);
    }

    return reconstituteResponse || undefined;
  },
  makeOfferToNFT: async (
    Moralis,
    contractAddressEnum: ContractTypeEnum,
    nftTokenId,
    nftPriceInETH,
    duration,
    quantity
  ) => {
    const marketPlaceAddress = await vanillaContractAddressStore
      ?.getState()
      ?.getContractAddress(ContractTypeEnum.Marketplace);

    const nftContractAddress = await vanillaContractAddressStore?.getState()?.getContractAddress(contractAddressEnum);

    let makeOfferNFT = undefined;

    const options = {
      params: {
        nftContract: nftContractAddress,
        tokenID: nftTokenId,
        quantity: quantity,
        exp: duration,
      },
      msgValue: Moralis.Units.ETH(nftPriceInETH),
      chain: defaultChainId,
      contractAddress: marketPlaceAddress,
      functionName: 'makeOffer',
      abi: getAbi(ContractTypeEnum.Marketplace)?.makeOffer,
    };

    console.log('makeOfferNFT options', options);

    try {
      makeOfferNFT = await Moralis.executeFunction(options);
      console.log('makeOfferNFT response', makeOfferNFT);
    } catch (error) {
      console.log(error);
    }

    return makeOfferNFT || undefined;
  },
  acceptOffer: async (Moralis, contractAddressEnum: ContractTypeEnum, nftTokenId, marketplaceIndex, quantity) => {
    const marketPlaceAddress = await vanillaContractAddressStore
      ?.getState()
      ?.getContractAddress(ContractTypeEnum.Marketplace);

    const nftContractAddress = await vanillaContractAddressStore?.getState()?.getContractAddress(contractAddressEnum);

    let acceptOffer = undefined;

    const options = {
      params: {
        nftContract: nftContractAddress,
        tokenID: nftTokenId,
        index: marketplaceIndex,
        quantity: quantity,
      },
      chain: defaultChainId,
      contractAddress: marketPlaceAddress,
      functionName: 'acceptOffer',
      abi: getAbi(ContractTypeEnum.Marketplace)?.acceptOffer,
    };

    console.log('acceptOffer options', options);

    try {
      acceptOffer = await Moralis.executeFunction(options);
      console.log('acceptOffer response', acceptOffer);
    } catch (error) {
      console.log(error);
    }

    return acceptOffer || undefined;
  },
  declineOffer: async (Moralis, contractAddressEnum: ContractTypeEnum, nftTokenId, marketplaceIndex) => {
    const nftContractAddress = await vanillaContractAddressStore?.getState()?.getContractAddress(contractAddressEnum);

    return get()?.executeMoralisFunction(
      Moralis,
      ContractTypeEnum.Marketplace,
      'deleteOffer',
      getAbi(ContractTypeEnum.Marketplace)?.deleteOffer,
      {
        nftContract: nftContractAddress,
        tokenID: nftTokenId,
        index: marketplaceIndex,
      }
    );
  },
}));

export const vanillaStore = useWalletStore;
// @ts-ignore-start
export default create<IAppState>(useWalletStore);
// @ts-ignore-end
