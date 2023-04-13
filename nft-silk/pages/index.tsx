import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useMoralis } from 'react-moralis';

import { Button } from 'components/button';
import { StaticPage } from 'components/pages/static-page';
import useTranslation from '@hooks/useTranslation';
import Account from '@components/ethereum/Account/Account';
import useAppStore from '@hooks/useAppStore';

const Home: NextPage = () => {
  const { isAuthenticated, isAuthenticating } = useMoralis();
  const [ready, setReady] = useState(false);
  const { profile, setShowProfileModal, setShowEmailVerificationModal } = useAppStore();

  const trans = useTranslation();

  useEffect(() => {
    if (!isAuthenticating) setTimeout(() => setReady(true), 300);
  }, [isAuthenticating]);

  if (!ready) return <></>;

  return (
    <StaticPage backgroundVideo={`${process.env.NEXT_PUBLIC_ASSETS_BASE_URL}/video/silks-intro.mp4`}>
      <img className="h-20 w-auto" src="/images/logos/silks.svg" alt="Silks" />

      {!isAuthenticated ? (
        <>
          <h1 className="font-bold text-3xl">{trans.t('home.title_disconnected')}</h1>
          {/* <p>{trans.t('home.subtitle')}</p> */}
          <Account />
        </>
      ) : profile === undefined || profile === null ? (
        <>
          <h1 className="font-bold text-3xl">{trans.t('home.title_not_registered')}</h1>
          {/* <p>{trans.t('home.subtitle')}</p> */}
          <Button color="primary" fill="solid" notch="right" full={true} onClick={() => setShowProfileModal(true)}>
            {trans.t('home.complete_registration')}
          </Button>
        </>
      ) : profile && !profile?.isEmailVerified ? (
        <>
          <h1 className="font-bold text-3xl">{trans.t('home.title_not_registered')}</h1>
          {/* <p>{trans.t('home.subtitle')}</p> */}
          <Button
            color="primary"
            fill="solid"
            notch="right"
            full={true}
            onClick={() => setShowEmailVerificationModal(true)}
          >
            {trans.t('home.complete_registration')}
          </Button>
        </>
      ) : (
        <>
          <h1 className="font-bold text-3xl">{trans.t('home.title')}</h1>
          {/* <p>{trans.t('home.subtitle')}</p> */}
        </>
      )}
    </StaticPage>
  );
};

export default Home;
