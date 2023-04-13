import React, { FunctionComponent } from 'react';

export type CardProps = {
  children: any;
  title?: any;
  image?: any;
  footer?: any;
};

export const Card: FunctionComponent<CardProps> = ({ title, children, image, footer, ...domProps }) => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      {image}
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{title}</div>
        {children}
      </div>
      <div className="px-6 pt-4 pb-2">{footer}</div>
    </div>
  );
};
