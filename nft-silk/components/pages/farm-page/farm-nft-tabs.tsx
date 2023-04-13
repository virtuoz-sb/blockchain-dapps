import React, { FunctionComponent, useMemo } from 'react';
import TabPanel from '@components/nft-types/nft-tabs/tab-panel';
import BaseTabs from '@components/nft-types/nft-tabs/base-tabs';
import { useOffers, useTokenPrice, useNFTTabsCfg } from '@components/nft-types/helpers';
import { Offers } from '@components/offers';
import { useMemoizedCallback } from '@hooks/useMemoizedCallback';
import Properties from '@components/properties';
import { CoordinatesTab } from '@components/pages/details-page/coordinates-tab';
import StakedHorsesWrapper from '@components/horse-action/components/staked-horses-wrapper';
import StableRequestsWrapper from '@components/horse-action/components/stable-requests-wrapper';

type FarmNFTTabsProps = {
  currentNFT: IFarm;
  className?: string;
  stakedHorses?: IStakedHorse[];
  stableRequests?: IStableRequest[];
  coordinates?: ICoordinateModel[];
};

const FarmNFTTabs: FunctionComponent<FarmNFTTabsProps> = ({
  currentNFT,
  stakedHorses,
  stableRequests,
  coordinates,
  className,
}) => {
  const NFTTabsCfg = useNFTTabsCfg(currentNFT?.collectionType);
  const { baseTokenPrice } = useTokenPrice();
  const { offers } = useOffers(currentNFT);

  //used for selector labels
  const counts = useMemo(() => {
    return {
      offers: offers ? offers.length : false,
      coordinates: coordinates ? coordinates.length : false,
      requests: stableRequests ? stableRequests.length : false,
    };
  }, [coordinates, offers, stableRequests]);

  //adjust tabs cfg conditional to requests, staked, isPublic
  //this will also force a tabs change call
  const adjustedNFTTabs = useMemo(() => {
    let checks = [];
    if (stakedHorses && stakedHorses.length) {
      checks.push('stakedHorses');
    }
    if (currentNFT.isPublic && stableRequests && stableRequests.length) {
      checks.push('stableRequests');
    }
    const newTabs = NFTTabsCfg.filter(t => (t.depends ? checks.includes(t.depends) : true));
    //console.log('ADJUST FARM TABS', newTabs, NFTTabsCfg);
    return newTabs;
  }, [stakedHorses, currentNFT.isPublic, stableRequests, NFTTabsCfg]);

  const defaultTab = useMemo(() => {
    if (currentNFT.tokenId) {
      return 'properties';
    }
    return null;
  }, [currentNFT.tokenId]);

  const offerProps = useMemo(() => {
    return {
      tokenType: currentNFT.collectionType,
      tokenName: currentNFT.name,
      availableQuantityToAcceptAnOffer: currentNFT.availableQuantityToAcceptAnOffer,
      tokenImageUrl: currentNFT.imageThumbnail,
      hasMultipleShares: currentNFT.hasMultipleShares,
    };
  }, [currentNFT]);

  //check for change of tabs
  const onTabsChange = useMemoizedCallback(
    (selectedTab: string, setSelectedTab: (arg0: string) => void, tabs: string | any[]) => {
      //console.log('TABS CHANGE', selectedTab, tabs);
      if (defaultTab && !tabs.includes(selectedTab)) {
        setSelectedTab(defaultTab);
      }
    }
  );
  return (
    <BaseTabs
      tabsCfg={adjustedNFTTabs}
      className={className}
      defaultTab={defaultTab}
      onTabsChange={onTabsChange}
      tabCounts={counts}
      renderTabPanes={(selectedTab: string) => {
        return (
          <>
            <TabPanel id="properties" activeId={selectedTab}>
              <Properties currentNFT={currentNFT} />
            </TabPanel>
            <TabPanel id="offers" activeId={selectedTab}>
              <Offers baseTokenPrice={baseTokenPrice} offers={offers} {...offerProps} />
            </TabPanel>
            <TabPanel id="stables" activeId={selectedTab}>
              <StakedHorsesWrapper stakedHorses={stakedHorses} />
            </TabPanel>
            <TabPanel id="coordinates" activeId={selectedTab}>
              <CoordinatesTab coordinates={coordinates} />
            </TabPanel>
            <TabPanel id="requests" activeId={selectedTab}>
              <StableRequestsWrapper stableRequests={stableRequests} />
            </TabPanel>
          </>
        );
      }}
    />
  );
};

export default FarmNFTTabs;
