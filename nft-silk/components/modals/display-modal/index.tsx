import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';

import { Icon } from '@components/icons';

import styles from './display-modal.module.scss';
import clsx from 'clsx';

export type DisplayModalProps = {
  id?: string;
  icon?: any;
  title: any;
  children: any;
  buttons?: any;
  isOpen: boolean;
  onClose: (value) => void;
  showTitleCloseIcon?: boolean;
  width?: string;
  height?: string;
};

export const DisplayModal = ({
  id = 'dialogModalPortal',
  icon,
  title,
  children,
  buttons,
  isOpen,
  onClose,
  showTitleCloseIcon = true,
  width = 'max-w-lg',
  height = '',
  ...props
}: DisplayModalProps) => {
  let refDiv = useRef(null);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={onClose} initialFocus={refDiv}>
        <div
          id={id}
          className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              className={clsx(
                'inline-block align-bottom rounded-lg px-4 pt-5 pb-4 text-left overflow-auto shadow-xl transform transition-all sm:my-8 sm:align-middle sm:p-6',
                width,
                height,
                styles.modal
              )}
              data-test="display-modal"
            >
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:mr-4 sm:text-left text-white">
                {title && (
                  <div className="flex justify-between items-center pb-3">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium">
                      {title}
                    </Dialog.Title>

                    {showTitleCloseIcon && (
                      <div className="modal-close cursor-pointer z-50">
                        <Icon
                          name="close"
                          className="inline-block w-6 h-6"
                          onClick={onClose}
                          data-test="display-modal-close"
                        />
                      </div>
                    )}
                  </div>
                )}

                {!title && showTitleCloseIcon && (
                  <div className="modal-close cursor-pointer z-50 absolute right-6 top-5">
                    <Icon
                      name="close"
                      className="inline-block w-6 h-6"
                      onClick={onClose}
                      data-test="display-modal-close"
                    />
                  </div>
                )}

                <div className="mt-2" ref={refDiv}>
                  {children}
                </div>

                {buttons && <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">{buttons}</div>}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
