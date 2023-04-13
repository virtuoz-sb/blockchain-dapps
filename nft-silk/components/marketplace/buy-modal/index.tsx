import React, { FunctionComponent, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useMoralis } from 'react-moralis';

import { Icon } from '@components/icons';
import { DisplayModal } from '@components/modals/display-modal';
import { Button } from '@components/button';
import useWalletStore from '@hooks/useWalletStore';
import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import { Loader } from '@components/loader';
import Account from '@components/ethereum/Account/Account';
import { getNftImageThumbnail, getNftMarketplaceDetailRoute } from '@common/getInformationPerNftCollectionEnum';
import {
  buyNFTNotification,
  getTokenMetadataByCollectionType,
  getTokenTypeByCollectionType,
} from '@common/api/portal/marketplace';
import useTranslation from '@hooks/useTranslation';

import styles from './buy-modal.marketplace.module.scss';
import { nftCanDisplayName } from '@common/helpers/marketplaceHelper';
import useAppStore from '@hooks/useAppStore';
import { CoinTypeEnum } from '@common/enum/CoinTypeEnum';

export type BuyModalProps = {
  isOpen: boolean;
  isOpenEvent: any;
  contractType: ContractTypeEnum;
  contractName?: string;
  tokenId: number;
  tokenName?: string;
  tokenImageThumbnailUrl: string;
  sellerWalletAddress: string;
  marketPlaceItemId: number;
  totalInETH: number;
  quantityOfShares?: number;
};

