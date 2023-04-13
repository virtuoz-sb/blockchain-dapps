import { useEffect } from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import Moralis from 'moralis';
import { default as MoralisTypes } from 'moralis/types';
import { MoralisProvider, useMoralis, useMoralisWeb3Api } from 'react-moralis';
import VenlyWeb3Connector from '@components/ethereum/Account/CustomProviders/VenlyWeb3Connector';

import { handleUserTransactions } from '@common/helpers/userTransaction';
import AppLayout from '@layout/appLayout';
import useAppStore from '@hooks/useAppStore';
import useContractAddressStore from '@hooks/useContractAddressStore';
import useTransactionStore from '@hooks/useTransactionStore';

import '@styles/globals.scss';

const APP_ID = process.env.NEXT_PUBLIC_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function SilksPortal(props: AppProps) {
  return (
    <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL} initializeOnMount={true}>
      <SilksPortalComponent {...props} />
    </MoralisProvider>
  );
}

function SilksPortalComponent({ Component, pageProps }: AppPropsWithLayout) {
  const { account, chainId, isWeb3Enabled, enableWeb3, isAuthenticated, isWeb3EnableLoading, isInitialized, logout } =
    useMoralis();
  const { native } = useMoralisWeb3Api();
  const { getProfile, profile, setProfile, setShowProfileModal } = useAppStore();
  const {} = useTransactionStore(); // connects the websocket on app load
  const { getContractAddresses, refreshContractAddresses } = useContractAddressStore();

  // moralis/web startup on load of app
  useEffect(() => {
    const connectorId = window.localStorage.getItem('connectorId');

    if (!isWeb3Enabled && !isWeb3EnableLoading) {
      // @ts-ignore-start
      if (connectorId === 'venly') {
        enableWeb3({ connector: VenlyWeb3Connector as unknown as MoralisTypes.Connector });
      } else {
        enableWeb3({ provider: connectorId as MoralisTypes.Web3ProviderType });
      }
      Moralis.onAccountChanged(async account => {
        console.log('Connected account changed', account);
        await logout();
        window.localStorage.removeItem('connectorId');
        setProfile(undefined);
      });
      // @ts-ignore-end
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  // get user profile on load of app
  useEffect(() => {
    const getUserProfile = async () => {
      const profile = await getProfile(account);

      if (profile) {
        await handleUserTransactions(Moralis, account, chainId);
      } else if (profile === undefined) {
        // only show profile modal if connected but no profile
        setShowProfileModal(true);
      }
    };

    if (account && isAuthenticated && !profile) {
      getUserProfile();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isAuthenticated, profile]);

  // fallback for getting index contracts through moralis, if web socket fails, will trigger refreshContractAddresses toggle
  useEffect(() => {
    if (isInitialized && refreshContractAddresses) {
      getContractAddresses(native);
    }
  }, [getContractAddresses, isInitialized, native, refreshContractAddresses]);

  const getLayout = Component.getLayout || (page => <AppLayout>{page}</AppLayout>);

  return (
    <>
      <Head>
        <title>Silks Portal</title>
        <meta name="description" content="Silks Portal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="app-container pt-0">{getLayout(<Component {...pageProps} />)}</div>
    </>
  );
}

export default SilksPortal;
