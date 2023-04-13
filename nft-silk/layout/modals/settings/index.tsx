/* eslint-disable @next/next/no-img-element */
import React, { FunctionComponent, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMoralis } from 'react-moralis';

import useAppStore from '@hooks/useAppStore';
import useTranslation from '@hooks/useTranslation';
import { FullScreenModal } from '@components/modals/full-screen-modal';
import { Icon } from '@components/icons';
import { Tabs } from '@components/tabs';
import ProfileSettingsForm from './profile-form';
import ContactSettingsForm from './contact-form';
import NotificationsSettingsForm from './notifications-form';

import styles from './settings.module.scss';

export type SettingsProps = {
  [props: string]: any;
};

export const Settings: FunctionComponent<SettingsProps> = ({ ...props }) => {
  const { showSettingsModal, setShowSettingsModal, settingsModalDefaultTab, setSettingsModalDefaultTab } =
    useAppStore();
  const trans = useTranslation();
  const router = useRouter();
  const { isInitialized, isAuthenticated } = useMoralis();

  const onShowSettings = () => {
    onScrollToTop();
  };

  const onScrollToTop = () => {
    const modalTop = document.querySelector('#full-screen');
    modalTop?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const tabs = [
    { name: 'PROFILE', content: <ProfileSettingsForm onSuccess={onScrollToTop}></ProfileSettingsForm> },
    { name: 'CONTACT DETAILS', content: <ContactSettingsForm onSuccess={onScrollToTop}></ContactSettingsForm> },
    {
      name: 'NOTIFICATIONS',
      content: <NotificationsSettingsForm onSuccess={onScrollToTop}></NotificationsSettingsForm>,
    },
  ];

  useEffect(() => {
    if (router?.query?.settingsTab && isInitialized && isAuthenticated) {
      setSettingsModalDefaultTab(router.query.settingsTab);
      setShowSettingsModal(true);
    }
  }, [router, isInitialized, isAuthenticated]);

  return (
    <>
      <FullScreenModal
        className="overflow-y-auto"
        onClose={() => {
          setShowSettingsModal(false);
          // reset modal state, give time for modal to close so user doesn't see
          setTimeout(() => {
            onShowSettings();
            setSettingsModalDefaultTab(0);
          }, 1000);
        }}
        isOpen={showSettingsModal}
        background="url('images/fullscreen-modal-background.png')"
      >
        <div className="flex justify-between items-center" id="full-screen">
          <img
            className="block h-10 w-auto ml-6 mt-4 opacity-0 sm:opacity-100"
            src="/images/logos/silks.svg"
            alt="Silks"
          />

          <div className={styles.settingsImageHeader}>
            <div className="text-white z-10 pt-5 text-xl uppercase">{trans.t('settings.title')}</div>
          </div>

          <div className={`${styles.settingsImageSubHeader} flex justify-center items-end`}>
            <div
              className="text-white z-10 flex justify-center items-center"
              style={{
                background: 'linear-gradient(180deg, #4583FF 0%, rgba(69, 131, 255, 0) 100%)',
                opacity: '0.8',
                transform: 'matrix(1, 0, 0, -1, 0, 0)',
                width: 67,
                height: 57,
              }}
            >
              <Icon name="user" className="h-6 w-6 mb-1" style={{ transform: 'matrix(1, 0, 0, -1, 0, 0)' }} />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div
            className="flex flex-col justify-center items-center text-white text-center max-w-screen-lg"
            style={{ marginTop: 125 }}
          >
            <Tabs tabClassName="border-t border-blue-500/25 pt-8" tabs={tabs} defaultIndex={settingsModalDefaultTab} />
          </div>
        </div>

        <div className="flex justify-center text-white pb-20">
          <div className="max-w-screen-sm">
            <div className="relative pb-9">
              <div className={styles.infoDot}>
                <Icon name="info" className="h-5 w-5 ml-[10px] mt-[10px]" />
              </div>
              <hr className={styles.infoHr} />
            </div>

            <div className={`${styles.textLightGray} text-sm text-center`}>{trans.t('settings.info')}</div>
          </div>
        </div>
      </FullScreenModal>
    </>
  );
};
