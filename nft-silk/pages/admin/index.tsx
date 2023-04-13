import type { ReactElement } from 'react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';

import { Amplify } from 'aws-amplify';
import type { NextPageWithLayout } from '../_app';
import { Loader } from '@components/loader';
import Landing from '@layout/admin/landing';
import AWSLogin from '@components/admin/login/aws-login';
//import useAdminStore from '@hooks/useAdminStore';
import { vanillaStore as vanillaAdminStore } from '@hooks/useAdminStore';
import awsAdminAuthConfig from '@common/authAdmin';

let isAwsSet = false;
const setUpAws = () => {
  const updatedAwsConfig = {
    ...awsAdminAuthConfig,
    oauth: {
      ...awsAdminAuthConfig.oauth,
      redirectSignIn: window.location.origin + process.env.NEXT_PUBLIC_AWS_AUTH_ROUTE,
      redirectSignOut: window.location.origin + process.env.NEXT_PUBLIC_AWS_AUTH_ROUTE,
    },
  };
  //console.log('CALLING SETUP', updatedAwsConfig);
  const awsConfig = { Auth: updatedAwsConfig };

  Amplify.configure(awsConfig);
};

if (typeof window !== 'undefined' && !isAwsSet) {
  isAwsSet = true;
  setUpAws();
}

const checkUser = vanillaAdminStore.getState().checkAuthenticatedUser;

const AdminLanding: NextPageWithLayout = () => {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const isMounted = useRef<boolean>(false);
  //const { isAdminActive } = useAdminStore();

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      checkUser().then(res => {
        //console.log('RES', res);
        //if res redirect else shut off loading
        if (res.success) {
          router.replace('/admin/portal');
        } else {
          setIsReady(true);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /*   useEffect(() => {
    console.log('isADMIN Active', isAdminActive, isReady);
  }, [isAdminActive, isReady]); */

  if (!isReady) return <Loader />;

  return (
    <div className="h-full">
      <AWSLogin />
    </div>
  );
};

AdminLanding.getLayout = function getLayout(page: ReactElement) {
  return <Landing>{page}</Landing>;
};

export default AdminLanding;
