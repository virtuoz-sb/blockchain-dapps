import React, { FunctionComponent, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useMoralis } from 'react-moralis';

import { Button } from '@components/button';
import { Loader } from '@components/loader';
import { Icon } from '@components/icons';
import { DisplayModal } from '@components/modals/display-modal';
import useWalletStore from '@hooks/useWalletStore';
import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import Account from '@components/ethereum/Account/Account';
import { getNftImageThumbnail } from '@common/getInformationPerNftCollectionEnum';
import { declineOfferSendNotification, getTokenTypeByCollectionType } from '@common/api/portal/marketplace';
import useTranslation from '@hooks/useTranslation';
import { nftCanDisplayName } from '@common/helpers/marketplaceHelper';

import styles from '../accept-offer-modal/accept-offer-modal.module.scss';

export type IDeclineOfferModalProps = {
  isOpen: boolean;
  isOpenEvent: any;
  offerMarketplaceIndexId: number;
  offerFromUserWalletAddress: string;
  offerFromUser: string;
  offerQuantity: number;
  offerPriceInETH: number;
  availableQuantityForSell: number;
  tokenType: ContractTypeEnum;
  tokenTypeName?: string;
  tokenId: number;
  name: string;
  imageURL: string;
};

export const DeclineOfferModalComponent: FunctionComponent<IDeclineOfferModalProps> = ({
  isOpen,
  isOpenEvent,
  offerMarketplaceIndexId,
  offerFromUserWalletAddress: offerFromOwnerWalletAddress,
  offerFromUser: offerFromOwner,
  offerQuantity,
  offerPriceInETH,
  tokenType,
  tokenTypeName,
  tokenId,
  name,
  imageURL,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>();
  const [isDeclineOfferWithError, setIsDeclineOfferWithError] = useState<boolean>(false);
  const [isDeclineOfferModalOpen, setIsDeclineOfferModalOpen] = useState<boolean>(false);
  const [isDeclineOfferButtonDisabled, setIsDeclineOfferButtonDisabled] = useState<boolean>(false);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(true);

  const [collectionsName, setCollectionsName] = useState<string>();
  const [nftOfferPriceInETH, setNftOfferPriceInETH] = useState<number>();
  const [nftOfferPriceInUSD, setNftOfferPriceInUSD] = useState<number>();

  const [baseTokenPrice, setBaseTokenPrice] = useState<any>();

  const { getTokenPrice, getEthInUsd, declineOffer } = useWalletStore();
  const { isInitialized, Moralis, isAuthenticated } = useMoralis();
  const { t } = useTranslation();

  const onCloseModal = () => {
    setIsDeclineOfferModalOpen(!isDeclineOfferModalOpen);
    isOpenEvent(false);

    // give time for modal to close
    setTimeout(() => {
      setIsDeclineOfferWithError(false);
    }, 500);
  };

  const onDeclineOfferNFT = async () => {
    setIsLoading(true);

    try {
      const declineOfferResponse = await declineOffer(Moralis, tokenType, tokenId, offerMarketplaceIndexId);

      const notificationResponse = await declineOfferSendNotification(
        offerFromOwnerWalletAddress,
        tokenId.toString(),
        tokenType
      );

      onCloseModal();
    } catch (error) {
      if (error == undefined || error.code !== 4001) {
        setIsDeclineOfferWithError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!isAuthenticated) {
        setIsWalletConnected(false);
      } else if (baseTokenPrice) {
        setIsLoading(isOpen);
        initializeDeclineComponent().then(() => {
          setIsLoading(false);
          setIsDeclineOfferModalOpen(true);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, baseTokenPrice]);

  const initializeDeclineComponent = async () => {
    setNftOfferPriceInETH(offerPriceInETH);
    await getCollectionName();
    await getNftPriceInUSD(offerPriceInETH);
  };

  const getCollectionName = async () => {
    if (tokenTypeName) {
      setCollectionsName(tokenTypeName);
    } else {
      const tokenEntity = await getTokenTypeByCollectionType(tokenType);
      setCollectionsName(tokenEntity.collectionDetailName);
    }
  };

  useEffect(() => {
    if (!isWalletConnected) {
      setIsWalletConnected(true);
    }
  }, [isWalletConnected]);

  useEffect(() => {
    getNftPriceInUSD(nftOfferPriceInETH);

    if (nftOfferPriceInETH && nftOfferPriceInETH > 0 && isDeclineOfferButtonDisabled) {
      setIsDeclineOfferButtonDisabled(false);
    } else if (!nftOfferPriceInETH || nftOfferPriceInETH == 0) {
      setIsDeclineOfferButtonDisabled(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftOfferPriceInETH]);

  const getNftPriceInUSD = async ethPrice => {
    if (ethPrice) {
      setNftOfferPriceInUSD(await moralisGetUsdPrice(ethPrice));
    } else {
      setNftOfferPriceInUSD(0);
    }
  };

  const moralisGetUsdPrice = async ethPrice => {
    if (ethPrice) {
      return await getEthInUsd(baseTokenPrice, ethPrice, false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      moralisGetTokenPrice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  const moralisGetTokenPrice = async () => {
    const tokenPrice = await getTokenPrice(Moralis);
    // console.log(tokenPrice);
    setBaseTokenPrice(tokenPrice);
  };

  return (
    <div>
      <div className="hidden">
        <Account triggerAuthModal={!isWalletConnected} />
      </div>
      {isLoading ? <Loader /> : ''}
      <DisplayModal
        id="declientOfferModal"
        title=""
        isOpen={isDeclineOfferModalOpen}
        onClose={onCloseModal}
        width="w-[800px]"
        height="h-[550px]"
      >
        {isDeclineOfferWithError && (
          <div className="flex flex-col justify-center items-center ml-24 mr-24">
            <div className="pt-6 font-bold text-3xl text-white">{t('marketplaceModals.error.title')}</div>
            <div className="w-full pt-10 border-b border-gray-700" />
            <div className="pt-24 font-medium text-center">{t('marketplaceModals.error.subTitle')}</div>
            <div className="text-gray-300 text-center">{t('marketplaceModals.error.message')}</div>
          </div>
        )}

        {!isDeclineOfferWithError && (
          <>
            <div>
              <div className="flex place-content-center pt-6 font-bold text-2xl text-white">
                {t('declineOfferModal.title')}
              </div>
              <div className="flex place-content-center text-sm">
                {t('acceptOfferModal.from')}
                <p className="text-blue-300 font-bold pl-1">{offerFromOwner}</p>
              </div>
              <div className="ml-16 mr-16 pt-6">
                <div className="w-full mb-6 border-b border-gray-700" />
                <div className="flex">
                  <div className={clsx('h-52 w-52', styles.notched)}>
                    <img
                      src={imageURL || getNftImageThumbnail(tokenType)}
                      className="w-full h-full rounded-md"
                      alt="cardItem"
                    />
                  </div>
                  <div className="w-[70%]">
                    <div className="flex justify-between">
                      <div className="ml-6">
                        <div className="text-sm text-gray-300 font-medium">{t('acceptOfferModal.item')}</div>

                        <div>{nftCanDisplayName(tokenType) && name}</div>

                        <div className="flex mr-12">
                          {tokenType == ContractTypeEnum.HorseGovernance ? (
                            <div className="mr-7 w-24">
                              <span className="inline-flex items-center h-8 px-3 py-0.5 rounded-full text-xs font-medium bg-purple-700">
                                <Icon name="governance" className="h-3 w-5 mr-1 mb-2" />
                                {t('horse.governance')}
                              </span>
                            </div>
                          ) : (
                            tokenType == ContractTypeEnum.HorsePartnership && (
                              <div className="mr-7 w-24">
                                <span className="inline-flex items-center h-8 px-3 py-0.5 rounded-full text-xs font-medium bg-rose-900">
                                  <Icon name="partnership" className="h-2 w-4 mr-1 mb-2" />
                                  {t('horse.partnership')}
                                </span>
                              </div>
                            )
                          )}

                          <div className="font-bold text-2xl text-white">#{tokenId}</div>
                        </div>
                      </div>
                      <div className="ml-6">
                        <div className="pl-6 text-sm text-gray-300 font-medium">{t('acceptOfferModal.subtotal')}</div>
                        <div className="flex">
                          <Icon name="eth-gray-rounded" className="h-5 w-5" />
                          <div className="flex pl-2">
                            <div className="font-medium">{nftOfferPriceInETH}</div>
                            <div className="pl-2 text-sm font-medium">(${nftOfferPriceInUSD})</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className={clsx(styles.sharesQuantity, styles.picker)}>
                        <div className={styles.title}>{t('acceptOfferModal.quantity')}</div>
                        <div className={styles.count}>
                          <div className={clsx(styles.text, 'select-none')}>{offerQuantity}</div>
                        </div>
                      </div>
                    </div>

                    <div className="pl-6 font-medium">{collectionsName}</div>
                    <div className="w-full ml-4 mt-2 mb-2 border-b border-gray-700" />
                  </div>
                </div>
              </div>
              <div className="flex pt-6">
                <div className="w-[65%] flex justify-end">
                  <div className="mt-3">
                    <Button
                      color="primary"
                      onClick={() => {
                        onDeclineOfferNFT();
                      }}
                      fill="solid"
                      notch="both"
                      disabled={isDeclineOfferButtonDisabled}
                    >
                      {t('declineOfferModal.decline')}
                    </Button>
                  </div>
                </div>

                <div className="flex pl-16">
                  <div className="ml-6">
                    <div className="pl-6 text-sm text-gray-300 font-medium">{t('acceptOfferModal.totalEarnings')}</div>
                    <div className="flex">
                      <Icon name="eth-gray-rounded" className="h-5 w-5" />
                      <div className="flex pl-2">
                        <div className="font-medium">{(nftOfferPriceInETH * offerQuantity).toFixed(4)}</div>
                        <div className="pl-2 text-sm font-medium">(${nftOfferPriceInUSD * offerQuantity})</div>
                      </div>
                    </div>
                    <div className="w-full pt-2 border-b border-gray-700" />
                    <div className="w-full pt-1 border-b border-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DisplayModal>
    </div>
  );
};
