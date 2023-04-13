import React, { useEffect } from 'react';
import { Auth } from 'aws-amplify';

import useTranslation from '@hooks/useTranslation';
import { Button } from '@components/button';

export type AwsLoginProps = {
  isRedirect?: boolean;
};

export default function AWSLogin({ isRedirect = false }: AwsLoginProps) {
  const trans = useTranslation();
  useEffect(() => {
    if (isRedirect) {
      Auth.federatedSignIn();
    }
  }, [isRedirect]);

  return isRedirect ? null : (
    <div className="flex flex-col min-h-full items-center justify-center">
      <div className="mb-8">
        <img className="w-auto" src="/images/logos/silks-admin.svg" alt="Silks Admin" />
      </div>
      <Button
        color="primary"
        fill="solid"
        notch="right"
        uppercase
        className="pt-5"
        full={true}
        onClick={() => Auth.federatedSignIn()}
      >
        {trans.t('admin.login.signin')}
      </Button>
    </div>
  );
}
