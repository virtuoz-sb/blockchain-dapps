import React, { FunctionComponent, useMemo } from 'react';
import TabPanel from '@components/nft-types/nft-tabs/tab-panel';
import BaseTabs from '@components/nft-types/nft-tabs/base-tabs';
import { useOffers, useTokenPrice, useNFTTabsCfg } from '@components/nft-types/helpers';
import { Offers } from '@components/offers';
import { useMemoizedCallback } from '@hooks/useMemoizedCallback';
import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import Properties from '@components/properties';

import { Syndicate } from '@components/syndicate';
import { SyndicateListing } from '@components/syndicate-listing';

type HorseFTTabsProps = {
  currentNFT: IHorse;
  className?: string;
  isCollection?: boolean;
};

const HorseNFTTabs: FunctionComponent<HorseFTTabsProps> = ({ currentNFT, isCollection = false, className }) => {
  //set with tokenId to force change on collection versions
  const NFTTabsCfg = useNFTTabsCfg(currentNFT?.collectionType, currentNFT?.tokenId);
  const { baseTokenPrice } = useTokenPrice();
  const { offers } = useOffers(currentNFT, isCollection);

  //used for selector labels
  const counts = useMemo(() => {
    return { offers: offers ? offers.length : false };
  }, [offers]);

  //nft.isFractionalized
  const { isSyndicated, isListing } = useMemo(() => {
    return {
      isSyndicated:
        currentNFT.collectionType === ContractTypeEnum.HorseGovernance ||
        currentNFT.collectionType === ContractTypeEnum.HorsePartnership,
      isListing: currentNFT.collectionType === ContractTypeEnum.HorsePartnership,
    };
  }, [currentNFT.collectionType]);

  const defaultTab = useMemo(() => {
    if (currentNFT.tokenId) {
      return isSyndicated ? 'syndicate' : 'properties';
    }
    return null;
  }, [isSyndicated, currentNFT.tokenId]);

  const offerProps = useMemo(() => {
    return {
      tokenType: currentNFT.collectionType,
      tokenName: currentNFT.name,
      availableQuantityToAcceptAnOffer: currentNFT.availableQuantityToAcceptAnOffer,
      tokenImageUrl: currentNFT.imageThumbnail,
      hasMultipleShares: currentNFT.hasMultipleShares,
    };
  }, [currentNFT]);

  //check for change of tabs - selected may not exist: set to new default tab based on type
  const onTabsChange = useMemoizedCallback(
    (selectedTab: string, setSelectedTab: (arg0: string) => void, tabs: string | any[]) => {
      //console.log('TABS CHANGE', selectedTab, tabs, defaultTab);
      if (defaultTab && (!tabs.includes(selectedTab) || selectedTab !== defaultTab)) {
        setSelectedTab(defaultTab);
      }
    }
  );
  return (
    <BaseTabs
      tabsCfg={NFTTabsCfg}
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
            <TabPanel id="syndicate" activeId={selectedTab} condition={isSyndicated}>
              <Syndicate syndicateData={currentNFT.syndicateTab} />
            </TabPanel>
            <TabPanel id="listing" activeId={selectedTab} condition={isListing}>
              <SyndicateListing
                syndicateListingData={currentNFT.syndicateListingTab}
                baseTokenPrice={baseTokenPrice}
                currentNFT={currentNFT}
              />
            </TabPanel>
          </>
        );
      }}
    />
  );
};

export default HorseNFTTabs;
