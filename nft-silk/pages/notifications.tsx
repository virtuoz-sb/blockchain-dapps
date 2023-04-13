import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useMoralis } from 'react-moralis';

import useTranslation from '@hooks/useTranslation';
import { Notification } from '@components/notification';
import { Page } from '@components/pages/page';

const Home: NextPage = () => {
  const { isAuthenticated } = useMoralis();
  const [isSignedIn, setIsSignedIn] = useState(null);

  const trans = useTranslation();

  useEffect(() => {
    setIsSignedIn(isAuthenticated);
  }, [isAuthenticated]);

  return <Page title={trans.t('notifications.title')}>{isSignedIn && <Notification />}</Page>;
};

export default Home;
