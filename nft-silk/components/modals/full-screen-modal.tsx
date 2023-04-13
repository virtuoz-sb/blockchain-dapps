import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Icon } from '@components/icons';

export type FullScreenModalProps = {
  background?: string;
  className?: string;
  icon?: any;
  children: any;
  buttons?: any;
  isOpen: boolean;
  onClose: (value) => void;
  showTitleCloseIcon?: boolean;
  padding?: string;
};

export const FullScreenModal = ({
  background,
  className,
  icon,
  children,
  buttons,
  isOpen,
  onClose,
  showTitleCloseIcon = true,
  padding = '40px',
  ...props
}: FullScreenModalProps) => {
  let refDiv = useRef(null);
  let refDialog = useRef(null);

  let bgStyles = {
    backgroundImage: background || undefined,
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-40 inset-10"
        onClose={onClose}
        initialFocus={refDiv}
        data-test="full-screen-modal"
        ref={refDialog}
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
          <Dialog.Overlay className="fixed inset-0 bg-[#33436a] bg-opacity-95 transition-opacity" />
        </Transition.Child>

        <div className="flex h-full">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className={`w-full transform transition-all ${className}`} style={{ ...bgStyles }} ref={refDiv}>
              <div className="cursor-pointer z-50 mt-4 text-white fixed right-0">
                <Icon
                  name="close"
                  className="inline-block w-6 h-6 mr-6"
                  onClick={() => {
                    onClose(null);
                  }}
                  data-test="modal-close"
                />
              </div>
              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
