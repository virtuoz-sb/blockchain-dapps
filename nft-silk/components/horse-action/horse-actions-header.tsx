import { ReactNode, FunctionComponent } from 'react';
import clsx from 'clsx';
import useTranslation from '@hooks/useTranslation';
import {
  useHorseActionsState,
  useHorseActionsDispatch,
  activateAction,
} from '@components/horse-action/horse-actions-context';
import { getHorseActionContent } from './action-config';
//import { StableActionButton, DeStableActionButton } from '@components/horse-action/action-button';

/* const buttonTypes = {
  stable: StableActionButton,
  deStable: DeStableActionButton,
}; */

type HorseActionsHeaderProps = {
  children?: ReactNode;
  className?: string;
  otherAction?: ReactNode;
};

const HorseActionsHeader: FunctionComponent<HorseActionsHeaderProps> = ({ children, className, otherAction }) => {
  const { t } = useTranslation();
  const { actionsState } = useHorseActionsState();
  const dispatch = useHorseActionsDispatch();
  const { hasValidActions, horseActions } = actionsState;
  return (
    <>
      {hasValidActions && (
        <div
          className={clsx(
            'bg-[#201F33] flex justify-center items-center w-full h-16 gap-x-0 xl:gap-x-6 2xl:gap-x-11 rounded-t',
            className
          )}
        >
          {horseActions.map(act => {
            const Component = getHorseActionContent(act.id, 'button');
            return Component ? (
              <Component
                key={act.id}
                actionTxt={t(`horseaction.${act.id}.action`)}
                onHandleAction={() => dispatch(activateAction(act))}
              />
            ) : null;
          })}
          {otherAction && otherAction}
        </div>
      )}

      {children && children}
    </>
  );
};

export default HorseActionsHeader;
