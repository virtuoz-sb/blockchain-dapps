import { ReactNode, FunctionComponent } from 'react';

import { Header } from '@layout/header';
import { Footer } from '@layout/footer';
import { Profile, Settings, Redemption } from '@layout/index';
import { DisplayModal } from '@components/modals/display-modal';
import useMediaQuery from '@hooks/useMediaQuery';
import useTranslation from '@hooks/useTranslation';
import { mobileBreakpointWidth } from '@common/constants';

// todo add Head with title etc?

type AppLayoutProps = {
  children: ReactNode;
};

const Layout: FunctionComponent<AppLayoutProps> = ({ children }) => {
  const trans = useTranslation();
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpointWidth}px)`);

  return (
    <>
      <Header />
      {children}
      <Profile />
      <Settings />
      <Redemption />
      <Footer />

      <DisplayModal
        title=""
        isOpen={isMobile}
        width="w-[350px]"
        height="h-[150px]"
        showTitleCloseIcon={false}
        onClose={() => {}}
      >
        <div className="mt-7 text-center">{trans.t('common.mobile')}</div>
      </DisplayModal>
    </>
  );
};

export default Layout;
