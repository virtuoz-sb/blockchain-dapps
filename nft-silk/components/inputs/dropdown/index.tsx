import React, { FunctionComponent, useMemo, useRef, useEffect, useState } from 'react';
import { useField } from 'formik';
import clsx from 'clsx';
import { map } from 'lodash-es';

import styles from './dropdown.module.scss';

export type DropdownProps = {
  placeholder?: string;
  error?: string;
  id?: string;
  name?: string;
  label?: string;
  className?: string;
  tooltipContent?: string;
  required?: boolean;
  value?: any;
  options: any[];
  editable?: boolean;
  showErrors?: boolean;
  isSmall?: boolean;
  [props: string]: any; // All other props
};

export const Dropdown: FunctionComponent<DropdownProps> = ({
  id,
  name,
  placeholder,
  label,
  options,
  className,
  tooltipContent,
  editable = true,
  required = false,
  showErrors = true,
  isSmall = false,
  ...domProps
}) => {
  const [field, { error, touched }] = useField({
    name,
  });

  const getInputClass = (hasError: boolean, editable: boolean, value: string) => {
    return clsx(
      styles.full,
      value && styles.isValid,
      !editable && styles.disable,
      hasError && [styles.errorInput, 'pr-10']
    );
  };

  const { hasError } = useMemo(() => {
    const hasError = Boolean(touched) && Boolean(error !== undefined);
    return {
      hasError,
    };
  }, [touched, error]);

  return (
    <div className={className}>
      <div
        className={clsx(styles.selectContainer, {
          [styles.small]: isSmall,
        })}
      >
        <div className="h-full">
          <select
            name={name}
            id={id || name}
            className={getInputClass(hasError, editable, field.value)}
            disabled={!editable}
            {...field}
            {...domProps}
          >
            {map(options, o => (
              <option value={o.value} label={o.label} key={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <label htmlFor={name}>{placeholder}</label>
        </div>
      </div>

      {showErrors && (
        <p className={clsx(styles.error, hasError && 'pb-3')} data-test={`${domProps['data-test']}-error`}>
          {hasError && error}
          {!hasError && <>&nbsp;</>}
        </p>
      )}
    </div>
  );
};
