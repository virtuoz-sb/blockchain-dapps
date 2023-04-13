import React, { FunctionComponent } from 'react';
import useTranslation from '@hooks/useTranslation';
import clsx from 'clsx';
import styles from './staked-horses.module.scss';
import { numberFormat } from '@common/helpers/formatters';

export type StakedHorsesProps = {
  stakedHorses: IStakedHorse[];
  [props: string]: any; // All other props
};

export const StakedHorses: FunctionComponent<StakedHorsesProps> = ({ stakedHorses, ...domProps }) => {
  const { t } = useTranslation();

  return (
    <div className={clsx('rounded-md bg-blue-900 overflow-auto', styles.stakedHorsesTabWrapper)}>
      <div className={clsx('rounded-md bg-blue-900 overflow-auto pt-2 max-h-full')}>
        {stakedHorses?.length > 0 && (
          <table className="w-full h-full" cellPadding={10}>
            <thead>
              <tr className="border-b border-gray-600">
                <th
                  scope="col"
                  className="whitespace-nowrap sticky py-3 px-3 top-[-10px] z-10 bg-blue-900 bg-opacity-95 text-left text-xs backdrop-filter text-white-500 font-normal"
                >
                  {t('stakedHorses.stall')}
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap sticky py-3 px-3 top-[-10px] z-10 hidden bg-blue-900 bg-opacity-95 text-left text-xs backdrop-filter sm:table-cell text-white-500 font-normal"
                >
                  {t('stakedHorses.horseName')}
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap sticky py-3 px-3 top-[-10px] z-10 hidden bg-blue-900 bg-opacity-95 text-xs backdrop-filter lg:table-cell text-white-500 font-normal"
                >
                  {t('stakedHorses.auctionPrice')}
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap sticky py-3 px-3 top-[-10px] z-10 bg-blue-900 bg-opacity-95 text-left text-xs backdrop-filter text-white-500 font-normal"
                >
                  {t('stakedHorses.dam')}
                </th>
              </tr>
            </thead>
            <tbody>
              {stakedHorses.map(horse => (
                <tr key={horse.id} className="hover:bg-white/10">
                  <th className="whitespace-nowrap py-3 px-3 border-b border-gray-600 text-left font-normal">
                    {horse.stall}
                  </th>
                  <th className="whitespace-nowrap py-3 px-3 border-b border-gray-600 m-2 text-left font-normal">
                    {horse.name}
                  </th>
                  <th className="whitespace-nowrap py-3 px-3 border-b border-gray-600 text-gray-300 font-normal">
                    {horse.usdPrice !== '-' ? `$${numberFormat(horse.usdPrice)}` : horse.usdPrice}
                  </th>
                  <th className="whitespace-nowrap py-3 px-3 border-b border-gray-600 text-gray-300 text-left font-normal">
                    {horse.damName}
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
