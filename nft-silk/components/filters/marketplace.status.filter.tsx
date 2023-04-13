import React, { FunctionComponent, useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { IFilterItemTypeEnum } from './marketplace.filter';

import { Icon } from '@components/icons';
import { CheckboxInput } from '@components/inputs/checkbox-input';
import { TextInputRange } from '@components/inputs/text-range';
import styles from './filter.module.scss';

export type MarketplaceStatusFilterProps = {
  initialFilterValues?: IStatusFilter[];
  onChange: Function;
  clearFilter?: boolean;
  [props: string]: any; // All other props
};

export interface IStatusFilter {
  icon?: string;
  count?: number;
  title: string;
  items: IStatusItemsFilter[];
}

export interface IStatusItemsFilter {
  filterType: IFilterItemTypeEnum;
  range1Name?: string;
  range2Name?: string;
  range1Placeholder?: string;
  range2Placeholder?: string;
  dbColumnName: string;
  name: string;
  count?: number;
}

export const MarketplaceStatusFilter: FunctionComponent<MarketplaceStatusFilterProps> = ({
  initialFilterValues = [
    {
      title: 'STATUS',
      items: [
        {
          filterType: IFilterItemTypeEnum.Checkbox,
          dbColumnName: 'IsForSale',
          name: 'For Sale',
        },
        {
          filterType: IFilterItemTypeEnum.TextRange,
          dbColumnName: 'PriceInETH',
          name: 'Price Range',
          range1Name: 'priceRange1',
          range2Name: 'priceRange2',
          range1Placeholder: 'Min. Price',
          range2Placeholder: 'Max. Price',
        },
      ],
    },
  ],
  onChange,
  clearFilter,
  ...props
}) => {
  const formRef = useRef<any>();
  const [isShowing, setIsShowing] = useState<boolean>(false);

  const onSubmit = values => {
    onChange(values);
  };

  const textRangeEvent = (valueRange1, valueRange2) => {
    let selectedFilter: IDynamicFiltersModel;
    if (valueRange1 && valueRange2) {
      selectedFilter = {
        filterType: 'TextRange',
        dbColumnName: initialFilterValues[0].items[1].dbColumnName,
        lastActionIsRemove: false,
        valueOfRange1: parseFloat(valueRange1),
        valueOfRange2: parseFloat(valueRange2),
      };
    } else {
      selectedFilter = {
        filterType: 'TextRange',
        dbColumnName: initialFilterValues[0].items[1].dbColumnName,
        lastActionIsRemove: true,
        valueOfRange1: 0,
        valueOfRange2: 0,
      };
    }

    onChange(selectedFilter);
  };

  useEffect(() => {
    if (clearFilter) {
      if (formRef.current) {
        formRef.current.reset();
      }
    }
  }, [clearFilter]);

  return (
    <form ref={formRef}>
      <div>
        {initialFilterValues.map(filter => (
          <div key={filter.title} className={clsx(styles.container, { [styles.closed]: !isShowing })}>
            <div className={styles.header} onClick={() => setIsShowing(!isShowing)}>
              <div className={styles.title}>
                {filter.icon && <Icon name={filter.icon} className={styles.leftIcon} />}
                {filter.title}
              </div>

              <div className={clsx(styles.chevron, { [styles.closed]: !isShowing })}>
                <span className="pr-4">{filter.count}</span>
                <Icon name="chevron-up" className="h-3 w-3" color="var(--color-royal-white)" />
              </div>
            </div>

            <div className={styles.filter}>
              {filter.items.map((item, index) => (
                <div
                  key={filter.title + item.name + index}
                  className={clsx('flex justify-between pr-12', filter.icon ? 'pl-6' : '')}
                >
                  {item.filterType == IFilterItemTypeEnum.Checkbox && (
                    <CheckboxInput
                      className="mb-4"
                      name={item.dbColumnName}
                      label={item.name}
                      id={item.dbColumnName + index}
                      isLarge
                      onChangeEventForMarketplace={onSubmit}
                      useBooleanValue={true}
                    />
                  )}
                  {item.filterType == IFilterItemTypeEnum.TextRange && (
                    <div className="">
                      <div className="pb-2">{item.name}</div>

                      <TextInputRange
                        range1Name={item.range1Name}
                        range1DataTest={item.range1Name}
                        range1Placeholder={item.range1Placeholder}
                        range2Name={item.range2Name}
                        range2DataTest={item.range2Name}
                        range2Placeholder={item.range2Placeholder}
                        isSmall={true}
                        className="flex w-[250px]"
                        // mask="$ 0,000,000"
                        mask={/^[\d]{1,3}\.?[\d]{0,4}$/}
                        onChangeEventForMarketplace={textRangeEvent}
                        clearTextRangeValue={clearFilter}
                      />
                    </div>
                  )}

                  {item.count}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </form>
  );
};
