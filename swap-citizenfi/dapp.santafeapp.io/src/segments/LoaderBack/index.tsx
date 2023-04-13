import React from "react";
import cn from "classnames";
import styles from "./LoaderBack.module.sass";

const LoaderBack = ({ className, color, hidden }: any) => {
  return (
    <div
      hidden={hidden? hidden : false}
      className={cn(styles.loader, className, {
        [styles.loaderWhite]: color === "white",
      })}
    ></div>
  );
};

export default LoaderBack;
