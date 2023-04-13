import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames"

import { useAppContext } from "../../../common/libs/context";

import { RootState } from '../../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../../app/hook'
import { LEFT_MENU } from "../poolSlice"
import { MENU_LIST, NetworkArray, NETWORK_TYPES, NUM_ARR } from "../../../common/libs/constant";

import styles from "./FamosoStaking.module.sass"
import ProvideLiquidity from "./ProvideLiquidity";
import { approveErc20, balanceErc20 } from "../../../common/libs/functions/integrate";
import contracts, { contractAddress } from "../../../../contracts";
import { getBalanceStr, showError, showSuccess } from "../../../common/libs/functions";
import { bestGas, bestGasPrice } from "../../../common/libs/constant"

const FamosoStaking = () => {
    const dispatch = useAppDispatch()
    const activeMenu = useAppSelector((state: RootState) => state.pool.activeMenu)

    const {isConnected, walletAddress, isCorrectNet, connectedNetwork} = useAppContext()
    const [showProvide, setShowProvide] = useState<boolean>(false)

    const [approved, setApproved] = useState<boolean>(false)
    const [balancePair, setBalancePair] = useState<any>(0)

    const [doingApprove, setDoingApprove] = useState<boolean>(false)
    const [doingWithdraw, setDoingWithdraw] = useState<boolean>(false)
    const [doingWithdrawAll, setDoingWithdrawAll] = useState<boolean>(false)
    const [doingProvide, setDoingProvide] = useState<boolean>(false)

    const [myAmount, setMyAmount] = useState<number>(0)
    
    const pairToken = '0xe78e051086dab54fe38f00e8d9aedab234bd3ea9'
    const url = window.location.pathname;


    useEffect(() => {
        if(isCorrectNet && isConnected) init()
    }, [walletAddress, isCorrectNet, isConnected, url])

    function init(){
        if(connectedNetwork === NETWORK_TYPES.BSC_MAIN || connectedNetwork === NETWORK_TYPES.BSC_TEST) return
        if(window.web3 && window.web3.eth){
            getBalancePair() 
            checkApproved()
            getUserInfo()
        }
    }
        
    const approveToken = () => {
        if(doingApprove) return
        if(approved) return showError("You have already approved token")
        setDoingApprove(true)
        return approveErc20(pairToken, contractAddress[connectedNetwork].FamosoStaking, walletAddress)
        .then((res: any) => {
            setApproved(true)
            setDoingApprove(false)
        })
        .catch((err: any) => {
            setDoingApprove(false)
        })
    }

    const clickProvide = () => {
        if(!approved) showError("Please approve LP token first")
        if(doingProvide) return
        setDoingProvide(true)
        setShowProvide(true)
    }

    const getBalancePair = () => {
        balanceErc20(pairToken, walletAddress)
        .then((res: any) => {
            setBalancePair(res)
        })
    }

    const withDraw = () => {
        if(doingWithdraw) return
        if(window.web3 && window.web3.eth){
            let FamosoStaking: any = new window.web3.eth.Contract(contracts.abis.FamosoStaking , contractAddress[connectedNetwork].FamosoStaking)
            
            if(isConnected && isCorrectNet){
                setDoingWithdraw(true)
                FamosoStaking.methods.reward()
                .send({
                    from: walletAddress,
                    gas: bestGas, 
                    gasPrice: bestGasPrice
                })
                .then((res: any) => {
                    console.log("deposit res", res)
                    setDoingWithdraw(true)
                    return showSuccess("Deposit successed")
                })
                .catch((err: any) => {
                    setDoingWithdraw(false)
                })
            }
        }
    }

    const withdrawAll = () => {
        if(doingWithdrawAll) return
        if(window.web3 && window.web3.eth){
            let FamosoStaking: any = new window.web3.eth.Contract(contracts.abis.FamosoStaking , contractAddress[connectedNetwork].FamosoStaking)
            
            if(isConnected && isCorrectNet){
                setDoingWithdrawAll(true)
                FamosoStaking.methods.withdraw()
                .send({
                    from: walletAddress,
                    gas: bestGas, 
                    gasPrice: bestGasPrice
                })
                .then((res: any) => {
                    console.log("deposit res", res)
                    setDoingWithdrawAll(false)
                    return showSuccess("Deposit successed")
                })
                .catch((err: any) => {
                    setDoingWithdrawAll(false)
                })
            }
        }
    }

    const closeProvide = () => {
        setShowProvide(false)
        setDoingProvide(false)
    }

    const checkApproved = () => {
        const tokenContract = new window.web3.eth.Contract(contracts.abis.ERC20, pairToken)
            return tokenContract.methods.allowance(walletAddress, contractAddress[connectedNetwork].FamosoStaking)
            .call()
            .then((res: any) => {
                const isApproved: boolean = Number(res) >= 10**18
                return setApproved(isApproved)
            })
    }

    const getUserInfo = () => {
        if(window.web3 && window.web3.eth){
            let FamosoStaking: any = new window.web3.eth.Contract(contracts.abis.FamosoStaking , contractAddress[connectedNetwork].FamosoStaking)
            
            if(isConnected && isCorrectNet){
                FamosoStaking.methods.userInfo(walletAddress)
                .call()
                .then((res: any) => {
                    // console.log("userinfo from FamosoStaking", res, res.amount)
                    setMyAmount(res.amount)
                })
                .catch((err: any) => {
                })
            }
        }
    }

    return (
        <div className={cn("pt-4",styles.stakingpool)} hidden={activeMenu !== LEFT_MENU.FARM}>
            <div className={styles.toppart}>
                <p className={styles.title}>Famoso Pool</p>
            </div>
            <div className={styles.bottompart}>
                <div className={styles.cards}>
                    <div className={styles.card}>
                        <div className={styles.topCont}>
                            <img 
                                src={"/assets/img/cifi.png"} 
                                alt="" />
                            <p className={styles.name}>
                                { "META Income" }
                            </p>
                            <p className={styles.num}>{0}</p>
                        </div>
                        <div className={cn(styles.action)} onClick={() => withDraw()}>
                            <span hidden={doingWithdraw}>{"Withdraw"}</span>
                            <span className="loader-animation-sm" hidden={!doingWithdraw}></span>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.topCont}>
                            <img 
                                src={ "/assets/images/pair.png" } 
                                alt="" />
                            <p className={styles.name}>
                                { "CIFI/WMATIC LP Stake" }
                            </p>
                            <p className={styles.num}>{getBalanceStr(myAmount, 18, 3)}</p>
                        </div>
                        <div className={styles.action} onClick={() => approveToken()}>
                            <span hidden={doingApprove}>{ approved ? "Approved" : "Approve" }</span>
                            <span className="loader-animation-sm" hidden={!doingApprove}></span>
                        </div>
                    </div>
                </div>
                <div className={styles.buttons}>
                    <div className={styles.btn} onClick={() => withdrawAll()}>
                        <span hidden={doingWithdrawAll}>{"Withdraw All"}</span>
                        <span className="loader-animation-sm" hidden={!doingWithdrawAll}></span>
                    </div>
                    <div className={styles.btn} onClick={() => clickProvide()}>
                        <span hidden={doingProvide}>{"Provide Liquidity"}</span>
                        <span className="loader-animation-sm" hidden={!doingProvide}></span>
                    </div>
                </div>
            </div>

            <ProvideLiquidity 
                isModalOpen={showProvide}
                onHide={() => closeProvide()}
                balancePair={balancePair}
                pairAddress={pairToken}
            />
        </div>
    )
}

export default FamosoStaking;
