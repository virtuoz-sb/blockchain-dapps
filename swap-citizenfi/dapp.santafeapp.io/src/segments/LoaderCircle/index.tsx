import React from "react";
import cn from "classnames";
import styles from "./LoaderCircle.module.sass";

const Loader = ({ className, hidden, style }: any) => {
  return <div hidden={hidden ? hidden : false} style={style? style: {}} className={cn(styles.loader, className)}></div>;
};

export default Loader;
