import React, { FunctionComponent, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import useTranslation from '@hooks/useTranslation';
import { Button } from '@components/button';
import { TextInput } from '@components/inputs/text-input';
import { mockAdminLogin, errorCodes } from '@common/mock/mockAdmin';

//todo language
const notfoundMsg = 'User Not Found';
const inactiveMsg = 'User is Deactivated';
const pendingMsg = 'User Pending Invitation';
const unknownMsg = 'Serve Error Encountered';

const LoginSchema = Yup.object().shape({
  password: Yup.string().required('Required').min(8).max(32),
  email: Yup.string().email().required('Required'),
});

export type LoginFormProps = {
  onSuccess: Function;
};

const LoginForm: FunctionComponent<LoginFormProps> = ({ onSuccess }) => {
  const [authErrorMsg, setAuthErrorMsg] = useState(null);
  const trans = useTranslation();

  const initialValues = {
    password: '',
    email: '',
  };

  const onSubmit = async (values, { setFieldError }) => {
    try {
      setAuthErrorMsg(null);
      //const response = await api.post('/api/admin/login', values);
      const response = await mockAdminLogin(values);
      console.log('ADMIN Login', values, response);
      onSuccess(response);
    } catch (error) {
      //const errorMessage = error?.response?.data?.errorMessage;
      const errCode = error?.message;
      let errMsg = unknownMsg;
      // look for specific error messages from BE to show FE validation errors
      if (errCode) {
        if (errCode.indexOf(errorCodes.notfound) > -1) {
          //setFieldError('email', emailExistsMsg);
          errMsg = notfoundMsg;
        }
        if (errCode.indexOf(errorCodes.inactive) > -1) {
          errMsg = inactiveMsg;
        }
        if (errCode.indexOf(errorCodes.pending) > -1) {
          errMsg = pendingMsg;
        }
      }
      console.log('Admin Login error', errCode, errMsg);
      setAuthErrorMsg(errMsg);
    }
  };

  return (
    <div className="w-full max-w-md px-4 sm:px-0">
      <Formik enableReinitialize onSubmit={onSubmit} initialValues={initialValues} validationSchema={LoginSchema}>
        {({ dirty, isSubmitting, isValid }) => {
          return (
            <Form className="" data-test="login-form">
              <div className="flex flex-col">
                <TextInput
                  name="email"
                  placeholder={trans.t('Your email')}
                  isAutofocus
                  data-test="admin-email"
                  //required
                  //mask={/^[A-Za-z]{1}[A-Za-z0-9_]{0,19}$/}
                />
                <TextInput
                  name="password"
                  placeholder={trans.t('Your password')}
                  data-test="admin-password"
                  type="password"
                />

                <div className="flex flex-col items-center">
                  {authErrorMsg && <div className="text-red-500 font-medium">{authErrorMsg}</div>}

                  <div className="flex">
                    <Button
                      color="primary"
                      fill="solid"
                      notch="right"
                      buttonType="submit"
                      uppercase
                      className="pt-5"
                      full={true}
                      disabled={!dirty || !isValid || isSubmitting}
                    >
                      {trans.t('Sign IN to admin portal')}
                    </Button>
                  </div>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default LoginForm;
