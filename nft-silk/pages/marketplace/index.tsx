/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import clsx from 'clsx';
import type { NextPage } from 'next';
import { debounce, toInteger } from 'lodash-es';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';

import { IFilter, IFilterItems } from '../../components/filters/marketplace.filter';
import { ICardModel } from '../../components/marketplace/card';

import { Icon } from '@components/icons';
import { Filters } from '@components/filters';
import { Skeleton } from '@components/skeleton';

import useTranslation from '@hooks/useTranslation';
import { MarketplaceFilter } from '@components/filters/marketplace.filter';
import { MarketplaceCard } from '@components/marketplace/card';
import api from '@common/api';
import { MarketplaceStatusFilter } from '@components/filters/marketplace.status.filter';
import useAppStore from '@hooks/useAppStore';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import useWalletStore from '@hooks/useWalletStore';

import styles from './marketplace.module.scss';
import { getNftImageThumbnailFromS3 } from '@common/getInformationPerNftCollectionEnum';
import { getAllCollections, getCollectionTotalsCountModel } from '@common/api/portal/marketplace';

interface IMarketplaceModel {
  selectedCollection: ICollectionModel;
  selectedOrderBy: IOrderByModel;
  itemsList: ICardModel[];
  filtersList: IFilter[];
  collectionsList: ICollectionModel[];
  selectedFilter: IDynamicFiltersModel[];
  ItemsListPaging: IListPaging;
  ItemsListSize: number;
}

interface IListPaging {
  pageNumber: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}

export interface ICollectionModel {
  id: number;
  name: string;
  contractAddress: string;
  icon?: string;
  banner?: string;
  endpointForCards?: string;
  endpointForFilters?: string;
  totalItems?: string;
  totalOwners?: string;
  floorPrice?: string;
  collectionType?: ContractTypeEnum;
  description: string;
}

interface IOrderByModel {
  type: MarketPlaceOrderByTypeEnum;
  name: string;
}

enum MarketPlaceOrderByTypeEnum {
  NewToOld = 1,
  OldToNew = 2,
  PriceLowToHigh = 3,
  PriceHighToLow = 4,
}

