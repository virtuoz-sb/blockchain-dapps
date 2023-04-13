import React, { FunctionComponent } from 'react';
import clsx from 'clsx';

type CountDownProps = {
  count?: number;
  className?: string;
};

const CountDown: FunctionComponent<CountDownProps> = ({ count = 5, className }) => {
  return (
    <div className={clsx('flex items-center justify-center mt-9', className)}>
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border-[2.5px] border-[color:var(--color-light-gray)]">
        <span className="font-bold leading-none text-white">{count}</span>
      </span>
    </div>
  );
};

export default CountDown;
