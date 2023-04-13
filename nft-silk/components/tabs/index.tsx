/* eslint-disable @next/next/no-img-element */
import React, { FunctionComponent, Fragment, useState, useEffect } from 'react';
import clsx from 'clsx';
import styles from './tabs.module.scss';

export type TabsProps = {
  tabs: any[];
  defaultIndex?: number;
  className?: string;
  tabClassName?: string;
  [props: string]: any; // All other props
};

export const Tabs: FunctionComponent<TabsProps> = ({ tabs, defaultIndex = 0, className, tabClassName }) => {
  const [currentTabIndex, setCurrentTabIndex] = useState<any>(defaultIndex);
  //console.log("TABS", tabs);
  useEffect(() => {
    if (defaultIndex >= 0) {
      setCurrentTabIndex(defaultIndex);
    }
  }, [defaultIndex]);

  return (
    <div className={className}>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className={clsx(
            'block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none sm:text-sm mb-2',
            styles.select
          )}
          defaultValue={currentTabIndex}
          onChange={({ target: { value } }) => {
            setCurrentTabIndex(parseInt(value));
          }}
        >
          {tabs.map((tab, index) => tab && <option key={`tabsopt${index}`}>{tab.name}</option>)}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map(
              (tab, index) =>
                tab && (
                  <button
                    key={tab.name}
                    onClick={() => setCurrentTabIndex(index)}
                    className={clsx(
                      index == currentTabIndex
                        ? 'border-blue-500 text-white'
                        : 'border-transparent text-gray-300 hover:text-gray-400 hover:border-gray-300',
                      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                    )}
                    aria-current={index == currentTabIndex ? 'page' : undefined}
                  >
                    {tab.name}
                  </button>
                )
            )}
          </nav>
        </div>
      </div>
      <div className={tabClassName}>{tabs[currentTabIndex]?.content}</div>
    </div>
  );
};
