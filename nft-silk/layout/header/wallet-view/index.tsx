import { Fragment, useState, useRef, useEffect } from 'react';
import { useMoralis, useNativeBalance } from 'react-moralis';
import { Popover, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { filter, flatten, forEach, map, reduce, uniq } from 'lodash-es';

import useAppStore from '@hooks/useAppStore';
import useTranslation from '@hooks/useTranslation';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import useWalletStore from '@hooks/useWalletStore';
import { Button } from '@components/button';
import { ConfirmModal } from '@components/modals/confirm-modal';
//import { Loader } from '@components/loader';
import { Skeleton } from '@components/skeleton';

import styles from './wallet-view.module.scss';

type WalletViewProps = {
  toggle: boolean;
};

export default function WalletView({ toggle }: WalletViewProps) {
  const { chainId, isAuthenticated, logout, Moralis } = useMoralis();
  const { data: balance } = useNativeBalance();
  const { setProfile } = useAppStore();
  const { getContractAddress } = useContractAddressStore();
  const { getEthInUsdWithoutTokenPrice, getNFTsForContract } = useWalletStore();
  const trans = useTranslation();

  const [contractAddresses, setContractAddresses] = useState<any>({});
  const [nftTokens, setNftTokens] = useState<any[]>([]);
  const [balanceUsd, setBalanceUsd] = useState<number>(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);
  const [loadingTokens, setLoadingTokens] = useState<boolean>(false);

  const isMounted = useRef<boolean>(false);
  const popover = useRef<HTMLDivElement>(null);
  const popoverBtn = useRef<HTMLButtonElement>(null);

  const getNFTsForToken: any = async tokenAddress => {
    try {
      let response = null;
      let tokens = [];
      let page = 0;

      const getBatch = async page => {
        return await getNFTsForContract(Moralis, tokenAddress, chainId, { cursor: response?.cursor });
      };

      // max page size is 100, keep calling api to get all tokens
      while (!response || response.cursor) {
        response = await getBatch(page);
        page++;

        tokens = tokens.concat(...response.result);
      }

      return tokens;
    } catch (error) {
      return [];
    }
  };

  // set isMounted to true on first run
  useEffect(() => {
    const getAddresses = async () => {
      const avatarAddress = await getContractAddress(ContractTypeEnum.Avatar);
      const horseAddress = await getContractAddress(ContractTypeEnum.Horse);
      const landAddress = await getContractAddress(ContractTypeEnum.Land);
      const skyfallsTokenAddress = await getContractAddress(ContractTypeEnum.SkyFalls);

      setContractAddresses({
        avatarAddress,
        horseAddress,
        landAddress,
        skyfallsTokenAddress,
      });
    };

    if (!isMounted.current) {
      getAddresses();
    }

    isMounted.current = true;
  }, [getContractAddress]);

  useEffect(() => {
    if (isMounted.current && popover.current && popoverBtn.current) {
      const isOpen = popover?.current?.childElementCount > 1;

      if (!isOpen) {
        const getTokens = async () => {
          if (isAuthenticated && Moralis && chainId) {
            setLoadingTokens(true);
            popoverBtn?.current?.click();

            // get tokens for each contract type, flatten into single array
            let tokens: any[] = flatten(
              await Promise.all([
                getNFTsForToken(contractAddresses?.avatarAddress),
                getNFTsForToken(contractAddresses?.horseAddress),
                getNFTsForToken(contractAddresses?.landAddress),
                getNFTsForToken(contractAddresses?.skyfallsTokenAddress),
              ])
            );

            console.log(tokens);

            const userTokens = [];
            const tokenNames = uniq(map(tokens, b => b.name));

            forEach(tokenNames, tn => {
              const ts = filter(tokens, b => b.name === tn);

              userTokens.push({
                name: tn,
                tokens: ts,
                total: reduce(ts, (sum, t) => sum + Number(t.amount), 0),
              });
            });

            setNftTokens(userTokens);
            setLoadingTokens(false);
          }
        };

        const getBalanceUsd = async () => {
          setLoadingBalance(true);
          const balenceInEth = Moralis.Units.ETH(balance.balance);
          const result = await getEthInUsdWithoutTokenPrice(Moralis, balenceInEth);

          setBalanceUsd(result);
          setLoadingBalance(false);
        };

        getTokens();
        // getBalanceUsd();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle]);

  return (
    <>
      <Popover className={styles.popover} ref={popover}>
        {({ open, close }) => (
          <>
            <Popover.Button className="hidden" ref={popoverBtn}></Popover.Button>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Popover.Panel static className={styles.popoverPanel}>
                <div className={styles.optionTitle}>{trans.t('header.wallet.inGameToken')}</div>

                {balance.balance !== '0' && (
                  <div className={clsx(styles.option, styles.tokenOption)}>
                    <div className={clsx(styles.title, { ['pt-2']: !balanceUsd && !loadingBalance })}>
                      {balance.formatted}
                    </div>
                    {balanceUsd && (
                      <div className={styles.text}>
                        ${balanceUsd} {trans.t('header.wallet.currency.usd')}
                      </div>
                    )}
                    {loadingBalance && <Skeleton height={18} className="w-1/2"></Skeleton>}
                  </div>
                )}

                <div className={styles.optionTitle}>{trans.t('header.wallet.nft')}</div>

                {loadingTokens && (
                  <>
                    <Skeleton className={clsx(styles.option, styles.nftOption)}></Skeleton>
                    <Skeleton className={clsx(styles.option, styles.nftOption)}></Skeleton>
                    <Skeleton className={clsx(styles.option, styles.nftOption)}></Skeleton>
                  </>
                )}

                {!loadingTokens && nftTokens.length > 0 && (
                  <>
                    {map(nftTokens, (t, index) => {
                      if (t && t?.total > 0) {
                        return (
                          <div className={clsx(styles.option, styles.nftOption)} key={t.name}>
                            <div className={styles.title}>
                              <span>{t.name}</span>
                              <span className="ml-1">{t.total}</span>
                            </div>
                          </div>
                        );
                      }

                      return <></>;
                    })}
                  </>
                )}

                <Button
                  color="primary"
                  className="w-full flex justify-end mt-3"
                  notch="right"
                  onClick={async () => {
                    setShowDisconnectModal(true);
                  }}
                >
                  {trans.t('header.wallet.disconnect')}
                </Button>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>

      <ConfirmModal
        isOpen={showDisconnectModal}
        title="Disconnect Wallet?"
        confirmButtonText="Yes"
        cancelButtonText="No"
        onClose={async result => {
          if (result === true) {
            await logout();
            window.localStorage.removeItem('connectorId');
            setProfile(undefined);
          }

          setShowDisconnectModal(false);
        }}
      >
        {trans.t('header.wallet.confirmDisconnect')}
      </ConfirmModal>
    </>
  );
}
