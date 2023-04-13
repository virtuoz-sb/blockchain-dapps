import React, { FunctionComponent, useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';
import clsx from 'clsx';

import { Button } from '@components/button';
import { DisplayModal } from '@components/modals/display-modal';
import { Icon } from '@components/icons';
import { Loader } from '@components/loader';
import useAppStore from '@hooks/useAppStore';
import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import useTranslation from '@hooks/useTranslation';
import useWalletStore from '@hooks/useWalletStore';
import { getNftImageThumbnail } from '@common/getInformationPerNftCollectionEnum';
import { nftCanDisplayName } from '@common/helpers/marketplaceHelper';

import styles from './cancel-modal.marketplace.module.scss';
import { cancelNFTSaleNotification, getTokenTypeByCollectionType } from '@common/api/portal/marketplace';

export type CancelModalProps = {
  isOpen: boolean;
  isOpenEvent: any;
  contractType: ContractTypeEnum;
  contractName: string;
  tokenId: number;
  tokenName: string;
  tokenImageThumbnailUrl: string;
  marketplaceId: number;
  totalInETH: number;
  totalInUSD: number;
};

export const CancelModalComponent: FunctionComponent<CancelModalProps> = ({
  isOpen,
  isOpenEvent,
  contractType,
  contractName,
  tokenId,
  tokenName,
  tokenImageThumbnailUrl,
  marketplaceId,
  totalInETH,
  totalInUSD,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoralisError, setHasMoralisError] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [nftContractName, setNftContractName] = useState<string>();

  const { t } = useTranslation();
  const { profile } = useAppStore();

  const { Moralis } = useMoralis();
  const { cancelNFTForSale } = useWalletStore();

  const onCancel = async () => {
    setIsLoading(true);
    try {
      const result = await cancelNFTForSale(Moralis, marketplaceId);

      if (result) {
        onCloseModal();

        if (profile) {
          await cancelNFTSaleNotification(
            profile.userRegistrationId,
            nftContractName,
            tokenId.toString(),
            nftCanDisplayName(contractType) ? tokenName : '',
            contractType,
            tokenImageThumbnailUrl
          );
        }
      } else {
        setHasMoralisError(true);
        setIsLoading(false);
      }
    } catch (error) {
      if (error.code && error.code !== 4001) {
        setHasMoralisError(true);
      }

      setIsLoading(false);
    }
  };

  const onCloseModal = async () => {
    await setShowCancelModal(!showCancelModal);
    isOpenEvent(!showCancelModal);

    // wait until modal closes
    setTimeout(() => {
      setIsLoading(false);
      setHasMoralisError(false);
    }, 500);
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
      setIsLoading(false);
      setHasMoralisError(false);
    }

    getContractName().then(() => setShowCancelModal(isOpen));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <>
      {isLoading ? <Loader /> : null}

      <DisplayModal
        id="cancelDialogModal"
        title=""
        isOpen={showCancelModal}
        onClose={onCloseModal}
        width="w-[800px]"
        height="h-[600px]"
      >
        <div className="flex flex-col justify-center items-center px-12 pt-6">
          <div className={styles.title}>{t('cancelMarketplaceItemModal.title')}</div>

          <hr className={styles.hr} />

          {hasMoralisError && (
            <div className="flex flex-col justify-center items-center ml-24 mr-24">
              <div className="pt-6 font-bold text-3xl text-white">{t('marketplaceModals.error.title')}</div>
              <div className="w-full pt-10 border-b border-gray-700" />
              <div className="pt-24 font-medium text-center">{t('marketplaceModals.error.subTitle')}</div>
              <div className="text-gray-300 text-center">{t('marketplaceModals.error.message')}</div>
            </div>
          )}

          {/* <div className="w-full flex pt-8">
          <div className="w-[70%] space-y-4">
            <div className="mr-10 border-b border-gray-700" />
            <div className="flex justify-between">
              <div>
                <span className="text-gray-300 font-medium">{t('sellModal.type')}:</span>
                <span className="pl-2 font-medium">{t('sellModal.fixedPrice')}</span>
              </div>

              {tokenType == ContractTypeEnum.HorseGovernance ? (
                <div className="mr-16 w-24">
                  <span className="inline-flex items-center h-8 px-3 py-0.5 rounded-full text-xs font-medium bg-purple-700">
                    <Icon name="governance" className="h-3 w-5 mr-1 mb-2" />
                    {t('horse.governance')}
                  </span>
                </div>
              ) : (
                tokenType == ContractTypeEnum.HorsePartnership && (
                  <div className="mr-14 w-24">
                    <span className="inline-flex items-center h-8 px-3 py-0.5 rounded-full text-xs font-medium bg-rose-900">
                      <Icon name="partnership" className="h-2 w-4 mr-1 mb-2" />
                      {t('horse.partnership')}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className={clsx('mr-10', tokenType == ContractTypeEnum.HorsePartnership && 'flex space-x-2')}>
              {tokenType == ContractTypeEnum.HorsePartnership && (
                <div className={clsx(styles.sharesQuantity, styles.picker)}>
                  <div className={styles.title}>{t('sellModal.tokens')}</div>
                  <div className={styles.count}>
                    <div className={clsx(styles.text, 'select-none')}>{sharesCount}</div>
                  </div>
                </div>
              )}
            </div>

             <div>
                <DateTimeComponent
                  selectedValue={sellNftTimeDuration}
                  updateEventSelectedValue={setSellNftTimeDuration}
                  className="mr-10"
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
              <div className={clsx('h-52 w-52', sellstyles.notched)}>
                <img
                  src={imageURL || getNftImageThumbnail(tokenType)}
                  className="w-full h-full rounded-md"
                  alt="cardItem"
                />
              </div>
              <div className="-bottom-3 sm:absolute">
                <button className={clsx('', sellstyles.btnTokenLabel)}>{tokenId}</button>
              </div>
            </div>
            <div className="min-h-[50px]">
              <div className={clsx('relative mt-5 ml-3')}>
                <div className="text-x text-gray-300 font-medium ml-9">{t('sellModal.currentPrice')}</div>
                <div className="flex items-center text-white">
                  <Icon name={'eth-gray-rounded'} className="h-7 w-7" />
                  <span className="ml-2 text-xl font-bold">{totalInETH}</span>
                  <span className="ml-2 text-x">(${totalInUSD})</span>
                </div>
              </div>
            </div>
          </div>
        </div>*/}

          {!hasMoralisError && (
            <>
              <div className="mx-16">
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
                            <div className="pl-2 text-sm font-medium">(${totalInUSD})</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pl-6 font-medium">{nftContractName}</div>
                    <div className="ml-4 mt-4 border-b border-gray-700" />
                    <div className={styles.description}>
                      <div>{t('cancelMarketplaceItemModal.description')}</div>
                      <div className={styles.confirm}>{t('cancelMarketplaceItemModal.confirm')}</div>
                    </div>
                  </div>
                </div>
                <div className="w-full mt-8 mb-10 border-b border-gray-700" />
              </div>

              <div className="flex">
                <Button
                  type="button"
                  className="w-[170px] mr-4"
                  full={true}
                  fill="solid"
                  color="dark"
                  notch="left"
                  chevrons="left"
                  uppercase={true}
                  onClick={onCloseModal}
                >
                  {t('cancelMarketplaceItemModal.buttons.back')}
                </Button>
                <Button
                  type="button"
                  className="w-[170px]"
                  full={true}
                  fill="solid"
                  notch="right"
                  chevrons="right"
                  uppercase={true}
                  onClick={onCancel}
                >
                  {t('cancelMarketplaceItemModal.buttons.continue')}
                </Button>
              </div>
            </>
          )}
        </div>
      </DisplayModal>
    </>
  );
};
