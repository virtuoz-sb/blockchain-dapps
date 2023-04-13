import React, { FunctionComponent, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useMoralis } from 'react-moralis';

import api from '@common/api';
import useAppStore from '@hooks/useAppStore';
import { Button } from '@components/button';
import { TextInput } from '@components/inputs/text-input';
import useTranslation from '@hooks/useTranslation';

import styles from './profile.module.scss';

const ProfileSchema = Yup.object().shape({
  username: Yup.string().required('Required').min(6).max(20),
  email: Yup.string().email().required('Required'),
});

const emailExistsMsg = 'Email is already registered';
const usernameExistsMsg = 'Username is already registered';
const walletAddressExistsMsg = 'Wallet address is already registered';

export type ProfileFormProps = {
  onSuccess: Function;
};

const ProfileForm: FunctionComponent<ProfileFormProps> = ({ onSuccess }) => {
  const trans = useTranslation();
  const { account } = useMoralis();
  const { getProfile, profile } = useAppStore();

  const [emailExists, setEmailExists] = useState(false);
  const [usernameExists, setUsernameExists] = useState(false);
  const [walletAddressExists, setWalletAddressExists] = useState(false);

  const isEdit = profile !== undefined && profile !== null;

  const initialValues = {
    username: profile?.username || '',
    email: profile?.email || '',
    walletAddress: profile?.walletAddress || account || '',
  };

  const onSubmit = async (values, { setFieldError }) => {
    try {
      if (isEdit) {
        const response = await api.put('/api/userRegistration', {
          ...values,
          userRegistrationId: profile.userRegistrationId,
        });
      } else {
        const response = await api.post('/api/userRegistration', values);
      }

      await getProfile(values.walletAddress);

      onSuccess();
    } catch (error) {
      const errorMessage = error?.response?.data?.errorMessage;

      // look for specific error messages from BE to show FE validation errors
      if (errorMessage) {
        if (errorMessage.indexOf('UserRegistration.IX_UserRegistration_Email') > -1) {
          setFieldError('email', emailExistsMsg);
        }

        if (errorMessage.indexOf('UserRegistration.IX_UserRegistration_Username') > -1) {
          setFieldError('username', usernameExistsMsg);
        }

        if (errorMessage.indexOf('UserRegistration.IX_UserRegistration_WalletAddress') > -1) {
          setWalletAddressExists(true);
        }
      }

      const errors = error?.response?.data?.errors;

      if (errors) {
      }
    }
  };

  return (
    <>
      <div className={styles.profileTitle}>
        {isEdit ? trans.t('profile.updateRegistration') : trans.t('profile.newRegistration')}
      </div>
      <br />
      <Formik enableReinitialize onSubmit={onSubmit} initialValues={initialValues} validationSchema={ProfileSchema}>
        {({ dirty, isSubmitting, isValid }) => {
          return (
            <Form className="w-3/4" data-test="profile-form">
              <div className="flex flex-col">
                <TextInput
                  name="username"
                  placeholder="Enter your Username"
                  isAutofocus
                  data-test="username"
                  disabled={isEdit}
                  required
                  mask={/^[A-Za-z]{1}[A-Za-z0-9_]{0,19}$/}
                />
                <TextInput name="email" placeholder="Enter your Email" data-test="email" required />
                <TextInput
                  name="walletAddress"
                  placeholder="Wallet Address"
                  data-test="walletAddress"
                  editable={false}
                />

                <div className="flex flex-col pt-5 pb-20 items-center">
                  {walletAddressExists && (
                    <div className="text-red-600 pb-4">{walletAddressExists && walletAddressExistsMsg}</div>
                  )}

                  <div className="flex">
                    <Button
                      color="primary"
                      fill="solid"
                      notch="right"
                      chevrons="right"
                      buttonType="submit"
                      className="w-[170px]"
                      full={true}
                      disabled={!isValid || isSubmitting || walletAddressExists}
                    >
                      {isEdit ? 'UPDATE' : 'SUBMIT'}
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

export default ProfileForm;
