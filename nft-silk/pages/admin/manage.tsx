import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../_app';
import useTranslation from '@hooks/useTranslation';
import AdminLayout from '@layout/adminLayout';
import AdminPage from '@components/admin/admin-page';

const AdminManage: NextPageWithLayout = () => {
  const trans = useTranslation();
  return (
    <AdminPage section={trans.t('Manage Access')}>
      <div className="h-full text-white p-6">
        <h2 className="text-3xl">{trans.t('Manage Access')}</h2>
      </div>
    </AdminPage>
  );
};

AdminManage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout isManagePage>{page}</AdminLayout>;
};

export default AdminManage;
