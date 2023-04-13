import React, { FunctionComponent, useMemo } from 'react';
import TabPanel from '@components/nft-types/nft-tabs/tab-panel';
import BaseTabs from '@components/nft-types/nft-tabs/base-tabs';
import type { NFTType } from '@components/nft-types/nft-tabs-cfg';
import { useOffers, useTokenPrice, useNFTTabsCfg } from '@components/nft-types/helpers';
import { Offers } from '@components/offers';
import { useMemoizedCallback } from '@hooks/useMemoizedCallback';
import Properties from '@components/properties';

type DefaultNFTTabsProps = {
  currentNFT: NFTType;
  className?: string;
  isCollection?: boolean;
};

const DefaultNFTTabs: FunctionComponent<DefaultNFTTabsProps> = ({ currentNFT, className, isCollection = false }) => {
  //set with tokenId to force change on collection versions
  const NFTTabsCfg = useNFTTabsCfg(currentNFT?.collectionType, currentNFT?.tokenId);
  const { baseTokenPrice } = useTokenPrice();
  const { offers } = useOffers(currentNFT, isCollection);

  //used for selector labels
  const counts = useMemo(() => {
    return { offers: offers ? offers.length : false };
  }, [offers]);

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
  //condition Boolean(currentNFT && offers && baseTokenPrice)
  //if tokenId changes will reset to properties
  const onTabsChange = useMemoizedCallback((selectedTab: string, setSelectedTab: (arg0: string) => void) => {
    //console.log('TABS CHANGE', selectedTab, defaultTab);
    if (defaultTab && selectedTab !== defaultTab) {
      setSelectedTab(defaultTab);
    }
  });
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
          </>
        );
      }}
    />
  );
};

export default DefaultNFTTabs;
