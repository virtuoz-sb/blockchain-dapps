import React, { useState, useRef } from "react";
import cn from "classnames";
import styles from "./ImageBack.module.sass"

import Loader from "../LoaderCircle";
import LoaderBack from "../LoaderBack"
import { useIntersection } from "../Image/intersectionObserver";

const ImageObject = (props: any) => {
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

    const brokenImage = "/images/icons/gradient.png"
    const { src, alt, className } = props
    return (
    <div 
        ref={imgRef}
        className={cn(className, "w-100 h-100")} >
        {isInView && (
          <>
            <div className={cn("w-100 h-100 flex", styles.loadContainer)} hidden={!!isLoaded}>
              {/* <Loader className={cn(styles.load, 'm-auto')} /> */}
              {/* <LoaderBack /> */}
              <img 
                className="image"
                src="/assets/img/grey.jpg" 
                alt="" />
            </div>
            <img
              className={cn('image', {['isLoaded']: !!isLoaded})}
              src={src}
              alt=""
              hidden={!isLoaded}
              onLoad={handleOnLoad}
            />
          </>
        )}
    </div>
    );
};

export default ImageObject;
