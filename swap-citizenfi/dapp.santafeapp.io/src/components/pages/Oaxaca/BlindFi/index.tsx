import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import ethereumImg from "../../../../assets/img/icons/SantaFe2.png";
import { useAppContext } from "../../../common/libs/context";
import { shortAddress, copyText } from "../../../common/libs/functions"
import { approveErc20 } from "../../../common/libs/functions/integrate";

import { clickContract } from "./blindSlice"
import { getContractData, setApprovedCifi } from "./blindSlice"

import Minting from "./Minting";
import { useAppSelector, useAppDispatch } from '../../../../app/hook'
import { RootState } from '../../../../app/store'
import { balanceErc20 } from "../../../common/libs/functions/integrate";
import { classImgArr } from "../../../common/libs/image"
import itemBackImg from "../../../../assets/img/back/item-back.jpg";
import contracts from "../../../../contracts";
import { bestGas, bestGasPrice, NETWORK_TYPES } from "../../../common/libs/constant";
import { setActiveHeaderMenu } from "../../../../app/reducers/appSlice";

import { santaMetaData } from "../../../common/libs/metadata"

import cn from "classnames"
import styles from "./BlindFi.module.sass"

const alertify = require("alertifyjs")
function BlindFi() {
    const dispatch = useAppDispatch()
    const BlindBoxContracts = useAppSelector((state: RootState) => state.blind.BlindBoxContracts)
    const selectedContract = useAppSelector((state: RootState) => state.blind.selectedContract)
    const blindData2Mint = useAppSelector((state: RootState) => state.blind.blindData2Mint)
    const approvedCifi   = useAppSelector((state: RootState) => state.blind.approvedCifi)

    const { walletAddress, connectedNetwork } = useAppContext()
    const [isMint, setIsMint] = useState<boolean>(false)
    const [isMinted, setIsMinted] = useState<boolean>(false)
    const [isInit, setIsInit] = useState<boolean>(false)

    const isLoaded = useAppSelector((state: RootState) => state.blind.isLoaded)

    const [isProcess, setIsProcess]= useState<boolean>(false)

    const url = window.location.pathname;
    useEffect(() => {
        dispatch(setActiveHeaderMenu(11))
        if (isLoaded) return
    }, [dispatch, walletAddress, url])

    const drawItem = () => {
        if(connectedNetwork === NETWORK_TYPES.BSC_MAIN) return
        // setIsProcess(true)
    }

    const arr_6 = [1, 2, 3, 4, 5, 6]

    return (
        <div className={styles.blindFi}>
            <p className={styles.title}>Mystery Box</p>
            <div className={styles.drawBtn}>
                <div 
                    className="bd-shiny btn-hover active c-white text-center btn-back-gradient bold text-2xl py-3 px-8 mt-4 pointer"  
                    hidden={isProcess} 
                    onClick={() => drawItem()}>
                    Ended
                </div>
                <div className="flex">
                    <div className="m-auto">
                        <div className="loader-animation my-4" hidden={!isProcess}></div>
                    </div>
                </div>
            </div>
            <div className={styles.boxContents}>
                {
                    arr_6.map((item: any, index: any) => 
                        <div key={index} className={styles.boxItem}>
                            <img src={santaMetaData[2][item].image} alt="" />
                            <div className={styles.bottomContent}>
                                <div className={styles.subTitle}>{santaMetaData[2][item].name}</div>
                                <div className={styles.desc}>
                                    {santaMetaData[2][item].description}
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
            <Minting
                isModalOpen={isProcess}
                onHide={() => setIsProcess(false)}
            />
        </div>
    )
}

export default BlindFi;
