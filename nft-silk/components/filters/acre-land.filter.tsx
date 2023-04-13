import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { clsx } from 'clsx';

import { Button } from '@components/button';
import { Icon } from '@components/icons';
import { RadioInputFormik } from '@components/inputs/radio-input';
import { Tooltip } from '@components/tooltip';
import useTranslation from '@hooks/useTranslation';
import styles from './filter.module.scss';

export type AcreLandFilterProps = {
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

export const AcreLandFilter: FunctionComponent<AcreLandFilterProps> = ({
  initialFilterValues = null,
  onChange,
  onToggleShow,
  closeFilter = false,
  clearFilter = false,
  translationKey = 'landMap',
  icon,
  disabled = false,
  ...props
}) => {
  const formikRef = useRef<FormikProps<any>>(null);
  const [isShowing, setIsShowing] = useState<boolean>(false);
  const trans = useTranslation();

  const initialValues = {
    acreType: null,
  };

  const onToggleIsShowing = () => {
    if (!disabled) {
      setIsShowing(!isShowing);
      onToggleShow(!isShowing);
    }
  };

  const onSubmit = values => {
    onChange(values);
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
    <div className={clsx(styles.container, { [styles.closed]: !isShowing })} style={{ maxHeight: '300px' }}>
      <div className={styles.header} onClick={onToggleIsShowing}>
        <div className={styles.title}>
          {trans.t(`${translationKey}.filters.acreLand.title`)}
          {icon && (
            <Tooltip message={trans.t(`${translationKey}.filters.acreLand.tooltip`)}>
              <Icon name={icon} className={styles.info} color="var(--color-royal-blue)" />
            </Tooltip>
          )}
        </div>

        <div className={clsx(styles.chevron, { [styles.closed]: !isShowing })}>
          <Icon name="chevron-up" className="h-3 w-3" color="var(--color-royal-white)" />
        </div>
      </div>

      <Formik innerRef={formikRef} onSubmit={onSubmit} initialValues={initialFilterValues || initialValues}>
        {() => {
          return (
            <Form data-test="acre-land-filter-form">
              <div className={styles.filter}>
                <RadioInputFormik
                  className="mb-2"
                  name="acreType"
                  label={trans.t(`${translationKey}.filters.acreLand.all`)}
                  id="acreLand-all"
                  value="all"
                  isLarge
                />
                <RadioInputFormik
                  name="acreType"
                  label={trans.t(`${translationKey}.filters.acreLand.forSale`)}
                  id="acreLand-forSale"
                  value="forSale"
                  isLarge
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
                >
                  {trans.t('common.filters.search')}
                </Button>

                <button type="submit" className={styles.clear} onClick={onResetForm}>
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
