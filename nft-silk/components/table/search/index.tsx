import React, { useState, ChangeEvent } from 'react';
import clsx from 'clsx';

import useDebounceCallback from '@hooks/useDebounceCallback';
import { Icon } from '@components/icons';

export type SearchInputProps = {
  className?: string;
  onSearchChange: (searchQuery: string) => void;
  initialValue: string;
  [props: string]: any;
};

/**
 * Table global filter search;
 * onSearchChange: callback (react table set state)
 * initialValue search value (react table filter state)
 * standalone:  pass back to react table as globalFilter
 * from table: use react table state globalFilter and setGlobalFilter
 */

export default function SearchInput({ onSearchChange, initialValue, className, ...props }: SearchInputProps) {
  const [searchValue, setSearchValue] = useState(initialValue ?? '');
  const onDebounceChange = useDebounceCallback((val: string) => {
    onSearchChange(val);
  }, 500);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    onDebounceChange(event.target.value);
  };

  //reset clear?
  /*  const handleClear = () => {
    setSearchValue('');
    onSearchChange(undefined);
  };

  useEffect(() => {
    if (initialValue === undefined) {
      handleClear();
    }
  }, [initialValue]); */

  return (
    <div className={clsx('w-full max-w-xs', className)}>
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <div className="relative">
        <Icon name="magnifying-glass" className="absolute h-4 w-4 pt-3 ml-3" />
        <input
          className="py-3 pl-10 pr-3 leading-5 border border-blue-700 bg-[#201f33]/90 text-white w-full sm:text-sm"
          placeholder="Search..."
          onChange={handleChange}
          type="search"
          value={searchValue}
          {...props}
        ></input>
      </div>
    </div>
  );
}
