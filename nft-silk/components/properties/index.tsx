import React, { FunctionComponent } from 'react';
import styles from './properties.module.scss';
import clsx from 'clsx';
import { numberFormat } from '@common/helpers/formatters';
import moment from 'moment';

type NFTType = IAvatar | IHorse | ILand | IFarm;

type PropertiesProps = {
  currentNFT: NFTType;
};

const changePropertyValueBasedOnName = (type, name, value) => {
  const vName = name.toLocaleLowerCase();
  switch (vName) {
    case 'auction price':
      if (type == 'number') {
        return `${value} of 1,000,000`;
      } else {
        return value;
      }
    case 'foal date': // foal date unix timestamp is in seconds. We need to convert to MS and then render the date
      return moment(new Date(value * 1000)).format('MM/DD/YYYY');
    default:
      return value;
  }
};

const renderProperty = (indexKey, type: string, name: string, value: string, rarity: number) => {
  return (
    <div key={indexKey} className="rounded-md bg-blue-700 p-4 border border-blue-600 relative max-h-[90px]">
      <div className="flex flex-row" title={name}>
        <span className="ml-5 uppercase text-xs text-gray-300 truncate">{name}</span>
      </div>
      <div
        className={clsx('font-bold text-white ml-5 h-7 truncate', value?.length > 11 && 'text-xs flex items-center')}
        title={changePropertyValueBasedOnName(type, name, value)}
      >
        {changePropertyValueBasedOnName(type, name, value)}
      </div>
      {rarity > 0 && (
        <div className="text-xs text-gray-300 ml-5 truncate" title={rarity + '% have this trait'}>
          {rarity}% have this trait
        </div>
      )}
    </div>
  );
};

const renderEmptyProperty = (key: string) => {
  return <div key={key} className={clsx('rounded-md h-24 hidden xl:flex max-h-[90px]', styles.emptyProperty)}></div>;
};

const renderProperties = (currentNFT: NFTType) => {
  let filler = Array.apply(null, { length: 3 - (currentNFT?.properties?.length % 3) });
  return (
    <div className={clsx('rounded-md bg-blue-900 overflow-auto p-6', styles.propertyTabWrapper)}>
      <div className={clsx('grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1 gap-2 h-auto max-h-full')}>
        {currentNFT?.properties
          ?.sort((a, b) => (a.name > b.name ? 1 : -1))
          .map((property, index) =>
            renderProperty(index, property.type, property.name, property.value, numberFormat(property.rarity, 2))
          )}
        {filler.length < 3 && filler.map((x, i) => renderEmptyProperty(`empty${i}`))}
        <div className="h-2"></div>
      </div>
    </div>
  );
};

const Properties: FunctionComponent<PropertiesProps> = ({ currentNFT }) => {
  return currentNFT ? renderProperties(currentNFT) : null;
};

export default Properties;