const Marketplace: NextPage = () => {
  const [marketplaceModel, setMarketplaceModel] = useState<IMarketplaceModel>();
  const [collectionChanged, setCollectionChanged] = useState<ICollectionModel>();
  const [orderByDropdownChanged, setOrderByDropdownChanged] = useState<IOrderByModel>();
  const [generalFilterChanged, setGeneralFilterChanged] = useState<string>(undefined);
  const [generalFilterValue, setGeneralFilterValue] = useState<string>('');
  const [pricesModel, setPricesModel] = useState<IFetchMarketItems[]>();
  const [avatarModel, setAvatarModel] = useState<ISilksGetAvatarModel>();
  const [avatarFilterModel, setAvatarFilterModel] = useState<ISilksGetAvatarFilterModel>();
  const [cardModel, setCardModel] = useState<IGetAllWithDynamicFiltersResponseModel>();
  const [cardFilterModel, setCardFilterModel] = useState<IGetAllFiltersGenericModel>();
  const [dropdownIsLoading, setDropdownIsLoading] = useState<boolean>(true);
  const [filterIsLoading, setFilterIsLoading] = useState<boolean>(true);
  const [cardIsLoading, setCardIsLoading] = useState<boolean>(true);
  const [horseModel, sethorseModel] = useState<IGetAllHorses>();
  const [landModel, setLandModel] = useState<IGetAllLands>();
  const [farmModel, setFarmModel] = useState<IGetAllFarms>();
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [isFilterChanged, setIsFilterChanged] = useState<boolean>(false);

  const [isFilterCollapsed = false, setIsFilterCollapsed] = useState<boolean>();
  const [filterCollapsed, setFilterCollapsed] = useState<ILand>(null);
  const [clearFilters, setClearFilters] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState(1);

  const { setShowFooter, profile } = useAppStore();
  const {
    getMarketplaceAvatarsForSale,
    getMarketplaceItemsForSale,
    getTokenPrice,
    getEthInUsd,
    getAllNFTTokensOwners,
    getFloorPrice,
    getTotalMarketplaceItems,
  } = useWalletStore();

  const { getContractAddress } = useContractAddressStore();

  const { Moralis, isInitialized, account, isAuthenticated } = useMoralis();
  const { native } = useMoralisWeb3Api();

  const { t } = useTranslation();

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  const orderByDropdownModel: IOrderByModel[] = [
    {
      type: MarketPlaceOrderByTypeEnum.NewToOld,
      name: 'NEW TO OLD',
    },
    {
      type: MarketPlaceOrderByTypeEnum.OldToNew,
      name: 'OLD TO NEW',
    },
    {
      type: MarketPlaceOrderByTypeEnum.PriceLowToHigh,
      name: 'PRICE LOW TO HIGH',
    },
    {
      type: MarketPlaceOrderByTypeEnum.PriceHighToLow,
      name: 'PRICE HIGH TO LOW',
    },
  ];

  const isValidUrl = string => {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  };

  const setMarketplaceFiltersData = async () => {
    let marketplaceModelCopy = {
      ...marketplaceModel,
    };

    let collectionModels: ICollectionModel[] = [];
    const userAccount = isAuthenticated ? account : '';
    const allCollections = await getAllCollections(userAccount);

    if (allCollections && allCollections.length > 0) {
      allCollections.forEach(col => {
        if (col.isActive) {
          collectionModels.push({
            id: col.collectionId,
            name: col.collectionName,
            contractAddress: '',
            icon: process.env.NEXT_PUBLIC_API_BASE + col.imageIconURL,
            banner: process.env.NEXT_PUBLIC_API_BASE + col.imageHeaderURL,
            endpointForCards: isValidUrl(col.endpointForCards)
              ? col.endpointForCards
              : col.endpointForCards != null
              ? process.env.NEXT_PUBLIC_API_BASE + col.endpointForCards
              : '',
            endpointForFilters: isValidUrl(col.endpointForFilters)
              ? col.endpointForFilters
              : col.endpointForFilters != null
              ? process.env.NEXT_PUBLIC_API_BASE + col.endpointForFilters
              : '',
            collectionType: ContractTypeEnum[col.collectionType],
            description: col.description,
          });
        }
      });
      //console.log('GetAllCollection final Model', collectionModels);
    } else {
      console.log('No collecitons found');
      return;
    }

    for (const collection of collectionModels) {
      const contractType = collection.collectionType;
      collection.contractAddress = await getContractAddress(contractType);

      if (contractType == ContractTypeEnum.Avatar) {
        let totalMarketplaceItems = undefined;
        totalMarketplaceItems = await getTotalMarketplaceItems(native, collection.contractAddress);
        collection.totalItems = totalMarketplaceItems ? totalMarketplaceItems : '-';

        //let nftOwner: IGetNFTOwnersResult[] = undefined;
        //nftOwner = await getAllNFTTokensOwners(Moralis, collection.contractAddress);
        //console.log('Avatar Owners', nftOwner);
        collection.totalOwners = '-';
      } else {
        const totals = await getCollectionTotalsCountModel(contractType, userAccount);
        collection.totalItems = totals.totalItems.toString();
        collection.totalOwners = totals.totalOwners.toString();
      }

      let floorPriceInWei = await getFloorPrice(Moralis, native, collection.collectionType);
      if (floorPriceInWei) {
        collection.floorPrice = floorPriceInWei;
      } else {
        collection.floorPrice = '-';
      }
    }

    marketplaceModelCopy.selectedCollection = collectionModels[0];
    marketplaceModelCopy.collectionsList = collectionModels;
    marketplaceModelCopy.selectedOrderBy = orderByDropdownModel.find(
      w => w.type == MarketPlaceOrderByTypeEnum.NewToOld
    );
    marketplaceModelCopy.ItemsListSize = getNumberOfRenderedItems();
    marketplaceModelCopy.selectedFilter = [];
    setMarketplaceModel(marketplaceModelCopy);
  };

  const getCardDataBasedOnCollection = async () => {
    if (marketplaceModel) {
      if (marketplaceModel?.selectedCollection?.collectionType == ContractTypeEnum.Avatar) {
        getAvatarDataAPI();
      } else {
        getCardsDataAPI();
      }
    }
  };

  const getNumberOfRenderedItems = () => {
    const totalCardsW = Math.round(screen.width / 220);
    const totalCardsH = Math.round(screen.height / 270);
    return Math.round(totalCardsW * totalCardsH);
  };

  const getAvatarFiltersDataAPI = async () => {
    await api
      .get(marketplaceModel.selectedCollection.endpointForFilters)
      .then(resp => {
        if (resp.status == 200) {
          setAvatarFilterModel(resp.data);
        } else {
          console.log(
            'Fails to get filters for avatars inside else statement. We should have a default error page to show this message to the user'
          );
        }
      })
      .catch(error => {
        console.log(
          'Fails to get filters for avatars inside catch statement. We should have a default error page to show this message to the user'
        );
        console.log(error);
      });
  };

  const getAvatarDataAPI = async () => {
    let queryString = await getQueryStringForAvatar();

    await api
      .get(marketplaceModel.selectedCollection.endpointForCards + queryString)
      .then(resp => {
        // console.log('API avatars response', resp);
        if (resp.status == 200) {
          setAvatarModel(resp.data);
        } else {
          console.log(
            'Fails to get avatars information inside else statement. We should have a default error page to show this message to the user'
          );
        }
      })
      .catch(error => {
        console.log(
          'Fails to get avatars information inside catch statement. We should have a default error page to show this message to the user'
        );
        console.log(error);
      });
  };

  const getCardsFiltersDataAPI = async () => {
    //console.log('get filters for cards');
    let filterEndpoint = marketplaceModel.selectedCollection.endpointForFilters;
    if (filterEndpoint != '') {
      if (marketplaceModel.selectedCollection.collectionType == ContractTypeEnum.MyAssets)
        filterEndpoint = `${filterEndpoint}/${account}`;

      await api
        .get(filterEndpoint)
        .then(resp => {
          if (resp.status == 200) {
            setCardFilterModel(resp.data);
          } else {
            console.log(
              'Fails to get land information inside else statement. We should have a default error page to show this message to the user'
            );
          }
        })
        .catch(error => {
          console.log(
            'Fails to get card filters information inside catch statement. We should have a default error page to show this message to the user'
          );
          console.log(error);
        });
    } else {
      let marketplaceModelCopy = {
        ...marketplaceModel,
        filtersList: [],
      };
      console.log('No trait endpoint found');

      setMarketplaceModel(marketplaceModelCopy);
      setFilterIsLoading(false);
    }
  };

  const getCardsDataAPI = async () => {
    let payload = await getPayloadFilter();

    if (marketplaceModel.selectedCollection.endpointForCards) {
      await api
        .post(marketplaceModel.selectedCollection.endpointForCards, payload)
        .then(resp => {
          if (resp.status == 200) {
            setCardModel(resp.data);
          } else {
            console.log(
              'Fails to get cards information inside else statement. We should have a default error page to show this message to the user'
            );
          }
        })
        .catch(error => {
          console.log(
            'Fails to get cards information inside catch statement. We should have a default error page to show this message to the user'
          );
          console.log(error);
        });
    } else {
      let marketplaceModelCopy = {
        ...marketplaceModel,
        itemsList: [],
        filtersList: [],
        ItemsListPaging: {
          pageNumber: 1,
          totalItems: 0,
          totalPages: 1,
          hasMore: false,
        },
      };

      setMarketplaceModel(marketplaceModelCopy);
      setCardIsLoading(false);
      setFilterIsLoading(false);
      setIsFilterChanged(false);
    }
  };

  const fetchMoreData = async () => {
    //console.log('Infinete Scroll - fetch more items data trigger');
    getCardDataBasedOnCollection();
  };

  const getQueryStringForAvatar = async () => {
    let queryString = `?pageSize=${marketplaceModel.ItemsListSize}`;
    let traitCount = 0;

    if (marketplaceModel.selectedFilter && marketplaceModel.selectedFilter.length > 0) {
      marketplaceModel.selectedFilter.forEach(filter => {
        if (filter.optionValue && filter.optionValue.length > 0) {
          queryString = queryString.concat(`&search[stringTraits][${traitCount}][name]=${filter.dbColumnName}`);
          let filterValueCount = 0;
          filter.optionValue.forEach(filterValue => {
            queryString = queryString.concat(
              `&search[stringTraits][${traitCount}][values][${filterValueCount}]=${filterValue}`
            );
            filterValueCount++;
          });
          traitCount++;
        }
      });
    }

    if (generalFilterChanged) {
      queryString = queryString.concat(
        `&search[stringTraits][${traitCount}][name]=token_id&search[stringTraits][${traitCount}][values][0]=${generalFilterChanged}`
      );
    }

    if (!isFirstLoad && !isFilterChanged) {
      // console.log('Current page is, ' + marketplaceModel.ItemsListPaging.pageNumber);

      const nextPageNumber = marketplaceModel.ItemsListPaging.pageNumber + 1;

      // console.log('next page is, ' + nextPageNumber);

      if (nextPageNumber <= marketplaceModel.ItemsListPaging.totalPages)
        queryString = queryString.concat(`&page=${nextPageNumber}`);
      setCurrentPage(nextPageNumber);
    } else {
      setCurrentPage(0);
    }

    // console.log('Querystring sent to avatars', queryString);

    return queryString;
  };

  const getPayloadFilter = async () => {
    let queryString: IGetAllWithDynamicFiltersModel = {
      pageSize: marketplaceModel.ItemsListSize,
      pageNumber: 1,
      orderByType: marketplaceModel.selectedOrderBy.type,
      currentWalletConnected: account,
    };

    if (marketplaceModel.selectedFilter) {
      // console.log('current filter', queryString);
      queryString.dynamicFilters = marketplaceModel.selectedFilter;
    }

    if (generalFilterChanged) {
      queryString.tokenId = parseInt(generalFilterChanged);
    }

    if (!isFirstLoad && !isFilterChanged) {
      // console.log('Current page is, ' + marketplaceModel.ItemsListPaging.pageNumber);

      const nextPageNumber = marketplaceModel.ItemsListPaging.pageNumber + 1;

      // console.log('next page is, ' + nextPageNumber);

      if (nextPageNumber <= marketplaceModel.ItemsListPaging.totalPages) queryString.pageNumber = nextPageNumber;
    }

    // console.log('Querystring sent to other nfts', queryString);

    return queryString;
  };

  useEffect(() => {
    if (cardFilterModel) {
      let mktFilterModel: Array<IFilter> = [];

      cardFilterModel.traits.forEach(trait => {
        let traitOptions: Array<IFilterItems> = [];
        trait.values.forEach(option => {
          traitOptions.push({
            name: option.value,
            count: option.count,
          });
        });
        mktFilterModel.push({
          dbColumnName: trait.traitType,
          title: trait.name,
          count: trait.values.length,
          items: traitOptions,
        });
      });

      if (mktFilterModel.length > 0) {
        let marketplaceModelCopy = {
          ...marketplaceModel,
          filtersList: mktFilterModel,
        };
        // console.log('Trait final model', mktFilterModel);

        setMarketplaceModel(marketplaceModelCopy);
      }

      setFilterIsLoading(false);
    }
  }, [cardFilterModel]);

  const handleGeneralFilterChanged = event => {
    setGeneralFilterValue(event.target.value);
    handleGeneralFilterDebounce(event);
  };

  const handleGeneralFilterDebounce = debounce(event => {
    // console.log('handle general filter changed');
    if (event.target.value) {
      setGeneralFilterChanged(event.target.value);
    } else if (event.target.value == '') {
      setGeneralFilterChanged('');
    }
  }, 4000);

  const clearGeneralFilterValue = async () => {
    setGeneralFilterValue('');
    setGeneralFilterChanged(undefined);
  };

  useEffect(() => {
    // console.log('general filter changed, refresh the filter');
    if (generalFilterChanged != undefined) {
      setIsFilterChanged(true);
    }
  }, [generalFilterChanged]);

  // collection value changed
  useEffect(() => {
    if (collectionChanged) {
      // console.log('Collection changed,', collectionChanged);
      let marketplaceModelCopy = {
        ...marketplaceModel,
        selectedCollection: collectionChanged,
        selectedFilter: [],
      };

      setIsFirstLoad(true);
      setFilterIsLoading(true);
      setCardIsLoading(true);
      setGeneralFilterChanged(undefined);
      setGeneralFilterValue('');
      setMarketplaceModel(marketplaceModelCopy);
    }
  }, [collectionChanged]);

  // order by value changed
  useEffect(() => {
    let marketplaceModelCopy = {
      ...marketplaceModel,
      selectedOrderBy: orderByDropdownChanged,
    };

    setMarketplaceModel(marketplaceModelCopy);
  }, [orderByDropdownChanged]);

  useEffect(() => {
    if (marketplaceModel?.selectedCollection && marketplaceModel?.selectedOrderBy && marketplaceModel?.selectedFilter) {
      setDropdownIsLoading(false);
      setIsFilterChanged(true);
    }
  }, [marketplaceModel?.selectedCollection, marketplaceModel?.selectedOrderBy, marketplaceModel?.selectedFilter]);

  const getMarketPlacePrices = async () => {
    if (isInitialized) {
      if (marketplaceModel.selectedCollection.collectionType == ContractTypeEnum.Avatar) {
        const avatarPrices: IFetchMarketItems[] = await getMarketplaceAvatarsForSale(native);
        setPricesModel(avatarPrices);
      } else {
        setCardsAndPriceData();
      }
    } else if (isFirstLoad) {
      setTimeout(getMarketPlacePrices, 5000);
    }
  };

  useEffect(() => {
    if (pricesModel) {
      if (marketplaceModel?.selectedCollection?.collectionType == ContractTypeEnum.Avatar) {
        setAvatarAndPriceData();
      } else {
        getCardsDataAPI();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricesModel]);

  const setAvatarAndPriceData = async () => {
    if (avatarModel && pricesModel) {
      // console.log('Model Avatar', avatarModel);
      // console.log('Model Prices for Avatars', pricesModel);

      let mktCardModel: Array<ICardModel> = [];
      let mktListPaging: IListPaging;

      if (avatarModel.items.length == 0) {
        mktListPaging = {
          pageNumber: 1,
          totalItems: 0,
          totalPages: 1,
          hasMore: false,
        };
      } else {
        mktListPaging = {
          pageNumber: avatarModel.pageNumber,
          totalItems: avatarModel.totalItems,
          totalPages: avatarModel.totalPages,
          hasMore: avatarModel.pageNumber == avatarModel.totalPages ? false : true,
        };

        const getCurrentTokenPrice = await getTokenPrice(Moralis);

        for (const item of avatarModel?.items) {
          const nftPriceObject = pricesModel?.find(e => e.tokenId == item.tokenId.toString() && e.sold == false);
          const nftPriceETH = nftPriceObject?.priceWeiUnit
            ? parseFloat(parseFloat(Moralis.Units.FromWei(nftPriceObject?.priceWeiUnit)).toFixed(4))
            : undefined;
          const nftPriceUSD = nftPriceETH ? await getEthInUsd(getCurrentTokenPrice, nftPriceETH) : '0';

          const nftIsForsale = nftPriceObject ? !nftPriceObject.sold : false;

          mktCardModel.push({
            id: item.tokenId,
            image: item.imageThumbnail,
            name: item.name,
            isForSale: nftIsForsale,
            marketPlaceItemId: nftPriceObject ? parseInt(nftPriceObject.itemId) : undefined,
            priceETH: nftPriceETH,
            priceDollar: nftPriceUSD,
            nftOwnerWalletAddress: nftPriceObject ? nftPriceObject.seller : undefined,
            contractType: marketplaceModel.selectedCollection.collectionType,
            fromPage: currentPage,
          });
        }
      }

      let marketplaceModelCopy = {
        ...marketplaceModel,
        ItemsListPaging: mktListPaging,
      };

      if (mktCardModel.length > 0) {
        if (isFirstLoad) {
          setIsFilterChanged(false);
          marketplaceModelCopy.itemsList = mktCardModel;
        } else if (isFilterChanged) {
          setIsFilterChanged(false);
          marketplaceModelCopy.itemsList = mktCardModel;
        } else {
          marketplaceModelCopy.itemsList = marketplaceModelCopy.itemsList.concat(Array.from(mktCardModel));
        }
      } else {
        setIsFilterChanged(false);
        marketplaceModelCopy.itemsList = mktCardModel;
      }

      setMarketplaceModel(marketplaceModelCopy);
    }
  };

  useEffect(() => {
    if (isFirstLoad && marketplaceModel) {
      setCardIsLoading(false);
      if (marketplaceModel.selectedCollection.collectionType == ContractTypeEnum.Avatar) {
        getAvatarFiltersDataAPI();
      } else {
        getCardsFiltersDataAPI();
      }
      setIsFirstLoad(false);
    } else if (marketplaceModel?.itemsList) {
      setCardIsLoading(false);
    }
  }, [marketplaceModel?.itemsList]);

  useEffect(() => {
    if (marketplaceModel?.filtersList) {
      setFilterIsLoading(false);
    }
  }, [marketplaceModel?.filtersList]);

  // avatarModel value changed
  useEffect(() => {
    if (avatarModel) {
      getMarketPlacePrices();
    }
  }, [avatarModel]);

  // cardModel value changed
  useEffect(() => {
    if (cardModel) {
      getMarketPlacePrices();
    }
  }, [cardModel]);

  const setCardsAndPriceData = async () => {
    if (cardModel) {
      // console.log('Model Cards', cardModel);
      let mktCardModel: Array<ICardModel> = [];
      let mktListPaging: IListPaging;

      if (cardModel.items.length == 0) {
        mktListPaging = {
          pageNumber: 1,
          totalItems: 0,
          totalPages: 1,
          hasMore: false,
        };
      } else {
        mktListPaging = {
          pageNumber: cardModel.pageNumber,
          totalItems: cardModel.totalCount,
          totalPages: cardModel.totalPages,
          hasMore: cardModel.pageNumber == cardModel.totalPages || cardModel.totalPages == 0 ? false : true,
        };

        let getCurrentTokenPrice = undefined;
        let marketplaceItems: IFetchMarketItems[] = undefined;
        if (marketplaceModel.selectedCollection.collectionType != ContractTypeEnum.MyAssets) {
          getCurrentTokenPrice = await getTokenPrice(Moralis);

          marketplaceItems = await getMarketplaceItemsForSale(
            native,
            marketplaceModel.selectedCollection.collectionType
          );
        }

        for (const item of cardModel?.items) {
          let marketItem = undefined;
          let nftPriceUSD = 0;
          if (marketplaceModel.selectedCollection.collectionType != ContractTypeEnum.MyAssets) {
            marketItem = marketplaceItems.find(e => e.tokenId == item.tokenId.toString() && e.sold == false);
            nftPriceUSD = item.priceInETH ? await getEthInUsd(getCurrentTokenPrice, item.priceInETH) : '0';
          }

          const selectedCollection = item.contractType
            ? ContractTypeEnum[item.contractType]
            : marketplaceModel.selectedCollection.collectionType;
          const imageLocation = item.imageThumbnailURL
            ? item.imageThumbnailURL
            : getNftImageThumbnailFromS3(selectedCollection, item.tokenId);

          mktCardModel.push({
            id: toInteger(item.tokenId),
            image: imageLocation,
            name: item.name,
            isForSale: item.isForSale,
            marketPlaceItemId: item?.marketPlaceItemId,
            priceETH: item.priceInETH,
            priceDollar: nftPriceUSD,
            nftOwnerWalletAddress: marketItem ? marketItem.seller : item.nftOwnerWalletAddress,
            contractType: selectedCollection,
            fromPage: currentPage,
            sharesQuantity: item.sharesQuantity,
          });
        }
      }

      let marketplaceModelCopy = {
        ...marketplaceModel,
        ItemsListPaging: mktListPaging,
      };

      if (mktCardModel.length > 0) {
        if (isFirstLoad) {
          setIsFilterChanged(false);
          marketplaceModelCopy.itemsList = mktCardModel;
        } else if (isFilterChanged) {
          setIsFilterChanged(false);
          marketplaceModelCopy.itemsList = mktCardModel;
        } else {
          marketplaceModelCopy.itemsList = marketplaceModelCopy.itemsList.concat(Array.from(mktCardModel));
        }
      } else {
        setIsFilterChanged(false);
        marketplaceModelCopy.itemsList = mktCardModel;
      }

      // console.log('MKT Model updated with cards data,', marketplaceModelCopy.itemsList);

      setMarketplaceModel(marketplaceModelCopy);
    }
  };

  // avatarFilterModel value changed
  useEffect(() => {
    if (avatarFilterModel) {
      let mktFilterModel: Array<IFilter> = [];

      avatarFilterModel?.traits?.forEach(item => {
        let traitOptions: Array<IFilterItems> = [];
        item.values.forEach(trait => {
          traitOptions.push({
            name: trait.value,
            count: trait.count,
          });
        });
        mktFilterModel.push({
          dbColumnName: item.traitType,
          title: item.name,
          count: item.values.length,
          items: traitOptions,
        });
      });

      if (mktFilterModel.length > 0) {
        let marketplaceModelCopy = {
          ...marketplaceModel,
          filtersList: mktFilterModel,
        };

        setMarketplaceModel(marketplaceModelCopy);
      }

      setFilterIsLoading(false);
    }
  }, [avatarFilterModel]);

  useEffect(() => {
    if (clearFilters) {
      let marketplaceModelCopy = {
        ...marketplaceModel,
        selectedFilter: [],
      };

      setMarketplaceModel(marketplaceModelCopy);
      clearGeneralFilterValue();
    }
  }, [clearFilters]);

  // on clearFilters, all filters will update, debounce to only get one call
  const onFiltersUpdated = debounce((filter: IDynamicFiltersModel, clearAllFilters = false) => {
    if (clearAllFilters) {
      setClearFilters(true);
    } else if (filter) {
      let noChangesWasDetectedOnFilters = false;

      if (filter.dbColumnName && filter.filterType) {
        let selectedFilters: Array<IDynamicFiltersModel> = [...marketplaceModel?.selectedFilter];
        // console.log('selected filters', selectedFilters);

        if (filter.filterType == 'checkbox') {
          // remove the checkbox option from the current filter
          if (selectedFilters.length > 0 && filter.lastActionIsRemove) {
            // console.log(selectedFilters);

            selectedFilters.forEach((selFilter, index) => {
              if (selFilter.dbColumnName == filter.dbColumnName && selFilter.filterType == filter.filterType) {
                if (selFilter.useBooleanValue) {
                  selectedFilters.splice(index, 1);
                } else {
                  selFilter.optionValue = selFilter.optionValue?.filter(ele => ele != filter.optionValue[0]);

                  if (selFilter.optionValue.length == 0) {
                    selectedFilters.splice(index, 1);
                  }
                }
              }
            });
          }
          // add the checkbox option to the current filter if last actions is not to remove the checkbox filter
          if (!filter.lastActionIsRemove) {
            if (selectedFilters.find(f => f.dbColumnName == filter.dbColumnName && f.filterType == filter.filterType)) {
              selectedFilters.forEach((value, index) => {
                if (value.dbColumnName == filter.dbColumnName) {
                  value.optionValue = value.optionValue.concat(Array.from(filter.optionValue));
                }
              });
            } else {
              selectedFilters.push(filter);
            }
          }
        } else if (filter.filterType == 'TextRange') {
          if (
            filter.lastActionIsRemove &&
            selectedFilters.length > 0 &&
            selectedFilters.some(s => s.dbColumnName == filter.dbColumnName && s.filterType == filter.filterType)
          ) {
            selectedFilters.forEach((selFilter, index) => {
              if (selFilter.dbColumnName == filter.dbColumnName && selFilter.filterType == filter.filterType) {
                selectedFilters.splice(index, 1);
              }
            });
          } else if (filter.lastActionIsRemove) {
            noChangesWasDetectedOnFilters = true;
          }

          // add the textrange to the current filter if last actions is not to remove the textrange filter
          if (!filter.lastActionIsRemove) {
            if (selectedFilters.find(f => f.dbColumnName == filter.dbColumnName && f.filterType == filter.filterType)) {
              selectedFilters.forEach((value, index) => {
                if (value.dbColumnName == filter.dbColumnName) {
                  value.lastActionIsRemove = filter.lastActionIsRemove;
                  value.valueOfRange1 = filter.valueOfRange1;
                  value.valueOfRange2 = filter.valueOfRange2;
                }
              });
            } else {
              selectedFilters.push(filter);
            }
          }
        } else if (filter.filterType == 'calendar') {
        } else if (filter.filterType == 'calendarRange') {
        } else if (filter.filterType == 'freeText') {
          // remove the text filter if exists
          if (selectedFilters.length > 0) {
            selectedFilters.forEach((value, index) => {
              if (value.dbColumnName == filter.dbColumnName && value.filterType == filter.filterType) {
                selectedFilters.splice(index, 1);
              }
            });
          }

          // add the text filter
          if (filter.textValue) {
            selectedFilters.push(filter);
          }
        }

        if (noChangesWasDetectedOnFilters) {
          // console.log('No changes was detected on filters,', selectedFilters);
        } else {
          // console.log('Selected Filters,', selectedFilters);

          let marketplaceModelCopy = {
            ...marketplaceModel,
            selectedFilter: selectedFilters,
          };

          setMarketplaceModel(marketplaceModelCopy);
        }
      }
    }
  }, 100);

  useEffect(() => {
    // console.log('Effect IsFilterChanged, ', isFilterChanged);
    if (isFilterChanged) {
      setCardIsLoading(true);
      getCardDataBasedOnCollection();
    }
  }, [isFilterChanged]);

  /*  useEffect(() => {
    if (!cardIsLoading && marketplaceModel?.ItemsListPaging?.hasMore) {
      var div = document.getElementById('scrollableDiv');
      var hasVerticalScroll = div.scrollHeight > div.clientHeight;
      console.log('ADSNB infinite scroll', hasVerticalScroll);
      if (marketplaceModel?.ItemsListPaging?.hasMore && !hasVerticalScroll) {
        console.log('ADSNB, fetch more data triggered');
        fetchMoreData();
      }
    }
  }, [cardIsLoading, marketplaceModel?.ItemsListPaging?.hasMore]); */

  // always loaded
  useEffect(() => {
    if (isAuthenticated && !account) return () => {};

    if (isInitialized) {
      setDropdownIsLoading(true);
      setCardIsLoading(true);
      setFilterIsLoading(true);
      setShowFooter(false);
      setIsFirstLoad(true);
      setMarketplaceFiltersData();

      return () => {
        setShowFooter(true);
      };
    } else {
      return () => {};
    }
  }, [isInitialized, isAuthenticated, account]);

  return (
    <div className="pt-12">
      {dropdownIsLoading ? (
        <p className="">
          <Skeleton className="w-full h-64" enableAnimation={true} />
        </p>
      ) : (
        <div className="flex overflow-hidden h-64">
          <img className="w-full h-full object-cover" src={marketplaceModel?.selectedCollection?.banner} alt="" />

          <div className={clsx('absolute pt-[160px] z-30', (isFilterCollapsed && 'lg:pl-[50px]') || 'lg:pl-[300px]')}>
            <div className="bg-blue-700/70 backdrop-blur h-24 flex items-center rounded-t-lg">
              <Popover className="relative h-full">
                {({ open, close }) => (
                  <>
                    <Popover.Button
                      className={classNames(
                        'pr-8',
                        open ? 'text-gray-900 bg-slate-800/70' : 'text-gray-500',
                        'h-full min-w-[285px]',
                        'group rounded-tl-lg inline-flex items-center text-base font-medium hover:text-gray-900',
                        'w-[550px]'
                      )}
                    >
                      <div className="font-bold lg:text-xl xl:text-2xl text-white flex items-center">
                        <div className="ml-5 w-20">
                          <img
                            className="h-16 w-16 rounded-full"
                            src={marketplaceModel?.selectedCollection?.icon}
                            alt=""
                          />
                        </div>
                        <div>
                          <div className="flex items-center">
                            {marketplaceModel?.selectedCollection?.name}
                            {open ? (
                              <Icon name="chevron-up" className="ml-2 h-3 w-3" />
                            ) : (
                              <Icon name="chevron-up" className="ml-2 h-3 w-3 rotate-180" />
                            )}
                          </div>
                          <div className="text-xs text-gray-300 font-medium flex">COLLECTION</div>
                        </div>
                      </div>
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel
                        static
                        className="absolute w-full transform shadow-lg py-1 bg-slate-900 rounded-md focus:outline-none opacity-100 cursor-pointer"
                      >
                        <>
                          {marketplaceModel?.collectionsList?.map((collection, index) => (
                            <div
                              key={collection.name}
                              onClick={() => {
                                setCollectionChanged(collection);
                                close();
                              }}
                              className="rounded-t-lg border-b-2 border-gray-700/80 overflow-hidden hover:pl-5 group"
                            >
                              <div className="flex items-center h-12">
                                <div className="ml-3 flex items-center text-white group-hover:text-yellow-300">
                                  <div className="ml-5 w-16">
                                    <img className="h-10 w-10 rounded-full" src={collection.icon} alt="" />
                                  </div>
                                  <div className="font-medium text-sm mr-5">{collection.name}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
              <div className="pl-16 hidden md:block">
                <div className="font-bold text-2xl text-white">{marketplaceModel?.selectedCollection?.totalItems}</div>
                <div className="text-xs text-gray-300 font-medium">ITEMS</div>
              </div>
              <div className="pl-10 hidden md:block">
                <div className="font-bold text-2xl text-white">{marketplaceModel?.selectedCollection?.totalOwners}</div>
                <div className="text-xs text-gray-300 font-medium">OWNERS</div>
              </div>
              <div className="pl-10 pr-10 hidden md:block">
                <div className="font-bold text-2xl text-white">{marketplaceModel?.selectedCollection?.floorPrice}</div>
                <div className="text-xs text-gray-300 font-medium">FLOOR PRICE</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative min-h-fit flex">
        <Filters
          moduleId={2}
          onChange={() => {}}
          onFilterCollapse={collapsed => {
            setIsFilterCollapsed(!isFilterCollapsed);
            setFilterCollapsed(collapsed);
          }}
          onFilterClear={val => setClearFilters(val)}
        >
          <>
            {filterIsLoading ? (
              <p className="">
                <Skeleton className="w-full h-10 mt-1" enableAnimation={true} />
                <Skeleton className="w-full h-10 mt-1" enableAnimation={true} />
                <Skeleton className="w-full h-10 mt-1" enableAnimation={true} />
              </p>
            ) : (
              <>
                {marketplaceModel?.selectedCollection?.collectionType != ContractTypeEnum.Avatar &&
                  marketplaceModel?.selectedCollection?.collectionType != ContractTypeEnum.MyAssets && (
                    <MarketplaceStatusFilter
                      onChange={(properties, clearAllFilters = false) => {
                        onFiltersUpdated(properties, clearAllFilters);
                      }}
                      clearFilter={clearFilters}
                    />
                  )}
                {marketplaceModel?.filtersList && (
                  <MarketplaceFilter
                    initialFilterValues={marketplaceModel.filtersList}
                    onChange={(properties, clearAllFilters = false) => {
                      onFiltersUpdated(properties, clearAllFilters);
                    }}
                    clearFilter={clearFilters}
                  />
                )}
              </>
            )}
          </>
        </Filters>
        <div className="w-full">
          <div className="flex-col">
            <div className="flex justify-between h-[50px] bg-blue-700/100">
              <div className="flex justify-between lg:flex-row">
                <Popover className="xl:w-[50vw] 2xl:w-[60vw] z-10">
                  {marketplaceModel?.selectedCollection?.description &&
                    marketplaceModel?.selectedCollection?.description.length > 0 &&
                    (({ open, close }) => (
                      <>
                        {open ? (
                          <div className="w-full flex pl-10 mt-[15px] bg-blue-700 text-sm">
                            <div
                              onClick={() => {
                                close();
                              }}
                              className="flex flex-col space-y-4 mb-4 mr-5 text-gray-300"
                              dangerouslySetInnerHTML={{ __html: marketplaceModel.selectedCollection?.description }}
                            />
                            <div className="flex mr-11">
                              <Popover.Button
                                className={classNames(
                                  'h-[20px] w-full flex items-center text-blue text-xs font-medium hover:text-blue-500/70',
                                  open
                                )}
                              >
                                <span className="whitespace-nowrap mr-2">{t('marketplace.seeLess')}</span>
                                <Icon name="chevron-up-blue" className="h-4 w-4 flex" />
                              </Popover.Button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex justify-between text-sm items-center ml-10">
                            <div
                              className={clsx(styles.collectionDescription, 'mr-5 text-gray-300')}
                              dangerouslySetInnerHTML={{ __html: marketplaceModel?.selectedCollection?.description }}
                            />
                            <div className="flex mr-11">
                              <Popover.Button
                                className={classNames(
                                  'group inline-flex items-center text-blue text-xs font-medium hover:text-blue-500/70',
                                  open
                                )}
                              >
                                <span className="whitespace-nowrap pr-2">{t('marketplace.seeMore')}</span>
                                <Icon name="chevron-down-blue" className="h-4 w-4 flex" />
                              </Popover.Button>
                            </div>
                          </div>
                        )}
                      </>
                    ))}
                </Popover>
              </div>
              <div className="flex">
                <div className="flex flex-grow items-center w-[210px]">
                  <div className="pr-4">
                    <Icon name="magnifying-glass" className="absolute h-5 w-5 pt-3 ml-3" />
                    <input
                      className="pl-10 bg-slate-900/60 text-white h-[50px] w-full"
                      placeholder="Name, Token ID..."
                      onChange={event => handleGeneralFilterChanged(event)}
                      type="text"
                      pattern="[0-9]*"
                      value={generalFilterValue}
                    ></input>
                  </div>
                </div>
                <div className="w-[230px] mr-6 block">
                  {marketplaceModel?.selectedCollection?.collectionType != ContractTypeEnum.Avatar && (
                    <Popover className="relative h-full">
                      {({ open, close }) => (
                        <>
                          <Popover.Button
                            className={classNames(
                              open ? 'text-gray-900' : 'text-gray-500',
                              'h-full w-full group inline-flex items-center text-base font-medium bg-slate-900/60 hover:text-gray-900'
                            )}
                          >
                            <div className="text-white flex items-center w-full">
                              <div className="pl-3 flex items-center">{marketplaceModel?.selectedOrderBy?.name}</div>
                            </div>
                            <div className="pr-6">
                              {open ? (
                                <Icon name="chevron-up" className="ml-2 h-3 w-3" />
                              ) : (
                                <Icon name="chevron-up" className="ml-2 h-3 w-3 rotate-180" />
                              )}
                            </div>
                          </Popover.Button>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                          >
                            <Popover.Panel
                              static
                              className="absolute z-10 w-full transform shadow-lg py-1 bg-slate-800/70 rounded-md focus:outline-none opacity-100 cursor-pointer"
                            >
                              <>
                                {orderByDropdownModel.map((orderBy, index) =>
                                  marketplaceModel?.selectedCollection?.collectionType == ContractTypeEnum.MyAssets &&
                                  (orderBy.type == MarketPlaceOrderByTypeEnum.PriceLowToHigh ||
                                    orderBy.type == MarketPlaceOrderByTypeEnum.PriceHighToLow) ? (
                                    ''
                                  ) : (
                                    <div
                                      key={orderBy.name}
                                      onClick={() => {
                                        // order list with selected value
                                        setOrderByDropdownChanged(orderBy);
                                        close();
                                      }}
                                      className="rounded-t-lg border-b-2 border-gray-700/80 overflow-hidden hover:pl-3 group"
                                    >
                                      <div className="flex items-center h-12">
                                        <div className="pl-10 flex items-center text-white group-hover:text-yellow-300">
                                          <div className="font-medium text-sm mr-5">{orderBy.name}</div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                              </>
                            </Popover.Panel>
                          </Transition>
                        </>
                      )}
                    </Popover>
                  )}
                </div>
              </div>
            </div>
            <div
              id="scrollableDiv"
              className={clsx('flex flex-wrap overflow-y-scroll overflow-x-hidden', styles.infiniteScroll)}
            >
              {cardIsLoading ? (
                <p className="flex ml-3 mt-3 space-x-5">
                  <Skeleton className="w-52 h-52" enableAnimation={true} count={2} />
                  <Skeleton className="w-52 h-52" enableAnimation={true} count={2} />
                  <Skeleton className="w-52 h-52" enableAnimation={true} count={2} />
                  <Skeleton className="w-52 h-52" enableAnimation={true} count={2} />
                  <Skeleton className="w-52 h-52" enableAnimation={true} count={2} />
                </p>
              ) : (
                <InfiniteScroll
                  style={{ overflowX: 'hidden' }}
                  dataLength={marketplaceModel?.itemsList?.length ? marketplaceModel?.itemsList?.length : 0}
                  next={fetchMoreData}
                  hasMore={marketplaceModel?.ItemsListPaging?.hasMore}
                  loader={<h4 className="hidden">Loading...</h4>}
                  endMessage={
                    marketplaceModel?.ItemsListPaging?.totalItems == 0 ? (
                      <div
                        className={clsx(
                          'flex items-center justify-center font-bold text-2xl text-white',
                          styles.infiniteScroll
                        )}
                      >
                        No items to display.
                      </div>
                    ) : (
                      <div
                        className={clsx(
                          'flex items-center justify-center font-bold text-2xl text-white',
                          styles.infiniteScroll
                        )}
                      >
                        You have reached the end of the collection.
                      </div>
                    )
                  }
                  scrollableTarget="scrollableDiv"
                >
                  <div className="flex flex-wrap">
                    {marketplaceModel?.itemsList?.map((card, index) => (
                      <MarketplaceCard
                        key={card.id + card.contractType}
                        cardModel={card}
                        type={marketplaceModel?.selectedCollection?.collectionType}
                      />
                    ))}
                  </div>
                </InfiniteScroll>
              )}
            </div>
          </div>
        </div>
        <br />
        <br />
        <div className=""></div>
      </div>
    </div>
  );
};

export default Marketplace;
