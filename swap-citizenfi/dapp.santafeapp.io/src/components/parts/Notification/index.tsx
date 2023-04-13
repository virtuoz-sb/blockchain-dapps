import React from "react";
import cn from "classnames";
import styles from "./Notification.module.sass";

import { useAppContext } from "../../common/libs/context";
import { RootState } from '../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../app/hook'
import { closeNotification } from "../../../app/reducers/appSlice";
import { networkScan } from "../../common/libs/data";

const Notification = ({ className, value, setValue }: any) => {
    const dispatch = useAppDispatch()
    const notification = useAppSelector((state: RootState) => state.app.showNotification)
    const { connectedNetwork } = useAppContext()
    const close = () => {
        return dispatch(closeNotification())
    }
  return (
    <div className={cn(styles.transaction, {[styles.active]: notification.show})}>
        <span className={cn(styles.close, "btn-hover-nb")} onClick={() => close()}>
            <i className="icofont-close-line text-2xl bold"></i>
        </span>
        <div className={cn(cn(styles.leftPad, "btn-hover"))} onClick={() => close()}>
            <i className="icofont-check-circled text-2xl"></i>
        </div>
        <div className={styles.rightPad}>
            <span className={styles.notTitle} hidden={notification.title !== ""}>Transaction receipt</span>
            <span className={styles.notTitle} hidden={notification.title === ""}>{notification.title}</span>
            <a 
                href={networkScan[connectedNetwork].url + "tx/" + notification.tx} 
                rel="noreferrer" 
                target="_blank" 
                className="btn-hover-nb">
                View on {networkScan[connectedNetwork].title}
            </a>
        </div>
    </div>
  );
};

export default Notification;
