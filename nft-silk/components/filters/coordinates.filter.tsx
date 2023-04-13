import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Form, Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { clsx } from 'clsx';

import { Button } from '@components/button';
import { Icon } from '@components/icons';
import { TextInput } from '@components/inputs/text-input';
import { Tooltip } from '@components/tooltip';
import useTranslation from '@hooks/useTranslation';

import styles from './filter.module.scss';

const CoordinatesFilterSchema = Yup.object().shape({
  min: Yup.string()
    .required('Required')
    .matches(/^(\d{1,3}),(\d{1,3})$/),
  max: Yup.string()
    .required('Required')
    .matches(/^(\d{1,3}),(\d{1,3})$/),
});

export type CoordinatesFilterProps = {
  initialFilterValues?: any;
  onChange: Function;
  onToggleShow: Function;
  closeFilter?: boolean;
  clearFilter?: boolean;
  translationKey?: string;
  icon?: string;
  disabled?: boolean;
  [props: string]: any; // All other props
};

export const CoordinatesFilter: FunctionComponent<CoordinatesFilterProps> = ({
  initialFilterValues = null,
  onChange,
  onToggleShow,
  closeFilter = false,
  clearFilter = () => {},
  translationKey = 'landMap',
  icon,
  disabled = false,
  ...props
}) => {
  const formikRef = useRef<FormikProps<any>>(null);
  const [isShowing, setIsShowing] = useState<boolean>(false);
  const trans = useTranslation();

  const initialValues = {
    min: '',
    max: '',
  };

  const onToggleIsShowing = () => {
    if (!disabled) {
      setIsShowing(!isShowing);
      onToggleShow(!isShowing);
    }
  };

  const onSubmit = values => {
    const filter = {
      min: values.min === '' ? null : values.min,
      max: values.max === '' ? null : values.max,
    };

    onChange(filter);
  };

  const onResetForm = () => {
    formikRef?.current?.resetForm({ values: initialValues });
  };

  useEffect(() => {
    if (clearFilter) {
      onResetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearFilter]);

  useEffect(() => {
    if (closeFilter) {
      setIsShowing(false);
    }
  }, [closeFilter]);

  useEffect(() => {
    if (disabled) {
      setIsShowing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  return (
    <div className={clsx(styles.container, 'max-h-[300px]', { [styles.closed]: !isShowing })}>
      <div className={styles.header} onClick={onToggleIsShowing}>
        <div className={styles.title}>
          {trans.t(`${translationKey}.filters.coordinates.title`)}
          {icon && (
            <Tooltip message={trans.t(`${translationKey}.filters.coordinates.tooltip`)}>
              <Icon name={icon} className={styles.info} color="var(--color-royal-blue)" />
            </Tooltip>
          )}
        </div>

        <div className={clsx(styles.chevron, { [styles.closed]: !isShowing })}>
          <Icon name="chevron-up" className="h-3 w-3" color="var(--color-royal-white)" />
        </div>
      </div>

      <Formik
        innerRef={formikRef}
        onSubmit={onSubmit}
        initialValues={initialFilterValues || initialValues}
        validationSchema={CoordinatesFilterSchema}
      >
        {({ dirty, isSubmitting, isValid }) => {
          return (
            <Form data-test="coordinates-filter-form">
              <div className={clsx(styles.filter, 'flex')}>
                <TextInput
                  name="min"
                  className="w-2/5 mr-4"
                  placeholder={trans.t(`${translationKey}.filters.coordinates.placeholderMin`)}
                  showErrors={false}
                  isSmall={true}
                  required
                  mask={'#,#'}
                  blocks={{
                    '#': {
                      mask: Number,
                      scale: 0,
                      min: 0,
                      max: 159,
                      thousandsSeparator: '',
                    },
                  }}
                />

                <TextInput
                  name="max"
                  className="w-2/5"
                  placeholder={trans.t(`${translationKey}.filters.coordinates.placeholderMax`)}
                  showErrors={false}
                  isSmall={true}
                  required
                  mask={'#,#'}
                  blocks={{
                    '#': {
                      mask: Number,
                      scale: 0,
                      min: 0,
                      max: 159,
                      thousandsSeparator: '',
                    },
                  }}
                />
              </div>

              <div className={styles.footer}>
                <Button
                  buttonType="submit"
                  type="primary"
                  fill="solid"
                  notch="none"
                  full={true}
                  short={true}
                  uppercase={true}
                  disabled={!dirty || !isValid}
                >
                  {trans.t('common.filters.search')}
                </Button>

                <button
                  type="button"
                  className={styles.clear}
                  onClick={() => {
                    onResetForm();
                    onSubmit(initialValues);
                  }}
                >
                  {trans.t('common.filters.clear')}
                </button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};
