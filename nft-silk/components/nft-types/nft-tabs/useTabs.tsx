import { useRef, useEffect, useMemo, useState } from 'react';

//from https://github.com/Zertz/react-headless-tabs

function usePrevious<T>(value: T) {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

export default function useTabs<K extends string>(tabs: K[], defaultTab: K | null | undefined = tabs.at(0)) {
  const state = useState(defaultTab);
  const [selectedTab, setSelectedTab] = state;

  const activeIndex = useMemo(() => {
    if (selectedTab) {
      //console.log("CHANGE ACTIVE", selectedTab);//tab or tsbs change
      return tabs.indexOf(selectedTab);
    }

    return -1;
  }, [selectedTab, tabs]);

  const previousActiveIndex = usePrevious(activeIndex);

  useEffect(() => {
    if (tabs.length === 0) {
      setSelectedTab(undefined);

      return;
    }

    if (selectedTab === null || (selectedTab && tabs.includes(selectedTab))) {
      return;
    }

    if (
      typeof previousActiveIndex === 'number' &&
      previousActiveIndex >= 0 &&
      (tabs[previousActiveIndex] || tabs[previousActiveIndex - 1])
    ) {
      setSelectedTab(tabs[previousActiveIndex] || tabs[previousActiveIndex - 1]);

      return;
    }

    if (defaultTab === null) {
      return;
    }

    setSelectedTab(defaultTab && tabs.includes(defaultTab) ? defaultTab : tabs[0]);
  }, [defaultTab, previousActiveIndex, selectedTab, setSelectedTab, tabs]);

  return state;
}
