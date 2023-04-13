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
import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import Account from '@components/ethereum/Account/Account';
import { getNftImageThumbnail } from '@common/getInformationPerNftCollectionEnum';
import { getTokenTypeByCollectionType, sellNFTNotification } from '@common/api/portal/marketplace';
import useTranslation from '@hooks/useTranslation';
import { getTimestampInSeconds } from '@common/helpers/dateHelper';

import styles from './sell-modal.marketplace.module.scss';
import { nftCanDisplayName } from '@common/helpers/marketplaceHelper';
import { CoinTypeEnum } from '@common/enum/CoinTypeEnum';

export type SellModalProps = {
  isOpen: boolean;
  isOpenEvent: any;
  contractType: ContractTypeEnum;
  contractName?: string;
  tokenId: number;
  tokenName: string;
  tokenImageThumbnailUrl: string;
  totalInETH?: number;
  quantityOfShares?: number;
};

export const SellModalComponent: FunctionComponent<SellModalProps> = ({
  isOpen,
  isOpenEvent,
  contractType,
  contractName,
  tokenId,
  tokenName,
  tokenImageThumbnailUrl,
  totalInETH = 0.0001,
  quantityOfShares = 1,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>();
  const [isRequestApprovalInProgress, setIsRequestApprovalInProgress] = useState<boolean>();
  const [isSellModalOpen, setIsSellModalOpen] = useState<boolean>(false);
  const [isSellButtonDisabled, setIsSellButtonDisabled] = useState<boolean>(false);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(true);

  const [nftContractName, setNftContractName] = useState<string>();
  const [sellNftTotalInETH, setSellNftTotalInETH] = useState<number>();
  const [sellNftTotalInUSD, setSellNftTotalInUSD] = useState<number>();
  const [sellNftTimeDuration, setSellNftTimeDuration] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours() + 3)
  );
  const [sharesCount, setSharesCount] = useState<number>();
  const [baseTokenPrice, setBaseTokenPrice] = useState<any>();
  const [contractFees, setContractFees] = useState<ITokenTypeEntityModel>();

  const {
    placeNFTForSell,
    getTokenPrice,
    getEthInUsd,
    isTransactionsApprovedForAddress,
    approveTransactionsForAddress,
  } = useWalletStore();
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

  const handleNftSell = async () => {
    const unixTimestampInSeconds = getTimestampInSeconds(new Date(sellNftTimeDuration.toUTCString()));
    console.log('sell button clicked');
    console.log('original date (not gmt)', sellNftTimeDuration);
    console.log('gmt timestamp in seconds', unixTimestampInSeconds);
    console.log('Quantity of shares for sell', sharesCount);

    try {
      const userProfile = await getUserProfile();

      const nftSellResponse = await placeNFTForSell(
        Moralis,
        contractType,
        tokenId,
        sellNftTotalInETH,
        unixTimestampInSeconds,
        sharesCount
      );
      console.log('nft sell response', nftSellResponse);

      if (nftSellResponse == undefined || nftSellResponse.code == -32603 || nftSellResponse.code == 4001) {
        console.log('Something went wrong. Sell NFT function', nftSellResponse);
        return;
      }

      // since the wallet is connected to the app but the registration is not completed we don't have his registrationId
      // the portal must allow users to make transactions on the marketplace even if they are not registered
      // in short the transaction will be completed on chain but the user will not be notified by email and notifications system of the app
      if (userProfile) {
        const notificationResponse = await sellNFTNotification(
          userProfile.userRegistrationId,
          nftContractName,
          tokenId.toString(),
          nftCanDisplayName(contractType) ? tokenName : '',
          sellNftTotalInETH,
          CoinTypeEnum.ETH,
          contractType,
          tokenImageThumbnailUrl
        );
      }

      setIsSellModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getContractName = async () => {
    if (contractName) {
      setNftContractName(contractName);
    } else {
      const tokenEntity = await getTokenTypeByCollectionType(contractType);
      setNftContractName(tokenEntity.collectionDetailName);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!isAuthenticated) {
        setIsWalletConnected(false);
      } else {
        console.log('Quantity of shares', quantityOfShares);
        setIsLoading(isOpen);
        setSellNftTotalInETH(totalInETH);
        setSharesCount(1);
        checkIfUserApprovedTransactionForTheMarketplace(isOpen);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isWalletConnected) {
      setIsWalletConnected(true);
    }
  }, [isWalletConnected]);

  const checkIsTransactionApprovedForAddress = async (walletAddress: string): Promise<boolean> => {
    if (walletAddress) {
      const isApproved = await isTransactionsApprovedForAddress(native, walletAddress, contractType);
      console.log('request is approved?', isApproved);
      return isApproved;
    } else {
      return undefined;
    }
  };

  const checkIfUserApprovedTransactionForTheMarketplace = async isModalOpen => {
    try {
      const userProfile = await getUserProfile();

      const walletAddress = userProfile ? userProfile.walletAddress : account;

      const isApproved = await checkIsTransactionApprovedForAddress(walletAddress);

      if (!isApproved) {
        const requestApproval = await approveTransactionsForAddress(Moralis, contractType);
        console.log('request approval status', requestApproval);

        if (requestApproval == undefined || requestApproval.code == 4001) return;

        requestApprovalInProgress(walletAddress);
      }

      const contractFees = await getTokenTypeByCollectionType(contractType);
      setContractFees(contractFees);
      await getContractName();

      setIsSellModalOpen(isModalOpen);
    } finally {
      setIsLoading(false);
    }
  };

  const requestApprovalInProgress = async (walletAddress: string) => {
    if (walletAddress) {
      setIsRequestApprovalInProgress(true);
      setIsSellButtonDisabled(true);
      const isApproved = await checkIsTransactionApprovedForAddress(walletAddress);
      if (isApproved) {
        setIsRequestApprovalInProgress(false);
        setIsSellButtonDisabled(false);
      } else {
        setTimeout(requestApprovalInProgress, 5000, walletAddress);
      }
    }
  };

  useEffect(() => {
    moralisGetUsdPrice(sellNftTotalInETH);

    if (sellNftTotalInETH && isSellButtonDisabled && !isRequestApprovalInProgress) {
      setIsSellButtonDisabled(false);
    } else if (!sellNftTotalInETH) {
      setIsSellButtonDisabled(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellNftTotalInETH]);

  const moralisGetUsdPrice = async ethPrice => {
    if (ethPrice) {
      const usdPrice = await getEthInUsd(baseTokenPrice, ethPrice, false);
      setSellNftTotalInUSD(usdPrice);
    } else {
      setSellNftTotalInUSD(0);
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

  useEffect(() => {
    if (baseTokenPrice) {
      moralisGetUsdPrice(sellNftTotalInETH);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTokenPrice]);

  return (
    <div>
      <div className="hidden">
        <Account triggerAuthModal={!isWalletConnected} />
      </div>
      {isLoading ? <Loader /> : ''}
      <DisplayModal
        id="sellDialogModal"
        title=""
        isOpen={isSellModalOpen}
        onClose={() => {
          setIsSellModalOpen(!isSellModalOpen);
          isOpenEvent(false);
        }}
        width="w-[800px]"
        height="h-[550px]"
      >
        <div className="flex flex-col justify-center items-center pl-20 pr-20 pt-6">
          <div className="font-bold text-2xl text-white">{t('sellModal.title')}</div>
          <div className="w-full flex pt-8">
            <div className="w-[70%] space-y-4">
              <div className="mr-10 border-b border-gray-700" />
              <div className="flex justify-between">
                <div>
                  <span className="text-gray-300 font-medium">{t('sellModal.type')}:</span>
                  <span className="pl-2 font-medium">{t('sellModal.fixedPrice')}</span>
                </div>

                {contractType == ContractTypeEnum.HorseGovernance ? (
                  <div className="mr-16 w-24">
                    <span className="inline-flex items-center h-8 px-3 py-0.5 rounded-full text-xs font-medium bg-purple-700">
                      <Icon name="governance" className="h-3 w-5 mr-1 mb-2" />
                      {t('horse.governance')}
                    </span>
                  </div>
                ) : (
                  contractType == ContractTypeEnum.HorsePartnership && (
                    <div className="mr-14 w-24">
                      <span className="inline-flex items-center h-8 px-3 py-0.5 rounded-full text-xs font-medium bg-rose-900">
                        <Icon name="partnership" className="h-2 w-4 mr-1 mb-2" />
                        {t('horse.partnership')}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className={clsx('mr-10', contractType == ContractTypeEnum.HorsePartnership && 'flex space-x-2')}>
                <TextInputWithoutFormik
                  name="amount"
                  placeholder={t('sellModal.unitPrice')}
                  data-test="amount-dt"
                  className="text-sm"
                  isSmall={false}
                  iconName="eth"
                  value={sellNftTotalInETH}
                  onChangeEvent={setSellNftTotalInETH}
                  mask={/^[\d]{1,3}\.?[\d]{0,4}$/}
                />

                {contractType == ContractTypeEnum.HorsePartnership && (
                  <div className={clsx(styles.sharesQuantity, styles.picker)}>
                    <div className={styles.title}>{t('sellModal.quantity')}</div>
                    <div className={styles.count}>
                      <div className={clsx(styles.text, 'select-none')}>{sharesCount}</div>
                      <div className={styles.controls}>
                        <Icon
                          name="increase"
                          className={clsx('h-3 w-3 mb-1', {
                            ['cursor-pointer']: sharesCount < quantityOfShares,
                            ['cursor-not-allowed']: sharesCount >= quantityOfShares,
                          })}
                          onClick={() => {
                            if (sharesCount < quantityOfShares) {
                              setSharesCount(sharesCount + 1);
                            }
                          }}
                        />
                        <Icon
                          name="decrease"
                          className={clsx('h-3 w-3', {
                            ['cursor-pointer']: sharesCount > 1,
                            ['cursor-not-allowed']: sharesCount <= 1,
                          })}
                          onClick={() => {
                            if (sharesCount > 1) {
                              setSharesCount(sharesCount - 1);
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
                  selectedValue={sellNftTimeDuration}
                  updateEventSelectedValue={setSellNftTimeDuration}
                  className="mr-10"
                  name={t('sellModal.duration')}
                />
              </div>
              <div className="mr-10 border-b border-gray-700" />
              <div className="text-gray-300 font-medium">
                {t('sellModal.serviceFees')}: {contractFees?.serviceFee.toFixed(2)}%
              </div>
              <div className="flex justify-between mr-10 text-gray-300 font-medium">
                {t('sellModal.creatorFees')}: {contractFees?.creatorFee.toFixed(2)}%
              </div>
              <div className="mr-10 border-b border-gray-700" />
            </div>
            <div className="bg-slate-900/60 rounded-md border border-gray-700 p-3">
              <div className="relative flex justify-center">
                <div className={clsx('h-52 w-52', styles.notched)}>
                  <img
                    src={tokenImageThumbnailUrl || getNftImageThumbnail(contractType)}
                    className="w-full h-full rounded-md"
                    alt="cardItem"
                  />
                </div>
                <div className="-bottom-3 sm:absolute">
                  <button className={clsx('', styles.btnTokenLabel)}>{tokenId}</button>
                </div>
              </div>
              <div className="min-h-[50px]">
                <div className={clsx('relative mt-5 ml-3')}>
                  <div className="text-x text-gray-300 font-medium ml-9">{t('sellModal.totalPrice')}</div>
                  <div className="flex items-center text-white">
                    <Icon name={'eth-gray-rounded'} className="h-7 w-7" />
                    <span className="ml-2 text-xl font-bold">{(sellNftTotalInETH * sharesCount).toFixed(4)}</span>
                    <span className="ml-2 text-x">(${sellNftTotalInUSD * sharesCount})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pl-20 pr-20 flex">
          <div className="w-[60%]">
            {isRequestApprovalInProgress && (
              <>
                <div className="flex pt-1">
                  <Loader fullscreen={false} customHeight={3} customWidth={3} />
                  <div className="pl-2 text-sm text-yellow-300">{t('sellModal.approvaInProgress')}</div>
                </div>
              </>
            )}
            <div className="mt-3">
              <Button
                color="primary"
                onClick={() => {
                  setIsLoading(true);
                  handleNftSell();
                }}
                fill="solid"
                notch="both"
                disabled={isSellButtonDisabled}
              >
                {t('sellModal.completeListing')}
              </Button>
            </div>
          </div>
          <div className="flex justify-center w-[40%]">
            <div className="pt-2 font-bold text-fuchsia-500">{t('sellModal.preview')}</div>
          </div>
        </div>
      </DisplayModal>
    </div>
  );
};