export const BuyModalComponent: FunctionComponent<BuyModalProps> = ({
  isOpen,
  isOpenEvent,
  contractType,
  contractName = '',
  tokenId,
  tokenName,
  tokenImageThumbnailUrl,
  sellerWalletAddress,
  marketPlaceItemId,
  totalInETH,
  quantityOfShares,
}) => {
  const [isLoadingFullScreen, setIsLoadingFullScreen] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>();

  const [baseTokenPrice, setBaseTokenPrice] = useState<any>();

  const [nftContractName, setNftContractName] = useState<string>();
  const [nftTotalInUSD, setNftTotalInUSD] = useState<number>();
  const [nftSharesCount, setNftSharesCount] = useState<number>(quantityOfShares);

  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);
  const [isPageWithError, setIsPageWithError] = useState<boolean>(false);
  const [isPageBuySuccess, setIsPageBuySuccess] = useState<boolean>(false);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(true);
  const [isBuyButtonDisabled, setIsBuyButtonDisabled] = useState<boolean>(false);

  const { profile } = useAppStore();
  const { buyNFT, getTokenPrice, getEthInUsd } = useWalletStore();
  const { isInitialized, Moralis, isAuthenticated, account } = useMoralis();
  const { t } = useTranslation();

  const handleNftBuy = async () => {
    const totalPurchaseValue = (totalInETH * nftSharesCount).toFixed(4);
    console.log('buy button clicked', marketPlaceItemId);
    console.log('quantity of shares', nftSharesCount);
    console.log('total in eth', totalPurchaseValue);
    setIsBuyButtonDisabled(true);

    try {
      setIsLoading(true);

      const userProfile = await getUserProfile();

      const nftBuyResponse = await buyNFT(Moralis, marketPlaceItemId, totalPurchaseValue, nftSharesCount);
      console.log('nft buy response', nftBuyResponse);

      if (nftBuyResponse == undefined || nftBuyResponse.code == -32603 || nftBuyResponse.code == 4001) {
        console.log('Something went wrong. Buy NFT function', nftBuyResponse);
        setIsPageWithError(true);
        return;
      }

      const notificationResponse = await buyNFTNotification(
        sellerWalletAddress,
        userProfile?.userRegistrationId,
        nftContractName,
        tokenId,
        nftCanDisplayName(contractType) ? tokenName : '',
        (totalInETH * nftSharesCount).toFixed(4),
        CoinTypeEnum.ETH,
        contractType,
        tokenImageThumbnailUrl
      );

      setIsPageBuySuccess(true);
    } finally {
      setIsLoading(false);
      setIsBuyButtonDisabled(false);
    }
  };

  const getUserProfile = async () => {
    const userProfile = await profile;
    if (!userProfile) {
      console.log('profile is not loaded.');
      return undefined;
    }
    console.log(userProfile);
    return userProfile;
  };

  useEffect(() => {
    if (quantityOfShares && quantityOfShares > 0) {
      setNftSharesCount(quantityOfShares);
    } else {
      setNftSharesCount(1);
    }
  }, [quantityOfShares]);

  useEffect(() => {
    if (isOpen) {
      if (!isAuthenticated) {
        setIsWalletConnected(false);
      } else {
        setIsLoadingFullScreen(true);
        getCollectionName();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isWalletConnected) {
      setIsWalletConnected(true);
    }
  }, [isWalletConnected]);

  const getCollectionName = async () => {
    let colName = contractName;
    if (colName.length == 0) {
      const tokenTypeCollection = await getTokenTypeByCollectionType(contractType);

      if (tokenTypeCollection) {
        colName = tokenTypeCollection.collectionDetailName;
      } else {
        colName = 'collection name';
        console.log('Collection name not found.', tokenTypeCollection);
      }
    }

    setNftContractName(colName);
    setIsLoadingFullScreen(false);
    setIsBuyModalOpen(true);
  };

  useEffect(() => {
    if (isInitialized && isOpen) {
      moralisGetTokenPrice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isOpen]);

  const moralisGetTokenPrice = async () => {
    const tokenPrice = await getTokenPrice(Moralis);
    // console.log(tokenPrice);
    setBaseTokenPrice(tokenPrice);
  };

  useEffect(() => {
    if (baseTokenPrice) {
      moralisGetUsdPrice(totalInETH);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTokenPrice]);

  const moralisGetUsdPrice = async ethPrice => {
    if (ethPrice) {
      const usdPrice = await getEthInUsd(baseTokenPrice, ethPrice, false);
      setNftTotalInUSD(usdPrice);
    }
  };

  return (
    <div>
      <div className="hidden">
        <Account triggerAuthModal={!isWalletConnected} />
      </div>
      {isLoadingFullScreen ? <Loader /> : ''}
      <DisplayModal
        title=""
        isOpen={isBuyModalOpen}
        onClose={() => {
          setIsBuyModalOpen(!isBuyModalOpen);
          setIsPageBuySuccess(false);
          setIsPageWithError(false);
          isOpenEvent(false);
        }}
        width="w-[800px]"
        height="h-[500px]"
      >
        {isPageWithError ? (
          <div className="flex flex-col justify-center items-center ml-24 mr-24">
            <div className="pt-6 font-bold text-3xl text-white">OOPS! SOMETHING IS WRONG</div>
            <div className="w-full pt-10 border-b border-gray-700" />
            <div className="pt-24 font-medium">Your transaction was unsuccessfull.</div>
            <div className="text-gray-300">Please refer to your wallet`s activity log to help troubleshoot.</div>
          </div>
        ) : isPageBuySuccess ? (
          <div className="flex flex-col justify-center items-center ml-24 mr-24">
            <div className="font-bold text-3xl text-white">SUCCESS</div>
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
            </div>
            <div className="text-gray-300 text-sm text-center">
              Your transaction has been submitted. Please allow time for your transaction to be completely processed and
              to be reflected in the portal.
            </div>
            <Button
              full={true}
              className="mt-3 w-48"
              color="primary"
              onClick={() => {
                window.location.href = getNftMarketplaceDetailRoute(contractType, tokenId);
              }}
              fill="solid"
              notch="both"
            >
              VIEW ITEM
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex place-content-center pt-6 font-bold text-2xl text-white">CONFIRM YOUR PURCHASE</div>
            <div className="ml-16 mr-16 pt-6">
              <div className="w-full mb-6 border-b border-gray-700" />
              <div className="flex">
                <div className={clsx('h-52 w-52', styles.notched)}>
                  <img
                    src={tokenImageThumbnailUrl || getNftImageThumbnail(contractType)}
                    className="w-full h-full rounded-md"
                    alt="cardItem"
                  />
                </div>
                <div className="w-[70%]">
                  <div className="flex justify-between">
                    <div className="ml-6">
                      <div className="text-sm text-gray-300 font-medium">ITEM </div>

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
                      <div className="pl-6 text-sm text-gray-300 font-medium">PRICE</div>
                      <div className="flex">
                        <Icon name="eth-gray-rounded" className="h-5 w-5" />
                        <div className="flex pl-2">
                          <div className="font-medium">{totalInETH}</div>
                          <div className="pl-2 text-sm font-medium">(${nftTotalInUSD})</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {contractType == ContractTypeEnum.HorsePartnership ? (
                    <div className="flex justify-end">
                      <div className={clsx(styles.sharesQuantity, styles.picker)}>
                        <div className={styles.title}>Tokens</div>
                        <div className={styles.count}>
                          <div className={clsx(styles.text, 'select-none')}>{nftSharesCount}</div>
                          <div className={styles.controls}>
                            <Icon
                              name="increase"
                              className={clsx('h-3 w-3 mb-1', {
                                ['cursor-pointer']: nftSharesCount < quantityOfShares,
                                ['cursor-not-allowed']: nftSharesCount >= quantityOfShares,
                              })}
                              onClick={() => {
                                if (nftSharesCount < quantityOfShares) {
                                  setNftSharesCount(nftSharesCount + 1);
                                }
                              }}
                            />
                            <Icon
                              name="decrease"
                              className={clsx('h-3 w-3', {
                                ['cursor-pointer']: nftSharesCount > 1,
                                ['cursor-not-allowed']: nftSharesCount <= 1,
                              })}
                              onClick={() => {
                                if (nftSharesCount > 1) {
                                  setNftSharesCount(nftSharesCount - 1);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-16"></div>
                  )}
                  <div className="pl-6 font-medium">{nftContractName}</div>
                  <div className="w-full ml-4 mt-2 mb-2 border-b border-gray-700" />
                  {isLoading ? (
                    <>
                      <div className="pl-6 flex">
                        <div className="mr-2">
                          <Loader fullscreen={false} customHeight={3} customWidth={3} />
                        </div>
                        <div>
                          <div className="flex text-sm text-yellow-300">
                            <p>Item has a pending transaction.</p>
                          </div>
                          <div className="flex text-sm text-gray-300">
                            <p>Your purchase may fail. Gas fees still apply.</p>
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
                <Button
                  color="primary"
                  onClick={() => {
                    handleNftBuy();
                  }}
                  fill="solid"
                  notch="both"
                  disabled={isBuyButtonDisabled}
                >
                  Confirm Purchase
                </Button>
              </div>
              {contractType == ContractTypeEnum.HorsePartnership && (
                <div className="flex pl-16">
                  <div className="ml-6">
                    <div className="pl-6 text-sm text-gray-300 font-medium">PRICE</div>
                    <div className="flex">
                      <Icon name="eth-gray-rounded" className="h-5 w-5" />
                      <div className="flex pl-2">
                        <div className="font-medium">{(totalInETH * nftSharesCount).toFixed(4)}</div>
                        <div className="pl-2 text-sm font-medium">(${(nftTotalInUSD * nftSharesCount).toFixed(2)})</div>
                      </div>
                    </div>
                    <div className="w-full pt-2 border-b border-gray-700" />
                    <div className="w-full pt-1 border-b border-gray-700" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DisplayModal>
    </div>
  );
};

export type BuyModalWithoutData = {
  isOpen: boolean;
  isOpenEvent: any;
  tokenId: number;
  contractType: ContractTypeEnum;
};

export const BuyModalWithoutDataComponent: FunctionComponent<BuyModalWithoutData> = ({
  isOpen,
  isOpenEvent,
  tokenId,
  contractType,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isContractValid, setIsContractValid] = useState<boolean>(false);
  const [isNotImplementedModalOpen, setIsNotImplementedModalOpen] = useState<boolean>(false);

  const [buyModalProps, setBuyModalProps] = useState<BuyModalProps>(undefined);

  const getTokenData = async () => {
    const getTokenData = await getTokenMetadataByCollectionType(contractType, tokenId);
    console.log('buy modal without data properties ... nft metadata', getTokenData);

    const data = getTokenData[0];

    setBuyModalProps({
      isOpen: isOpen,
      isOpenEvent: isOpenEvent,
      tokenId: data.tokenId,
      tokenName: data?.name,
      tokenImageThumbnailUrl: data.imageURL,
      sellerWalletAddress: data.nftOwnerWalletAddress,
      marketPlaceItemId: data.marketPlaceItemId,
      totalInETH: data.priceInETH,
      contractType: contractType,
    });
  };

  useEffect(() => {
    if (isOpen) {
      if (
        (contractType == ContractTypeEnum.Farm ||
          contractType == ContractTypeEnum.Horse ||
          contractType == ContractTypeEnum.Land) &&
        tokenId
      ) {
        getTokenData().then(() => setIsContractValid(true));
      } else {
        setIsNotImplementedModalOpen(true);
      }
    }

    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <div>
      {isLoading ? <Loader /> : ''}
      {isContractValid ? (
        <BuyModalComponent
          isOpen={isOpen}
          isOpenEvent={isOpenEvent}
          sellerWalletAddress={buyModalProps.sellerWalletAddress}
          tokenId={buyModalProps.tokenId}
          tokenName={buyModalProps.tokenName}
          tokenImageThumbnailUrl={buyModalProps.tokenImageThumbnailUrl}
          marketPlaceItemId={buyModalProps.marketPlaceItemId}
          totalInETH={buyModalProps.totalInETH}
          contractType={buyModalProps.contractType}
        />
      ) : (
        <div>
          <DisplayModal
            title="Not Implemented"
            isOpen={isNotImplementedModalOpen}
            onClose={() => setIsNotImplementedModalOpen(!isNotImplementedModalOpen)}
            width="w-[800px]"
            height="h-[500px]"
          >
            <p>
              Contract of {contractType} type not implemented. TokenId: {tokenId}
            </p>
          </DisplayModal>
        </div>
      )}
    </div>
  );
};
