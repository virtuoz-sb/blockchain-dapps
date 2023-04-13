import React, { useEffect, useState } from "react";
// import { withTranslation } from 'react-i18next'
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";

import darkImg from "../../../assets/img/icons/anyswap.png"
import { getBalanceStr, humanize, rounded, showSuccess, validateWalletAddres } from "../../../../common/libs/functions"
import jQuery from "jquery";
import { useAppContext } from "../../../../common/libs/context";
import { useAppDispatch } from '../../../../../app/hook'

import { coins, maticAddr } from "../../coins";
import Icon from "../../../../parts/Icon";

import { bestGas, bestGasPrice, maxSupply, mnDeadline, mnTkAmt } from "../../../../common/libs/constant";
import styles from "./RemoveLiquidity.module.sass";

import { Range, getTrackBackground } from "react-range";
import { approveErc20, balanceErc20 } from "../../../../common/libs/functions/integrate";
import contracts, { contractAddress } from "../../../../../contracts";
import { openNotification } from '../../../../../app/reducers/appSlice'
import { setLiquidityCount } from "../../swapSlice";

const STEP = 0.1;
const MIN = 0.0;
const MAX = 100;

const alertify = require("alertifyjs")
const $: any = jQuery

function RemoveLiquidity(props: any) {
    const dispatch = useAppDispatch()
    const { walletAddress, connectedNetwork } = useAppContext()
    const { contracts } = useAppContext()
    const { firstCoin, secondCoin, reserveFirst, reserveSecond, priceFirst, priceSecond } = props
    const { myShare, totalSupply } = props

    const [values, setValues] = useState([0]);

    const [firstAmount, setFirstAmount] = useState<any>(0)
    const [secondAmount, setSecondAmount] = useState<any>(0)

    const [isErr, setIsErr] = useState<number>(0)
    const [errMsg, setErrMsg] = useState<any>("Insufficient balance")

    const [isProcess, setIsProcess] = useState<boolean>(false)
    const [approvedLp, setApprovedLp] = useState<boolean>(false)
    const [perc, setPerc] = useState<number>(0)
    useEffect(() => {
        if(myShare*totalSupply === 0) setPerc(0)
        else if((myShare > 0) && (totalSupply > 0)) setPerc(myShare/totalSupply)
        else setPerc(0)
    }, [myShare, totalSupply, props.isModalOpen])


    useEffect(() => {
        if (window.web3 && window.web3.eth && validateWalletAddres(props.pairAddress)) {
            checkApproved()
        }
    }, [])

    const checkApproved = () => {
        const tokenContract = new window.web3.eth.Contract(contracts.abis.ERC20, props.pairAddress)
        return tokenContract.methods.allowance(walletAddress, contractAddress[connectedNetwork].FamosoRouter)
        .call()
        .then((res: any) => {
            const isApproved: boolean = Number(res)/(10**18) >= maxSupply
            setApprovedLp(isApproved)
        })
    }

    const clickRemoveSupply = () => {
        if(!validateWalletAddres(walletAddress)) return
        if(!validateWalletAddres(props.pairAddress)) return
        if(isProcess) return
        setIsProcess(true)
        if(approvedLp) return runRmoveLP()
        else{
            approveErc20(props.pairAddress, contractAddress[connectedNetwork].FamosoRouter, walletAddress)
            .then((res: any) => {
                setApprovedLp(true)
                return runRmoveLP()
            })
            .catch((err: any) => {
                setIsProcess(false)
            })
        }
    }

    const runRmoveLP = async () => {
        if(isProcess) return
        setIsProcess(true)

        const pp = Number(values[0])/100.0
        let rmvAmt: any = parseInt( String(myShare*pp*(10**18)) )
        if((1 - pp) < (10**(-18))) rmvAmt = parseInt(myShare)

        console.log("burn", walletAddress, rmvAmt)
        const router = new window.web3.eth.Contract(contracts.abis.FamosoRouter, contractAddress[connectedNetwork].FamosoRouter)    
        if(!firstCoin.isCoin && !secondCoin.isCoin){
            return router.methods.removeLiquidity(firstCoin.address, secondCoin.address, BigInt(String(rmvAmt)), mnTkAmt, mnTkAmt, walletAddress, mnDeadline)
            .send({ 
                from: walletAddress ,
                gas: bestGas,
                gasPrice: bestGasPrice
            })
            .then((res: any) => {
                console.log("removed liquidity", res)
                setIsProcess(false)
                setInitVals()
                clickClose()
                dispatch(setLiquidityCount(true))
                return dispatch(openNotification(res, "Liquidity removed"))
            })
            .catch((err: any) => {
                setIsProcess(false)
            })
        }
        else {
            return router.methods.removeLiquidityETH(firstCoin.isCoin ? secondCoin.address : firstCoin.address, BigInt(String(rmvAmt)), mnTkAmt, mnTkAmt, walletAddress, mnDeadline)
            .send({ 
                from: walletAddress,
                gas: bestGas,
                gasPrice: bestGasPrice 
            })
            .then((res: any) => {
                console.log("removed liquidity", res)
                setIsProcess(false)
                setInitVals()
                clickClose()
                dispatch(setLiquidityCount(true))
                return dispatch(openNotification(res, "Liquidity removed"))
            })
            .catch((err: any) => {
                setIsProcess(false)
            })
        }
    }

    const clickClose = () => {
        props.onHide()
        setInitVals()
    }

    const setInitVals = () => {
        setValues([0]);
        setFirstAmount(0)
        setSecondAmount(0)
        setIsErr(0)
        setErrMsg("Insufficient balance")
        setIsProcess(false)
        setPerc(0)
    }

    const [editFirst, setEditFirst] = useState<boolean>(false)
    const [editSecond, setEditSecond] = useState<boolean>(false)

    const moveRange = (vals: any) => {
        setValues(vals)
        let pp = Number(vals[0])/100.0
        if(!editFirst)setFirstAmount( rounded(Number(reserveFirst*perc*pp), 18) )
        if(!editSecond)setSecondAmount(rounded(reserveSecond*perc*pp, 18))
        setEditFirst(false)
        setEditSecond(false)
        // console.log("reserve values on remove", reserveFirst, reserveSecond, perc, pp, myShare, totalSupply)
    }

    const enterFirstAmount = (val: any) => {
        setFirstAmount(val)
        setEditFirst(true)
        setEditSecond(false)
        if(!(Number(firstAmount) > 0)) return
        let pp: any = 100.0 * Number(val) / firstAmount
        pp = Math.min(pp, 100.0)
        setSecondAmount(Number(reserveSecond*perc*pp).toFixed(4))
    }

    const enterSecondAmount = (val: any) => {
        setSecondAmount(val)
        setEditFirst(false)
        setEditSecond(true)
        if(!(Number(secondAmount) > 0)) return
        let pp: any = 100.0 * Number(val) / secondAmount
        pp = Math.min(pp, 100.0)
        setFirstAmount( Number(reserveFirst*perc*pp).toFixed(4) )
    }

    const getMySharePer = () => {
        if(Number(myShare) < 10**(-18)) return 0
        if(Number(totalSupply)< 10**(-18)) return "-"
        let p_val = Number(myShare)/Number(totalSupply)
        if(p_val < 0.0001) return "<0.01%"
        else return rounded(p_val, 5) + "%"
    }

    return (
        <>
            <Modal onHide={() => clickClose()} show={props.isModalOpen} centered className="modal-dialog-wallet-connect mx-400 show-claim-modal p-2" data-easein="whirlIn">
                <ModalBody className=" btn-back-gradient-reverse rounded p-4">
                    <div>
                        <div className="flex-col py-2">
                            
                            <div className="c-white text-3xl bold mb-1 text-center">
                                Remove Liquidity
                                <div className="close-window pointer right top" onClick={() => clickClose()}>
                                    <i className="fa remix ri-close-fill fs-32"></i>
                                </div>
                            </div>
                            <p className="c-white text-base mt-2 mb-3">Remove liquidity to receive tokens back</p>
                            <div className={styles.range}>
                                {/* <div className={styles.label}>Percent range</div> */}
                                <Range
                                    values={values}
                                    step={STEP}
                                    min={MIN}
                                    max={MAX}
                                    onChange={(values) => moveRange(values)}
                                    renderTrack={({ props, children }) => (
                                        <div
                                            onMouseDown={props.onMouseDown}
                                            onTouchStart={props.onTouchStart}
                                            style={{
                                                ...props.style,
                                                height: "36px",
                                                display: "flex",
                                                width: "100%",
                                            }}
                                        >
                                            <div
                                                ref={props.ref}
                                                style={{
                                                    height: "8px",
                                                    width: "100%",
                                                    borderRadius: "4px",
                                                    background: getTrackBackground({
                                                        values,
                                                        colors: ["#3772FF", "#E6E8EC"],
                                                        min: MIN,
                                                        max: MAX,
                                                    }),
                                                    alignSelf: "center",
                                                }}
                                            >
                                                {children}
                                            </div>
                                        </div>
                                    )}
                                    renderThumb={({ props, isDragged }) => (
                                        <div
                                            {...props}
                                            style={{
                                                ...props.style,
                                                height: "24px",
                                                width: "24px",
                                                borderRadius: "50%",
                                                backgroundColor: "#3772FF",
                                                border: "4px solid #FCFCFD",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "-33px",
                                                    color: "#fff",
                                                    fontWeight: 600,
                                                    fontSize: "14px",
                                                    lineHeight: "18px",
                                                    fontFamily: "Poppins",
                                                    padding: "4px 8px",
                                                    borderRadius: "8px",
                                                    backgroundColor: "#141416",
                                                }}
                                            >
                                                {values[0].toFixed(1)}
                                            </div>
                                        </div>
                                    )}
                                />
                                <div className={styles.scale}>
                                    <div className={styles.number}>0 %</div>
                                    <div className={styles.number}>100 %</div>
                                </div>
                            </div>
                            <p className="c-white text-base mb-2">You will receive</p>
                            <div className="back-dark7 flex-col rounded-m p-3">
                                <div className="flex flex-no-wrap white">
                                    <div className="flex mx-2 m-auto-v" id="lang-sel-dropdown">
                                        <div className="flex flex-no-wrap  m-auto-v pointer" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            {/* <img src={firstCoin.logoURI} className="size-24px rounded-50" alt="" />
                                            <span className="m-auto-v mx-1 pointer">{firstCoin.symbol}</span> */}
                                        </div>
                                    </div>

                                    <input
                                        type="text"
                                        className="right m-auto-v white blank-box w-fill sp-mx-w-160"
                                        placeholder="0.0"
                                        value={editFirst ? firstAmount : rounded(firstAmount, 18)}
                                        // disabled={true}
                                        onChange={(e: any) => enterFirstAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="text-center flex mb-2">
                            {/* <img src={changeSvg} alt="" className="m-auto-v img-white pointer" /> */}
                            <Icon name="plus" size="30" fill="#fff" className="c-white" />
                            {/* <img src={loadingPng} alt="" /> */}
                        </div>
                        <div className="flex-col mb-4">
                            {/* <p className=" c-white text-lg bold mb-1">Input</p> */}
                            <div className="back-dark7 flex-col rounded-m p-3">
                                <div className="flex flex-no-wrap">
                                    <div className="flex mx-2 m-auto-v" id="lang-sel-dropdown">
                                        <div className="flex flex-no-wrap  m-auto-v pointer" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            {/* <img src={secondCoin.logoURI} className="size-24px rounded-50" alt="" />
                                            <span className="m-auto-v mx-1 pointer">{secondCoin.symbol}</span> */}
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        className="right m-auto-v blank-box w-fill white sp-mx-w-160"
                                        placeholder="0.0"
                                        value={editSecond ? secondAmount : rounded(secondAmount, 18)}
                                        // disabled={true}
                                        onChange={(e: any) => enterSecondAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="mb-1">
                            Current prices and your pool share
                        </p>
                        <div className="flex-col font-DmSans border-dark p-2 rounded-m mb-4">
                            <div className="flex w-100 grid3-abs">
                                <div className="item text-center">{priceFirst}</div>
                                <div className="item text-center">{priceSecond}</div>
                                <div className="item text-center">{getMySharePer()}</div>
                            </div>
                            <div className="flex w-100 grid3-abs">
                                <span className="item text-center">{secondCoin.symbol} per {firstCoin.symbol}</span>
                                <span className="item text-center">{firstCoin.symbol} per {secondCoin.symbol}</span>
                                <span className="item text-center">Share of Pool</span>
                            </div>
                        </div>

                        <div
                            hidden={isErr > 0}
                            onClick={() => clickRemoveSupply()}
                            className={"flex text-center btn-hover btn-back-gradient p-2 rounded-m pointer c-white " + (isProcess ? "disabled" : "")}>
                            {/* <img className="m-auto-v mx-2" src={connectSvg} alt="" /> */}
                            <span hidden={isProcess} className="m-auto-v">Confirm</span>
                            <img hidden={!isProcess} style={{height: "10px", margin: "5px"}} src="/assets/images/EllipsisSpinner3.svg" alt="" />
                        </div>

                        <div
                            hidden={isErr !== 1}
                            className="flex text-center back-blue1 p-2 my-2 rounded-m pointer c-white">
                            {/* <img className="m-auto-v mx-2" src={connectSvg} alt="" /> */}
                            <span className="m-auto-v">{errMsg}</span>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
}

// export default withTranslation('common')(ConnectWallet)
export default RemoveLiquidity

