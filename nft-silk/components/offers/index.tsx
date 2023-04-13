import React, { FunctionComponent, useState, useEffect } from 'react';
import { Icon } from '@components/icons';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import useTranslation from '@hooks/useTranslation';
import clsx from 'clsx';

import { numberFormat } from '@common/helpers/formatters';
import { convertMsToTime, getTimestampInSeconds } from '@common/helpers/dateHelper';
import useWalletStore from '@hooks/useWalletStore';
import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import { AcceptOfferModalComponent } from '@components/marketplace/accept-offer-modal';
import { DeclineOfferModalComponent } from '@components/marketplace/decline-offer-modal';

import styles from './offers.module.scss';

export type OffersProps = {
  offers: IOffer[];
  tokenType: ContractTypeEnum;
  tokenName: string;
  tokenImageUrl: string;
  baseTokenPrice: any;
  availableQuantityToAcceptAnOffer: number;
  hasMultipleShares: boolean;
  [props: string]: any; // All other props
};

export const Offers: FunctionComponent<OffersProps> = ({
  offers,
  tokenType,
  tokenName,
  tokenImageUrl,
  baseTokenPrice,
  availableQuantityToAcceptAnOffer = 0,
  hasMultipleShares = false,
  ...domProps
}) => {
  const [offersData, setOffersData] = useState<IOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<IOffer>(null);

  const [isAcceptOfferModalOpen, setIsAcceptOfferModalOpen] = useState<boolean>(false);
  const [isDeclinetOfferModalOpen, setIsDeclineOfferModalOpen] = useState<boolean>(false);

  const { getFloorPrice, getEthInUsd } = useWalletStore();
  const { isInitialized, Moralis, account, isAuthenticated } = useMoralis();
  const { native } = useMoralisWeb3Api();
  const { t } = useTranslation();

  useEffect(() => {
    if (offers && baseTokenPrice && isInitialized) {
      initialize(offers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers, availableQuantityToAcceptAnOffer, baseTokenPrice, isInitialized, isAuthenticated, account]);

  const initialize = async (offers: IOffer[]) => {
    if (offers && offers.length > 0) {
      let floorPriceInWei = await getFloorPrice(Moralis, native, offers[0].collectionType);
      console.log('floor price in wei', floorPriceInWei);
      console.log('isAuthenticated', isAuthenticated);
      console.log('account', account);
      console.log('offers', offers);
      console.log('account', account);
      console.log('availableQuantityToAcceptAnOffer', availableQuantityToAcceptAnOffer);

      for (let offer of offers) {
        offer.priceInUSD = await getEthInUsd(baseTokenPrice, offer.priceInETH, false);

        var floorText =
          offer.priceInETH == floorPriceInWei
            ? ''
            : offer.priceInETH > floorPriceInWei
            ? t('offers.above')
            : t('offers.below');
        if (floorPriceInWei > 0) {
          offer.floorDifference = `${floorText} ${Math.round(
            (offer.priceInETH * 100) / floorPriceInWei - 100
          ).toString()}%`;
        } else {
          offer.floorDifference = `${floorText} ${Math.round((offer.priceInETH / 0.0001) * 100).toString()}%`;
        }

        var currentGMTTimestampInSeconds = getTimestampInSeconds(new Date(new Date().toUTCString()));
        var timestampDifference = offer.expirationDateUnix - currentGMTTimestampInSeconds;
        offer.currentExpirationTime = convertMsToTime(timestampDifference);

        if (
          isAuthenticated &&
          account &&
          offer.offererWalletAddress.toLowerCase() != account.toLowerCase() &&
          availableQuantityToAcceptAnOffer > 0
        ) {
          offer.isAcceptButtonEnabled = true;

          if (hasMultipleShares) {
            offer.isDeclineButtonEnabled = false;
          } else {
            offer.isDeclineButtonEnabled = true;
          }
        } else {
          offer.isAcceptButtonEnabled = false;
          offer.isDeclineButtonEnabled = false;
        }
      }

      setOffersData(offers);
    }
  };

  useEffect(() => {
    if (!isAcceptOfferModalOpen && !isDeclinetOfferModalOpen) {
      setSelectedOffer(null);
    }
  }, [isAcceptOfferModalOpen, isDeclinetOfferModalOpen]);

  return (
    <div className={clsx('rounded-md bg-blue-900 overflow-auto', styles.offersTabWrapper)}>
      <div className={clsx('rounded-md bg-blue-900 overflow-auto p-6 h-full')}>
        {offers?.length > 0 ? (
          <>
            <table className="w-full" cellPadding={10}>
              <thead>
                <tr className="border-b border-gray-600">
                  <th
                    scope="col"
                    className="whitespace-nowrap sticky top-0 z-10 bg-blue-900 bg-opacity-95 py-3.5  text-left text-xs backdrop-filter text-white-500 font-normal"
                  >
                    {t('offers.price')}
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap sticky top-0 z-10 hidden bg-blue-900 bg-opacity-95  text-left text-xs backdrop-filter sm:table-cell text-white-500 font-normal"
                  >
                    {t('offers.quantity')}
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap sticky top-0 z-10 hidden bg-blue-900 bg-opacity-95  text-left text-xs backdrop-filter sm:table-cell text-white-500 font-normal"
                  >
                    {t('offers.usdPrice')}
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap sticky top-0 z-10 hidden bg-blue-900 bg-opacity-95  text-left text-xs backdrop-filter lg:table-cell text-white-500 font-normal"
                  >
                    {t('offers.floorDifference')}
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap sticky top-0 z-10 bg-blue-900 bg-opacity-95 text-left text-xs backdrop-filter text-white-500 font-normal"
                  >
                    {t('offers.expiration')}
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap sticky top-0 z-10 bg-blue-900 bg-opacity-95 text-left text-xs backdrop-filter text-white-500 font-normal"
                  >
                    {t('offers.from')}
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 bg-blue-900 bg-opacity-95  text-left text-xs backdrop-filter text-white-500 font-normal"
                  ></th>
                  <th
                    scope="col"
                    className="sticky top-0 z-10 bg-blue-900 bg-opacity-95 text-left text-xs backdrop-filter text-white-500 font-normal"
                  ></th>
                </tr>
              </thead>
              <tbody>
                {offersData.map(offer => (
                  <tr
                    key={offer.marketPlacePriceOffersID}
                    className="hover:bg-white/10 text-xs border-b border-gray-600 "
                  >
                    <td className="whitespace-nowrap text-left flex items-center h-full">
                      <Icon name="eth-red-offers" className="h-5 w-5 mr-1" />
                      {numberFormat(offer.priceInETH, 4)}
                    </td>
                    <td className="whitespace-nowrap text-gray-300">{offer.quantity}</td>
                    <td className="whitespace-nowrap text-gray-300">${offer.priceInUSD}</td>
                    <td className="whitespace-nowrap text-gray-300">{offer.floorDifference}</td>
                    <td className="whitespace-nowrap text-gray-300">{offer.currentExpirationTime}</td>
                    <td className="whitespace-nowrap text-blue-300">
                      <u>{offer.offererName}</u>
                    </td>
                    {offer.isAcceptButtonEnabled && (
                      <td className="whitespace-nowrap">
                        <button
                          className="flex items-center justify-center outline outline-1 outline-blue text-blue w-full p-2 h-7 rounded hover:text-white hover:bg-blue"
                          onClick={async () => {
                            setSelectedOffer(offer);
                            setIsAcceptOfferModalOpen(true);
                          }}
                        >
                          {t('offers.accept')}
                        </button>
                      </td>
                    )}
                    {offer.isDeclineButtonEnabled && (
                      <td className="whitespace-nowrap border-b border-gray-600">
                        <button
                          className="flex items-center justify-center outline outline-1 outline-blue text-blue w-full p-2 h-7 rounded hover:text-white hover:bg-blue"
                          onClick={async () => {
                            setSelectedOffer(offer);
                            setIsDeclineOfferModalOpen(true);
                          }}
                        >
                          {t('offers.decline')}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <AcceptOfferModalComponent
              isOpen={isAcceptOfferModalOpen && selectedOffer !== null}
              isOpenEvent={setIsAcceptOfferModalOpen}
              offerMarketplaceIndexId={selectedOffer?.indexID}
              offerFromUserWalletAddress={selectedOffer?.offererWalletAddress}
              offerFromUser={selectedOffer?.offererName}
              offerQuantity={selectedOffer?.quantity}
              offerPriceInETH={selectedOffer?.priceInETH}
              availableQuantityForSell={availableQuantityToAcceptAnOffer}
              tokenType={tokenType}
              tokenId={selectedOffer?.tokenId}
              name={tokenName}
              imageURL={tokenImageUrl}
            />

            <DeclineOfferModalComponent
              isOpen={isDeclinetOfferModalOpen && selectedOffer !== null}
              isOpenEvent={setIsDeclineOfferModalOpen}
              offerMarketplaceIndexId={selectedOffer?.indexID}
              offerFromUserWalletAddress={selectedOffer?.offererWalletAddress}
              offerFromUser={selectedOffer?.offererName}
              offerQuantity={selectedOffer?.quantity}
              offerPriceInETH={selectedOffer?.priceInETH}
              availableQuantityForSell={availableQuantityToAcceptAnOffer}
              tokenType={tokenType}
              tokenId={selectedOffer?.tokenId}
              name={tokenName}
              imageURL={tokenImageUrl}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white">
            <img src="/images/no-listings.svg" className="mb-2" alt="No Listings" />
            {t('offers.noOffers')}
          </div>
        )}
      </div>
    </div>
  );
};
