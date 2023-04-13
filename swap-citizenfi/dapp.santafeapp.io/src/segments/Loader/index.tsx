import React from "react";
import cn from "classnames";
import styles from "./Loader.module.sass";

const Loader = ({ className, color, hidden }: any) => {
  return (
    <div
      hidden={hidden? hidden : false}
      className={cn(styles.loader, className, {
        [styles.loaderWhite]: color === "white",
      })}
    ></div>
  );
};

export default Loader;
