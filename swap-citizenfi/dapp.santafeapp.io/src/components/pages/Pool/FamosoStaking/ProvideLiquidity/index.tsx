import React, { useEffect, useState } from "react";
// import { withTranslation } from 'react-i18next'
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";

import darkImg from "../../../../../assets/img/icons/anyswap.png"
import { showError, getBalanceStr, humanize, showSuccess, validateWalletAddres } from "../../../../common/libs/functions"
import jQuery, { isNumeric } from "jquery";
import { useAppContext } from "../../../../common/libs/context";
import { useAppDispatch } from '../../../../../app/hook'

import Icon from "../../../../parts/Icon";

import contracts from "../../../../../contracts"
import { contractAddress } from "../../../../../contracts"
import { bestGas, bestGasPrice } from "../../../../common/libs/constant"

import cn from "classnames"
import styles from "./ProvideLiquidity.module.sass"
import { balanceErc20 } from "../../../../common/libs/functions/integrate";


function ProvideLiquidity(props: any) {
    const dispatch = useAppDispatch()
    const { walletAddress, connectedNetwork, isConnected, isCorrectNet } = useAppContext()
    const { balancePair, pairAddress } = props

    const [amount, setAmount] = useState<any>("")
    const [totalSupply, setTotalSupply] = useState<any>(0)

    useEffect(() => {
        if(window.web3 && window.web3.eth){
            getTotalSupply()
        }
    }, [])

    const getTotalSupply = () => {
        balanceErc20(pairAddress, contractAddress[connectedNetwork].FamosoStaking)
        .then((res: any) => {
            setTotalSupply(Number(res)/(10**18))
        })
    }

    const enterAmount = (e: any, val: any) => {
        if(!isNumeric(val)) {
            return showError("Please input correct value")
        }
        console.log(val)
        setAmount(val)
    }

    const clickConfirm = () => {
        let provideAmount: any = Number(amount)
        if(!isNumeric(amount)) {
            return showError("Please input correct value")
        }else if (provideAmount > Number(balancePair)/(10**18)){
            return showError("Entered amount is larger than your balance")
        }else{
            if(window.web3 && window.web3.eth){
                let FamosoStaking: any = new window.web3.eth.Contract(contracts.abis.FamosoStaking , contractAddress[connectedNetwork].FamosoStaking)
                
                if(isConnected && isCorrectNet){
                    FamosoStaking.methods.deposit(BigInt(provideAmount*(10**18)))
                    .send({
                        from: walletAddress,
                        gas: bestGas, 
                        gasPrice: bestGasPrice
                    })
                    .then((res: any) => {
                        console.log("deposit res", res)
                        return showSuccess("Deposit successed")
                    })
                    .catch((err: any) => {})
                }
            }
        }
    }

    const clickClose = () => {
        props.onHide()
        setAmount("")
        setTotalSupply(0)
    }

    return (
        <>
            <Modal onHide={() => clickClose()} show={props.isModalOpen} centered className={cn("modal-dialog-wallet-connect show-claim-modal p-2", styles.provideLiquidity)} data-easein="whirlIn">
                <ModalBody className=" btn-back-gradient-reverse rounded p-4">
                    <div>
                        <div className="flex-col py-2">
                            <div className="close-window pointer right top" onClick={() => clickClose()}>
                                <i className="fa remix ri-close-fill fs-32"></i>
                            </div>
                            <p className="c-white text-3xl bold mb-1 text-center">Provide Liquidity</p>
                            <p className="c-white text-base mt-2 mb-4">Provide liquidity to get pool rewards</p>
                            <p className="c-white text-base mt-2 mb-4">Enter amount to provide</p>
                            <div className="back-dark7 flex-col rounded-m p-3">
                                <div className="flex">
                                    <span className="left fc-dark">{""}</span>
                                    <div className="right flex fc-dark">
                                        <span className="mr-2 pointer bold fc-green" onClick={() => setAmount(getBalanceStr(balancePair, 18, 5))}>MAX</span>
                                        {/* ~$1990 */}
                                        {getBalanceStr(balancePair, 18, 5)}
                                    </div>
                                </div>
                                <div className="flex flex-no-wrap white">
                                    <div className="flex mx-2 m-auto-v" id="lang-sel-dropdown">
                                        <div className="flex flex-no-wrap  m-auto-v pointer" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <img src={"/assets/images/pair.png"} className={styles.pairImg} alt="" />
                                            <span className="m-auto-v mx-1 pointer">{"MEND/BUSD"}</span>
                                        </div>
                                    </div>

                                    <input
                                        type="text"
                                        className={cn("right m-auto-v white blank-box w-fill", styles.inputBox)}
                                        placeholder="0.0"
                                        value={amount}
                                        onChange={(e) => {enterAmount(e, e.target.value)}}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="my-1">
                            Current prices and your pool share
                        </p>
                        <div className="flex-col font-DmSans border-dark p-3 rounded-m my-4">
                            <div className="flex w-100 my-1 grid3-abs">
                                <div className="item text-center">{34}</div>
                                <div className="item text-center">0.23 CIFI/day</div>
                                <div className="item text-center">100%</div>
                            </div>
                            <div className="flex w-100 my-1 grid3-abs">
                                <span className="item text-center">Total Supply</span>
                                <span className="item text-center">Reward</span>
                                <span className="item text-center">Share of Pool</span>
                            </div>
                        </div>

                        <div
                            onClick={() => clickConfirm()}
                            className={"flex text-center back-blue p-2 my-2 rounded-m pointer c-white " + ("disabled")}>
                            <span className="m-auto-v">Confirm</span>
                        </div>

                        <div
                            hidden={true}
                            className="flex text-center back-blue1 p-2 my-2 rounded-m pointer c-white">
                            <span className="m-auto-v">{"errMsg"}</span>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
}

// export default withTranslation('common')(ConnectWallet)
export default ProvideLiquidity

