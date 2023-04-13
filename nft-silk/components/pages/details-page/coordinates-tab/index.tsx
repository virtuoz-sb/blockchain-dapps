import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { map } from 'lodash-es';

import useTranslation from '@hooks/useTranslation';
import { Icon } from '@components/icons';

import styles from './coordinates-tab.module.scss';

export type CoordinatesTabProps = {
  coordinates: ICoordinateModel[];
  [props: string]: any; // All other props
};

export const CoordinatesTab: FunctionComponent<CoordinatesTabProps> = ({ coordinates, ...domProps }) => {
  const { t } = useTranslation();

  return (
    <div className={clsx('rounded-md bg-blue-900 overflow-auto', styles.positionsTabWrapper)}>
      <div className={clsx('rounded-md bg-blue-900 overflow-auto p-6 h-full')}>
        <div className={styles.title}>{t('details.coordinates.title')}</div>
        <div className={clsx('flex flex-wrap')}>
          {map(coordinates, l => (
            <div className={clsx(styles.position, 'ml-2 mt-2')} key={`${l.x}-${l.y}`}>
              <Icon name="marker" color="var(--color-dark-yellow)" className="h-3 w-3 mr-2" />
              {l.x}, {l.y}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
