import React, { FunctionComponent, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import styles from './syndicate-reconstitution-modal.module.scss';

import { DisplayModal } from '@components/modals/display-modal';
import { Button } from '@components/button';
import useWalletStore from '@hooks/useWalletStore';
import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import { Loader } from '@components/loader';
import Account from '@components/ethereum/Account/Account';
import { getNftImageThumbnail } from '@common/getInformationPerNftCollectionEnum';
import { getTokenTypeByCollectionType, reconstituteNFT } from '@common/api/portal/marketplace';
import useTranslation from '@hooks/useTranslation';
import useAppStore from '@hooks/useAppStore';
import { getNftForSaleFromMarketplacePerTokenIdAndCollectionType } from '@common/helpers/marketplaceHelper';
import CountDown from '@components/horse-action/components/count-down';
import { useAfterConfirmCountDown } from '@components/horse-action/helpers';

const successTimeout = 5000;

export type ISyndicateReconstitutionModalProps = {
  isOpen: boolean;
  isOpenEvent: any;
  tokenId: number;
  name: string;
  imageURL: string;
  collectionType: ContractTypeEnum;
  collectionName?: string;
};

export const SyndicateReconstitutionModal: FunctionComponent<ISyndicateReconstitutionModalProps> = ({
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

  const [isReconstituteModalOpen, setIsReconstituteModalOpen] = useState<boolean>(false);
  const [isPageWithErrorNftForSale, setIsPageWithErrorNftForSale] = useState<boolean>(false);
  const [isPageWithError, setIsPageWithError] = useState<boolean>(false);
  const [isPageReconstituteSuccess, setIsPageReconstituteSuccess] = useState<boolean>(false);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(true);
  const [isReconstituteButtonDisabled, setIsReconstituteButtonDisabled] = useState<boolean>(false);

  const { profile } = useAppStore();
  const {
    isTransactionsApprovedForAddress,
    approveTransactionsForAddress,
    reconstituteFractionalizedHorse,
    getMarketplaceItemsForSale,
  } = useWalletStore();
  const { isInitialized, Moralis, isAuthenticated, account } = useMoralis();
  const { native } = useMoralisWeb3Api();
  const { t } = useTranslation();

  const handleSyndicateFunc = async () => {
    console.log('syndicate button clicked');
    setIsReconstituteButtonDisabled(true);

    try {
      setIsLoading(true);

      const userProfile = await getUserProfile();

      const nftreconstituteFractionalizedHorseResponse = await reconstituteFractionalizedHorse(Moralis, tokenId);
      console.log('nftreconstituteFractionalizedHorseResponse response', nftreconstituteFractionalizedHorseResponse);

      if (
        nftreconstituteFractionalizedHorseResponse == undefined ||
        nftreconstituteFractionalizedHorseResponse.code == -32603 ||
        nftreconstituteFractionalizedHorseResponse.code == 4001
      ) {
        console.log(
          'Something went wrong. reconstituteFractionalizedHorse function',
          nftreconstituteFractionalizedHorseResponse
        );
        setIsPageWithError(true);
        return;
      }

      // since the wallet is connected to the app but the registration is not completed we don't have his registrationId
      // the portal must allow users to make transactions on the application even if they are not registered
      // in short the transaction will be completed on chain but the user will not be notified by email and notifications system of the app
      if (userProfile) {
        const notificationResponse = await reconstituteNFT(
          userProfile.userRegistrationId,
          tokenId.toString(),
          collectionType
        );
      }

      setIsPageReconstituteSuccess(true);
    } finally {
      setIsLoading(false);
      setIsReconstituteButtonDisabled(false);
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
    if (!isAuthenticated) {
      setIsWalletConnected(false);
    }

    if (isOpen && isInitialized && isAuthenticated && account) {
      console.log('user wallet address', account);
      initializeReconstituteModal().then(() => {
        setIsLoading(false);
        setIsReconstituteModalOpen(true);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isInitialized, isAuthenticated, account]);

  const initializeReconstituteModal = async () => {
    setIsLoading(true);

    const isForSale = await checkIfTheNftIsForSale();
    if (isForSale) {
      setIsPageWithErrorNftForSale(true);
      return;
    }

    checkIfUserApprovedTransactionForTheMarketplace();
    getCollectionName();
  };

  const checkIfTheNftIsForSale = async (): Promise<boolean> => {
    const governanceNftIsForSale = await getNftForSaleFromMarketplacePerTokenIdAndCollectionType(
      tokenId.toString(),
      account,
      ContractTypeEnum.HorseGovernance,
      native,
      getMarketplaceItemsForSale
    );

    const partnershipNftIsForSale = await getNftForSaleFromMarketplacePerTokenIdAndCollectionType(
      tokenId.toString(),
      account,
      ContractTypeEnum.HorsePartnership,
      native,
      getMarketplaceItemsForSale
    );
    if (
      (governanceNftIsForSale && governanceNftIsForSale.length > 0) ||
      (partnershipNftIsForSale && partnershipNftIsForSale.length > 0)
    ) {
      return true;
    } else {
      return false;
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

  const checkIfUserApprovedTransactionForTheMarketplace = async () => {
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
      setIsReconstituteButtonDisabled(true);
      const isApproved = await checkIsTransactionApprovedForAddress(walletAddress);
      if (isApproved) {
        setIsRequestApprovalInProgress(false);
        setIsReconstituteButtonDisabled(false);
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
    isPageReconstituteSuccess,
    successTimeout
  );

  const closeModalEvents = () => {
    setIsReconstituteModalOpen(false);
    setIsPageReconstituteSuccess(false);
    setIsPageWithError(false);
    setIsPageWithErrorNftForSale(false);
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
        isOpen={isReconstituteModalOpen}
        onClose={() => {
          closeModalEvents();
        }}
        width="w-[800px]"
        height="h-[500px]"
      >
        {isPageWithErrorNftForSale ? (
          <div className="flex flex-col justify-center items-center ml-24 mr-24">
            <div className="pt-6 font-bold text-3xl text-white">
              {t('syndicateReconstitutionModal.errorTitleNftIsForSale')}
            </div>
            <div className="w-full pt-10 border-b border-gray-700" />
            <div className="pt-24 font-medium text-center">
              {t('syndicateReconstitutionModal.errorSubTitleNftIsForSale')}
            </div>
            <div className="text-gray-300 text-center">
              {t('syndicateReconstitutionModal.errorMessageNftIsForSale')}
            </div>
          </div>
        ) : isPageWithError ? (
          <div className="flex flex-col justify-center items-center ml-24 mr-24">
            <div className="pt-6 font-bold text-3xl text-white">{t('syndicateReconstitutionModal.errorTitle')}</div>
            <div className="w-full pt-10 border-b border-gray-700" />
            <div className="pt-24 font-medium">{t('syndicateReconstitutionModal.errorSubTitle')}</div>
            <div className="text-gray-300">{t('syndicateReconstitutionModal.errorMessage')}</div>
          </div>
        ) : isPageReconstituteSuccess ? (
          <>
            <div className="flex flex-col justify-center items-center ml-24 mr-24">
              <div className="font-bold text-3xl text-white">{t('syndicateReconstitutionModal.successTitle')}</div>
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
              <div className="text-gray-300 text-sm text-center">
                {t('syndicateReconstitutionModal.successMessage')}
              </div>
              <CountDown count={timeLeft / 1000} className="mt-8" />
            </div>
          </>
        ) : (
          <div>
            <div className="flex place-content-center pt-6 font-bold text-2xl text-white">
              {t('syndicateReconstitutionModal.title')}
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
                      <div className="text-sm text-gray-300 font-medium">{t('syndicateReconstitutionModal.item')} </div>

                      <div>{name}</div>

                      <div className="flex mr-12">
                        <div className="font-bold text-2xl text-white">#{tokenId}</div>
                      </div>
                    </div>
                  </div>

                  <div className="h-6"></div>
                  <div className="pl-6 font-medium">{collectionsName}</div>
                  <div className="w-full ml-4 mt-2 mb-2 border-b border-gray-700" />
                  <div className="h-10"></div>
                  <div className="pl-6 text-xs text-gray-300 text-end">
                    {t('syndicateReconstitutionModal.information')}
                  </div>
                  <div className="w-full ml-4 mt-2 mb-2 border-b border-gray-700" />
                  {isRequestApprovalInProgress ? (
                    <>
                      <div className="flex pt-1">
                        <Loader fullscreen={false} customHeight={3} customWidth={3} />
                        <div className="pl-2 text-sm text-yellow-300">
                          {t('syndicateReconstitutionModal.approvaInProgress')}
                        </div>
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
                    handleSyndicateFunc();
                  }}
                  fill="solid"
                  notch="both"
                  disabled={isReconstituteButtonDisabled}
                >
                  {t('syndicateReconstitutionModal.confirmReconstitution')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DisplayModal>
    </div>
  );
};
