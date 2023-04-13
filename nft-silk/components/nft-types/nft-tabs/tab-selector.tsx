import React, { FunctionComponent, useMemo } from 'react';
import clsx from 'clsx';

type TabSelectorProps = {
  id: string;
  label: string;
  onSelect: (id: string) => void;
  activeId?: string;
  className?: string;
};

const TabSelector: FunctionComponent<TabSelectorProps> = ({ id, label, onSelect, activeId, className }) => {
  const isActive = useMemo(() => id === activeId, [activeId, id]);
  return (
    <button
      onClick={() => onSelect(id)}
      className={clsx(
        isActive
          ? 'border-blue-500 text-white'
          : 'border-transparent text-gray-300 hover:text-gray-400 hover:border-gray-300',
        'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
        className
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </button>
  );
};

export default TabSelector;
