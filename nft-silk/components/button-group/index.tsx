import React, { FunctionComponent, useEffect, useState } from 'react';
import clsx from 'clsx';
import { filter, isArray, map } from 'lodash-es';

import styles from './button-group.module.scss';

export type ButtonGroupProps = {
  buttons: string[];
  className?: string;
  onClick: Function;
  requireOne?: boolean; // requires at least one option to be selected always
  toggleable?: boolean;
  value?: string | string[];
  [props: string]: any; // all other props
};

export const ButtonGroup: FunctionComponent<ButtonGroupProps> = ({
  buttons,
  className,
  onClick,
  requireOne = false,
  toggleable = false,
  value,
  ...props
}) => {
  const [selectedButton, setSelectedButton] = useState<string[]>([]);

  const countClass =
    buttons.length === 2
      ? styles.two
      : buttons.length === 3
      ? styles.three
      : buttons.length === 4
      ? styles.four
      : styles.five;

  const data = buttons.length === 2 ? [buttons[0], '', buttons[1]] : buttons;

  const handleClick = button => {
    if (toggleable) {
      let buttons =
        selectedButton.indexOf(button) > -1 ? filter(selectedButton, b => b !== button) : [...selectedButton, button];

      // if requireOne is true, don't let selected buttons go below 1
      if (!requireOne || (requireOne && buttons.length >= 1)) {
        setSelectedButton(buttons);
        onClick(buttons);
      }
    } else {
      setSelectedButton([button]);
      onClick(button);
    }
  };

  useEffect(() => {
    if (value !== undefined) {
      setSelectedButton(isArray(value) ? value : [value]);
    }
  }, [value]);

  return (
    <div className={clsx(styles.buttonGroup, className)}>
      {map(data, (button, index) => (
        <div
          className={clsx(styles.button, countClass, {
            [styles.first]: index === 0,
            [styles.last]: index === data.length - 1,
            [styles.middle]: index !== 0 && index !== data.length - 1,
            [styles.seperator]: index !== 0 && index !== data.length - 1 && buttons.length === 2,
            [styles.selected]: selectedButton.indexOf(button) > -1,
            [styles.borderLeft]:
              index !== 0 && index !== data.length - 1 && selectedButton.indexOf(data[index - 1]) > -1,
            [styles.borderRight]:
              index !== 0 && index !== data.length - 1 && selectedButton.indexOf(data[index + 1]) > -1,
          })}
          onClick={() => handleClick(button)}
          key={button}
        >
          <div className={styles.text}>{button}</div>
        </div>
      ))}
    </div>
  );
};
