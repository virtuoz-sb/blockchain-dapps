import React from 'react';
import useAdminStore from '@hooks/useAdminStore';
import LoginForm from './form';

export const Login = () => {
  const { setAdminActive, setAdminProfile } = useAdminStore();
  // check admin user and direct
  // status. role
  const handleSuccess = user => {
    setAdminProfile(user);
    console.log('Login Success', user);
    setAdminActive(true);
  };
  return (
    <div className="flex flex-col min-h-full items-center justify-center">
      <div className="mb-8">
        <img className="w-auto" src="/images/logos/silks-admin.svg" alt="Silks Admin" />
      </div>
      <LoginForm onSuccess={handleSuccess} />
    </div>
  );
};

export default Login;
