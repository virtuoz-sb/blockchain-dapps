import React, { FunctionComponent, useState, useMemo, useCallback } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Auth } from 'aws-amplify';
import clsx from 'clsx';

import useTranslation from '@hooks/useTranslation';
import { Button } from '@components/button';
import { CheckboxInput } from '@components/inputs/checkbox-input';
import { TextInput } from '@components/inputs/text-input';
import { Icon } from '@components/icons';

//validators for indicators matching YUP schema
const getValidators = (t: (arg0: string) => any) => {
  const getT = (key: string) => t(`admin.changePassword.validators.${key}`);
  return [
    { id: 'newPassword_length', msg: getT('newPassword_length'), val: false },
    { id: 'newPassword_number', msg: getT('newPassword_number'), val: false },
    { id: 'newPassword_lowercase', msg: getT('newPassword_lowercase'), val: false },
    { id: 'newPassword_uppercase', msg: getT('newPassword_uppercase'), val: false },
    { id: 'newPassword_special', msg: getT('newPassword_special'), val: false },
    { id: 'newPassword_spaces', msg: getT('newPassword_spaces'), val: false },
  ];
};

//base Schema
const getChangePasswordSchema = (t: (arg0: string) => any) => {
  const getT = (key: string) => t(`admin.changePassword.errors.${key}`);
  return Yup.object().shape({
    existingPassword: Yup.string()
      .required(getT('required'))
      .min(8, getT('min'))
      .notOneOf([Yup.ref('newPassword')], getT('unique')),
    newPassword: Yup.string().required(getT('newRequired')),
  });
};
//validator indicators specific chema with object messages for matching
const NewPasswordSchema = Yup.string()
  .min(8, { newPassword_length: '8 characters minimum' })
  .matches(/\d+/, { message: { newPassword_number: 'One number' } })
  .matches(/[a-z]+/, { message: { newPassword_lowercase: 'One lowercase letter' } })
  .matches(/[A-Z]+/, { message: { newPassword_uppercase: 'One uppercase letter' } })
  .matches(/[!@#$%^&*()-+]+/, {
    message: { newPassword_special: 'One special character' },
  })
  .test('Password has spaces', { newPassword_spaces: 'No spaces' }, value => !/\s+/.test(value));
//.required({ newPassword_required: 'Please enter new password' });

//validate Yup schema and return specialized error messages
export function validateSchema(values, validationSchema) {
  try {
    validationSchema.validateSync(values, { abortEarly: false });
    return {};
  } catch (error) {
    return getErrorsFromValidationError(error);
  }
}
//gets key/value object as Yup message
//use inner for normal errors IE Formik yupToFormErrors
export function getErrorsFromValidationError(validationError) {
  //inner with errors, message, path, params
  return validationError.errors.reduce((acc, error) => {
    const [key, value] = Object.entries(error)[0];
    acc[key] = value;
    return acc;
  }, {});
}

const checkErrors = (errs, items) => {
  return items.map(it => {
    const val = errs && errs[it.id] ? false : true;
    return { ...it, val };
  });
};

//Check box read only for validator indicator status; change checked
export function CheckboxIndicator({ id, label, val }: { label?: string; id?: string; val?: boolean }) {
  return (
    <CheckboxInput
      className="pointer-events-none"
      labelClassName={clsx('text-[14px] font-normal', val && 'text-[color:var(--color-light-gray)]')}
      name={id}
      label={label}
      id={id}
      readOnly
      isLarge
      checked={val}
    />
  );
}

//gap display of indicators
export function IndicatorDisplay({ validations, className }: { className?: string; validations: any[] }) {
  //change by validation indicators array
  return (
    <div className={clsx('grid gap-x-8 gap-y-1 sm:gap-y-4 grid-cols-1 sm:grid-cols-2 mt-5', className)}>
      {validations.map(v => (
        <div key={v.id}>
          <CheckboxIndicator id={v.id} label={v.msg} val={v.val} />{' '}
        </div>
      ))}
    </div>
  );
}

const initialValues = {
  existingPassword: '',
  newPassword: '',
};

export type ChangePasswprdFormProps = {
  onSuccess: Function;
};

const ChangePasswordForm: FunctionComponent<ChangePasswprdFormProps> = ({ onSuccess }) => {
  const [authErrorMsg, setAuthErrorMsg] = useState(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { t } = useTranslation();
  //validator set for indicators
  const [activeValidators, setActiveValidators] = useState(() => getValidators(t));

  //base validation schema Formik
  const ChangePasswordSchema = useMemo(() => getChangePasswordSchema(t), [t]);
  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  //validate new password specific schema via YUP for indicator values; return error for Formik if errors
  const validateCheck = useCallback(
    values => {
      const validatorErrors = validateSchema(values.newPassword, NewPasswordSchema);
      const newActive = checkErrors(validatorErrors, activeValidators);
      setActiveValidators(newActive);
      let errs: any = {};
      if (Object.keys(validatorErrors).length) {
        errs.newPassword = 'Password rules not met';
      }
      //console.log('validated', validatorErrors, newActive, errs);
      return errs; //return just ehat to show in inputs
    },
    [activeValidators]
  );

  const onSubmit = useCallback(
    async (values: { existingPassword: string; newPassword: string }) => {
      try {
        setAuthErrorMsg(null);
        const user = await Auth.currentAuthenticatedUser();
        if (user) {
          const { existingPassword, newPassword } = values;
          const response = await Auth.changePassword(user, existingPassword, newPassword);
          console.log('Admin Change Password', response, user);
          onSuccess(user);
        } else {
          setAuthErrorMsg('Could not verify current user');
        }
        //else logout? unauthenticate?
      } catch (error) {
        const errMsg = error?.message || 'Change Password error';
        console.log('Admin Change Password error', error, errMsg);
        setAuthErrorMsg(errMsg);
      }
    },
    [onSuccess]
  );

  return (
    <div className="w-full max-w-md px-4 sm:px-0">
      <Formik
        enableReinitialize
        onSubmit={onSubmit}
        initialValues={initialValues}
        validationSchema={ChangePasswordSchema}
        validate={validateCheck}
      >
        {({ dirty, isSubmitting, isValid, errors }) => {
          return (
            <Form className="" data-test="change-password-form">
              <div className="flex flex-col">
                <TextInput
                  name="existingPassword"
                  placeholder={t('admin.changePassword.form.existing')}
                  //isAutofocus
                  data-test="existing-password"
                  autoComplete="new-password"
                  type="password"
                />
                <div className="relative">
                  <TextInput
                    name="newPassword"
                    placeholder={t('admin.changePassword.form.new')}
                    data-test="new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    showErrors={false}
                  />
                  <button
                    className="text-[color:var(--color-light-gray)] hover:text-gray-200 absolute top-0 right-0 translate-y-5"
                    type="button"
                    onClick={() => toggleShowPassword()}
                  >
                    <Icon name="view" className="h-5 w-6 mr-4" color="currentColor" />
                  </button>
                </div>
                <IndicatorDisplay validations={activeValidators} />

                <div className="flex flex-col items-start">
                  {authErrorMsg && <div className="text-red-500 font-medium mt-4">{authErrorMsg}</div>}

                  <div className="flex">
                    <Button
                      color="primary"
                      fill="solid"
                      notch="right"
                      buttonType="submit"
                      uppercase
                      className="pt-10"
                      full={true}
                      disabled={!dirty || !isValid || isSubmitting}
                    >
                      {t('admin.changePassword.form.button')}
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

export default ChangePasswordForm;
