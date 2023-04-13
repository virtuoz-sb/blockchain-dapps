import React, { useState, useEffect } from "react";

import { useAppContext } from "../../../common/libs/context";

import { approveErc20, balanceErc20 } from "../../../common/libs/functions/integrate";

import plusSvg from "../../../../assets/img/icons/svg/plus.svg"

import Switch from "../../../parts/Switch";
import Icon from "../../../parts/Icon";

import cn from "classnames"
import styles from "./SwapSetting.module.sass"
import { changeStorage } from "../../../common/libs/functions";

function Setting() {
    const { isConnected, walletAddress, isCorrectNet, appSetting, changeTheme } = useAppContext()

    const [expMode, setExpMode] = useState<boolean>(false)
    const [multi, setMulti] = useState<boolean>(false)
    const [sounds, setSounds] = useState<boolean>(false)

    const [curSpeed, setCurSpeed] = useState<any>(0)
    const [curToler, setCurToler] = useState<any>(0)

    useEffect(() => {

    }, [walletAddress, isCorrectNet, isConnected])

    useEffect(() => {
        setCurSpeed(appSetting.swap.speed)
        setCurToler(appSetting.swap.tolerance)
    }, [appSetting])    

    const changeToler = (val: any) => {
        setCurToler(100)
    }

    const Save = () => {
        
    }

    const speed_arr = ['Standard (5)', 'Fast (6)', 'Instant (7)']
    const tolerance_arr = ['0.1%', '0.5%', '1.0%']

    return (
        <div className={cn(styles.swapSetting, "font-DmSans c-white")}>
            <div className="flex-col py-4">
                <div className="flex my-2">
                    <span>Dark Mode</span>
                    <span className="right rounded-x">
                        <Switch value={appSetting.theme} setValue={(val: boolean) => changeTheme('theme', val)} />
                    </span>
                </div>
                <p className="text-base">Default Transaction Speed (GWEI)</p>
                <div className="flex text-center mb-3">
                    {
                        speed_arr.map((item: any, index: any) => 
                            <span 
                            onClick={() => setCurSpeed(index)}
                            className={cn("rounded-btn-x btn-hover py-2 white px-3 mx-1 back-dark7 pointer", styles.btn, {[styles.active]: index === curSpeed})} 
                            key={index}>
                                {item}
                            </span>
                        )
                    }
                </div>
                <div className="my-2 bd-b-dark mt-3 mb-4 mx-4"></div>
                {/* <p>Swaps and Liquidity</p> */}
                <p className="text-base">Slippage Tolerance</p>
                <div className="flex text-center mb-3 ff-sans">
                    {
                        tolerance_arr.map((item: any, index: any) =>
                            <span 
                                onClick={() => setCurToler(index)}
                                key={index}
                                className={cn("rounded-btn-x btn-hover py-2 px-3 white mx-1 back-dark7 pointer", styles.btn, styles.toleranceBtn, {[styles.active]: index === curToler})}>
                                {item}
                            </span>
                        )
                    }
                    <span className="rounded-btn-x py-2 px-3 white mx-1 back-dark7 pointer">
                        <input 
                            type="text" 
                            className="w-36px blank-box" 
                            placeholder="2 " 
                            id="" 
                            onChange={(e: any) => changeToler(e.target.value)}
                            />
                        %
                    </span>
                </div>
                <div className="flex my-2">
                    <span>Tx deadline (mins)</span>
                    <span className="right rounded back-dark7">
                        <input type="text" name="" id="" placeholder="2" className="rounded blank-box mx-w-100px text-lg px-4 py-1" />
                    </span>
                </div>
                
                <div className="flex my-2">
                    <span>Expert Mode</span>
                    <span className="right rounded-x">
                        <Switch value={expMode} setValue={setExpMode} />
                    </span>
                </div>
                
                <div className="flex my-2">
                    <span>Disable Multihops</span>
                    <span className="right rounded-x">
                        <Switch value={multi} setValue={setMulti} />
                    </span>
                </div>
                
                <div className="flex my-2">
                    <span>Flippy sounds</span>
                    <span className="right rounded-x">
                        <Switch value={sounds} setValue={setSounds} />
                    </span>
                </div>
            </div>
            
            <div
                onClick={() => Save()}
                className="flex btn-hover text-center btn-back-gradient-reverse p-2 my-2 rounded-m pointer c-white">
                {/* <img className="m-auto-v mx-2" src={connectSvg} alt="" /> */}
                <span className="m-auto-v">Save</span>
            </div>
        </div>
    )
}

export default Setting;
