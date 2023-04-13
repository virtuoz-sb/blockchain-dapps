import React from "react";

const Image = (props: any) => {
  // const darkMode = useDarkMode(false);
  const darkMode: any = {}
  const { src, srcDark, srcSet, srcSetDark, alt } = props
  return (
    <img
      srcSet={darkMode.value ? srcSetDark : srcSet}
      src={darkMode.value ? srcDark : src}
      alt={alt}
    />
  );
};

export default Image;
