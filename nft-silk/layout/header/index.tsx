/* eslint-disable @next/next/no-img-element */
import React, { FunctionComponent, Fragment, useEffect, useRef, useState } from 'react';
import { useMoralis } from 'react-moralis';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { find, map } from 'lodash-es';

import useAppStore from '@hooks/useAppStore';
import useContractAddressStore, { ContractTypeEnum } from '@hooks/useContractAddressStore';
import useNotificationStore from '@hooks/useNotificationStore';
import useTranslation from '@hooks/useTranslation';
import useWalletStore from '@hooks/useWalletStore';
import { Icon } from '@components/icons';
import { HeaderButton } from '@layout/index';
import Notifications from '@layout/header/notifications';
import WalletView from '@layout/header/wallet-view';
import Account from '@components/ethereum/Account/Account';
import Address from '@components/ethereum/Address/Address';

import styles from './header.module.scss';
import api from '@common/api';

const getLink = (item, active = false) => {
  return (
    <a
      href={item.href}
      className={clsx(
        active ? 'bg-gray-700' : '',
        'group mx-0 px-3 py-2 my-0.5 text-sm text-white font-semibold flex flex-row items-center uppercase border border-transparent',
        item.show == 'lg' && 'lg:hidden',
        item.show == 'xl' && 'xl:hidden',
        item.highlight
          ? 'text-market py-1.5 hover:bg-market hover:text-blue-700 hover:rounded'
          : 'hover:bg-blue-900 hover:border-blue-500/75 hover:rounded'
      )}
    >
      {item.icon && (
        <Icon
          name={item.icon}
          className={clsx(
            'w-4 h-4 mr-2',
            item.highlight ? 'fill-market group-hover:fill-blue-700' : 'fill-white',
            item.highlight ? 'stroke-market group-hover:stroke-blue-700' : 'stroke-white'
            //'group-hover:fill-blue-700 group-hover:stroke-blue-700'
          )}
          color={null}
        />
      )}
      {item.name}
    </a>
  );
};

const getButton = (item, active = false) => {
  return (
    <button
      onClick={() => {
        if (item?.onClick) {
          item.onClick();
        }
      }}
      className={clsx(
        active ? 'bg-gray-700' : '',
        'group block w-full mx-0 px-3 py-2 my-0.5 text-sm text-white font-semibold uppercase border border-transparent',
        'hover:bg-blue-900 hover:border-blue-500/75 hover:rounded'
      )}
    >
      <div className="flex items-center">
        {item.icon && (
          <Icon
            name={item.icon}
            className={clsx(
              'w-4 h-4 mr-2',
              item.highlight ? 'fill-market' : 'fill-white',
              item.highlight ? 'stroke-market' : 'fill-stroke'
            )}
            color={null}
          />
        )}
        {item.name}
      </div>
    </button>
  );
};

function MenuItemLink({ item }: { item: any }) {
  return <Menu.Item>{({ active }) => getLink(item, active)}</Menu.Item>;
}

function DisclosureButtonLink({ item }: { item: any }) {
  return <Disclosure.Button as="div">{getLink(item)}</Disclosure.Button>;
}

function MenuItemBtn({ item }: { item: any }) {
  return <Menu.Item>{({ active }) => getButton(item, active)}</Menu.Item>;
}

function DisclosureButtonBtn({ item }: { item: any }) {
  return <Disclosure.Button as="div">{getButton(item)}</Disclosure.Button>;
}

