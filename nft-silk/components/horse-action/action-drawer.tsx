import { ReactNode, FunctionComponent } from 'react';
import clsx from 'clsx';

import useTranslation from '@hooks/useTranslation';
import { Drawer } from '@components/modals/drawer';
import { Button, ButtonProps } from '@components/button';
import { Loader } from '@components/loader';

export const ActionConfirmButtons: FunctionComponent<{
  confirmTxt?: string;
  cancelTxt?: string;
  onActionConfirm: any;
  onActionClose: any;
  className?: string;
  confirmBtnProps?: Partial<ButtonProps>;
  cancelBtnProps?: Partial<ButtonProps>;
}> = ({ onActionClose, onActionConfirm, className, confirmTxt, cancelTxt, confirmBtnProps, cancelBtnProps }) => {
  const { t } = useTranslation();
  return (
    <div className={clsx('pt-6 flex justify-between', className)}>
      <Button
        color="dark"
        fill="solid"
        notch="left"
        chevrons="left"
        className="mr-3 flex-1"
        uppercase
        full
        autoFocus
        onClick={onActionClose}
        {...cancelBtnProps}
      >
        {cancelTxt || t('horseaction.cancel')}
      </Button>
      <Button
        color="primary"
        uppercase
        className="flex-1"
        full
        fill="outline"
        chevrons="right"
        notch="right"
        onClick={onActionConfirm}
        {...confirmBtnProps}
      >
        {confirmTxt || t('horseaction.confirm')}
      </Button>
    </div>
  );
};

export type ActionDrawerProps = {
  children: ReactNode;
  className?: string;
  contentCls?: string;
  title?: any;
  subtitle?: any;
  isActionActive: boolean;
  isActionProcessing?: boolean;
  onHandleClose: (value) => void;
  [drawerOptions: string]: any;
};

const ActionDrawer: FunctionComponent<ActionDrawerProps> = ({
  children,
  className,
  contentCls,
  title,
  subtitle,
  isActionActive,
  isActionProcessing,
  onHandleClose,
  ...drawerOptions
}) => {
  return (
    <Drawer
      title={null}
      isOpen={isActionActive}
      onClose={() => onHandleClose(false)}
      width="max-w-3xl"
      className="bg-[#201f33]/70"
      //containerCls="mt-32 mr-2.5"
      wrapperCls="right-0 sm:right-2 top-0 sm:top-28 md:top-32 2xl:top-36"
      {...drawerOptions}
    >
      {isActionActive && (
        <div className="flex flex-col min-h-full items-center justify-center p-6">
          <div className={clsx(contentCls)}>
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-white uppercase">{title}</h1>
              {subtitle && <div className="font-medium text-[color:var(--color-light-gray)] mt-1"> {subtitle}</div>}
            </div>
            <div className={clsx(className)}>{children}</div>
          </div>
          {isActionProcessing && <Loader />}
        </div>
      )}
    </Drawer>
  );
};
export default ActionDrawer;
