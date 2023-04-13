import React, { FunctionComponent } from 'react';
import HorseActionsHeader from '@components/horse-action/horse-actions-header';
import { StakedHorses } from '@components/staked-horses';

export type StakedHorsesWrapperProps = {
  stakedHorses: IStakedHorse[];
  className?: string;
  [props: string]: any; // All other props
};

const StakedHorsesWrapper: FunctionComponent<StakedHorsesWrapperProps> = ({ stakedHorses, className, ...props }) => {
  return (
    <HorseActionsHeader className={className} {...props}>
      <StakedHorses stakedHorses={stakedHorses} />
    </HorseActionsHeader>
  );
};

export default StakedHorsesWrapper;
