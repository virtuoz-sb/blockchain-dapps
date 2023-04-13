import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { debounce, find, map } from 'lodash-es';
import { useMoralis } from 'react-moralis';

import api from '@common/api';
import { DetailSidePanel } from '@components/land-map/detail-side-panel';
import { FarmConversionPanel } from '@components/land-map/farm-conversion-panel';
import { Filters } from '@components/filters';
import { AcreLandFilter } from '@components/filters/acre-land.filter';
import { ConfirmModal } from '@components/modals/confirm-modal';
import { CoordinatesFilter } from '@components/filters/coordinates.filter';
import { DamFilter } from '@components/filters/dam.filter';
import { FarmsFilter } from '@components/filters/farms.filter';
import { WalletFilter } from '@components/filters/wallet.filter';
import LandMap from '@components/land-map';
import useTranslation from '@hooks/useTranslation';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import useWalletStore from '@hooks/useWalletStore';

const translationKey = 'landMap';

enum FilterType {
  acre,
  farms,
  dam,
  coordinates,
  wallet,
}

const emptyFilterObj = {
  acreType: null,
  dam: null,
  coordinates: {
    min: null,
    max: null,
  },
  farms: {
    type: null,
    forSale: null,
    size: null,
  },
  wallet: {
    hash: null,
    type: null,
  },
};

