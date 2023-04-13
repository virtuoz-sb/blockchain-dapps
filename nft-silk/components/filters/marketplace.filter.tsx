import React, { FunctionComponent, useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

import { Icon } from '@components/icons';
import { CheckboxInput } from '@components/inputs/checkbox-input';
import { TextInputWithoutFormik } from '@components/inputs/text-input';
import styles from './filter.module.scss';

export type MarketplaceFilterProps = {
  initialFilterValues?: IFilter[];
  onChange: Function;
  clearFilter?: boolean;
  [props: string]: any; // All other props
};

export interface IFilter {
  icon?: string;
  count?: number;
  dbColumnName: string;
  title: string;
  items: IFilterItems[];
  isFilterCollapsed?: boolean;
}

export interface IFilterItems {
  filterType?: IFilterItemTypeEnum;
  isChecked?: boolean;
  name: string;
  count: number;
}

export enum IFilterItemTypeEnum {
  Checkbox = 1,
  Text = 2,
  TextRange = 3,
}

export const MarketplaceFilter: FunctionComponent<MarketplaceFilterProps> = ({
  initialFilterValues = null,
  onChange,
  clearFilter,
  ...props
}) => {
  const formRef = useRef<any>();
  const [filterValues, setFilterValues] = useState<IFilter[]>(initialFilterValues);

  const onSubmit = values => {
    onChange(values);
  };

  useEffect(() => {
    if (clearFilter) {
      if (formRef.current) {
        formRef.current.reset();
        resetSearchInListOptions();
      }
    }
  }, [clearFilter]);

  const resetSearchInListOptions = async () => {
    let input, li, i;
    input = document.getElementById('dynamicFilters');
    li = input.getElementsByTagName('li');

    // Loop through all list items, and unhide if hidden
    for (i = 0; i < li.length; i++) {
      li[i].style.display = '';
    }
  };

  const searchInListOptions = async (searchComponentName, listComponentName) => {
    // Declare variables
    let input, filter, ul, li, a, i, txtValue;
    input = document.getElementById(searchComponentName);
    filter = input.value.toUpperCase();
    ul = document.getElementById(listComponentName);
    li = ul.getElementsByTagName('li');

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName('a')[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = '';
      } else {
        li[i].style.display = 'none';
      }
    }
  };

  const handleFilterOpenClose = async (filterChanged: IFilter) => {
    if (filterChanged) {
      let currentFilters = [...filterValues];
      currentFilters.forEach(filter => {
        if (filter.dbColumnName == filterChanged.dbColumnName) {
          filter.isFilterCollapsed = filter.isFilterCollapsed ? !filter.isFilterCollapsed : true;
        }
      });
      setFilterValues(currentFilters);
    }
  };

  return (
    <form id="dynamicFilters" ref={formRef}>
      {filterValues &&
        filterValues.map((filterHeader, index) => (
          <div
            key={'filterHeader' + filterHeader.title + index}
            className={clsx(styles.container, { [styles.closed]: !filterHeader.isFilterCollapsed })}
          >
            <div className={styles.header} onClick={() => handleFilterOpenClose(filterHeader)}>
              <div className={styles.title}>
                {filterHeader.icon && <Icon name={filterHeader.icon} className={styles.leftIcon} />}
                {filterHeader.title}
              </div>

              <div className={clsx(styles.chevron, { [styles.closed]: !filterHeader.isFilterCollapsed })}>
                <span className="pr-4">{filterHeader.count}</span>
                <Icon name="chevron-up" className="h-3 w-3" color="var(--color-royal-white)" />
              </div>
            </div>

            <div className={styles.filter}>
              <TextInputWithoutFormik
                className="mb-2 w-full pr-6"
                name={'search' + filterHeader.title + index}
                placeholder="Search..."
                isSmall={true}
                clearInputValue={clearFilter}
                onChangeEventForMarketplaceFilteringTraitOptions={() =>
                  searchInListOptions('search' + filterHeader.title + index, 'filterList' + filterHeader.title + index)
                }
                iconName="magnifying-glass"
              />
              <ul id={'filterList' + filterHeader.title + index}>
                {filterHeader.items.map((item, index) => (
                  <li
                    key={'listOption' + filterHeader.title + item.name + index}
                    className={clsx('flex justify-between pr-12', filterHeader.icon ? 'pl-6' : '')}
                  >
                    <a className="hidden">{item.name}</a>
                    <CheckboxInput
                      className="mb-4"
                      name={filterHeader.dbColumnName}
                      label={item.name}
                      id={'filterOption' + filterHeader.dbColumnName + index}
                      isLarge
                      onChangeEventForMarketplace={onSubmit}
                      value={item.isChecked != undefined ? item.isChecked : false}
                    />
                    {item.count}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
    </form>
  );
};
