import React, { FC, useMemo } from 'react';
import { useField } from 'formik';
import clsx from 'clsx';

interface Props {
  name: string;
  label: string;
  id: string;
  className?: string;
  labelClassName?: string;
  value?: any;
  checked?: boolean;
  isLarge?: Boolean;
  onChangeEventForMarketplace?: any;
  useBooleanValue?: boolean;
  [props: string]: any; // All other props
}

const inputCls =
  'text-primary h-4 w-4 rounded focus:ring-[color:var(--color-light-gray)] focus:ring-offset-transparent focus:ring-0 !border-[color:var(--tw-color-blue-600)] bg-transparent';
const inputLargeCls =
  'text-primary h-5 w-5 rounded focus:ring-[color:var(--color-light-gray)] focus:ring-offset-transparent focus:ring-0 !border-[color:var(--tw-color-blue-600)] bg-transparent';
const labelCls = 'ml-3 block text-sm font-medium';
const labelLargeCls = 'ml-3 block text-base font-medium';

export const CheckboxInput: FC<Props> = ({
  label = '',
  name,
  id,
  className,
  labelClassName,
  isLarge = false,
  onChangeEventForMarketplace = null,
  useBooleanValue,
  ...props
}) => {
  //const [isChecked, setIsChecked] = useState<boolean>(true);

  const onclickEvent = async event => {
    if (onChangeEventForMarketplace != null) {
      let selectedFilter: IDynamicFiltersModel = {
        filterType: 'checkbox',
        dbColumnName: name,
        lastActionIsRemove: event.target.checked ? false : true,
      };

      if (useBooleanValue) {
        selectedFilter.useBooleanValue = true;
        selectedFilter.isChecked = event.target.checked;
      } else {
        selectedFilter.optionValue = [label];
      }

      onChangeEventForMarketplace(selectedFilter);
    }
  };

  return (
    <div className={clsx('flex items-center', className)}>
      <input
        type="checkbox"
        id={id}
        name={name}
        className={isLarge ? inputLargeCls : inputCls}
        onClick={onclickEvent}
        {...props}
      />
      <label
        htmlFor={id}
        className={clsx('cursor-pointer', !isLarge && labelCls, isLarge && labelLargeCls, labelClassName)}
      >
        {label}
      </label>
    </div>
  );
};

export const CheckboxInputFormik: FC<Props> = ({
  label = '',
  name,
  id,
  className,
  isLarge = false,
  onChangeEventForMarketplace,
  labelClassName,
  useBooleanValue,
  ...props
}) => {
  const [field, { error, touched }] = useField({
    ...props,
    name,
    type: 'checkbox',
  });

  const hasError = useMemo(() => {
    return Boolean(touched) && Boolean(error !== undefined);
  }, [touched, error]);

  return (
    <CheckboxInput
      label={label}
      name={name}
      id={id}
      className={className}
      labelClassName={labelClassName}
      isLarge={isLarge}
      onChangeEventForMarketplace={onChangeEventForMarketplace}
      useBooleanValue={useBooleanValue}
      {...field}
      {...props}
    />
  );
};
