import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames"

import { useAppContext } from "../../../common/libs/context";

import { RootState } from '../../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../../app/hook'
import { LEFT_MENU } from "../poolSlice"
import styles from "./FamosoStaking.module.sass"

import Icon from "../../../parts/Icon";

import PoolRow from "./PoolRow";
import { famosoSwapGraphEndPoint } from "../../../common/libs/data";
import { getFamosoPairsFromGraph } from "../../../common/libs/functions/getData";

const FamosoStaking = () => {
    const activeMenu = useAppSelector((state: RootState) => state.pool.activeMenu)

    const {isConnected, walletAddress, isCorrectNet, connectedNetwork} = useAppContext()
    const activePool = useAppSelector((state: RootState) => state.pool.activePool)
       
    const url = window.location.pathname;

    const [pairs, setPairs] = useState<Array<any>>([])

    useEffect(() => {
        getPairs()
    }, [])

    const getPairs = () => {
        return getFamosoPairsFromGraph(connectedNetwork)
        .then((res: any) => {
            setPairs(res)
            console.log("get created famoso pairs", res)
        })
        .catch((err: any) => {
            console.log("get created famoso pairs", err)
            // return dispatch(getFamosoPairs())
        })
    }

    const _pairs = [
        {
          id: "0xe78e051086dab54fe38f00e8d9aedab234bd3ea9",
          token0: {
            id: "0x19623d433caa0cb8e56f42a368d7c7426180dc06",
            name: "citizen finance",
            symbol: "CIFI",
            logoURI: "/assets/images/cifi.png"
          },
          token1: {
            id: "0x86652c1301843b4e06fbfbbdaa6849266fb2b5e7",
            name: "Wrapped Matic",
            symbol: "WMATIC",
            logoURI: "/assets/images/wmatic.png"
          },
          totalSupply: "7.2199999999999993",
          volumeUSD: "0",
          single : false
        },
        {
          id: "0x19623d433caa0cb8e56f42a368d7c7426180dc06",
          single: true,
          token0: {
            id: "0x19623d433caa0cb8e56f42a368d7c7426180dc06",
            name: "citizen finance",
            symbol: "CIFI",
            logoURI: "/assets/images/cifi.png"
          },
          token1: {
            id: "0x86652c1301843b4e06fbfbbdaa6849266fb2b5e7",
            name: "USDT Token",
            symbol: "USDT",
            logoURI: "/assets/images/usdt.png"
          },
          totalSupply: "7.2199999999999993",
          volumeUSD: "0"
        }
    ]

    return (
        <div className={cn("mt-4",styles.stakingpool)} hidden={activeMenu !== LEFT_MENU.FARM}>
            <div className={cn("flex py-2 my-3 fc-grey bold", styles.topHead)}>
                <div className="flex pointer text-center flex-item m-auto">
                    <span className="m-auto-v">Pools</span>
                    {/* <i className="icofont-thin-down m-auto-v sort up"></i> */}
                </div>
                <div className="flex pointer text-center flex-item m-auto">
                    <span className="m-auto-v">Earned</span>
                    {/* <i className="icofont-thin-down m-auto-v sort up"></i> */}
                </div>
                <div className="flex pointer text-center flex-item m-auto">
                    <span className="m-auto-v">APR</span>
                    <Icon name={"calc"} viewBox="0 0 24 24" />
                </div>
                <div className="flex pointer text-center flex-item m-auto">
                    <span className="m-auto-v">Liquidity</span>
                    <Icon name={"info-mark"} viewBox="0 0 24 24" />
                </div>
            </div>
            <div hidden={!activePool}>
                {
                    _pairs && _pairs.map((x: any, index: any) => (
                        <PoolRow 
                            className={styles.group} 
                            item={x} 
                            key={index} />
                    ))
                }
                <div className={styles.bottom} hidden={!pairs || (pairs && (pairs.length < 10))}>
                    <div className={styles.content}>
                        <span>To Top</span>
                        <Icon name="arrow-bottom" className={styles.downIcon} size="12" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FamosoStaking;
