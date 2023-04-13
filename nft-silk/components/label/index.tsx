import React, { FunctionComponent } from 'react';
import clsx from 'clsx';

import styles from './label.module.scss';

export type LabelProps = {
  id?: string;
  label?: string;
  className?: string;
  required?: boolean;
  editable?: boolean;
};

const lockStyle = {
  fontSize: 9,
  filter: 'grayscale(1)',
  opacity: 0.5,
};

export const Label: FunctionComponent<LabelProps> = ({ label, required, editable, className, id }) => {
  let symbolDisplay = <span></span>;

  if (required) {
    symbolDisplay = <span className={styles.required}>*</span>;
  }

  if (!editable) {
    symbolDisplay = <sup style={lockStyle}>&#128274;</sup>;
  }

  const labelCls = clsx(styles.label, className);

  return (
    <label htmlFor={id} className={labelCls}>
      {label} {symbolDisplay}
    </label>
  );
};