export const Header: FunctionComponent = (...domProps) => {
  const router = useRouter();
  const { account, isAuthenticated, Moralis } = useMoralis();

  const { getContractAddress } = useContractAddressStore();
  const { getNFTsForContract, getAllNFTsForContract } = useWalletStore();
  const [hasSkyFallsTokens, setHasSkyFallsTokens] = useState<boolean>(false);
  const [isSignedIn, setIsSignedIn] = useState(null);
  const [toggleNotifications, setToggleNotifications] = useState<boolean>(false);
  const [toggleWalletView, setToggleWalletView] = useState<boolean>(false);
  const [triggerAuthModal, setTriggerAuthModal] = useState<boolean>(false);
  const [shakeBell, setShakeBell] = useState<boolean>(false);
  const [prevUnreadCount, setPrevUnreadCount] = useState<number>(0);
  const [updatedNavItems, setUpdatedNavItems] = useState<boolean>(false);

  const isGettingMetaverseLink = useRef(false);

  const { profile, showRedemptionModal, setShowSettingsModal, setShowRedemptionModal } = useAppStore();
  const { notifications } = useNotificationStore();
  const trans = useTranslation();

  const navigation = useRef([
    { id: 'home', name: trans.t('header.buttons.home'), icon: 'home', href: '/', show: 'xl' },
    { id: 'avatars', name: trans.t('header.buttons.avatars'), icon: 'avatar', href: '/avatar', show: 'lg' },
    { id: 'map', name: trans.t('header.buttons.map'), icon: 'map', href: '/map', show: 'lg' },
    { id: 'stable', name: trans.t('header.buttons.stable'), icon: 'horse', href: '/stable', show: 'lg' },
    {
      id: 'marketplace',
      name: trans.t('header.buttons.marketplace'),
      icon: 'marketplace',
      href: '/marketplace',
      show: 'xl',
      target: undefined,
      highlight: undefined,
    },
    // PH1, disable showing enter metaverse menu option
    /*{
      id: 'metaverse',
      name: trans.t('header.buttons.metaverse'),
      icon: 'metaverse',
      href: null,
      target: '_blank',
      show: 'lg',
      highlight: true,
    },*/
  ]);

  useEffect(() => {
    if (Moralis && isAuthenticated && !showRedemptionModal) {
      const getRedemptionTokens = async () => {
        const skyfallsTokenAddress = await getContractAddress(ContractTypeEnum.SkyFalls);
        const tokens = await getNFTsForContract(Moralis, skyfallsTokenAddress);

        setHasSkyFallsTokens(tokens?.result?.length > 0);
      };

      getRedemptionTokens();
    }
  }, [getContractAddress, getNFTsForContract, isAuthenticated, Moralis, showRedemptionModal]);

  useEffect(() => {
    if (!isGettingMetaverseLink.current && Moralis) {
      const getMetaverseLink = async () => {
        isGettingMetaverseLink.current = true;
        const avatarTokenAddress = await getContractAddress(ContractTypeEnum.Avatar);
        const avatarsFromWallet = await getAllNFTsForContract(Moralis, avatarTokenAddress);
        let avatarId;

        if (avatarsFromWallet && avatarsFromWallet.length > 0) {
          const firstAvatar = avatarsFromWallet.sort((a, b) => a.token_id - b.token_id)[0];
          avatarId = firstAvatar.token_id;
        }

        const metaverseUrl = `${process.env.NEXT_PUBLIC_META_BASE_URL}/index.html?scenery=onboarding${
          avatarId ? `&avatarID=${avatarId}` : ''
        }`;
        const metaLink = find(navigation.current, n => n.id === 'metaverse');

        if (metaLink) {
          metaLink.href = metaverseUrl;
        }

        isGettingMetaverseLink.current = false;
        // triggers menu to update
        setUpdatedNavItems(!updatedNavItems);
      };

      // PH1, disable showing enter metaverse menu option
      //getMetaverseLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Moralis, isAuthenticated]);

  useEffect(() => {
    // don't shake if unreadCount has gone done
    if (notifications.unreadCount > 0 && notifications.unreadCount > prevUnreadCount) {
      setShakeBell(true);

      setTimeout(() => {
        setShakeBell(false);
      }, 1500);
    }

    setPrevUnreadCount(notifications.unreadCount);
  }, [notifications, prevUnreadCount]);

  useEffect(() => {
    setIsSignedIn(isAuthenticated);
  }, [isAuthenticated]);

  const userNavigation = [];
  if (profile && isSignedIn) {
    userNavigation.push({
      name: trans.t('header.navigation.settings'),
      onClick: () => {
        if (account) {
          setShowSettingsModal(true);
        }
      },
      icon: 'gear',
      highlight: false,
    });
  }

  if (hasSkyFallsTokens && isSignedIn) {
    userNavigation.push({
      name: trans.t('header.navigation.redemptions'),
      onClick: () => {
        if (account) {
          setShowRedemptionModal(true);
        }
      },
      icon: 'stars',
      highlight: true,
    });
  }

  const showSettings = userNavigation.length > 0;
  const showBell = isSignedIn;

  return (
    <>
      <Disclosure as="nav" className={clsx('absolute w-full z-40', { 'overflow-hidden': !isSignedIn })}>
        {({ open }) => (
          <>
            <div>
              <div className="flex justify-between h-12 ml-10">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <img className="block lg:hidden h-10 w-auto" src="/images/logos/silks.svg" alt="Silks" />
                    <img className="hidden lg:block h-10 w-auto" src="/images/logos/silks.svg" alt="Silks" />
                  </div>
                </div>
                <div className="hidden lg:ml-6 lg:flex lg:items-center -mt-4">
                  {map(navigation.current, item => (
                    <HeaderButton
                      key={item.id}
                      active={
                        item.id == 'home' ? router?.pathname == item.href : router?.pathname?.startsWith(item.href)
                      }
                      title={item.name}
                      icon={<Icon name={item.icon} color={item?.highlight && 'var(--color-market)'} />}
                      href={item.href}
                      target={item?.target}
                      className={clsx(
                        'hidden drop-shadow-white drop-shadow-md',
                        item.show == 'lg' && 'lg:block',
                        item.show == 'xl' && 'xl:block'
                      )}
                      highlight={item?.highlight}
                    />
                  ))}
                </div>
                <div
                  className={clsx('hidden sm:ml-6 sm:flex sm:items-center -mt-2 mr-[13px]', {
                    'mr-[-20px]': !isSignedIn,
                  })}
                >
                  <div
                    className={clsx(styles.headerWallet)}
                    onClick={event => {
                      if (isSignedIn) {
                        setToggleWalletView(!toggleWalletView);
                      } else if (!triggerAuthModal) {
                        setTriggerAuthModal(true);
                      }
                    }}
                  >
                    <div className={clsx('skew-fix flex flex-row h-full items-center', { ['h-[45px]']: !isSignedIn })}>
                      {isSignedIn !== null ? (
                        isSignedIn ? (
                          <div className="flex">
                            <div className="text-xs ">
                              <Address size="8" />
                            </div>
                            <span
                              className="ml-2 flex bg-green-400 uppercase text-white h-4 items-center px-1 py-0 rounded-full"
                              style={{ fontSize: 10 }}
                            >
                              {trans.t('header.wallet.on')}
                            </span>
                          </div>
                        ) : (
                          <>
                            <Account
                              inHeader
                              triggerAuthModal={triggerAuthModal}
                              onAuthModalClose={() => setTriggerAuthModal(false)}
                            />
                            <span
                              className="ml-2 flex bg-red-400 text-white uppercase h-4 items-center px-1 py-0 rounded-full mr-4"
                              style={{ fontSize: 10 }}
                            >
                              {trans.t('header.wallet.off')}
                            </span>
                          </>
                        )
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  <div
                    className={clsx(styles.headerMenu, 'flex items-center', !showSettings && !showBell && 'xl:hidden')}
                  >
                    <div className="ml-2 -gap-2 z-10 pt-1">
                      <div className="flex flex-row items-center">
                        <button
                          type="button"
                          className={clsx('relative', !showBell && 'hidden')}
                          onClick={() => setToggleNotifications(!toggleNotifications)}
                        >
                          <Icon
                            name="bell"
                            className={clsx('h-4 w-4 mr-2 mt-2', { [styles.notificationBellShake]: shakeBell })}
                          />
                          {notifications.unreadCount > 0 && (
                            <div className={styles.notifications}>
                              <div className={styles.count}>{notifications.unreadCount}</div>
                            </div>
                          )}
                        </button>
                        {/* Profile dropdown */}
                        <Menu
                          as="div"
                          className={clsx('ml-2 z-10 mt-2', !showBell && 'ml-[10px]', !showSettings && 'xl:hidden')}
                        >
                          <Menu.Button className="relative">
                            <span className="sr-only">Open user menu</span>
                            <Icon name="menu" className="h-5 w-5 mt-4 mr-2" />
                            {hasSkyFallsTokens && <div className={styles.menuNotification}></div>}
                          </Menu.Button>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="origin-top-right absolute right-0 top-16 w-[max-content] shadow-[0px_7px_10px_0px_rgba(0,0,0,0.4)] py-2 px-2 bg-[color:var(--tw-color-blue-700)] rounded-l focus:outline-none">
                              {map(navigation.current, item => (
                                <MenuItemLink key={item.name} item={item} />
                              ))}
                              {showSettings && (
                                <>
                                  <div className="border-t border-blue-500 xl:hidden z-40 my-1"></div>
                                  {map(userNavigation, item => (
                                    <MenuItemBtn key={item.name} item={item} />
                                  ))}
                                </>
                              )}
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="z-40 mt-6 mr-2 flex items-center sm:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="btn-header">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <Icon name="close" className="block h-6 w-6 mr-4" aria-hidden="true" />
                    ) : (
                      <Icon name="menu" className="block h-6 w-6 mr-4" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className={styles.mobileNav}>
              {map(navigation.current, item => (
                <DisclosureButtonLink item={item} key={item.name} />
              ))}
              {showSettings && (
                <>
                  <div className="border-t border-blue-500"></div>
                  {map(userNavigation, item => (
                    <DisclosureButtonBtn item={item} key={item.name} />
                  ))}
                </>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <WalletView toggle={toggleWalletView}></WalletView>
      <Notifications toggle={toggleNotifications}></Notifications>
    </>
  );
};
