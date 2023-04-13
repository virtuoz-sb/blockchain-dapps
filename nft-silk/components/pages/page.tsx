import React, { FunctionComponent, Fragment } from 'react';

export type PageProps = {
  children: any;
  title?: any;
};

export const Page: FunctionComponent<PageProps> = ({ title, children, ...domProps }) => {
  return (
    <div className="text-white">
      <div className="flex flex-col items-center justify-center min-h-full p-4 text-center pt-28">
        <header>
          <h1 className="text-3xl font-bold leading-tight text-white uppercase">{title}</h1>
        </header>
        <main className="px-8 py-8 sm:px-0 text-left w-full">{children}</main>
      </div>
    </div>
  );
};
