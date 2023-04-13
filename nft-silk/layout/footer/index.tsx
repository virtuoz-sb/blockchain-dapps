import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import clsx from 'clsx';

import { Icon } from '@components/icons';
import useAppStore from '@hooks/useAppStore';
import useTranslation from '@hooks/useTranslation';

import styles from './footer.module.scss';

export const Footer = () => {
  const { showFooter } = useAppStore();
  const trans = useTranslation();
  const originUrl = () => (typeof window !== 'undefined' ? window?.location?.origin : '');

  return (
    showFooter && (
      <div className="relative left-[-5px] bottom-[1px] sm:absolute z-40 m-0">
        <Popover className="relative">
          {({ open, close }) => (
            <>
              <Popover.Button
                className={clsx('group inline-flex items-center focus:outline-none ml-1', styles.footerButton, {
                  'text-gray-900 opacity-0': open,
                  'text-gray-500': !open,
                })}
              >
                <div className={clsx(styles.footerButtonBg, 'group-hover:border-t-blue')}></div>
                <div className="absolute top-3 left-5 h-[10px] w-[10px] group">
                  {open ? <Icon name="chevron-right" className="rotate-180" /> : <Icon name="chevron-right" />}
                </div>
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 -translate-x-20"
                enterTo="opacity-100 translate-x-0"
                leave="transition ease-in duration-250"
                leaveFrom="opacity-100 translate-x-0"
                leaveTo="opacity-0 -translate-x-20"
              >
                <Popover.Panel
                  static
                  className="absolute top-0 left-0 flex items-center transform flex-row items-center h-[40px]"
                >
                  <div
                    className={clsx('gap-8 flex flex-row items-center pl-8 py-1 h-[40px]', styles.socialMediaButtons)}
                  >
                    <a
                      href="https://discord.com/invite/silks"
                      onClick={() => close()}
                      target="_blank"
                      rel="noreferrer"
                      className="group"
                    >
                      <Icon
                        name="discord"
                        className="h-5 w-5 mt-1 fill-white stroke-white group-hover:fill-blue-500 group-hover:stroke-blue-500"
                        color={null}
                      />
                    </a>
                    <a
                      href="https://twitter.com/gameofsilks"
                      onClick={() => close()}
                      target="_blank"
                      rel="noreferrer"
                      className="group"
                    >
                      <Icon name="twitter" className="h-5 w-5 fill-white group-hover:fill-blue-500" color={null} />
                    </a>
                    <a
                      href="https://www.instagram.com/gameofsilks/"
                      onClick={() => close()}
                      target="_blank"
                      rel="noreferrer"
                      className="group"
                    >
                      <Icon
                        name="instagram"
                        className="h-5 w-5 -mt-0.5 fill-white group-hover:fill-blue-500"
                        color={null}
                      />
                    </a>
                    <a
                      href="https://www.tiktok.com/@gameofsilks"
                      onClick={() => close()}
                      target="_blank"
                      rel="noreferrer"
                      className="group"
                    >
                      <Icon name="tiktok" className="h-4 w-4 -mt-1 fill-white group-hover:fill-blue-500" color={null} />
                    </a>
                  </div>
                  <div className="gap-2 flex flex-row items-center ml-[-6px]">
                    <div className={styles.legalLink}>
                      <div className="skew-fix">
                        <a
                          href={originUrl() + '/terms-and-conditions'}
                          onClick={() => close()}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white text-xs"
                        >
                          {trans.t('socialMediaAndTermsPolicy.terms')}
                        </a>
                      </div>
                    </div>
                    <div className={styles.legalLink}>
                      <div className="skew-fix">
                        <a
                          href={originUrl() + '/privacy-policy'}
                          onClick={() => close()}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white text-xs"
                        >
                          {trans.t('socialMediaAndTermsPolicy.policy')}
                        </a>
                      </div>
                    </div>
                    <div className={styles.legalLink}>
                      <div className="skew-fix">
                        <a
                          href="https://silks.atlassian.net/servicedesk/customer/portals"
                          onClick={() => close()}
                          className="text-white text-xs"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {trans.t('socialMediaAndTermsPolicy.support')}
                        </a>
                      </div>
                    </div>
                    <button className={styles.footerButtonActive} onClick={() => close()}>
                      <div className={clsx(styles.footerButtonBgActive)}></div>
                      <div className="absolute top-3 left-8 h-[10px] w-[10px] group">
                        {open ? <Icon name="chevron-right" className="rotate-180" /> : <Icon name="chevron-right" />}
                      </div>
                    </button>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    )
  );
};
