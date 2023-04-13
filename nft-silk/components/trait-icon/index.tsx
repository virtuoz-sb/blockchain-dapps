import clsx from 'clsx';
import React, { FunctionComponent, PropsWithChildren } from 'react';

import { Icon } from '@components/icons';

export type TraitIconProps = {
  type: string;
  className?: string;
  color?: string;
};

const getIconByTraitType = (trait_code: string) => {
  switch (trait_code) {
    case 'background':
    case 'collar':
    case 'eyewear':
    case 'helmet':
    case 'jacket':
    case 'accessory':
    case 'color':
      return trait_code;
    case 'body_pattern':
    case 'sleeve_pattern':
    case 'helmet_pattern':
      return 'pattern';
    case 'primary_color':
    case 'secondary_color':
      return 'color';
    case 'sex':
      return 'user';
    case 'dam_name':
    case 'dam_sire_name':
    case 'sire_name':
      return 'horse';
    case 'foal_date':
      return 'calendar';
    default:
      return 'background';
  }
};

export const TraitIcon: FunctionComponent<TraitIconProps> = ({ type, className, color = '#d1d5db' }) => {
  return <Icon name={getIconByTraitType(type)} color="#d1d5db" className={clsx('w-4 h-4', className)} />;
};
