import React, { FunctionComponent, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import api from '@common/api';
import useAppStore from '@hooks/useAppStore';
import useTranslation from '@hooks/useTranslation';
import { Button } from '@components/button';
import { Toggle } from '@components/inputs/toggle';

import styles from './settings.module.scss';

const NotificationSettingsSchema = Yup.object().shape({});

export type NotificationsSettingsFormProps = {
  onSuccess: Function;
};

const NotificationsSettingsForm: FunctionComponent<NotificationsSettingsFormProps> = ({ onSuccess }) => {
  const { getProfile, profile } = useAppStore();
  const { t } = useTranslation();

  const initialValues = {
    horseWinningEmail: false,
    horseWinningSMS: false,
    marketplaceEmail: false,
    marketplaceSMS: false,
    ...profile?.settings,
    userRegistrationId: profile?.userRegistrationId,
  };

  const onSubmit = async (values, { setFieldError }) => {
    try {
      if (profile.settings) {
        const response = await api.put('/api/userSettings', values);
      } else {
        const response = await api.post('/api/userSettings', values);
      }

      await getProfile(profile?.walletAddress);

      onSuccess();
    } catch (error) {
      const errorMessage = error?.response?.data?.errorMessage;

      // look for specific error messages from BE to show FE validation errors
      if (errorMessage) {
      }

      const errors = error?.response?.data?.errors;

      if (errors) {
      }
    }
  };

  return (
    <>
      <div className={styles.settingsTitle}>{t('settings.notifications.title')}</div>

      <div className={`text-lg mb-3 ${styles.textLightGray}`}>{t('settings.notifications.subtitle')}</div>

      <Formik
        enableReinitialize
        onSubmit={onSubmit}
        initialValues={initialValues}
        validationSchema={NotificationSettingsSchema}
      >
        {({ dirty, isSubmitting, isValid }) => {
          return (
            <Form className="w-3/4 mx-auto" data-test="settings-form">
              <div className="flex flex-row border-t border-blue-500/25 py-5 mt-8">
                <div className="flex flex-col ">
                  <div className="text-left font-bold">{t('settings.notifications.horseWinningLabel')}</div>
                  <div className="text-left text-gray-400 text-sm w-3/4">
                    {t('settings.notifications.horseWinningDescription')}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row gap-2">
                    <Toggle name="horseWinningEmail" />
                    <span className="text-sm">{t('settings.notifications.email')}</span>
                  </div>
                  <div className="group relative flex flex-row gap-2">
                    <Toggle disabled={true} name="horseWinningSMS" />
                    <span className="text-sm">{t('settings.notifications.sms')}</span>
                    <div className="absolute top-1 right-[6rem] text-white text-xs whitespace-nowrap hidden group-hover:block">
                      {t('settings.notifications.comingSoon')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row border-t border-blue-500/25 py-5 mt-8">
                <div className="flex flex-col ">
                  <div className="text-left font-bold">{t('settings.notifications.marketplaceLabel')}</div>
                  <div className="text-left text-gray-400 text-sm w-3/4">
                    {t('settings.notifications.marketplaceDescription')}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-row gap-2">
                    <Toggle name="marketplaceEmail" />
                    <span className="text-sm">{t('settings.notifications.email')}</span>
                  </div>
                  <div className="group relative flex flex-row gap-2">
                    <Toggle disabled={true} name="marketplaceSMS" />
                    <span className="text-sm">{t('settings.notifications.sms')}</span>
                    <div className="absolute top-1 right-[6rem] text-white text-xs whitespace-nowrap hidden group-hover:block">
                      {t('settings.notifications.comingSoon')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col pt-5 pb-20 items-center">
                <div className="flex">
                  <Button
                    color="primary"
                    fill="solid"
                    notch="right"
                    chevrons="right"
                    buttonType="submit"
                    className="w-[170px]"
                    full={true}
                    disabled={!dirty || !isValid || isSubmitting}
                  >
                    {t('settings.notifications.updateButton')}
                  </Button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default NotificationsSettingsForm;
