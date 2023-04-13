import React, { FunctionComponent, ReactNode, useMemo } from 'react';
import clsx from 'clsx';

type TabPanelProps = {
  id: string;
  activeId?: string;
  className?: string;
  condition?: boolean;
  children: ReactNode;
};

const TabPanel: FunctionComponent<TabPanelProps> = ({ id, activeId, className, condition = true, children }) => {
  const isActive = useMemo(() => id === activeId && condition, [activeId, condition, id]);
  return <div className={clsx(className)}>{isActive ? children : null}</div>;
};

export default TabPanel;
