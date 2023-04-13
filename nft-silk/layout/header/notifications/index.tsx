import { Fragment, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Popover, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { map } from 'lodash-es';
import { formatDistance } from 'date-fns';

import useNotificationStore from '@hooks/useNotificationStore';
import useTranslation from '@hooks/useTranslation';
import { Icon } from '@components/icons';

import styles from './notifications.module.scss';
import useAppStore from '@hooks/useAppStore';

const testNotifications = [
  {
    date: new Date(),
    message: 'Your email has been verified and you can now receive communications from Silks!',
    title: 'System Update',
    read: false,
    userNotificationId: 1,
  },
  {
    date: new Date(),
    message: 'Your avatar #6743 has received an offer of 0.25 ETH from MetaMarion.',
    title: 'Marketplace Offer',
    read: false,
    userNotificationId: 2,
  },
  {
    date: new Date('2022-12-01'),
    message: 'Your wallet has been verified and you can now connect to Silks!',
    title: 'System Update',
    read: false,
    userNotificationId: 3,
  },
  {
    date: new Date(),
    message:
      'Your avatar #6743 has received an offer of 0.25 ETH from MetaMarion longer with a link <a href="#"> GO There Right Now!</a> with some other stuff that goes here.',
    title: 'Marketplace Offer',
    read: false,
    userNotificationId: 4,
  },
  {
    date: new Date('2022-12-01T12:00:00Z'),
    message: 'Your email has been verified and you can now receive communications from Silks!',
    title: 'System Update',
    read: false,
    userNotificationId: 5,
  },
  {
    date: new Date(),
    message: 'Your avatar #6743 has received an offer of 0.25 ETH from MetaMarion.',
    title: 'Marketplace Offer',
    read: false,
    userNotificationId: 6,
  },
];

const nCount = 3;
//use as needed for testing notifications
const useTestNotifications = () => {
  const isSet = useRef(false);
  const { addNotifications } = useNotificationStore();
  useEffect(() => {
    if (!isSet.current) {
      addNotifications(testNotifications.slice(0, nCount));
      isSet.current = true;
    }
  }, [addNotifications]);
};

type NotificationsProps = {
  toggle: boolean;
};

export default function Notifications({ toggle }: NotificationsProps) {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const popover = useRef<HTMLDivElement>(null);
  const popoverBtn = useRef<HTMLButtonElement>(null);
  const { profile, setShowSettingsModal, setSettingsModalDefaultTab } = useAppStore();

  const { notifications, removeNotification, setReadAllNotifications, setReadNotification } = useNotificationStore();
  const trans = useTranslation();

  //For Testing
  //useTestNotifications();

  useEffect(() => {
    if (isMounted && popover.current && popoverBtn.current) {
      const isOpen = popover?.current?.childElementCount > 1;

      if (!isOpen) {
        popoverBtn?.current?.click();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggle]);

  // set isMounted to true on first run
  useEffect(() => {
    setIsMounted(true);

    // remove this, for dev purposes
    //popoverBtn?.current?.click();
  }, []);

  function truncateString(str, num) {
    // If the length of str is less than or equal to num will return the str as is
    if (str.length <= num) {
      return str;
    }
    // Return str truncated with '...' concatenated to the end of str.
    return str.slice(0, num) + '...';
  }

  return (
    <>
      <Popover className={styles.popover} ref={popover}>
        {({ open, close }) => (
          <>
            <Popover.Button className="hidden" ref={popoverBtn}></Popover.Button>

            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Popover.Panel static className={styles.popoverPanel}>
                <>
                  <div className={styles.header}>
                    <div className={styles.title}>{trans.t('header.notifications.title')}</div>
                    <a
                      className={styles.read}
                      onClick={() => {
                        setReadAllNotifications();
                      }}
                    >
                      <Icon name="doubleCheck" className="h-5 w-5 pt-1 mr-2" color="var(--color-primary-default)" />
                      {trans.t('header.notifications.markAllRead')}
                    </a>
                    {profile && (
                      <div className={styles.settings}>
                        <button
                          onClick={() => {
                            setSettingsModalDefaultTab(2);
                            setShowSettingsModal(true);
                          }}
                        >
                          <Icon
                            name="gear-outline"
                            className="h-7 w-7 stroke-blue-500 hover:stroke-white"
                            color={null}
                          />
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    className={clsx(styles.notifications, { [styles.overflow]: notifications?.messages.length > 4 })}
                  >
                    {notifications?.messages.length === 0 && (
                      <div className={clsx(styles.notification, styles.empty)}>
                        <Icon name="horse-logo" color="var(--color-royal-blue" className={styles.icon} />
                        <div className={styles.title}>{trans.t('header.notifications.noMessages.title')}</div>
                        <div
                          className={styles.description}
                          dangerouslySetInnerHTML={{
                            __html: trans.t('header.notifications.noMessages.description'),
                          }}
                        ></div>
                      </div>
                    )}

                    {notifications?.messages.length > 0 &&
                      map(notifications?.messages, (m, index) => (
                        <div
                          className={clsx(styles.notification, { [styles.unread]: !m.read })}
                          key={`notification-${index}`}
                          onClick={() => {
                            setReadNotification(m);
                          }}
                        >
                          <div className={styles.picture}>
                            <Image src="/images/logos/silks-round.svg" alt="Silks" width={50} height={50} />
                          </div>
                          <div className={styles.messageContainer}>
                            <div className={styles.title}>
                              {truncateString(m.title, 20)}
                              <span className={styles.date}>
                                {formatDistance(m.date, new Date(), { addSuffix: true })}
                              </span>
                            </div>
                            <div
                              className={clsx('break-words w-[290px]', styles.message)}
                              dangerouslySetInnerHTML={{ __html: m.message }}
                            />
                          </div>
                          <div className={styles.delete}>
                            <Icon
                              name="trash"
                              className="h-5 w-5"
                              onClick={event => {
                                event.stopPropagation();
                                removeNotification(m);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* <div className={styles.footer}></div> */}
                </>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </>
  );
}
