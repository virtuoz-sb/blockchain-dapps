import { FunctionComponent, useCallback } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';

import useAdminStore from '@hooks/useAdminStore';
import useTranslation from '@hooks/useTranslation';
import useMediaQuery from '@hooks/useMediaQuery';
import { mobileBreakpointWidth } from '@common/constants';
import { Button } from '@components/button';
import AdminMenu from './menu';
import styles from './header.module.scss';

const manageAdminLink = process.env.NEXT_PUBLIC_AWS_AUTH_CONSOLE;

type HeaderProps = {
  isAdminManage: Boolean;
  isManagePage?: Boolean;
};

const getMenuItems = (trans: { t: (arg0: string) => any }, isMobile = false, isManage: Boolean = false) => {
  const mobileNav = [
    { action: 'home', name: trans.t('Home'), icon: 'home', href: '/admin/portal' },
    //{ action: 'manage', name: trans.t('Manage Access'), icon: 'shield', href: '/admin/manage' },
  ];
  if (isManage)
    mobileNav.push({ action: 'manage', name: trans.t('Manage Access'), icon: 'shield', href: '/admin/manage' });
  const navigation = [
    { action: 'change', name: trans.t('Change Password'), icon: 'padlock', href: '/admin/change' },
    { action: 'logout', name: trans.t('Logout'), icon: 'external', href: '/admin' },
  ];
  return isMobile ? mobileNav.concat(navigation) : navigation;
};

const Header: FunctionComponent<HeaderProps> = ({ isAdminManage, isManagePage }) => {
  const router = useRouter();
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpointWidth}px)`);
  const { adminProfile, logoutUser } = useAdminStore();

  const trans = useTranslation();
  const menuItems = getMenuItems(trans, isMobile, isAdminManage);

  const handleAction = useCallback(
    action => {
      switch (action) {
        case 'manage':
          //router.push('/admin/manage');
          window.open(manageAdminLink, '_blank');
          break;
        case 'change':
          router.push('/admin/change');
          break;
        case 'logout':
          logoutUser();
          break;
        default:
          router.push('/admin/portal');
      }
    },
    [logoutUser, router]
  );
  return (
    <nav className="absolute w-full z-40">
      <div className="flex justify-between items-center h-16 ml-4 md:ml-8">
        <div className="flex-shrink flex items-center">
          <img className="h-5 md:h-6 lg:h-fit w-auto" src="/images/logos/silks-admin.svg" alt="Silks Admin" />
        </div>
        {!isMobile && isAdminManage && !isManagePage && (
          <div className="flex flex-1 justify-center px-2 lg:mr-8 lg:justify-end">
            <Button
              fill="outline"
              color="primary"
              uppercase
              short
              notch="none"
              className=""
              onClick={() => handleAction('manage')}
            >
              <span className="text-sm text-[color:var(--color-royal-blue)] hover:text-white">
                {trans.t('Manage Admin Access')}
              </span>
            </Button>
          </div>
        )}
        <div className={clsx('flex items-center flex-1 md:flex-0 justify-end')}>
          <div className={clsx('flex items-center', styles.headerRight)}>
            <div className="skew-fix flex items-center px-2 mr-0 md:px-8 sm:mr-6">
              <h5 className="text-market text-sm md:text-base">{adminProfile?.attributes?.email}</h5>
            </div>
          </div>
          <div className={clsx('flex items-center relative w-10', !isMobile && styles.headerMenu)}>
            <div className="z-10">
              <AdminMenu onAction={handleAction} navItems={menuItems} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
