import { ReactNode, FunctionComponent } from 'react';
import clsx from 'clsx';
import Link from 'next/link';

import useTranslation from '@hooks/useTranslation';
import { Icon } from '@components/icons';

const portalUrl = '/admin/portal';

//section > Manage Access

type AdminPageProps = {
  children: ReactNode;
  className?: string;
  section?: string;
};

const AdminPage: FunctionComponent<AdminPageProps> = ({ children, className, section }) => {
  const trans = useTranslation();
  return (
    <div className="h-full text-white">
      <ol className="flex py-6 space-x-4 relative items-center" role="list">
        <li>
          <div>
            <Link href={portalUrl}>
              <a className="text-sm text-[color:var(--color-royal-white)] hover:underline">{trans.t('admin.title')}</a>
            </Link>
          </div>
        </li>
        {section && section.length && (
          <li>
            <div className="flex items-center">
              <Icon name="chevron-right" className="h-2 w-2" color="var(--color-dark-gray)" />
              <div className="ml-4 text-sm text-[color:var(--color-royal-white)] font-medium">{section}</div>
            </div>
          </li>
        )}
      </ol>
      <div
        className={clsx(
          'bg-blue-900 backdrop-blur bg-opacity-50 h-full',
          //styles.background,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default AdminPage;
