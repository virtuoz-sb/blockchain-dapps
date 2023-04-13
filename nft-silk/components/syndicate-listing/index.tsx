import React, { FunctionComponent, useEffect, useState } from 'react';
import { Icon } from '@components/icons';
import useTranslation from '@hooks/useTranslation';
import clsx from 'clsx';
import styles from './syndicate-listing.module.scss';
import useWalletStore from '@hooks/useWalletStore';
import ReactTooltip from 'react-tooltip';
import { useMoralis } from 'react-moralis';
import { BuyModalComponent } from '@components/marketplace/buy-modal';
import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import { getTimestampInSeconds, convertMsToTime } from '@common/helpers/dateHelper';
import { isBuyDisabled } from '@common/contractStateCfg';

export type syndicateProps = {
  syndicateListingData: IHorseSyndicateListingTab[];
  baseTokenPrice: any;
  currentNFT: INFTBase;
  [props: string]: any; // All other props
};

interface ISyndicateListingModel extends IHorseSyndicateListingTab {
  priceInUSD: number;
  isBuyListingEnabled: boolean;
  isCancelListingEnabled: boolean;
  currentExpirationTime: string;
}

export const SyndicateListing: FunctionComponent<syndicateProps> = ({
  syndicateListingData,
  baseTokenPrice,
  currentNFT,
  ...domProps
}) => {
  const [listingData, setListingData] = useState<ISyndicateListingModel[]>();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedSyndicateListingToBuy, setSelectedSyndicateListingToBuy] = useState<ISyndicateListingModel>();

  const { getEthInUsd } = useWalletStore();
  const { account } = useMoralis();
  const { t } = useTranslation();

  useEffect(() => {
    if (syndicateListingData && baseTokenPrice) {
      moralisGetUsdPrice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syndicateListingData, baseTokenPrice]);

  const moralisGetUsdPrice = async () => {
    if (syndicateListingData) {
      let model: ISyndicateListingModel[] = [];

      for (let listing of syndicateListingData) {
        const priceInUSD = await getEthInUsd(baseTokenPrice, listing.priceInETH, false);

        const isBuyListingEnabled = account
          ? account.toLowerCase() == listing.fromOwnerWalletAddress.toLowerCase()
            ? false
            : true
          : true;
        const isCancelListingEnabled = account
          ? account.toLowerCase() == listing.fromOwnerWalletAddress.toLowerCase()
            ? true
            : false
          : false;

        var currentGMTTimestampInSeconds = getTimestampInSeconds(new Date(new Date().toUTCString()));
        var timestampDifference = listing.expirationTimestamp - currentGMTTimestampInSeconds;
        var currentExpirationTime = convertMsToTime(timestampDifference);

        model.push({
          ...listing,
          priceInUSD: priceInUSD,
          isBuyListingEnabled: isBuyListingEnabled,
          isCancelListingEnabled: isCancelListingEnabled,
          currentExpirationTime: currentExpirationTime,
        });
      }
      setListingData(model);
    }
  };

  useEffect(() => {
    if (listingData) {
      ReactTooltip.rebuild();
    }
  }, [listingData]);

  useEffect(() => {
    if (selectedSyndicateListingToBuy) {
      setIsBuyModalOpen(!isBuyModalOpen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSyndicateListingToBuy]);

  useEffect(() => {
    if (!isBuyModalOpen) {
      setSelectedSyndicateListingToBuy(undefined);
    }
  }, [isBuyModalOpen]);

  const buyModalComponent = () => {
    if (isBuyModalOpen) {
      return (
        <BuyModalComponent
          isOpen={isBuyModalOpen}
          isOpenEvent={setIsBuyModalOpen}
          tokenId={currentNFT.tokenId}
          tokenName={currentNFT.name}
          tokenImageThumbnailUrl={currentNFT.imageThumbnail}
          sellerWalletAddress={selectedSyndicateListingToBuy.fromOwnerWalletAddress}
          marketPlaceItemId={selectedSyndicateListingToBuy.marketplaceItemId}
          totalInETH={selectedSyndicateListingToBuy.priceInETH}
          quantityOfShares={selectedSyndicateListingToBuy.quantity}
          contractType={ContractTypeEnum.HorsePartnership}
        />
      );
    } else return '';
  };

  return (
    <>
      <ReactTooltip id="comingSoonTooltip" place="bottom" type="dark" effect="solid">
        <span>Coming Soon!</span>
      </ReactTooltip>
      <div className={clsx('rounded-md bg-blue-900 overflow-auto', styles.syndicateListingTabWrapper)}>
        <div className={clsx('rounded-md bg-blue-900 overflow-auto p-6 h-full')}>
          {listingData?.length > 0 ? (
            <>
              <table className="w-full" cellPadding={10}>
                <thead>
                  <tr className="border-b border-gray-600">
                    <th
                      scope="col"
                      className="whitespace-nowrap sticky top-0 z-10 bg-blue-900 bg-opacity-95 py-3.5  text-left text-xs backdrop-filter text-white-500 font-normal"
                    >
                      {t('syndicateListing.price')}
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap sticky top-0 z-10 hidden bg-blue-900 bg-opacity-95  text-left text-xs backdrop-filter sm:table-cell text-white-500 font-normal"
                    >
                      {t('syndicateListing.usdPrice')}
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap sticky top-0 z-10 hidden bg-blue-900 bg-opacity-95  text-left text-xs backdrop-filter lg:table-cell text-white-500 font-normal"
                    >
                      {t('syndicateListing.quantity')}
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap sticky top-0 z-10 hidden bg-blue-900 bg-opacity-95  text-left text-xs backdrop-filter lg:table-cell text-white-500 font-normal"
                    >
                      {t('syndicateListing.expiration')}
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap sticky top-0 z-10 hidden bg-blue-900 bg-opacity-95  text-left text-xs backdrop-filter lg:table-cell text-white-500 font-normal"
                    >
                      {t('syndicateListing.from')}
                    </th>
                    <th
                      scope="col"
                      className="sticky top-0 z-10 bg-blue-900 bg-opacity-95 text-left text-xs backdrop-filter text-white-500 font-normal"
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {listingData.map((syndicate, index) => (
                    <tr key={index} className="hover:bg-white/10 text-xs border-b border-gray-600 ">
                      <td className="whitespace-nowrap text-left flex items-center h-full">
                        <Icon name="eth-gray-rounded" className="h-5 w-5 mr-1" />
                        <span className="font-bold ml-3">{syndicate.priceInETH}</span>
                        <span className="ml-3">ETH</span>
                      </td>
                      <td className="whitespace-nowrap text-gray-300">${syndicate?.priceInUSD}</td>
                      <td className="whitespace-nowrap text-gray-300">{syndicate.quantity}</td>
                      <td className="whitespace-nowrap text-gray-300">{syndicate.currentExpirationTime}</td>
                      <td className="whitespace-nowrap text-gray-300">{syndicate.fromOwner}</td>

                      <td className="whitespace-nowrap">
                        {syndicate.isCancelListingEnabled && (
                          <button
                            className="flex items-center justify-center outline outline-1 outline-blue text-blue w-full p-2 h-7 rounded hover:text-white hover:bg-blue"
                            data-tip
                            data-for="comingSoonTooltip"
                          >
                            {t('syndicateListing.cancel')}
                          </button>
                        )}

                        {!isBuyDisabled && syndicate.isBuyListingEnabled && (
                          <>
                            <button
                              className="flex items-center justify-center outline outline-1 outline-blue text-blue w-full p-2 h-7 rounded hover:text-white hover:bg-blue"
                              onClick={() => {
                                setSelectedSyndicateListingToBuy(syndicate);
                              }}
                            >
                              {t('syndicateListing.buy')}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {buyModalComponent()}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white">
              <img src="/images/no-listings.svg" className="mb-2" alt="No Listings" />
              {t('syndicateListing.noListings')}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
