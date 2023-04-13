import { FunctionComponent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMoralis } from 'react-moralis';
import { default as MoralisTypes } from 'moralis/types';

import useAppStore from '@hooks/useAppStore';
import { DisplayModal } from '@components/modals/display-modal';
import { Button } from '@components/button';
import { connectors } from './config';
import VenlyWeb3Connector from './CustomProviders/VenlyWeb3Connector';

import styles from './account.module.scss';

type AccountProps = {
  inHeader?: boolean;
  notch?: 'right' | 'left' | 'both' | 'none';
  onAuthModalClose?: Function;
  triggerAuthModal?: boolean;
  [props: string]: any; // all other props
};

const Account: FunctionComponent<AccountProps> = ({
  inHeader = false,
  notch = 'right',
  onAuthModalClose = () => {},
  triggerAuthModal = false,
  ...domProps
}) => {
  const router = useRouter();
  const { authenticate, isAuthenticated, account, chainId, logout } = useMoralis();
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const { getProfile } = useAppStore();

  useEffect(() => {
    if (isAuthenticated && account) {
      getProfile(account);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, account]);

  useEffect(() => {
    if (triggerAuthModal) {
      setIsAuthModalVisible(true);
    }
  }, [triggerAuthModal]);

  const onWalletConnect = async connectorId => {
    try {
      let userAuth;
      if (connectorId === 'venly') {
        userAuth = await authenticate({ connector: VenlyWeb3Connector as unknown as MoralisTypes.Connector });
      } else {
        userAuth = await authenticate({ provider: connectorId });
      }
      window.localStorage.setItem('connectorId', connectorId);
      setIsAuthModalVisible(false);
      onAuthModalClose();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated || !account) {
    return (
      <>
        {inHeader ? (
          <button className="text-xs" onClick={() => setIsAuthModalVisible(true)}>
            CONNECT WALLET
          </button>
        ) : (
          <Button color="primary" fill="solid" notch={notch} onClick={() => setIsAuthModalVisible(true)}>
            CONNECT WALLET
          </Button>
        )}
        <DisplayModal
          title="Connect Wallet"
          isOpen={isAuthModalVisible}
          onClose={() => {
            setIsAuthModalVisible(false);
            onAuthModalClose();
          }}
          width="w-[400px]"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {connectors.map(({ title, icon, connectorId }, key) => (
              <div className={styles.connector} key={key} onClick={() => onWalletConnect(connectorId)}>
                <div className={styles.icon}>{icon}</div>
                <span className="text-sm">{title}</span>
              </div>
            ))}
          </div>
        </DisplayModal>
      </>
    );
  }

  return (
    <>
      {/* <Address size={4} onClick={() => setIsModalVisible(true)} />
      <DisplayModal isOpen={isModalVisible} onClose={() => setIsModalVisible(false)} width="w-[400px]" title="Account">
        <div className="border p-2">
          <Address avatar="left" size={6} copyable style={{ fontSize: '20px' }} />
          <div className="mt-2 px-2">
            <a href={`${getExplorer(chainId)}/address/${account}`} target="_blank" rel="noreferrer" className="flex">
              <ExternalLinkIcon className="h-5 w-5 mr-1" />
              View on Explorer
            </a>
          </div>
        </div>

        <Button
          className="mt-3"
          onClick={async () => {
            await logout();
            window.localStorage.removeItem('connectorId');
            setIsModalVisible(false);
          }}
        >
          Disconnect Wallet
        </Button>
      </DisplayModal> */}
    </>
  );
};

export default Account;
