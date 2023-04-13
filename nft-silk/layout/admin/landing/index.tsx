import { ReactNode, FunctionComponent } from 'react';
import clsx from 'clsx';
import styles from './landing.module.scss';

type LandingProps = {
  children: ReactNode;
  className?: string;
};

const Landing: FunctionComponent<LandingProps> = ({ children, className }) => {
  return (
    <div className={styles.wrapper}>
      <div
        className={clsx(
          'h-screen bg-blue-900 backdrop-blur bg-opacity-50 overflow-hidden',
          styles.background,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Landing;
