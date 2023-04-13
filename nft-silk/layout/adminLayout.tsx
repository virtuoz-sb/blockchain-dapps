import { ReactNode, FunctionComponent, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import useAdminStore from '@hooks/useAdminStore';
import Header from '@layout/admin/header';
import styles from './admin/landing/landing.module.scss';

type AdminLayoutProps = {
  children: ReactNode;
  isManagePage?: Boolean;
};

const Layout: FunctionComponent<AdminLayoutProps> = ({ children, isManagePage = false }) => {
  const router = useRouter();
  const { isAdminActive } = useAdminStore();
  //selector
  const isAdminManage = useAdminStore(
    state => state.isAdminActive && state.adminProfile.groups.includes('silks-admins')
  );

  const isValid = useMemo(
    () => (isManagePage ? isAdminManage : isAdminActive),
    [isAdminActive, isAdminManage, isManagePage]
  );
  //console.log('Full', isAdminActive, isAdminManage, isManagePage, isValid);
  useEffect(() => {
    if (!isValid) {
      router.push('/admin');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid]);
  return isValid ? (
    <div className={styles.wrapper}>
      <Header isAdminManage={isAdminManage} isManagePage={isManagePage} />
      <div className="h-screen bg-blue-900 backdrop-blur bg-opacity-50 overflow-hidden pt-[64px] px-2 sm:px-6 md:px-8">
        <div className={styles.headerAccent}></div>
        {children}
      </div>
    </div>
  ) : null;
};

export default Layout;
