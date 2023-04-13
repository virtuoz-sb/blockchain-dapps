import { FunctionComponent } from 'react';
import clsx from 'clsx';

import { Icon } from '@components/icons';

{
  /* <Icon name="add-horse" color="#FFE45C" className="inline-block h-8 w-12" /> */
}

export const HorseActionButton: FunctionComponent<{
  actionTxt?: string;
  onHandleAction: any;
  icon?: any;
  className?: string;
  [props: string]: any;
}> = ({ onHandleAction, actionTxt, className, icon, ...props }) => {
  return (
    <button
      className={clsx(`flex items-center font-bold uppercase disabled:opacity-50`, className)}
      onClick={onHandleAction}
      {...props}
    >
      {icon && icon}
      {actionTxt}
    </button>
  );
};

export const StableActionButton: FunctionComponent<{
  actionTxt?: string;
  onHandleAction: any;
  [props: string]: any;
}> = ({ onHandleAction, actionTxt, ...props }) => {
  return (
    <HorseActionButton
      className="text-[#FFE45C] enabled:hover:text-yellow-500 px-2"
      onHandleAction={onHandleAction}
      actionTxt={actionTxt}
      icon={<Icon name="add-horse" color="currentColor" className="inline-block h-8 w-9 mr-1" />}
      {...props}
    />
  );
};

export const DeStableActionButton: FunctionComponent<{
  actionTxt?: string;
  onHandleAction: any;
  [props: string]: any;
}> = ({ onHandleAction, actionTxt, ...props }) => {
  return (
    <HorseActionButton
      className="text-[#FF8345] enabled:hover:text-orange-600 px-2"
      onHandleAction={onHandleAction}
      actionTxt={actionTxt}
      icon={<Icon name="remove-horse" color="currentColor" className="inline-block h-8 w-9 mr-1" />}
      {...props}
    />
  );
};

export default HorseActionButton;
