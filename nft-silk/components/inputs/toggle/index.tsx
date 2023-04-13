import React, { FunctionComponent, useMemo, useRef, useEffect } from 'react';
import { useField } from 'formik';
import clsx from 'clsx';
import { Switch } from '@headlessui/react';
import styles from './toggle.module.scss';
import { ExclamationCircleIcon } from '@heroicons/react/solid';

export type ToggleProps = {
  id?: string;
  name?: string;
  label?: string;
  description?: string;
  className?: string;
  tooltipContent?: string;
  value?: String;
  editable?: boolean;
  disabled?: boolean;
  [props: string]: any; // All other props
};

export const Toggle: FunctionComponent<ToggleProps> = ({
  id,
  name,
  className,
  tooltipContent,
  editable = true,
  label,
  description,
  disabled = false,
  ...domProps
}) => {
  const [field, { error, touched }] = useField({
    name,
  });

  const { hasError } = useMemo(() => {
    const hasError = editable && Boolean(touched) && Boolean(error !== undefined);
    return {
      hasError,
    };
  }, [touched, error, editable]);

  return (
    <div className={className}>
      <Switch.Group as="div" className={styles.wrapper}>
        {label && (
          <span className="flex flex-col">
            <Switch.Label as="span" className={styles.label} passive>
              {label}
            </Switch.Label>
            <Switch.Description as="span" className={styles.description}>
              {description}
            </Switch.Description>
          </span>
        )}
        <Switch
          disabled={disabled}
          checked={field.value}
          onChange={(value: boolean) => {
            field.onChange({ target: { value, name } });
          }}
          className={clsx(field.value ? 'bg-blue-500' : 'bg-gray-200', styles.switchWrapper)}
        >
          <span className={clsx(field.value ? 'translate-x-5' : 'translate-x-0', styles.knob)}>
            <span
              className={clsx(
                field.value ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200',
                styles.knobIcon
              )}
              aria-hidden="true"
            >
              <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                <path
                  d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span
              className={clsx(
                field.value ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100',
                styles.knobIcon
              )}
              aria-hidden="true"
            >
              <svg className="h-3 w-3 text-blue-500" fill="currentColor" viewBox="0 0 12 12">
                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
              </svg>
            </span>
          </span>
        </Switch>

        {hasError && (
          <div className={clsx(styles.adornment, 'right-0 pr-3')}>
            <ExclamationCircleIcon className={styles.errorIcon} aria-hidden="true" />
          </div>
        )}
      </Switch.Group>

      {/* {hasError && (
        <p className={styles.error} data-test={`${domProps['data-test']}-error`}>
          {error}
        </p>
      )} */}
    </div>
  );
};
