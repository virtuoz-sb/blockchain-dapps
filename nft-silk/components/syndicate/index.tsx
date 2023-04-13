import React, { FunctionComponent } from 'react';
import { Icon } from '@components/icons';
import useTranslation from '@hooks/useTranslation';
import clsx from 'clsx';
import styles from './syndicate.module.scss';

export type syndicateProps = {
  syndicateData: IHorseSyndicateTab[];
  [props: string]: any; // All other props
};

export const Syndicate: FunctionComponent<syndicateProps> = ({ syndicateData, ...domProps }) => {
  const { t } = useTranslation();

  return (
    <div className={clsx('rounded-md bg-blue-900 overflow-auto', styles.syndicateTabWrapper)}>
      <div className={clsx('rounded-md bg-blue-900 overflow-auto p-6 h-full')}>
        {syndicateData?.length > 0 && (
          <table className="w-full" cellPadding={10}>
            <thead>
              <tr className="border-b border-gray-600">
                <th
                  scope="col"
                  className="whitespace-nowrap sticky top-0 z-10 bg-blue-900 bg-opacity-95 py-3.5  text-left text-xs backdrop-filter text-white-500 font-normal"
                >
                  {t('syndicate.owner')}
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap sticky top-0 z-10 hidden bg-blue-900 bg-opacity-95  text-left text-xs backdrop-filter sm:table-cell text-white-500 font-normal"
                >
                  {t('syndicate.tokenType')}
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap sticky top-0 z-10 hidden bg-blue-900 bg-opacity-95  text-left text-xs backdrop-filter lg:table-cell text-white-500 font-normal"
                >
                  {t('syndicate.Share')}
                </th>
              </tr>
            </thead>
            <tbody>
              {syndicateData.map((syndicate, index) => (
                <tr key={index} className="hover:bg-white/10 text-xs border-b border-gray-600 ">
                  <td className="whitespace-nowrap text-left flex items-center h-full">
                    {syndicate.isGovernance ? (
                      <Icon name="governance" className="h-5 w-5 mr-1" />
                    ) : (
                      <Icon name="partnership" className="h-5 w-5 mr-1" />
                    )}
                    <span className="text-blue ml-3">
                      <u>{syndicate.owner}</u>
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-gray-300">{syndicate.tokenType}</td>
                  <td className="whitespace-nowrap text-gray-300">{syndicate.sharesQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
