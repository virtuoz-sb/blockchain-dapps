import React, { FunctionComponent, useMemo, useRef, useEffect, useState } from 'react';
import { useField } from 'formik';
import { IMaskInput } from 'react-imask';
import clsx from 'clsx';

import { Icon } from '@components/icons';
import { CopyClipboard } from '@components/copy-to-clipboard';

import styles from './text-input.module.scss';

export type TextInputProps = {
  placeholder?: string;
  error?: string;
  id?: string;
  name?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  tooltipContent?: string;
  isAutofocus?: boolean;
  mask?: any;
  guide?: boolean;
  required?: boolean;
  value?: any;
  editable?: boolean;
  type?: 'email' | 'text' | 'password';
  showErrors?: boolean;
  isSmall?: boolean;
  useClipboard?: boolean;
  iconName?: string;
  iconPosition?: string;
  onChangeEvent?: any;
  onChangeEventForMarketplace?: any;
  onChangeEventForMarketplaceFilteringTraitOptions?: any;
  clearInputValue?: boolean;
  [props: string]: any; // All other props
};

export const TextInputWithoutFormik: FunctionComponent<TextInputProps> = ({
  id,
  name,
  placeholder,
  label,
  className,
  inputClassName = '',
  tooltipContent,
  isAutofocus,
  mask,
  editable = true,
  guide = true,
  required = false,
  type = 'text',
  showErrors = true,
  isSmall = false,
  useClipboard,
  iconName = '',
  iconPosition = 'left',
  onChangeEvent = null,
  onChangeEventForMarketplace = null,
  onChangeEventForMarketplaceFilteringTraitOptions = null,
  clearInputValue = null,
  value = '',
  ...domProps
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState<string>(value);
  const [maskValue, setMaskValue] = useState<string>();

  const getInputClass = (editable: boolean) => {
    return clsx(
      styles.full,
      inputValue && styles.isValid,
      !editable && styles.disable,
      !editable && inputClassName == '' && styles.disabledCursor
    );
  };

  const handleChange = async event => {
    if (event) {
      setInputValue(event.target.value);
      handleEventsOnChange(event.target.value);
    }
  };

  const handleChangeForIMask = async (inputValue, mask) => {
    setInputValue(inputValue);
    setMaskValue(mask);
    handleEventsOnChange(inputValue);
  };

  const handleEventsOnChange = async inputValue => {
    if (onChangeEvent != null) {
      onChangeEvent(inputValue);
    }

    if (onChangeEventForMarketplace != null) {
      onChangeEventForMarketplace(inputValue);
    }

    if (onChangeEventForMarketplaceFilteringTraitOptions != null) {
      onChangeEventForMarketplaceFilteringTraitOptions();
    }
  };

  useEffect(() => {
    if (inputRef.current && isAutofocus) {
      inputRef.current.focus();
    }
  }, [isAutofocus]);

  useEffect(() => {
    if (clearInputValue) {
      setInputValue('');
      setMaskValue('');
    }
  }, [clearInputValue]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className={className}>
      <div
        className={clsx(styles.inputContainer, {
          [styles.small]: isSmall,
          [styles.iconPositionLeft]: iconName ? true : false,
        })}
      >
        {iconName && <Icon name={iconName} className={clsx(styles.icon)} />}
        <div className="h-full">
          {mask ? (
            <IMaskInput
              // @ts-ignore: hot fix for https://github.com/uNmAnNeR/imaskjs/issues/554
              name={name}
              id={id || name}
              className={clsx(getInputClass(editable), inputClassName)}
              type={type}
              disabled={!editable}
              mask={mask}
              value={inputValue.toString()}
              onAccept={(value, mask) => handleChangeForIMask(value, mask)}
              inputRef={(el: HTMLInputElement) => (inputRef.current = el)}
            />
          ) : (
            <input
              name={name}
              id={id || name}
              className={clsx(getInputClass(editable), inputClassName)}
              type={type}
              disabled={!editable}
              onChange={handleChange}
              value={inputValue}
              ref={inputRef}
            />
          )}

          <label htmlFor={name}>{placeholder}</label>
        </div>
      </div>
    </div>
  );
};

export const TextInput: FunctionComponent<TextInputProps> = ({
  id,
  name,
  placeholder,
  label,
  className,
  tooltipContent,
  isAutofocus,
  mask,
  editable = true,
  guide = true,
  required = false,
  type = 'text',
  showErrors = true,
  isSmall = false,
  useClipboard,
  iconName = '',
  iconPosition = 'left',
  onChangeEventForMarketplace = null,
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

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && isAutofocus) {
      inputRef.current.focus();
    }
  }, [isAutofocus]);

  return (
    <div className={className}>
      <div
        className={clsx(styles.inputContainer, {
          [styles.small]: isSmall,
          [styles.iconPositionLeft]: iconName ? true : false,
        })}
      >
        {iconName && <Icon name={iconName} className={clsx(styles.icon)} />}
        <div className="h-full">
          {mask ? (
            <IMaskInput
              name={name}
              // @ts-ignore: hot fix for https://github.com/uNmAnNeR/imaskjs/issues/554
              id={id || name}
              className={getInputClass(hasError, editable, field.value)}
              type={type}
              disabled={!editable}
              {...field}
              {...domProps}
              mask={mask}
              inputRef={(el: HTMLInputElement) => (inputRef.current = el)}
            />
          ) : (
            <input
              name={name}
              id={id || name}
              className={getInputClass(hasError, editable, field.value)}
              type={type}
              disabled={!editable}
              {...field}
              {...domProps}
              ref={inputRef}
            />
          )}

          <label htmlFor={name}>{placeholder}</label>

          {/* {hasError && (
          <div className={clsx(styles.adornment, 'right-0 pr-3')}>
            <ExclamationCircleIcon className={styles.errorIcon} aria-hidden="true" />
          </div>
        )} */}
          {useClipboard && (
            <CopyClipboard
              textToCopy={field.value}
              className="absolute inset-y-0 right-0 pr-3 z-10"
              iconClassName="h-5 w-5 text-gray-400"
            />
          )}
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
