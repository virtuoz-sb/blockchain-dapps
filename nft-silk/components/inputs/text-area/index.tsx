import React, { FunctionComponent, useMemo } from 'react';
import { useField } from 'formik';
import { ExclamationCircleIcon } from '@heroicons/react/solid';
import clsx from 'clsx';

import styles from './text-area.module.scss';

export type TextAreaProps = {
  placeholder?: string;
  error?: string;
  id?: string;
  name?: string;
  label?: string;
  cols?: number;
  rows?: number;
  className?: string;
  tooltipContent?: string;
  required?: boolean;
  value?: String;
  editable?: boolean;
  [props: string]: any; // All other props
};

const getInputClass = (hasError: boolean, editable: boolean, value: string) => {
  return clsx(
    styles.full,
    value && styles.isValid,
    !editable && styles.disable,
    hasError && [styles.errorInput, 'pr-10']
  );
};

export const TextArea: FunctionComponent<TextAreaProps> = ({
  id,
  name,
  placeholder,
  label,
  cols,
  rows,
  className,
  tooltipContent,
  editable = true,
  required = false,
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
      <div className={styles.inputContainer}>
        <textarea
          name={name}
          id={id || name}
          className={getInputClass(hasError, editable, field.value)}
          cols={cols}
          rows={rows}
          disabled={!editable}
          {...field}
          {...domProps}
        />

        <label htmlFor={name}>{placeholder}</label>

        {hasError && (
          <div className={clsx(styles.adornment, 'right-0 pr-3')}>
            <ExclamationCircleIcon className={styles.errorIcon} aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
};
