import React from 'react';
import { Formik, Form } from 'formik';

import { Button } from '@components/button';
import { TextInput } from '@components/inputs/text-input';
import useNotificationStore from '@hooks/useNotificationStore';

export const Notification = () => {
  const { sendNotificationToAll } = useNotificationStore();

  const initialValues = {
    message: '',
    title: '',
  };

  const onSubmit = async values => {
    await sendNotificationToAll(values.title, values.message);
  };

  return (
    <Formik enableReinitialize onSubmit={onSubmit} initialValues={initialValues}>
      {() => {
        return (
          <div className="flex flex-col justify-center items-center mt-3">
            <Form className="w-1/2 flex flex-col justify-center" data-test="notification-form">
              <div className="text-white text-xl pb-3">Send notification to all connected users</div>
              <TextInput name="title" placeholder="Title" maxLength={20} />
              <TextInput name="message" placeholder="Message" maxLength={300} />

              <div>
                <Button buttonType="submit">Send</Button>
              </div>
            </Form>
          </div>
        );
      }}
    </Formik>
  );
};
