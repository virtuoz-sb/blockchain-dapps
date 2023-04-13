import React, { FunctionComponent, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import styles from './syndicate-modal.module.scss';

import { DisplayModal } from '@components/modals/display-modal';
import { Button } from '@components/button';
import useWalletStore from '@hooks/useWalletStore';
import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import { Loader } from '@components/loader';
import Account from '@components/ethereum/Account/Account';
import { getNftImageThumbnail } from '@common/getInformationPerNftCollectionEnum';
import { getTokenTypeByCollectionType, syndicateNFT } from '@common/api/portal/marketplace';
import useTranslation from '@hooks/useTranslation';
import useAppStore from '@hooks/useAppStore';
import CountDown from '@components/horse-action/components/count-down';
import { useAfterConfirmCountDown } from '@components/horse-action/helpers';

//const secondsToCloseModal = 5;

const successTimeout = 5000;

export type ISyndicateModalProps = {
  isOpen: boolean;
  isOpenEvent: any;
  tokenId: number;
  name: string;
  imageURL: string;
  collectionType: ContractTypeEnum;
  collectionName?: string;
};

export const SyndicateModalComponent: FunctionComponent<ISyndicateModalProps> = ({
  isOpen,
  isOpenEvent,
  tokenId,
  name,
  imageURL,
  collectionType,
  collectionName = '',
}) => {
  const [isLoading, setIsLoading] = useState<boolean>();
  const [isRequestApprovalInProgress, setIsRequestApprovalInProgress] = useState<boolean>();
  //const [closeModalTimeout, setCloseModalTimeout] = useState<number>();

  const [collectionsName, setCollectionsName] = useState<string>();

  const [isSyndicateModalOpen, setIsSyndicateModalOpen] = useState<boolean>(false);
  const [isPageWithError, setIsPageWithError] = useState<boolean>(false);
  const [isPageFractionalizeSuccess, setIsPageFractionalizeSuccess] = useState<boolean>(false);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(true);
  const [isSyndicateButtonDisabled, setIsSyndicateButtonDisabled] = useState<boolean>(false);

  const { profile } = useAppStore();
  const { isTransactionsApprovedForAddress, approveTransactionsForAddress, fractionalizeHorse } = useWalletStore();
  const { isInitialized, Moralis, isAuthenticated, account } = useMoralis();
  const { native } = useMoralisWeb3Api();
  const { t } = useTranslation();

  const handlySyndicateFunc = async () => {
    console.log('syndicate button clicked');
    setIsSyndicateButtonDisabled(true);

    try {
      setIsLoading(true);

      const userProfile = await getUserProfile();

      const nftFractionalizeResponse = await fractionalizeHorse(Moralis, tokenId);
      console.log('nftFractionalizeResponse response', nftFractionalizeResponse);

      if (
        nftFractionalizeResponse == undefined ||
        nftFractionalizeResponse.code == -32603 ||
        nftFractionalizeResponse.code == 4001
      ) {
        console.log('Something went wrong. fractionalizeHorse function', nftFractionalizeResponse);
        setIsPageWithError(true);
        return;
      }

      // since the wallet is connected to the app but the registration is not completed we don't have his registrationId
      // the portal must allow users to make transactions on the application even if they are not registered
      // in short the transaction will be completed on chain but the user will not be notified by email and notifications system of the app
      if (userProfile) {
        const notificationResponse = await syndicateNFT(
          userProfile.userRegistrationId,
          tokenId.toString(),
          collectionType
        );
      }

      setIsPageFractionalizeSuccess(true);
    } finally {
      setIsLoading(false);
      setIsSyndicateButtonDisabled(false);
    }
  };

  useEffect(() => {
    if (!isWalletConnected) {
      setIsWalletConnected(true);
    }
  }, [isWalletConnected]);

  const getCollectionName = async () => {
    let colName = collectionName;
    if (colName.length == 0) {
      const tokenTypeCollection = await getTokenTypeByCollectionType(collectionType);

      if (tokenTypeCollection) {
        colName = tokenTypeCollection.collectionDetailName;
      } else {
        colName = 'collection name';
        console.log('Collection name not found.', tokenTypeCollection);
      }
    }

    setCollectionsName(colName);
  };

  useEffect(() => {
    if (isInitialized && isOpen) {
      if (!isAuthenticated) {
        setIsWalletConnected(false);
      } else {
        setIsLoading(isOpen);
        checkIfUserApprovedTransactionForTheMarketplace(isOpen);
        getCollectionName();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, isOpen]);

  const getUserProfile = async () => {
    const userProfile = await profile;
    if (!userProfile) {
      console.log('profile is not loaded.');
      return undefined;
    }
    console.log(userProfile);
    return userProfile;
  };

  const checkIfUserApprovedTransactionForTheMarketplace = async isModalOpen => {
    try {
      const userProfile = await getUserProfile();

      const walletAddress = userProfile ? userProfile.walletAddress : account;

      const isApproved = await checkIsTransactionApprovedForAddress(walletAddress);

      if (!isApproved) {
        const requestApproval = await approveTransactionsForAddress(
          Moralis,
          collectionType,
          ContractTypeEnum.HorsePartnership
        );
        console.log('request approval status', requestApproval);

        if (requestApproval == undefined || requestApproval.code == 4001) return;

        requestApprovalInProgress(walletAddress);
      }

      setIsSyndicateModalOpen(isModalOpen);
    } finally {
      setIsLoading(false);
    }
  };

  const checkIsTransactionApprovedForAddress = async (walletAddress: string): Promise<boolean> => {
    if (walletAddress) {
      const isApproved = await isTransactionsApprovedForAddress(
        native,
        walletAddress,
        collectionType,
        ContractTypeEnum.HorsePartnership
      );
      console.log('request is approved?', isApproved);
      return isApproved;
    } else {
      return undefined;
    }
  };

  const requestApprovalInProgress = async (walletAddress: string) => {
    if (walletAddress) {
      setIsRequestApprovalInProgress(true);
      setIsSyndicateButtonDisabled(true);
      const isApproved = await checkIsTransactionApprovedForAddress(walletAddress);
      if (isApproved) {
        setIsRequestApprovalInProgress(false);
        setIsSyndicateButtonDisabled(false);
      } else {
        setTimeout(requestApprovalInProgress, 5000, walletAddress);
      }
    }
  };

  //close success after 5 seconds countdown
  const timeLeft = useAfterConfirmCountDown(
    () => {
      closeModalEvents();
    },
    isPageFractionalizeSuccess,
    successTimeout
  );

  const closeModalEvents = () => {
    setIsSyndicateModalOpen(false);
    setIsPageFractionalizeSuccess(false);
    setIsPageWithError(false);
    isOpenEvent(false);
  };

  return (
    <div>
      <div className="hidden">
        <Account triggerAuthModal={!isWalletConnected} />
      </div>
      {isLoading ? <Loader /> : ''}
      <DisplayModal
        title=""
        isOpen={isSyndicateModalOpen}
        onClose={() => {
          closeModalEvents();
        }}
        width="w-[800px]"
        height="h-[500px]"
      >
        {isPageWithError ? (
          <div className="flex flex-col justify-center items-center ml-24 mr-24">
            <div className="pt-6 font-bold text-3xl text-white">{t('marketplaceModals.error.title')}</div>
            <div className="w-full pt-10 border-b border-gray-700" />
            <div className="pt-24 font-medium">{t('marketplaceModals.error.subTitle')}</div>
            <div className="text-gray-300">{t('marketplaceModals.error.message')}</div>
          </div>
        ) : isPageFractionalizeSuccess ? (
          <>
            <div className="flex flex-col justify-center items-center ml-24 mr-24">
              <div className="font-bold text-3xl text-white">{t('syndicateModal.successTitle')}</div>
              <div className="w-full mt-2 border-b border-gray-700" />
              <div className={clsx('h-52 w-52 mt-5', styles.notched)}>
                <img
                  src={imageURL || getNftImageThumbnail(collectionType)}
                  className="w-full h-full rounded-md"
                  alt="cardItem"
                />
              </div>
              <div className="mt-4 font-medium">
                {collectionsName} #{tokenId}: {name}
              </div>
              <div className="text-gray-300 text-sm text-center">{t('syndicateModal.successMessage')}</div>
              <CountDown count={timeLeft / 1000} className="mt-8" />
            </div>
          </>
        ) : (
          <div>
            <div className="flex place-content-center pt-6 font-bold text-2xl text-white">
              {t('syndicateModal.title')}
            </div>
            <div className="ml-16 mr-16 pt-6">
              <div className="w-full mb-6 border-b border-gray-700" />
              <div className="flex">
                <div className={clsx('h-52 w-52', styles.notched)}>
                  <img
                    src={imageURL || getNftImageThumbnail(collectionType)}
                    className="w-full h-full rounded-md"
                    alt="cardItem"
                  />
                </div>
                <div className="w-[70%]">
                  <div className="flex justify-between">
                    <div className="ml-6">
                      <div className="text-sm text-gray-300 font-medium">{t('syndicateModal.item')} </div>

                      <div>{name}</div>

                      <div className="flex mr-12">
                        <div className="font-bold text-2xl text-white">#{tokenId}</div>
                      </div>
                    </div>
                    <div className="ml-6">
                      <div className="text-sm text-gray-300 font-medium">{t('syndicateModal.total')}</div>
                      <div className="flex">
                        <div className="font-medium">{t('syndicateModal.shares')}</div>
                      </div>
                    </div>
                  </div>

                  <div className="h-6"></div>
                  <div className="pl-6 font-medium">{collectionsName}</div>
                  <div className="w-full ml-4 mt-2 mb-2 border-b border-gray-700" />
                  <div className="h-10"></div>
                  <div className="pl-6 text-xs text-gray-300 text-end">{t('syndicateModal.information')}</div>
                  <div className="w-full ml-4 mt-2 mb-2 border-b border-gray-700" />
                  {isRequestApprovalInProgress ? (
                    <>
                      <div className="flex pt-1">
                        <Loader fullscreen={false} customHeight={3} customWidth={3} />
                        <div className="pl-2 text-sm text-yellow-300">{t('syndicateModal.approvaInProgress')}</div>
                      </div>
                    </>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>
            <div className="flex pt-6">
              <div className="flex w-full justify-center items-center">
                <Button
                  color="primary"
                  onClick={() => {
                    handlySyndicateFunc();
                  }}
                  fill="solid"
                  notch="both"
                  disabled={isSyndicateButtonDisabled}
                >
                  {t('syndicateModal.confirmSyndication')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DisplayModal>
    </div>
  );
};
