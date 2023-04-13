import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { clsx } from 'clsx';

import { Button } from '@components/button';
import { ButtonGroup } from '@components/button-group';
import { Icon } from '@components/icons';
import { TextInput } from '@components/inputs/text-input';
import { Tooltip } from '@components/tooltip';
import useTranslation from '@hooks/useTranslation';
import styles from './filter.module.scss';

enum WalletType {
  Land = 'land',
  Farm = 'farm',
  Horse = 'horse',
}

export type WalletFilterProps = {
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

export const WalletFilter: FunctionComponent<WalletFilterProps> = ({
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
  const [selectedType, setSelectedType] = useState<string>(WalletType.Land);
  const trans = useTranslation();

  const initialValues = {
    hash: '',
  };

  const onToggleIsShowing = () => {
    if (!disabled) {
      setIsShowing(!isShowing);
      onToggleShow(!isShowing);
    }
  };

  const onSubmit = values => {
    const filter = {
      hash: values?.hash === '' ? null : values.hash,
      type: selectedType,
    };

    onChange(filter);
  };

  const onResetForm = () => {
    formikRef?.current?.resetForm({ values: initialValues });
    setSelectedType(WalletType.Land);
    onSubmit(initialValues);
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
          {trans.t(`${translationKey}.filters.wallet.title`)}
          {icon && (
            <Tooltip message={trans.t(`${translationKey}.filters.wallet.tooltip`)}>
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
            <Form data-test="wallet-filter-form">
              <div className={styles.filter}>
                <ButtonGroup
                  buttons={[
                    trans.t(`${translationKey}.filters.wallet.buttons.land`),
                    trans.t(`${translationKey}.filters.wallet.buttons.farm`),
                    trans.t(`${translationKey}.filters.wallet.buttons.horse`),
                  ]}
                  className="mb-5 mr-5"
                  onClick={(type: WalletType) => {
                    setSelectedType(type);
                  }}
                  value={selectedType}
                  toggleable={true}
                  requireOne={true}
                ></ButtonGroup>

                <TextInput
                  name="hash"
                  className="w-11/12"
                  placeholder={trans.t(`${translationKey}.filters.wallet.placeholder`)}
                  showErrors={false}
                  isSmall={true}
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

                <button type="button" className={styles.clear} onClick={onResetForm}>
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
