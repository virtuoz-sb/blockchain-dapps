import React, { FunctionComponent, ReactNode, useEffect, useState } from 'react';
import clsx from 'clsx';

import { Icon } from '@components/icons';
import useMediaQuery from '@hooks/useMediaQuery';
import useTranslation from '@hooks/useTranslation';
import { mobileBreakpointWidth } from '@common/constants';

import stylesLandMap from './filters.module.scss';
import stylesMarketplace from './filters.marketplace.module.scss';

export { AcreLandFilter } from './acre-land.filter';
export { CoordinatesFilter } from './coordinates.filter';
export { DamFilter } from './dam.filter';
export { FarmsFilter } from './farms.filter';
export { WalletFilter } from './wallet.filter';

export type FiltersProps = {
  children: ReactNode;
  onChange: Function;
  onFilterCollapse: Function;
  onFilterClear: Function;
  translationKey?: string;
  moduleId?: ModuleEnum;
  count?: number;
  [props: string]: any; // All other props
};

enum ModuleEnum {
  landMap = 1,
  marketplace = 2,
}

export const Filters: FunctionComponent<FiltersProps> = ({
  children,
  onChange,
  onFilterCollapse,
  onFilterClear,
  translationKey = 'landMap',
  moduleId = 1,
  count,
  ...props
}) => {
  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpointWidth}px)`);
  const [isCollpased, setIsCollpased] = useState<boolean>(isMobile);
  const trans = useTranslation();

  // CSS change accordingly the selected module
  const styles = moduleId == ModuleEnum.landMap ? stylesLandMap : stylesMarketplace;

  const toggleCollapse = () => {
    onFilterCollapse(!isCollpased);
    setIsCollpased(!isCollpased);
  };

  useEffect(() => {
    if (isMobile) {
      setIsCollpased(true);
    }
  }, [isMobile, setIsCollpased]);

  return (
    <div className={clsx(styles.container, { [styles.collapsed]: isCollpased })}>
      <div className={clsx(styles.headerContainer)}>
        <div className={styles.header}>
          <div className={styles.title}>
            <div>
              <Icon name="filter" className="h-4 w-4 pt-0.5"></Icon>
            </div>

            <div className={styles.filter}>{trans.t('common.filters.title')}</div>
            <button
              className={styles.clear}
              onClick={() => {
                // turn flag on to trigger clean, then reset flag
                onFilterClear(true);
                setTimeout(() => {
                  onFilterClear(false);
                });
              }}
            >
              {trans.t('common.filters.clear')}
            </button>
          </div>
          <div className={styles.collapse} onClick={toggleCollapse}>
            {isCollpased && <Icon name="filter" className="h-4 w-4 pt-0.5"></Icon>}
            {!isCollpased && <Icon name="chevron-left" className="h-2 w-2"></Icon>}
          </div>
        </div>

        {moduleId == ModuleEnum.landMap && count !== null && (
          <div className={styles.detail}>
            {count}{' '}
            {count === 0 || count > 1
              ? trans.t('landMap.filters.acres')
              : trans.t('landMap.filters.acres').slice(0, -1)}
          </div>
        )}
      </div>
      <div className={clsx(styles.filterList, { [styles.collapsed]: isCollpased })}>{children}</div>
    </div>
  );
};
