import React, { useEffect, useState } from "react";
// import { withTranslation } from 'react-i18next'
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";

import darkImg from "../../../../assets/img/icons/anyswap.png"
import { getBalanceStr, humanize, isNumeric, rounded, showError, showSuccess, validateWalletAddres } from "../../../../../common/libs/functions"
import jQuery from "jquery";
import { useAppContext } from "../../../../../common/libs/context";
import { useAppDispatch } from '../../../../../../app/hook'

import Icon from "../../../../../parts/Icon";

import { bestGas, bestGasPrice, mnTkAmt } from "../../../../../common/libs/constant";
import cn from "classnames"
import styles from "./SupplyStake.module.sass";

import { Range, getTrackBackground } from "react-range";
import { balanceErc20 } from "../../../../../common/libs/functions/integrate";
import { contractAddress } from "../../../../../../contracts";
import { openNotification } from "../../../../../../app/reducers/appSlice";
import { setLiquidityCount } from "../../../../Swap/swapSlice";
const STEP = 0.1;
const MIN = 0.0;
const MAX = 100;

const alertify = require("alertifyjs")
const $: any = jQuery

function SupplyStake({onHide, isModalOpen, pair}: any) {
    const dispatch = useAppDispatch()
    const { walletAddress, connectedNetwork } = useAppContext()
    const { contracts } = useAppContext()

    const [values, setValues] = useState([0]);

    

    const [isErr, setIsErr] = useState<number>(0)
    const [errMsg, setErrMsg] = useState<any>("Insufficient balance")

    const [isProcess, setIsProcess] = useState<boolean>(false)

    const [enterAmount, setEnterAmount] = useState<any>("")
    const [doingDeposit, setDoingDeposit] = useState<boolean>(false)
    const [myBalance, setMyBalance] = useState<any>(0)
    const [mySupply, setMySupply] = useState<any>(0)
    const [userEdited, setUserEdited] = useState<boolean>(false)

    useEffect(() => {
        if (window.web3 && window.web3.eth) {
            getInitValues()
        }
    }, [])

    const getInitValues = () => {
        getMyBalance()
        getStakingInfo()
    }

    const userEnterAmount = (val: any) => {
        setEnterAmount(val)
        setValues([Math.min(100, 100.0 * Number(val)/myBalance)])
        setUserEdited(true)
    }

    const moveRange = (vals: any) => {
        console.log("moveRange", vals)
        setValues(vals)
        if((100.0 - Number(values[0])) < (10**(-18)))setEnterAmount(myBalance)
        else setEnterAmount(Number(values[0])/100.0 * myBalance)
        setUserEdited(false)
    }
    
    const getMyBalance = () => {
        const tokenContract = new window.web3.eth.Contract(contracts.abis.ERC20, pair.id)
        balanceErc20(pair.id, walletAddress)
        .then((res: any) => {
            setMyBalance(rounded(Number(res) / (10**18), 5))
        })
    }

    const getStakingInfo = () => {
        const famosoStaking = new window.web3.eth.Contract(contracts.abis.FamosoStaking, contractAddress[connectedNetwork].FamosoStaking)
        famosoStaking.methods.userInfo(walletAddress)
        .call()
        .then((res: any) => {
            console.log("staking info", res)
            setMySupply(Number(res.amount)/(10**18))
        })
        .catch((err: any)  => {
            console.log("staking info", err)
        })
    }

    const clickSupply = () => {
        if(doingDeposit) return 
        if(!validInput()) return
        if(!isNumeric(String(enterAmount))) return showError("Please input correct amount value")
        if(Number(enterAmount) > Number(myBalance)) return showError("Your supply amount is larger than your LP token balance")
        setDoingDeposit(true)

        if(pair.single === true){
            const CifiStaking = new window.web3.eth.Contract(contracts.abis.CifiStaking, contractAddress[connectedNetwork].CifiStaking)
            return supplyHandler(CifiStaking)
        }else{
            const famosoStaking = new window.web3.eth.Contract(contracts.abis.FamosoStaking, contractAddress[connectedNetwork].FamosoStaking)
            return supplyHandler(famosoStaking)
        }

    }

    const supplyHandler = (StakingContract: any) => {
        StakingContract.methods.deposit(enterAmount*(10**18))
        .send({
            from: walletAddress,
            gasPrice: bestGasPrice,
            gas: bestGas
        })
        .then((res: any) => {
            setDoingDeposit(false)
            getInitValues()
            setInitValues()
            dispatch(setLiquidityCount(true))
            return dispatch(openNotification(res, "Supply success"))
        })
        .catch((err: any)  => {
            console.log("deposit info", err)
            setDoingDeposit(false)
        })
    }

    const validInput = () => {
        if(Number(enterAmount) > Number(myBalance)) return showError("Entered supply amount is larger than your wallet's balance")
        return true
    }

    const clickClose = () => {
        onHide()
        setInitValues()
    }

    const setInitValues = () => {
        setValues([0]);
        setIsErr(0)
        setErrMsg("Insufficient balance")
        setIsProcess(false)
        setEnterAmount("")
        setDoingDeposit(false)
        setMyBalance(0)
        setMySupply(0)
        setUserEdited(false)
    }

    return (
        <>
            <Modal onHide={() => clickClose()} show={isModalOpen} centered className={cn("modal-dialog-wallet-connect show-claim-modal mx-400 p-2", styles.supplyStake)} data-easein="whirlIn">
                <ModalBody className=" btn-back-gradient-reverse rounded p-4">
                    <div>
                        <div className="flex-col py-2">
                            <div className="close-window pointer right top" onClick={() => clickClose()}>
                                <i className="fa remix ri-close-fill fs-32"></i>
                            </div>
                            <p className="c-white text-3xl bold mb-1 text-center">
                                Stake {pair.single ? "CIFI" : "LP token"}
                            </p>
                            <p className="c-white text-base mt-2 mb-4">Stake {pair.single ? "CIFI" : "LP"} token to earn tokens back</p>
                            <div className={styles.range}>
                                <div className={styles.label} hidden={true}>Percent range</div>
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
                            <p className="c-white text-base mt-2 mb-4">Enter amount to supply</p>
                            <div className="back-dark7 flex-col rounded-m p-3">
                                <div className="flex">
                                    <span className="left fc-dark">{pair.token0.symbol + (pair.single ? "" : "-" + pair.token1.symbol)}</span>
                                    <div className="right flex fc-dark" onClick={() => userEnterAmount(myBalance)}>
                                        <span className="mr-2 pointer bold fc-green" >MAX</span>
                                        {/* ~$1990 */}
                                        {myBalance}
                                    </div>
                                </div>
                                <div className={cn("flex flex-no-wrap white", styles.inputBox)}>
                                    <div className="flex m-auto-v" id="lang-sel-dropdown">
                                        <div className="flex flex-no-wrap  m-auto-v pointer" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <img src={"/assets/images/cifi.png"} className={styles.tokenLogo} alt="" />
                                            <img hidden={pair.single} src={"/assets/images/matic.png"} className={styles.tokenLogo} alt="" />
                                        </div>
                                    </div>

                                    <input
                                        type="text"
                                        className="right m-auto-v white blank-box w-fill sp-mx-w-160"
                                        placeholder="0.0"
                                        value={userEdited ? enterAmount : rounded(enterAmount, 5)}
                                        // disabled={true}
                                        onChange={(e: any) => userEnterAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="my-1" hidden={true}>
                            Current prices and your pool share
                        </p>
                        <div className="flex-col font-DmSans border-dark p-3 rounded-m my-4" hidden={true}>
                            <div className="flex w-100 my-1 grid3-abs">
                                <div className="item text-center">{3}</div>
                                <div className="item text-center">{rounded(mySupply, 3)}</div>
                                <div className="item text-center">100%</div>
                            </div>
                            <div className="flex w-100 my-1 grid3-abs">
                                <span className="item text-center">Total Supply</span>
                                <span className="item text-center">Your Supply</span>
                                <span className="item text-center">Share of Pool</span>
                            </div>
                        </div>

                        <div
                            hidden={isErr > 0}
                            onClick={() => clickSupply()}
                            className={"flex text-center back-blue p-2 my-2 rounded-m pointer c-white " + (isProcess ? "disabled" : "")}>
                            {/* <img className="m-auto-v mx-2" src={connectSvg} alt="" /> */}
                            <span className="m-auto-v btn-hover" hidden={doingDeposit}>Confirm</span>
                            <img hidden={!doingDeposit} style={{height: "12px", margin: "5px 20px", cursor: "not-allowed"}} src="/assets/images/EllipsisSpinner3.svg" alt="" />
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
export default SupplyStake

