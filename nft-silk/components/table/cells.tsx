import React from 'react';
//import clsx from 'clsx';

const statusColors = {
  success: 'bg-[#B4FF53]', //'bg-lime-300', //B4FF53
  danger: 'bg-[#DF5FF6]', //'bg-fuchsia-400', //DF5FF6
  warning: 'bg-[#FF8345]',
  info: 'bg-cyan-300',
};

export function StatusPill({ statusTxt, status }: { statusTxt?: string; status?: string }) {
  const statusCls = statusColors[status] || status;
  return (
    <span
      className={`px-3 py-2 font-bold text-sm rounded-full shadow-sm text-[color:var(--color-primary-black)] ${statusCls}`}
    >
      {statusTxt}
    </span>
  );
}

export function ActionButton({
  onHandleAction,
  actionTxt,
  ...props
}: {
  actionTxt?: string;
  onHandleAction: any;
  [props: string]: any;
}) {
  return (
    <button
      className={`border border-primary bg-[#201f33]/50 shadow-sm shadow-blue-500/40 enabled:hover:bg-primary text-primary enabled:hover:text-white text-sm font-bold py-2 px-4 rounded w-full uppercase disabled:opacity-50`}
      onClick={onHandleAction}
      {...props}
    >
      {actionTxt}
    </button>
  );
}
