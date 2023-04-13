/* eslint-disable @next/next/no-img-element */
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useMoralis, useNFTBalances } from 'react-moralis';
import clsx from 'clsx';
import { map, take, reduce, sortBy, times, forEach } from 'lodash-es';

import api from '@common/api';
import useAppStore from '@hooks/useAppStore';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import useTranslation from '@hooks/useTranslation';
import useWalletStore from '@hooks/useWalletStore';
import { Button } from '@components/button';
import { DisplayModal } from '@components/modals/display-modal';
import { FullScreenModal } from '@components/modals/full-screen-modal';
import { Icon } from '@components/icons';

import { getEllipsisTxt } from '@common/helpers/formatters';
import { getExplorer } from '@common/helpers/networks';
import { getAbi } from '@common/abi';

import styles from './redemption.module.scss';

export type RedemptionProps = {
  [props: string]: any;
};

export const Redemption: FunctionComponent<RedemptionProps> = ({ ...props }) => {
  const { account, chainId, isAuthenticated, Moralis } = useMoralis();

  const { getContractAddress } = useContractAddressStore();
  const { getNFTsForContract } = useWalletStore();
  const [skyFallTokens, setSkyFallTokens] = useState<any[]>([]);
  const [skyFallLandsCount, setSkyFallLandsCount] = useState<number>(null);
  const [redeemCount, setRedeemCount] = useState<number>(0);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [useAllAvailable, setUseAllAvailable] = useState<boolean>(false);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string>();

  const { profile, showRedemptionModal, setShowRedemptionModal } = useAppStore();
  const trans = useTranslation();

  const redeemSkyFallToken = async () => {
    setHasError(false);
    const tokens = sortBy(skyFallTokens, t => t.token_id);
    let tokenCount = 0;
    let tokenAmounts = 0;

    forEach(tokens, t => {
      if (tokenAmounts < redeemCount) {
        tokenAmounts += Number(t.amount);
        tokenCount++;
      }
    });

    const redeemTokens = take(tokens, tokenCount);

    const skyfallsTokenAddress = await getContractAddress(ContractTypeEnum.SkyFalls);

    tokenAmounts = 0;

    const options = {
      contractAddress: skyfallsTokenAddress,
      functionName: 'migrateTokens',
      abi: getAbi(ContractTypeEnum.SkyFalls)?.migrateTokens,
      params: {
        ids: map(redeemTokens, t => t.token_id),
        amounts: map(redeemTokens, t => {
          const amount = Number(t.amount);
          if (tokenAmounts + amount < redeemCount) {
            tokenAmounts += amount;
            return amount;
          } else {
            const partialAmount = redeemCount - tokenAmounts;
            tokenAmounts += partialAmount;
            return partialAmount;
          }
        }),
      },
    };

    setIsRedeeming(true);

    try {
      let result = await Moralis.executeFunction({
        ...options,
      });

      setTransactionHash(result.hash);

      const sendMessage = profile !== undefined && profile !== null && profile?.userRegistrationId !== null;

      if (sendMessage) {
        await api.post(`/api/notification/${profile.userRegistrationId}`, {
          title: trans.t('redemption.redeem.notification.title'),
          message: trans.t('redemption.redeem.notification.message', {
            redeemCount,
            hash: result.hash,
          }),
        });
      }
    } catch (error) {
      // error code 4001 means user rejected transaction, no need to display error
      // otherwise, show error message
      if (error?.code !== 4001) {
        setHasError(true);
      }

      console.log(error);
    }

    setIsRedeeming(false);
  };

  const onClose = () => {
    setHasError(false);
    setShowRedemptionModal(false);

    // give time for modal to close before clearing
    setTimeout(() => {
      setSkyFallLandsCount(null);
      setRedeemCount(0);
      setTransactionHash(null);
    }, 250);
  };

  useEffect(() => {
    if (showRedemptionModal && isAuthenticated && Moralis && chainId) {
      const getRedemptionTokens = async () => {
        const skyfallsTokenAddress = await getContractAddress(ContractTypeEnum.SkyFalls);
        const tokens = await getNFTsForContract(Moralis, skyfallsTokenAddress, chainId);

        setSkyFallTokens(tokens?.result);
        setSkyFallLandsCount(
          reduce(
            tokens?.result,
            (sum, t) => {
              return sum + Number(t.amount);
            },
            0
          )
        );
        setRedeemCount(1);
      };

      getRedemptionTokens();
    }
  }, [getContractAddress, getNFTsForContract, chainId, isAuthenticated, Moralis, showRedemptionModal]);

  useEffect(() => {
    if (useAllAvailable) {
      setRedeemCount(skyFallLandsCount);
    } else {
      setRedeemCount(1);
    }
  }, [skyFallLandsCount, setRedeemCount, useAllAvailable]);

  return (
    <>
      <FullScreenModal
        className="overflow-y-auto"
        onClose={onClose}
        isOpen={showRedemptionModal}
        background="url('images/fullscreen-modal-background.png')"
      >
        <div className="flex justify-between items-center" id="full-screen">
          <img
            className="block h-10 w-auto ml-6 mt-4 opacity-0 sm:opacity-100"
            src="/images/logos/silks.svg"
            alt="Silks"
          />

          <div className={styles.imageHeader}>
            <div className="text-white z-10 pt-5 text-xl uppercase">{trans.t('redemption.title')}</div>
          </div>

          <div className={`${styles.imageSubHeader} flex justify-center items-end`}>
            <div
              className="text-white z-10 flex justify-center items-center"
              style={{
                background: 'linear-gradient(180deg, #4583FF 0%, rgba(69, 131, 255, 0) 100%)',
                opacity: '0.8',
                transform: 'matrix(1, 0, 0, -1, 0, 0)',
                width: 67,
                height: 57,
              }}
            >
              <Icon
                name="land-parcel"
                className="h-8 w-8 mb-1 -mt-3"
                style={{ transform: 'matrix(1, 0, 0, -1, 0, 0)' }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div
            className="flex flex-col justify-center items-center text-white text-center max-w-screen-lg"
            style={{ marginTop: 100 }}
          >
            <img src="/images/sky-falls.png" alt="Sky Falls"></img>

            {!transactionHash && (
              <>
                <div className="uppercase text-[40px] font-bold">{trans.t('redemption.redeem.description')}</div>
                <div className={clsx('text-lg font-[325]', styles.textLightGray)}>
                  {trans.t('redemption.redeem.subDescription')}
                </div>

                <div className={styles.redeem}>
                  <div className={styles.title}>{trans.t('redemption.redeem.available')}</div>
                  <div className={styles.count}>{skyFallLandsCount || '-'}</div>
                </div>

                <div className={clsx(styles.redeem, styles.picker)}>
                  <div className={styles.title}>{trans.t('redemption.redeem.redeem')}</div>
                  <div className={styles.count}>
                    <div className={clsx(styles.text, 'select-none')}>{redeemCount}</div>
                    <div className={styles.controls}>
                      <Icon
                        name="increase"
                        className={clsx('h-3 w-3 mb-1', {
                          ['cursor-pointer']: !useAllAvailable && redeemCount < skyFallLandsCount,
                          ['cursor-not-allowed']: useAllAvailable || redeemCount >= skyFallLandsCount,
                        })}
                        onClick={() => {
                          if (!useAllAvailable && redeemCount < skyFallLandsCount) {
                            setRedeemCount(redeemCount + 1);
                          }
                        }}
                      />
                      <Icon
                        name="decrease"
                        className={clsx('h-3 w-3', {
                          ['cursor-pointer']: !useAllAvailable && redeemCount > 1,
                          ['cursor-not-allowed']: useAllAvailable || redeemCount <= 1,
                        })}
                        onClick={() => {
                          if (!useAllAvailable && redeemCount > 1) {
                            setRedeemCount(redeemCount - 1);
                          }
                        }}
                      />
                    </div>
                    <div className={styles.checkbox}>
                      <input
                        type="checkbox"
                        id="all"
                        name="all"
                        value="all"
                        onClick={() => {
                          setUseAllAvailable(!useAllAvailable);
                        }}
                      />
                      <label htmlFor="all">All</label>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-[170px] mt-5"
                  color="primary"
                  fill="solid"
                  notch="right"
                  chevrons="right"
                  full={true}
                  uppercase={true}
                  disabled={skyFallLandsCount < 1 || isRedeeming}
                  onClick={() => redeemSkyFallToken()}
                >
                  {trans.t('redemption.redeem.button')}
                </Button>

                {hasError && <div className={styles.error}>{trans.t('redemption.redeem.error')}</div>}
              </>
            )}

            {transactionHash && (
              <>
                <>
                  <div className="uppercase text-[40px] font-bold">{trans.t('redemption.redeemed.description')}</div>
                  <div className={clsx('text-lg font-[325]', styles.textLightGray)}>
                    {trans.t('redemption.redeemed.subDescription')}
                  </div>

                  <div className={clsx(styles.redeem, styles.redeemed)}>
                    <div className={styles.title}>{trans.t('redemption.redeemed.owned')}</div>
                    <div className={styles.count}>{skyFallLandsCount}</div>
                  </div>

                  <div className={clsx(styles.redeem, styles.redeemed)}>
                    <div className={styles.title}>{trans.t('redemption.redeemed.redeemed')}</div>
                    <div className={styles.count}>
                      <div className={styles.text}>{redeemCount}</div>
                    </div>
                  </div>

                  <div className={clsx(styles.redeem, styles.redeemed)}>
                    <div className={styles.title}>{trans.t('redemption.redeemed.transacation')}</div>
                    <div className={styles.data}>
                      <div className={styles.transaction}>{getEllipsisTxt(transactionHash, 4)}</div>
                      <div className="flex mr-3">
                        <Icon
                          name="external"
                          color="var(--color-light-gray)"
                          className={clsx('h-5 w-5', styles.icon)}
                          onClick={() => {
                            window.open(
                              `${getExplorer(chainId)}tx/${transactionHash}`,
                              '_blank',
                              'noopener,noreferrer'
                            );
                          }}
                        />
                        <Icon
                          name="copy"
                          color="var(--color-light-gray)"
                          className={clsx('h-5 w-5 ml-[16px]', styles.icon)}
                          onClick={() => {
                            navigator.clipboard.writeText(transactionHash);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-[216px] mt-5"
                    color="primary"
                    fill="solid"
                    full={true}
                    uppercase={true}
                    onClick={onClose}
                  >
                    {trans.t('redemption.redeemed.button')}
                  </Button>
                </>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-center text-white py-20">
          <div className="max-w-screen-sm">
            <div className="relative pb-9">
              <div className={styles.infoDot} onClick={() => setShowInfoModal(true)}>
                <Icon name="info" className="h-5 w-5 ml-[10px] mt-[10px]" />
              </div>
              <hr className={styles.infoHr} />
            </div>

            <div
              className={clsx('text-sm text-center', styles.textLightGray)}
              dangerouslySetInnerHTML={{
                __html: transactionHash ? trans.t('redemption.redeemed.info') : trans.t('redemption.redeem.info'),
              }}
            ></div>
          </div>
        </div>
      </FullScreenModal>

      <DisplayModal
        isOpen={showInfoModal}
        title=""
        onClose={() => {
          setShowInfoModal(false);
        }}
        width="md:max-w-4xl sm:max-w-lg"
      >
        <div className={styles.infoModal}>
          <div
            className={styles.title}
            dangerouslySetInnerHTML={{
              __html: trans.t('redemption.infoModal.title'),
            }}
          ></div>
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{
              __html: trans.t('redemption.infoModal.description'),
            }}
          ></div>
        </div>
      </DisplayModal>
    </>
  );
};
