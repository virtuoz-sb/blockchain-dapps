import React, { FC, useMemo } from 'react';
import { useField } from 'formik';
import clsx from 'clsx';

interface Props {
  name: string;
  label: string;
  id: string;
  value: string;
  className?: string;
  editable?: boolean;
  isLarge?: Boolean;
  [props: string]: any; // All other props
}

const inputCls =
  'text-primary h-4 w-4 focus:ring-[color:var(--color-light-gray)] focus:ring-offset-transparent focus:ring-0 !border-[color:var(--tw-color-blue-600)] bg-transparent';
const inputLargeCls =
  'text-primary h-5 w-5 focus:ring-[color:var(--color-light-gray)] focus:ring-offset-transparent focus:ring-0 !border-[color:var(--tw-color-blue-600)] bg-transparent';
const labelCls = 'ml-3 block text-sm font-medium';
const labelLargeCls = 'ml-3 block text-base font-medium';
const disabledCls = 'opacity-75';

export const RadioInput: FC<Props> = ({
  label = '',
  name,
  id,
  className,
  editable = true,
  isLarge = false,
  ...props
}) => {
  return (
    <div className={clsx('flex items-center', className, { [disabledCls]: !editable })}>
      <input
        type="radio"
        id={id}
        name={name}
        className={clsx({ [inputCls]: !isLarge, [inputLargeCls]: isLarge })}
        disabled={!editable}
        {...props}
      />
      <label htmlFor={id} className={clsx('cursor-pointer', { [labelCls]: !isLarge, [labelLargeCls]: isLarge })}>
        {label}
      </label>
    </div>
  );
};

export const RadioInputFormik: FC<Props> = ({
  label = '',
  name,
  id,
  className,
  editable = true,
  isLarge = false,
  ...props
}) => {
  const [field, { error, touched }] = useField({
    ...props,
    name,
    type: 'radio',
  });

  const hasError = useMemo(() => {
    return Boolean(touched) && Boolean(error !== undefined);
  }, [touched, error]);

  return (
    <RadioInput
      id={id}
      name={name}
      label={label}
      className={className}
      editable={editable}
      isLarge={isLarge}
      {...field}
      {...props}
    />
  );
};
