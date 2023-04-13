import React, { FunctionComponent, useState, useCallback } from 'react';
import clsx from 'clsx';
import useTranslation from '@hooks/useTranslation';
import useAdminStore from '@hooks/useAdminStore';
import { Button } from '@components/button';
import ChangePasswordForm from './form';

function SuccessDisplay(): JSX.Element {
  const { t } = useTranslation();
  const { logoutUser, adminProfile } = useAdminStore();
  const getT = (key: string) => t(`admin.changePassword.success.${key}`);
  return (
    <div className="w-full max-w-lg p-4 sm:p-8 flex flex-col items-center mt-8 border border-slate-200/10 rounded-lg bg-[#201f33]/50 backdrop-blur-xl">
      <h3 className="text-xl font-medium text-white">{getT('title')}</h3>
      <h5 className="text-white text-sm md:text-base mt-6">{adminProfile?.attributes?.email}</h5>
      <div className="text-sm text-center text-[color:var(--color-light-gray)]">{getT('msg')}</div>
      <Button
        color="dark"
        fill="solid"
        notch="right"
        chevrons="right"
        uppercase
        className="pt-8"
        full={true}
        onClick={() => logoutUser()}
      >
        {getT('button')}
      </Button>
    </div>
  );
}

type ChangePasswordProps = {
  className?: string;
  title?: string;
};

export const ChangePassword: FunctionComponent<ChangePasswordProps> = ({ className, title }) => {
  const [isPasswordChanged, setIsPasswordChanged] = useState<boolean>(false);
  // response success change password
  const handleSuccess = useCallback(user => {
    console.log('Change Password Success', user);
    setIsPasswordChanged(true);
  }, []);

  return (
    <div className={clsx('flex flex-col min-h-full items-center justify-start', className)}>
      <div className="w-full max-w-md px-4 sm:px-0">
        <h2 className="text-3xl sm:text-4xl font-bold mb-8">{title}</h2>
      </div>
      {isPasswordChanged ? <SuccessDisplay /> : <ChangePasswordForm onSuccess={handleSuccess} />}
    </div>
  );
};

export default ChangePassword;
