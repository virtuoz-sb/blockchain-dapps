import React, { FunctionComponent, useMemo, useEffect, useRef } from 'react';
import TabSelector from '@components/nft-types/nft-tabs/tab-selector';
import type { NFTTabCFg } from '@components/nft-types/nft-tabs-cfg';
import useTabs from '@components/nft-types/nft-tabs/useTabs';
import useTranslation from '@hooks/useTranslation';
import clsx from 'clsx';

//get tab label with option counts object ( {offers: 10, ...} )
function getLabel(tab: NFTTabCFg, t: (arg0: string) => any, counts = {}) {
  return tab.hasCount && counts[tab.id] ? `${t(tab.tId)} (${counts[tab.id]})` : t(tab.tId);
}

type TabsProps = {
  defaultTab?: string;
  tabsCfg: NFTTabCFg[];
  renderTabPanes: Function;
  //children array?
  onTabsChange?: Function;
  className?: string;
  tabsClassName?: string;
  tabCounts?: any;
};

//tabs component: receives tabsCfg - NFTTabCFg to set tab selectors; renderTabPanes in instances
//useTabs hook selection

const BaseTabs: FunctionComponent<TabsProps> = ({
  tabsCfg,
  defaultTab,
  renderTabPanes,
  className,
  tabsClassName,
  onTabsChange,
  tabCounts,
}) => {
  const { t } = useTranslation();
  const isMounted = useRef<boolean>(false);
  const flatTabs = useMemo(() => {
    return tabsCfg.map(({ id }) => id);
  }, [tabsCfg]);

  const [selectedTab, setSelectedTab] = useTabs(flatTabs, defaultTab);
  //revise? mechanism to callback on tabs change (flat tabs)
  useEffect(() => {
    if (onTabsChange && isMounted.current) {
      onTabsChange(selectedTab, setSelectedTab, flatTabs);
    } else {
      isMounted.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatTabs]);

  return (
    <div className={clsx(className)}>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          className="block w-full pl-3 pr-10 caret-white py-2 text-white bg-blue-700 rounded text-sm border-blue-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 my-2"
          defaultValue={selectedTab}
          onChange={({ target: { value } }) => {
            setSelectedTab(value);
          }}
        >
          {tabsCfg.map(tab => (
            <option key={tab.id} value={tab.id}>
              {getLabel(tab, t, tabCounts)}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <div className="">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabsCfg.map(tab => (
              <TabSelector
                key={tab.id}
                activeId={selectedTab}
                id={tab.id}
                label={getLabel(tab, t, tabCounts)}
                onSelect={setSelectedTab}
              />
            ))}
          </nav>
        </div>
      </div>
      <div className={clsx(tabsClassName)}>{renderTabPanes(selectedTab)}</div>
    </div>
  );
};

export default BaseTabs;
