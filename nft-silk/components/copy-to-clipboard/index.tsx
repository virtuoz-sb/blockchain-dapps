import React, { useState, FunctionComponent } from 'react';
import { CheckIcon, DuplicateIcon } from '@heroicons/react/solid';
import clsx from 'clsx';

export type CopyToClipboardProps = {
  className?: string;
  iconClassName?: string;
  textToCopy: string;
};

export const CopyClipboard: FunctionComponent<CopyToClipboardProps> = ({ className, iconClassName, textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = textToCopy => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 10000);
  };

  return (
    <div className={clsx('flex items-center', className)}>
      {copied ? (
        <CheckIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      ) : (
        <button onClick={() => copyToClipboard(textToCopy)}>
          <DuplicateIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
