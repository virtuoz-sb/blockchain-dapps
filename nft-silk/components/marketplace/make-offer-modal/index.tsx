import React, { FunctionComponent, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';

import { Button } from '@components/button';
import { Loader } from '@components/loader';
import { Icon } from '@components/icons';
import { DisplayModal } from '@components/modals/display-modal';
import useWalletStore from '@hooks/useWalletStore';
import useAppStore from '@hooks/useAppStore';
import { TextInputWithoutFormik } from '@components/inputs/text-input';
import { DateTimeComponent } from '@components/inputs/date-picker';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import Account from '@components/ethereum/Account/Account';
import { getNftImageThumbnail } from '@common/getInformationPerNftCollectionEnum';
import {
  checkIfNftHasDifferentOwner,
  getTokenTypeByCollectionType,
  makeOfferNFTNotification,
} from '@common/api/portal/marketplace';
import useTranslation from '@hooks/useTranslation';
import { nftCanDisplayName, nftForSaleHasDifferentOwner } from '@common/helpers/marketplaceHelper';
import CountDown from '@components/horse-action/components/count-down';
import { useAfterConfirmCountDown } from '@components/horse-action/helpers';

import styles from './make-offer-modal.module.scss';
import { CoinTypeEnum } from '@common/enum/CoinTypeEnum';

const successTimeout = 5000;

export type IMakeOfferModalProps = {
  isOpen: boolean;
  isOpenEvent: any;
  contractType: ContractTypeEnum;
  contractName?: string;
  tokenId: number;
  tokenName: string;
  tokenImageThumbnailUrl: string;
  totalInETH?: number;
  quantityForSale?: number;
  tokenOwnersWalletAddressList: string[];
};

export const MakeOfferModalComponent: FunctionComponent<IMakeOfferModalProps> = ({
  isOpen,
  isOpenEvent,
  contractType,
  contractName,
  tokenId,
  tokenName,
  tokenImageThumbnailUrl,
  totalInETH = 0.0001,
  quantityForSale = 1,
  tokenOwnersWalletAddressList,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>();
  const [isMakeOfferOwned, setIsMakeOfferOwned] = useState<boolean>(false);
  const [isMakeOfferSuccess, setIsMakeOfferSuccess] = useState<boolean>(false);
  const [isMakeOfferModalOpen, setIsMakeOfferModalOpen] = useState<boolean>(false);
  const [isMakeOfferButtonDisabled, setIsMakeOfferButtonDisabled] = useState<boolean>(false);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(true);

  const [floorPriceInETH, setFloorPriceInETH] = useState<number>();
  const [floorPriceInUSD, setFloorPriceInUSD] = useState<number>();

  const [nftContractName, setNftContractName] = useState<string>();
  const [nftTotalInETH, setNftTotalInETH] = useState<number>();
  const [nftTotalInUSD, setNftTotalInUSD] = useState<number>();
  const [nftTimeDuration, setNftTimeDuration] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 3, new Date().getHours())
  );
  const [nftQuantityForSale, setNftQuantityForSale] = useState<number>();
  const [baseTokenPrice, setBaseTokenPrice] = useState<any>();

  const {
    getTokenPrice,
    getEthInUsd,
    getFloorPrice,
    getMarketplaceItemsForSale,
    makeOfferToNFT,
    getAllNFTsForContract,
  } = useWalletStore();
  const { getContractAddress } = useContractAddressStore();
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

  const handleMakeOfferNFT = async () => {
    setIsLoading(true);

    const unixTimestampInSeconds = new Date(nftTimeDuration.toUTCString()).getTime() / 1000;
    console.log('make offer button clicked');
    console.log('original date (not gmt)', nftTimeDuration);
    console.log('gmt timestamp in seconds', unixTimestampInSeconds);
    console.log('Quantity of shares for the offer', nftQuantityForSale);
    console.log('total in eth', nftTotalInETH);

    try {
      const userProfile = await getUserProfile();

      const makeOfferResponse = await makeOfferToNFT(
        Moralis,
        contractType,
        tokenId,
        nftTotalInETH,
        unixTimestampInSeconds,
        nftQuantityForSale
      );
      console.log('make offer response', makeOfferResponse);

      if (makeOfferResponse == undefined || makeOfferResponse.code == -32603 || makeOfferResponse.code == 4001) {
        console.log('Something went wrong. Make offer NFT function', makeOfferResponse);
        return;
      }

      let tokenOwners = tokenOwnersWalletAddressList.filter(s => s.toLowerCase() != account.toLowerCase());
      const notificationResponse = await makeOfferNFTNotification(
        account,
        tokenOwners,
        contractType,
        nftContractName,
        tokenId,
        nftCanDisplayName(contractType) ? tokenName : '',
        nftTotalInETH,
        CoinTypeEnum.ETH,
        tokenImageThumbnailUrl
      );

      setIsMakeOfferSuccess(true);
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
        initializeMakeOfferComponent().then(() => {
          setIsLoading(false);
          setIsMakeOfferModalOpen(true);
        });
        console.log('quantity available for offer', quantityForSale);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, baseTokenPrice]);

  const initializeMakeOfferComponent = async () => {
    const hasDifferentOwner = await nftHasDifferentOwner();
    if (!hasDifferentOwner) {
      setIsMakeOfferOwned(true);
      return;
    }

    setNftTotalInETH(totalInETH);
    setNftQuantityForSale(1);
    await getCollectionName();
    await getNftTotalInUSD(totalInETH);
    await getNftFloorPrice();
  };

  const nftHasDifferentOwner = async () => {
    let nftHasDifferentOwnerFromChain = await nftForSaleHasDifferentOwner(
      tokenId,
      account,
      contractType,
      native,
      getMarketplaceItemsForSale
    );

    console.log('nftHasDifferentOwnerFromChain', nftHasDifferentOwnerFromChain);

    let nftHasDifferentOwnerFromWallet = false;
    let nftHasDifferentOwnerFromDatabase = false;

    if (contractType == ContractTypeEnum.Avatar) {
      const tokenAddress = await getContractAddress(contractType);
      const avatarsFromWallet: GetNFTsForContractResultModel[] = await getAllNFTsForContract(Moralis, tokenAddress);
      console.log('avatars from wallet', avatarsFromWallet);
      nftHasDifferentOwnerFromWallet = !avatarsFromWallet.some(s => s.token_id == tokenId.toString());
      console.log('nftHasDifferentOwnerFromWallet', nftHasDifferentOwnerFromWallet);
    } else {
      nftHasDifferentOwnerFromDatabase = await checkIfNftHasDifferentOwner(contractType, tokenId, account);

      console.log('nftHasDifferentOwnerFromDatabase', nftHasDifferentOwnerFromDatabase);
    }

    if (nftHasDifferentOwnerFromChain || nftHasDifferentOwnerFromDatabase || nftHasDifferentOwnerFromWallet) {
      return true;
    } else {
      return false;
    }
  };

  const getCollectionName = async () => {
    if (contractName) {
      setNftContractName(contractName);
    } else {
      const tokenEntity = await getTokenTypeByCollectionType(contractType);
      setNftContractName(tokenEntity.collectionDetailName);
    }
  };

  const getNftFloorPrice = async () => {
    const floorPrice = await getFloorPrice(Moralis, native, contractType);
    setFloorPriceInETH(floorPrice);
    setFloorPriceInUSD(await moralisGetUsdPrice(floorPrice));
  };

  useEffect(() => {
    if (!isWalletConnected) {
      setIsWalletConnected(true);
    }
  }, [isWalletConnected]);

  useEffect(() => {
    getNftTotalInUSD(nftTotalInETH);

    if (nftTotalInETH && nftTotalInETH > 0 && isMakeOfferButtonDisabled) {
      setIsMakeOfferButtonDisabled(false);
    } else if (!nftTotalInETH || nftTotalInETH == 0) {
      setIsMakeOfferButtonDisabled(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftTotalInETH]);

  const getNftTotalInUSD = async ethPrice => {
    if (ethPrice) {
      setNftTotalInUSD(await moralisGetUsdPrice(ethPrice));
    } else {
      setNftTotalInUSD(0);
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
    isMakeOfferSuccess,
    successTimeout
  );

  const closeModalEvents = () => {
    setIsMakeOfferModalOpen(false);
    setIsMakeOfferSuccess(false);
    isOpenEvent(false);
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
        isOpen={isMakeOfferModalOpen}
        onClose={() => {
          closeModalEvents();
        }}
        width="w-[800px]"
        height="h-[550px]"
      >
        {isMakeOfferOwned ? (
          <div className="flex flex-col justify-center items-center ml-24 mr-24">
            <div className="pt-6 font-bold text-3xl text-white">{t('makeOfferModal.ownedTitle')}</div>
            <div className="w-full pt-10 border-b border-gray-700" />
            <div className="pt-32 font-bold text-center">{t('makeOfferModal.ownedMessage')}</div>
          </div>
        ) : isMakeOfferSuccess ? (
          <div className="flex flex-col justify-center items-center ml-24 mr-24">
            <div className="font-bold text-3xl text-white">{t('makeOfferModal.successTitle')}</div>
            <div className="w-full mt-2 border-b border-gray-700" />
            <div className={clsx('h-52 w-52 mt-5', styles.notched)}>
              <img
                src={tokenImageThumbnailUrl || getNftImageThumbnail(contractType)}
                className="w-full h-full rounded-md"
                alt="cardItem"
              />
            </div>
            <div className="mt-4 font-medium">
              {nftContractName} #{tokenId}
              {nftCanDisplayName(contractType) && tokenName && ': ' + tokenName}
            </div>
            <div className="text-gray-300 text-sm text-center">{t('makeOfferModal.successMessage')}</div>
            <CountDown count={timeLeft / 1000} className="mt-8" />
          </div>
        ) : (
          <>
            <div className="flex flex-col justify-center items-center pl-20 pr-20 pt-6">
              <div className="font-bold text-2xl text-white">{t('makeOfferModal.title')}</div>
              <div className="border-b p-2 border-gray-700 w-full" />
              <div className="w-full flex pt-2">
                {/*image */}
                <div className="relative flex justify-center">
                  <div className={clsx('h-32 w-32', styles.notched)}>
                    <img
                      src={tokenImageThumbnailUrl || getNftImageThumbnail(contractType)}
                      className="w-full h-full rounded-md"
                      alt="cardItem"
                    />
                  </div>
                </div>

                {/*right text */}
                <div className="w-[70%] ml-2 space-y-4">
                  <div className="flex justify-between">
                    <div className="ml-6">
                      <div className="text-sm text-gray-300 font-medium">{t('makeOfferModal.item')}</div>

                      <div>{nftCanDisplayName(contractType) && tokenName}</div>

                      <div className="flex mr-12">
                        {contractType == ContractTypeEnum.HorseGovernance ? (
                          <div className="mr-7 w-24">
                            <span className="inline-flex items-center h-8 px-3 py-0.5 rounded-full text-xs font-medium bg-purple-700">
                              <Icon name="governance" className="h-3 w-5 mr-1 mb-2" />
                              {t('horse.governance')}
                            </span>
                          </div>
                        ) : (
                          contractType == ContractTypeEnum.HorsePartnership && (
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
                      <div className="pl-6 text-sm text-gray-300 font-medium whitespace-nowrap">
                        {t('makeOfferModal.floorPrice')}
                      </div>
                      <div className="flex">
                        <Icon name="eth-gray-rounded" className="h-5 w-5" />
                        <div className="flex pl-2">
                          <div className="font-medium">{floorPriceInETH}</div>
                          <div className="pl-2 text-sm font-medium">(${floorPriceInUSD})</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 font-medium">{nftContractName}</div>
                  <div className="ml-6 border-b border-gray-700 w-full" />
                </div>
              </div>

              {/*components below */}
              <div className="w-full mt-2 space-y-2">
                <div className={clsx(contractType == ContractTypeEnum.HorsePartnership && 'flex space-x-2')}>
                  <TextInputWithoutFormik
                    name={t('makeOfferModal.unitPrice')}
                    placeholder={t('makeOfferModal.unitPrice')}
                    data-test="amount-dt"
                    className="w-full text-sm"
                    isSmall={false}
                    iconName="eth"
                    value={nftTotalInETH}
                    onChangeEvent={setNftTotalInETH}
                    mask={/^[\d]{1,3}\.?[\d]{0,4}$/}
                  />

                  {contractType == ContractTypeEnum.HorsePartnership && (
                    <div className={clsx(styles.sharesQuantity, styles.picker)}>
                      <div className={styles.title}>{t('makeOfferModal.quantity')}</div>
                      <div className={styles.count}>
                        <div className={clsx(styles.text, 'select-none')}>{nftQuantityForSale}</div>
                        <div className={styles.controls}>
                          <Icon
                            name="increase"
                            className={clsx('h-3 w-3 mb-1', {
                              ['cursor-pointer']: nftQuantityForSale < quantityForSale,
                              ['cursor-not-allowed']: nftQuantityForSale >= quantityForSale,
                            })}
                            onClick={() => {
                              if (nftQuantityForSale < quantityForSale) {
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
                  )}
                </div>

                <div>
                  <DateTimeComponent
                    selectedValue={nftTimeDuration}
                    updateEventSelectedValue={setNftTimeDuration}
                    className=""
                    name={t('makeOfferModal.offerExpiration')}
                  />
                </div>
              </div>
            </div>

            <div className="flex pt-6">
              <div className="w-[65%] flex justify-end">
                <Button
                  color="primary"
                  onClick={() => {
                    handleMakeOfferNFT();
                  }}
                  fill="solid"
                  notch="both"
                  disabled={isMakeOfferButtonDisabled}
                >
                  {t('makeOfferModal.makeOffer')}
                </Button>
              </div>
              {contractType == ContractTypeEnum.HorsePartnership && (
                <div className="flex pl-16">
                  <div className="ml-6">
                    <div className="pl-6 text-sm text-gray-300 font-medium">{t('makeOfferModal.totalPrice')}</div>
                    <div className="flex">
                      <Icon name="eth-gray-rounded" className="h-5 w-5" />
                      <div className="flex pl-2">
                        <div className="font-medium">{(nftTotalInETH * nftQuantityForSale).toFixed(4)}</div>
                        <div className="pl-2 text-sm font-medium">
                          (${(nftTotalInUSD * nftQuantityForSale).toFixed(2)})
                        </div>
                      </div>
                    </div>
                    <div className="border-b pt-1 border-gray-700 w-full" />
                    <div className="border-b pt-1 border-gray-700 w-full" />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DisplayModal>
    </div>
  );
};