const LandMapPage = () => {
  const filters = useRef(Object.assign({}, emptyFilterObj));
  const trans = useTranslation();
  const { Moralis, chainId, isInitialized, isAuthenticated } = useMoralis();
  const { getContractAddress } = useContractAddressStore();

  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(false);
  const [farmConversionPanelOpen, setFarmConversionPanelOpen] = useState<boolean>(false);
  const [filtersUpdated, setFiltersUpdated] = useState<boolean>(false);
  const [currentLand, setCurrentLand] = useState<ILand>(null);
  const [currentMapLand, setCurrentMapLand] = useState<any>(null); // land object from map
  const [filterCollapsed, setFilterCollapsed] = useState<boolean>(null);
  const [clearAcreFilter, setClearAcreFilter] = useState<boolean>(false);
  const [clearFarmFilter, setClearFarmFilter] = useState<boolean>(false);
  const [clearCoorFilter, setClearCoorFilter] = useState<boolean>(false);
  const [openFilterType, setOpenFilterType] = useState<FilterType>(null);
  const [showEmptyResultsModal, setShowEmptyResultsModal] = useState<boolean>(false);
  const [filterCount, setFilterCount] = useState<FilterType>(null);
  const [developLands, setDevelopLands] = useState<any[]>(null);
  const [allowLandSelection, setAllowLandSelection] = useState<boolean>(true);
  const requestedMapData = useRef<boolean>(false);
  const requestedLandTokens = useRef<boolean>(false);
  const [mapData, setMapData] = useState<any[]>(null);
  const [ownedLandTokenIds, setOwnedLandTokenIds] = useState<Number[]>(null);
  const [ownedFarmTokenIds, setOwnedFarmTokenIds] = useState<Number[]>(null);
  const { getNFTsForContract } = useWalletStore();

  // on clearFilters, all filters will update, debounce to only get one call
  const onFiltersUpdated = debounce(() => {
    setFiltersUpdated(true);

    setTimeout(() => {
      setFiltersUpdated(false);
    });
  }, 100);

  const onClearAllFilters = async () => {
    await setClearAcreFilter(true);
    await setClearFarmFilter(true);
    await setClearCoorFilter(true);

    filters.current = Object.assign({}, emptyFilterObj);

    setTimeout(() => {
      onFiltersUpdated();
      setClearAcreFilter(false);
      setClearFarmFilter(false);
      setClearCoorFilter(false);
    });
  };

  const getMapData = async () => {
    try {
      const { data } = await api.get('/api/LandNFTs/land-map', { params: { pageSize: 100000 } });
      setMapData(data.items);

      if (filterCount === null) {
        setFilterCount(data.items.length);
      }
    } catch (error) {
      setMapData([]);
    }
  };

  const getUserOwnedTokenIds = async () => {
    try {
      const landContractAddress = await getContractAddress(ContractTypeEnum.Land);
      const farmContractAddress = await getContractAddress(ContractTypeEnum.Farm);

      const results = await Promise.all([
        getNFTsForContract(Moralis, landContractAddress, chainId),
        getNFTsForContract(Moralis, farmContractAddress, chainId),
      ]);

      setOwnedLandTokenIds(map(results[0]?.result, t => Number(t.token_id)));
      setOwnedFarmTokenIds(map(results[1]?.result, t => Number(t.token_id)));
    } catch (error) {
      setOwnedLandTokenIds([]);
      setOwnedFarmTokenIds([]);
    } finally {
      requestedLandTokens.current = false;
    }
  };

  useEffect(() => {
    if (!requestedMapData.current) {
      requestedMapData.current = true;
      getMapData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!requestedLandTokens.current && isInitialized && isAuthenticated) {
      requestedLandTokens.current = true;
      getUserOwnedTokenIds();
    } else {
      setOwnedLandTokenIds([]);
      setOwnedFarmTokenIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isAuthenticated, setOwnedLandTokenIds, setOwnedFarmTokenIds]);

  return (
    <div className={clsx('h-screen flex', { ['flex-col']: filterCollapsed })}>
      <Filters
        onChange={() => {}}
        onFilterCollapse={collapsed => setFilterCollapsed(collapsed)}
        onFilterClear={onClearAllFilters}
        count={filterCount}
      >
        <AcreLandFilter
          onChange={async acreType => {
            await setClearFarmFilter(true);
            await setClearCoorFilter(true);

            filters.current = Object.assign({}, emptyFilterObj, acreType);
            onFiltersUpdated();

            await setClearFarmFilter(false);
            await setClearCoorFilter(false);
          }}
          onToggleShow={isShowing => {
            if (isShowing) {
              setOpenFilterType(FilterType.acre);
            }
          }}
          translationKey={translationKey}
          clearFilter={clearAcreFilter}
          closeFilter={openFilterType !== FilterType.acre}
          disabled={farmConversionPanelOpen}
        ></AcreLandFilter>
        {/* <FarmsFilter
          onChange={async farms => {
            await setClearAcreFilter(true);
            await setClearCoorFilter(true);

            filters.current = Object.assign({}, emptyFilterObj, { farms });
            onFiltersUpdated();

            await setClearAcreFilter(false);
            await setClearCoorFilter(false);
          }}
          onToggleShow={isShowing => {
            if (isShowing) {
              setOpenFilterType(FilterType.farms);
            }
          }}
          translationKey={translationKey}
          clearFilter={clearFarmFilter}
          closeFilter={openFilterType !== FilterType.farms}
          disabled={farmConversionPanelOpen}
        ></FarmsFilter>
        <DamFilter
          onChange={dam => {
            filters.current = Object.assign({}, emptyFilterObj, dam);
            onFiltersUpdated();
          }}
          onToggleShow={isShowing => {
            if (isShowing) {
              setOpenFilterType(FilterType.dam);
            }
          }}
          translationKey={translationKey}
          clearFilter={clearFilters}
          closeFilter={openFilterType !== FilterType.dam}
        ></DamFilter> */}
        <CoordinatesFilter
          onChange={async coordinates => {
            await setClearAcreFilter(true);
            await setClearFarmFilter(true);

            filters.current = Object.assign({}, emptyFilterObj, { coordinates });
            onFiltersUpdated();

            await setClearAcreFilter(false);
            await setClearFarmFilter(false);
          }}
          onToggleShow={isShowing => {
            if (isShowing) {
              setOpenFilterType(FilterType.coordinates);
            }
          }}
          translationKey={translationKey}
          clearFilter={clearCoorFilter}
          closeFilter={openFilterType !== FilterType.coordinates}
          disabled={farmConversionPanelOpen}
        ></CoordinatesFilter>
        {/* <WalletFilter
          onChange={wallet => {
            filters.current = Object.assign({}, emptyFilterObj, { wallet });
            onFiltersUpdated();
          }}
          onToggleShow={isShowing => {
            if (isShowing) {
              setOpenFilterType(FilterType.wallet);
            }
          }}
          translationKey={translationKey}
          clearFilter={clearFilters}
          closeFilter={openFilterType !== FilterType.wallet}
        ></WalletFilter> */}
      </Filters>
      <div className="flex flex-col w-full h-full">
        <div className={clsx({ ['min-h-[115px] h-[115px] w-full']: !filterCollapsed })}></div>
        <LandMap
          className="h-full md:w-full lg:w-4/5"
          mapData={mapData}
          ownedLandTokenIds={ownedLandTokenIds}
          ownedFarmTokenIds={ownedFarmTokenIds}
          isWalletConnected={isAuthenticated}
          allowLandSelection={allowLandSelection}
          trans={trans.t}
          showStats={true}
          showLogs={false}
          filters={filters.current}
          filtersUpdated={filtersUpdated}
          developLands={developLands}
          onCountUpdated={(count, showEmptyResults = true) => {
            setFilterCount(count);

            if (count === 0 && showEmptyResults) {
              setShowEmptyResultsModal(true);
            }
          }}
          isDetailOpen={rightPanelOpen}
          onUpdateDevelopLands={lands => {
            setDevelopLands(lands);
          }}
          onClick={land => {
            setRightPanelOpen(true);

            if (land && land.object.userData?.land) {
              const landData = land.object.userData;
              setCurrentMapLand(landData);

              console.log('land data', landData);

              const landItem: ILand = {
                tokenOwnersWalletAddressList: [],
                tokenId: landData?.land.tokenId,
                coords: landData?.position,
                name: null,
                marketplaceItemId: landData?.land.marketPlaceItemId,
                isForSale: landData?.land.isForSale,
                isOwned:
                  landData?.land.tokenId && find(ownedLandTokenIds, t => t === landData?.land.tokenId) !== undefined,
                price: landData?.land.isForSale ? landData?.land.priceInETH : null,
                properties: [],
                type: 'Skyfalls',
                image: '/images/sky-falls.png',
                collectionType: ContractTypeEnum.Land,
                hasMultipleShares: false,
                availableQuantityToAcceptAnOffer: 0,
              };

              if (landData?.land?.plotType?.toLowerCase() === 'farm') {
                const farmItem: IFarm = {
                  ...landItem,
                  isPublic: landData?.land.isPublic,
                  image: '/images/farm-placeholder.png',
                  collectionType: ContractTypeEnum.Farm,
                };

                setCurrentLand(farmItem);
              } else {
                setCurrentLand(landItem);
              }
            }
          }}
        ></LandMap>
      </div>

      <DetailSidePanel
        isOpen={rightPanelOpen}
        land={currentLand}
        onClose={() => setRightPanelOpen(false)}
        onDevelopFarm={l => {
          setDevelopLands([currentMapLand]);
          setFarmConversionPanelOpen(true);
          setRightPanelOpen(false);
        }}
      />

      <FarmConversionPanel
        isOpen={farmConversionPanelOpen}
        selectedLands={developLands}
        onClose={async showDetail => {
          await setFarmConversionPanelOpen(false);
          await setAllowLandSelection(true);
          await setCurrentLand(null);
          await setDevelopLands(null);

          if (showDetail) {
            await setCurrentLand(currentLand);
            await setRightPanelOpen(true);
          }
        }}
        onRefreshMapData={() => {
          getMapData();
          getUserOwnedTokenIds();
          setAllowLandSelection(true);
        }}
        onNextStep={step => {
          if (step > 1) {
            setAllowLandSelection(false);
          } else {
            setAllowLandSelection(true);
          }
        }}
      />

      <ConfirmModal
        isOpen={showEmptyResultsModal}
        title={trans.t('landMap.filters.noResults.title')}
        confirmButtonText="Ok"
        onClose={() => {
          setShowEmptyResultsModal(false);
        }}
      >
        {trans.t('landMap.filters.noResults.description')}
      </ConfirmModal>
    </div>
  );
};

export default LandMapPage;
