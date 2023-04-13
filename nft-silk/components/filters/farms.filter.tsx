import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { clsx } from 'clsx';
import { map } from 'lodash-es';

import { Button } from '@components/button';
import { ButtonGroup } from '@components/button-group';
import { Icon } from '@components/icons';
import { CheckboxInputFormik } from '@components/inputs/checkbox-input';
import { Tooltip } from '@components/tooltip';
import useTranslation from '@hooks/useTranslation';
import styles from './filter.module.scss';

enum FarmType {
  Private = 'private',
  Public = 'public',
}

export type FarmsFilterProps = {
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

export const FarmsFilter: FunctionComponent<FarmsFilterProps> = ({
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
  const [selectedFarmType, setSelectedFarmType] = useState<FarmType>(FarmType.Private);
  const [selectedFarmSize, setSelectedFarmSize] = useState<any>(null);
  const trans = useTranslation();

  const initialValues = {
    forSale: false,
    vacant: false,
  };

  const farmSizes = {
    private: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    public: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  };

  const onToggleIsShowing = () => {
    if (!disabled) {
      setIsShowing(!isShowing);
      onToggleShow(!isShowing);
    }
  };

  const onFarmSizeSelect = size => {
    setSelectedFarmSize(size);
  };

  const onSubmit = values => {
    onChange({
      forSale: values?.forSale,
      vacant: values?.vacant,
      size: values?.size !== undefined ? values?.size : selectedFarmSize,
      type: values?.type !== undefined ? values?.type : selectedFarmType,
    });
  };

  const onResetForm = () => {
    formikRef?.current?.resetForm({ values: initialValues });
    setSelectedFarmType(FarmType.Private);
    setSelectedFarmSize(null);
  };

  const onCleanSubmit = () => {
    onSubmit({ size: null, type: null, forSale: null, vacant: null });
  };

  useEffect(() => {
    if (clearFilter) {
      console.log('reset farm form');
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
    <div className={clsx(styles.container, { [styles.closed]: !isShowing })} style={{ maxHeight: '420px' }}>
      <div className={styles.header} onClick={onToggleIsShowing}>
        <div className={styles.title}>
          {trans.t(`${translationKey}.filters.farms.title`)}
          {icon && (
            <Tooltip message={trans.t(`${translationKey}.filters.farms.tooltip`)}>
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
            <Form data-test="farms-filter-form">
              <div className={styles.filter}>
                <ButtonGroup
                  buttons={[
                    trans.t(`${translationKey}.filters.farms.buttons.private`),
                    trans.t(`${translationKey}.filters.farms.buttons.public`),
                  ]}
                  className="mb-5 mr-5"
                  onClick={(type: FarmType) => {
                    setSelectedFarmType(type);
                    onFarmSizeSelect(null);
                  }}
                  value={selectedFarmType}
                ></ButtonGroup>

                <CheckboxInputFormik
                  className="mb-4"
                  name="forSale"
                  label={trans.t(`${translationKey}.filters.farms.forSale`)}
                  id="farms-forSale"
                  isLarge
                />

                {selectedFarmType === FarmType.Public && (
                  <div className="flex relative">
                    <CheckboxInputFormik
                      className="mb-2"
                      name="vacant"
                      label={trans.t(`${translationKey}.filters.farms.vacant`)}
                      id="farms-vacant"
                      isLarge
                    />

                    <Tooltip message={trans.t(`${translationKey}.filters.farms.vacantTooltip`)}>
                      <Icon name="info-outline" className="h-4 w-4 ml-2 mt-1" color="var(--color-royal-blue)" />
                    </Tooltip>
                  </div>
                )}

                <div className="pt-5 font-medium">{trans.t(`${translationKey}.filters.farms.farmSizeTitle`)}</div>
                <div className="flex pt-3">
                  <div className="mr-4">
                    <button
                      type="button"
                      className={clsx(styles.button, 'select-none !w-[40px]', {
                        [styles.selected]: selectedFarmSize === 'all',
                      })}
                      onClick={() => onFarmSizeSelect('all')}
                    >
                      All
                    </button>
                  </div>

                  <div>
                    {map(farmSizes[selectedFarmType], fs => (
                      <button
                        type="button"
                        key={fs}
                        className={clsx(styles.button, 'select-none', { [styles.selected]: selectedFarmSize == fs })}
                        onClick={() => onFarmSizeSelect(fs)}
                      >
                        {fs}
                      </button>
                    ))}
                  </div>
                </div>
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

                <button
                  type="button"
                  className={styles.clear}
                  onClick={() => {
                    onResetForm();
                    onCleanSubmit();
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
