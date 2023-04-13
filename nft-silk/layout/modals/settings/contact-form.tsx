import React, { FunctionComponent, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useMoralis } from 'react-moralis';

import api from '@common/api';
import useAppStore from '@hooks/useAppStore';
import useTranslation from '@hooks/useTranslation';
import { Button } from '@components/button';
import { TextInput } from '@components/inputs/text-input';

import styles from './settings.module.scss';

const ContactSettingsSchema = Yup.object().shape({
  email: Yup.string().email().required('Required'),
});

const emailExistsMsg = 'Email is already registered';

export type ContactSettingsFormProps = {
  onSuccess: Function;
};

const ContactSettingsForm: FunctionComponent<ContactSettingsFormProps> = ({ onSuccess }) => {
  const { account } = useMoralis();
  const { getProfile, profile } = useAppStore();
  const { t } = useTranslation();

  const [emailExists, setEmailExists] = useState(false);

  const initialValues = {
    email: profile?.email || '',
    walletAddress: profile?.walletAddress || '',
    dynastyName: profile?.dynastyName || '',
    username: profile?.username || '',
    location: profile?.location || '',
    about: profile?.about || '',
    userRegistrationId: profile?.userRegistrationId || '',
  };

  const onSubmit = async (values, { setFieldError }) => {
    try {
      const response = await api.put('/api/userRegistration', values);

      await getProfile(values.walletAddress);

      onSuccess();
    } catch (error) {
      const errorMessage = error?.response?.data?.errorMessage;

      // look for specific error messages from BE to show FE validation errors
      if (errorMessage) {
        if (errorMessage.indexOf('UserRegistration.IX_UserRegistration_Email') > -1) {
          setFieldError('email', emailExistsMsg);
        }
      }

      const errors = error?.response?.data?.errors;

      if (errors) {
      }
    }
  };

  return (
    <>
      <div className={styles.settingsTitle}>{t('settings.contactDetails.title')}</div>

      <div className={`text-lg mb-3 ${styles.textLightGray}`}>{t('settings.contactDetails.subtitle')}</div>

      <Formik
        enableReinitialize
        onSubmit={onSubmit}
        initialValues={initialValues}
        validationSchema={ContactSettingsSchema}
      >
        {({ dirty, isSubmitting, isValid }) => {
          return (
            <Form className="w-3/4 mx-auto" data-test="settings-form">
              <div className="flex flex-col">
                <TextInput
                  name="email"
                  placeholder={t('settings.contactDetails.emailLabel')}
                  data-test="email"
                  required
                />
                <TextInput
                  name="walletAddress"
                  placeholder={t('settings.contactDetails.walletAddressLabel')}
                  data-test="walletAddress"
                  editable={false}
                  useClipboard
                />

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
                      {t('settings.contactDetails.updateButton')}
                    </Button>
                  </div>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default ContactSettingsForm;
