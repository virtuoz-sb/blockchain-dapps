import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';

import { Icon } from '@components/icons';

import clsx from 'clsx';

export type DrawerProps = {
  title: any;
  className?: string;
  children: any;
  buttons?: any;
  isBackDrop?: boolean;
  isOpen: boolean;
  onClose: (value) => void;
  showTitleCloseIcon?: boolean;
  width?: string;
  containerCls?: string;
  contentCls?: string;
  wrapperCls?: string;
};

export const Drawer = ({
  title,
  children,
  className,
  isBackDrop = false,
  buttons,
  isOpen,
  onClose,
  showTitleCloseIcon = true,
  width = 'max-w-lg',
  containerCls = '',
  contentCls = '',
  wrapperCls = '',
  ...props
}: DrawerProps) => {
  let refDiv = useRef(null);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose} initialFocus={refDiv}>
        {isBackDrop ? (
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
        ) : (
          <div className="fixed inset-0" />
        )}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className={clsx('pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-0', wrapperCls)}>
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel
                  className={clsx('pointer-events-auto w-screen bg-blue-700/50', width, containerCls)}
                  data-test="drawer-modal"
                >
                  <div
                    className={clsx(
                      'flex h-full flex-col border border-slate-200/10 rounded-t-lg bg-[#201f33]/50 backdrop-blur-xl text-white',
                      className
                    )}
                  >
                    {title && (
                      <div className="px-4 sm:px-6">
                        <div className="flex justify-between items-center">
                          <Dialog.Title as="h3" className="text-3xl font-medium pt-4 sm:pt-6 pb-3">
                            {title}
                          </Dialog.Title>

                          {showTitleCloseIcon && (
                            <div className="modal-close cursor-pointer z-10">
                              <Icon
                                name="close"
                                className="inline-block w-5 h-5"
                                color="#787E8A"
                                onClick={onClose}
                                data-test="display-modal-close"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!title && (
                      <div className="modal-close cursor-pointer z-10 absolute right-6 top-5">
                        <Icon
                          name="close"
                          className="inline-block w-5 h-5"
                          color="#787E8A"
                          onClick={onClose}
                          data-test="display-modal-close"
                        />
                      </div>
                    )}

                    <div className={clsx('flex-1 overflow-y-auto', contentCls)} ref={refDiv}>
                      {children}
                    </div>

                    {buttons && <div className="mt-5 sm:mt-4 flex">{buttons}</div>}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
