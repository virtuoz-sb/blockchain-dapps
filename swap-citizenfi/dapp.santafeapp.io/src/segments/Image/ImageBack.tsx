import React, { useState, useRef } from "react";
// import useDarkMode from "use-dark-mode";
import cn from "classnames";
import styles from "./ImageBack.module.sass"

import Loader from "../LoaderCircle";
import { useIntersection } from "../Image/intersectionObserver";

const ImageBack = (props: any) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef: any = useRef();
    useIntersection(imgRef, () => {
        setIsInView(true);
    });

    const handleOnLoad = () => {
        setTimeout(() => {
        setIsLoaded(true);
        }, 1000);
    };
    const { src, alt, className } = props
    return (
    <div 
        ref={imgRef}
        className={className} 
        style={{background: "url('" + (!!isLoaded ? src : "") + "')"}}>
        {isInView && (
          <>
            <div className={cn("w-100 h-100 flex", styles.loadContainer)} hidden={!!isLoaded}>
              <Loader className={cn(styles.load, 'm-auto')} />
            </div>
            <img
              className={cn('image', {['isLoaded']: !!isLoaded})}
              src={src}
              alt=""
              hidden={true}
              onLoad={handleOnLoad}
            />
          </>
        )}
    </div>
    );
};

export default ImageBack;
