import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../_app';
import useTranslation from '@hooks/useTranslation';
import AdminLayout from '@layout/adminLayout';
import AdminPage from '@components/admin/admin-page';
import ChangePassword from '@components/admin/change-password';

const AdminChangePassword: NextPageWithLayout = () => {
  const trans = useTranslation();
  return (
    <AdminPage section={trans.t('admin.changePassword.title')}>
      <div className="h-full text-white mt-4 sm:mt-10">
        <ChangePassword title={trans.t('admin.changePassword.title')} />
      </div>
    </AdminPage>
  );
};

AdminChangePassword.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminChangePassword;
