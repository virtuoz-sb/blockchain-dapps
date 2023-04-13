import { FunctionComponent, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';

import { Icon } from '@components/icons';

type AdminMenuProps = {
  onAction: Function;
  navItems: any[];
};

const AdminMenu: FunctionComponent<AdminMenuProps> = ({ onAction, navItems = [] }) => {
  return (
    <Menu as="div" className="absolute w-full">
      <Menu.Button>
        <span className="sr-only">Open admin menu</span>
        <Icon name="gear" className="h-5 w-5 ml-0 md:ml-4 -mt-7" />
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
        <Menu.Items className="origin-top-right absolute right-0 mt-2.5 w-[max-content] shadow-lg py-2 px-4 bg-[color:var(--color-dark-gray)] rounded-sm focus:outline-none">
          {navItems.map(item => (
            <Menu.Item key={item.action}>
              {({ active }) => (
                <button
                  onClick={() => onAction(item.action)}
                  className={clsx(
                    active
                      ? 'bg-[color:var(--color-royal-white)] text-[color:var(--color-dark-gray)]'
                      : 'text-[color:var(--color-royal-white)]',
                    'group block mx-0 px-2 py-1 my-2 text-sm uppercase w-full text-left font-semibold rounded-sm'
                  )}
                >
                  <div className="flex">
                    <Icon
                      name={item.icon}
                      className={clsx(
                        'w-4 h-4 mr-3'
                        //'fill-[color:var(--color-royal-white)]',
                        //'fill-stroke',
                        //'group-hover:fill-blue-700 group-hover:stroke-blue-700'
                      )}
                      color={active ? '#2e3d64' : '#e3e9f4'}
                    />
                    {item.name}
                  </div>
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default AdminMenu;
