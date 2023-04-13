import React, { FunctionComponent, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';

import { Button } from '@components/button';
import { Loader } from '@components/loader';
import { Icon } from '@components/icons';
import { DisplayModal } from '@components/modals/display-modal';
import useWalletStore from '@hooks/useWalletStore';
import useAppStore from '@hooks/useAppStore';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import Account from '@components/ethereum/Account/Account';
import { getNftImageThumbnail } from '@common/getInformationPerNftCollectionEnum';
import { acceptOfferSendNotification, getTokenTypeByCollectionType } from '@common/api/portal/marketplace';
import useTranslation from '@hooks/useTranslation';
import { nftCanDisplayName } from '@common/helpers/marketplaceHelper';
import CountDown from '@components/horse-action/components/count-down';
import { useAfterConfirmCountDown } from '@components/horse-action/helpers';

import styles from './accept-offer-modal.module.scss';

const successTimeout = 5000;

export type IAcceptOfferModalProps = {
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

export const AcceptOfferModalComponent: FunctionComponent<IAcceptOfferModalProps> = ({
  isOpen,
  isOpenEvent,
  offerMarketplaceIndexId,
  offerFromUserWalletAddress: offerFromOwnerWalletAddress,
  offerFromUser: offerFromOwner,
  offerQuantity,
  offerPriceInETH,
  availableQuantityForSell,
  tokenType,
  tokenTypeName,
  tokenId,
  name,
  imageURL,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>();
  const [isAcceptOfferWithError, setIsAcceptOfferWithError] = useState<boolean>(false);
  const [isAcceptOfferSuccess, setIsAcceptOfferSuccess] = useState<boolean>(false);
  const [isAcceptOfferModalOpen, setIsAcceptOfferModalOpen] = useState<boolean>(false);
  const [isAcceptOfferButtonDisabled, setIsAcceptOfferButtonDisabled] = useState<boolean>(false);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(true);

  const [isRequestApprovalInProgress, setIsRequestApprovalInProgress] = useState<boolean>();

  const [collectionsName, setCollectionsName] = useState<string>();
  const [nftOfferPriceInETH, setNftOfferPriceInETH] = useState<number>();
  const [nftOfferPriceInUSD, setNftOfferPriceInUSD] = useState<number>();

  const [nftQuantityForSale, setNftQuantityForSale] = useState<number>();
  const [nftMaxQuantityForSale, setNftMaxQuantityForSale] = useState<number>();
  const [baseTokenPrice, setBaseTokenPrice] = useState<any>();

  const { getTokenPrice, getEthInUsd, acceptOffer, isTransactionsApprovedForAddress, approveTransactionsForAddress } =
    useWalletStore();
  const { profile } = useAppStore();
  const { isInitialized, Moralis, isAuthenticated, account } = useMoralis();
  const { native } = useMoralisWeb3Api();
  const { t } = useTranslation();

  const getUserProfile = async () => {
    const userProfile = await profile;
    if (!userProfile) {
      console.log('profile is not loaded.');
      return undefined;
    }
    console.log(userProfile);
    return userProfile;
  };

  const handleAcceptOfferNFT = async () => {
    setIsLoading(true);

    console.log('marketplace id from accept offer', offerMarketplaceIndexId);
    console.log('Quantity accepted', nftQuantityForSale);

    try {
      const acceptOfferResponse = await acceptOffer(
        Moralis,
        tokenType,
        tokenId,
        offerMarketplaceIndexId,
        nftQuantityForSale
      );
      console.log('accept offer response', acceptOfferResponse);

      if (acceptOfferResponse == undefined || acceptOfferResponse.code == -32603 || acceptOfferResponse.code == 4001) {
        console.log('Something went wrong. Accept offer NFT function', acceptOfferResponse);
        setIsAcceptOfferWithError(true);
        return;
      }

      const notificationResponse = await acceptOfferSendNotification(
        offerFromOwnerWalletAddress,
        tokenId.toString(),
        tokenType
      );

      setIsAcceptOfferSuccess(true);
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
        initializeAcceptOfferComponent().then(() => {
          setIsLoading(false);
          setIsAcceptOfferModalOpen(true);
        });
        console.log('offer from owner', offerFromOwner);
        console.log('offer quantity', offerQuantity);
        console.log('user can accept only', availableQuantityForSell);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, baseTokenPrice]);

  const initializeAcceptOfferComponent = async () => {
    await checkIfUserApprovedTransactionForTheMarketplace();

    const maxQuantityAvailableToAccept =
      availableQuantityForSell > offerQuantity ? offerQuantity : availableQuantityForSell;

    setNftQuantityForSale(maxQuantityAvailableToAccept);
    setNftMaxQuantityForSale(maxQuantityAvailableToAccept);
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

  const checkIfUserApprovedTransactionForTheMarketplace = async () => {
    const userProfile = await getUserProfile();

    const walletAddress = userProfile ? userProfile.walletAddress : account;

    const isApproved = await checkIsTransactionApprovedForAddress(walletAddress);

    if (!isApproved) {
      const requestApproval = await approveTransactionsForAddress(Moralis, tokenType);
      console.log('request approval status', requestApproval);

      if (requestApproval == undefined || requestApproval.code == 4001) return;

      requestApprovalInProgress(walletAddress);
    }
  };

  const checkIsTransactionApprovedForAddress = async (walletAddress: string): Promise<boolean> => {
    if (walletAddress) {
      const isApproved = await isTransactionsApprovedForAddress(native, walletAddress, tokenType);
      console.log('request is approved?', isApproved);
      return isApproved;
    } else {
      return undefined;
    }
  };

  const requestApprovalInProgress = async (walletAddress: string) => {
    if (walletAddress) {
      setIsRequestApprovalInProgress(true);
      setIsAcceptOfferButtonDisabled(true);
      const isApproved = await checkIsTransactionApprovedForAddress(walletAddress);
      if (isApproved) {
        setIsRequestApprovalInProgress(false);
        setIsAcceptOfferButtonDisabled(false);
      } else {
        setTimeout(requestApprovalInProgress, 5000, walletAddress);
      }
    }
  };

  useEffect(() => {
    if (!isWalletConnected) {
      setIsWalletConnected(true);
    }
  }, [isWalletConnected]);

  useEffect(() => {
    getNftPriceInUSD(nftOfferPriceInETH);

    if (nftOfferPriceInETH && nftOfferPriceInETH > 0 && isAcceptOfferButtonDisabled) {
      setIsAcceptOfferButtonDisabled(false);
    } else if (!nftOfferPriceInETH || nftOfferPriceInETH == 0) {
      setIsAcceptOfferButtonDisabled(true);
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

  //close success after 5 seconds countdown
  const timeLeft = useAfterConfirmCountDown(
    () => {
      closeModalEvents();
    },
    isAcceptOfferSuccess,
    successTimeout
  );

  const closeModalEvents = () => {
    setIsAcceptOfferModalOpen(false);
    isOpenEvent(false);
    setIsAcceptOfferWithError(false);
    setIsAcceptOfferSuccess(false);
  };

  return (
    <div>
      <div className="hidden">
        <Account triggerAuthModal={!isWalletConnected} />
      </div>
      {isLoading ? <Loader /> : ''}
      <DisplayModal
        id="sellDialogModal"
        title=""
        isOpen={isAcceptOfferModalOpen}
        onClose={() => {
          closeModalEvents();
        }}
        width="w-[800px]"
        height="h-[550px]"
      >
        {isAcceptOfferWithError ? (
          <div className="flex flex-col justify-center items-center ml-24 mr-24">
            <div className="pt-6 font-bold text-3xl text-white">{t('marketplaceModals.error.title')}</div>
            <div className="w-full pt-10 border-b border-gray-700" />
            <div className="pt-24 font-medium text-center">{t('marketplaceModals.error.subTitle')}</div>
            <div className="text-gray-300 text-center">{t('marketplaceModals.error.message')}</div>
          </div>
        ) : isAcceptOfferSuccess ? (
          <div className="flex flex-col justify-center items-center ml-24 mr-24">
            <div className="font-bold text-3xl text-white">{t('acceptOfferModal.successTitle')}</div>
            <div className="w-full mt-2 border-b border-gray-700" />
            <div className={clsx('h-52 w-52 mt-5', styles.notched)}>
              <img
                src={imageURL || getNftImageThumbnail(tokenType)}
                className="w-full h-full rounded-md"
                alt="cardItem"
              />
            </div>
            <div className="mt-4 font-medium">
              {collectionsName} #{tokenId}
              {nftCanDisplayName(tokenType) && name && ': ' + name}
            </div>
            <div className="text-gray-300 text-sm text-center">{t('acceptOfferModal.successMessage')}</div>
            <CountDown count={timeLeft / 1000} className="mt-8" />
          </div>
        ) : (
          <>
            <div>
              <div className="flex place-content-center pt-6 font-bold text-2xl text-white">
                {t('acceptOfferModal.title')}
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
                          <div className={clsx(styles.text, 'select-none')}>{nftQuantityForSale}</div>
                          <div className={styles.controls}>
                            <Icon
                              name="increase"
                              className={clsx('h-3 w-3 mb-1', {
                                ['cursor-pointer']: nftQuantityForSale < nftMaxQuantityForSale,
                                ['cursor-not-allowed']: nftQuantityForSale >= nftMaxQuantityForSale,
                              })}
                              onClick={() => {
                                if (nftQuantityForSale < nftMaxQuantityForSale) {
                                  setNftQuantityForSale(nftQuantityForSale + 1);
                                }
                              }}
                            />
                            <Icon
                              name="decrease"
                              className={clsx('h-3 w-3', {
                                ['cursor-pointer']: nftQuantityForSale > 1,
                                ['cursor-not-allowed']: nftQuantityForSale <= 1,
                              })}
                              onClick={() => {
                                if (nftQuantityForSale > 1) {
                                  setNftQuantityForSale(nftQuantityForSale - 1);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pl-6 font-medium">{collectionsName}</div>
                    <div className="w-full ml-4 mt-2 mb-2 border-b border-gray-700" />
                    {isRequestApprovalInProgress ? (
                      <>
                        <div className="pl-6 flex">
                          <div className="mr-2">
                            <Loader fullscreen={false} customHeight={3} customWidth={3} />
                          </div>
                          <div>
                            <div className="flex text-sm text-yellow-300">
                              <p>{t('acceptOfferModal.approvalTitle')}</p>
                            </div>
                            <div className="flex text-sm text-gray-300">
                              <p>{t('acceptOfferModal.approvalMessage')}</p>
                            </div>
                          </div>
                        </div>
                        <div className="w-full ml-4 mt-2 border-b border-gray-700" />
                      </>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </div>
              <div className="flex pt-6">
                <div className="w-[65%] flex justify-end">
                  <div className="mt-3">
                    <Button
                      color="primary"
                      onClick={() => {
                        handleAcceptOfferNFT();
                      }}
                      fill="solid"
                      notch="both"
                      disabled={isAcceptOfferButtonDisabled}
                    >
                      {t('acceptOfferModal.accept')}
                    </Button>
                  </div>
                </div>

                <div className="flex pl-16">
                  <div className="ml-6">
                    <div className="pl-6 text-sm text-gray-300 font-medium">{t('acceptOfferModal.totalEarnings')}</div>
                    <div className="flex">
                      <Icon name="eth-gray-rounded" className="h-5 w-5" />
                      <div className="flex pl-2">
                        <div className="font-medium">{(nftOfferPriceInETH * nftQuantityForSale).toFixed(4)}</div>
                        <div className="pl-2 text-sm font-medium">(${nftOfferPriceInUSD * nftQuantityForSale})</div>
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
