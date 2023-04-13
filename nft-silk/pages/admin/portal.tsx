import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../_app';
import useTranslation from '@hooks/useTranslation';
import AdminLayout from '@layout/adminLayout';
import AdminPage from '@components/admin/admin-page';
import { PortalUsers } from '@components/admin/portal-users';

//set height to control table viewport display: Header 64 + section crumb 72
//const heightBuffer = 64 + 72;

const AdminPortal: NextPageWithLayout = () => {
  const trans = useTranslation();
  return (
    <AdminPage>
      <div className="h-[calc(100vh_-_136px)]">
        <PortalUsers title={trans.t('admin.portalUsers.title')} />
      </div>
    </AdminPage>
  );
};

AdminPortal.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminPortal;
