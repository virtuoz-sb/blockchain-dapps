import React, { useState, useEffect } from "react";
import cn from "classnames";

import { isNumeric, showError } from "../../../common/libs/functions"

import { useAppContext } from "../../../common/libs/context";

import { approveErc20, balanceCoin, balanceErc20 } from "../../../common/libs/functions/integrate";

import { RootState } from '../../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../../app/hook'

import { bestGas, bestGasPrice, zeroAddr } from "../../../common/libs/constant";

import {maxSupply} from "../../../common/libs/constant"
import defaultToken  from "../../../../helpers/tokenLists/famoso-default.tokenlist.json"
import { contractAddress, net_state } from "../../../../contracts";
import { openNotification } from "../../../../app/reducers/appSlice";

function Bridge() {
    const dispatch = useAppDispatch()
    const { walletAddress, connectedNetwork } = useAppContext()
    const { contracts } = useAppContext()

    let tokenObject: any = defaultToken

    const CifiToken: any = tokenObject['tokens' + connectedNetwork][2]
    const MendToken: any = tokenObject['tokens' + connectedNetwork][3]

    const [payApproved, setPayApproved] = useState<boolean>(false)

    const [payBalance, setPayBalance] = useState<any>("---")
    const [receiveBalance, setReceiveBalance] = useState<any>("---")

    const [payAmount, setPayAmount] = useState<any>()
    const [receiveAmount, setReceiveAmount] = useState<any>()

    const [isErr, setIsErr] = useState<number>(0)
    const [errMsg, setErrMsg] = useState<any>("Insufficient balance")
    const [doingSwap, setDoingSwap] = useState<boolean>(false)

    const [blocked, setBlocked] = useState<boolean>(false)

    const blockErr = "Your wallet address is blocked on Famoso"

    useEffect(() => {
        getExchangeBalances(CifiToken.address, setPayBalance)
        getExchangeBalances(MendToken.address, setReceiveBalance)
        checkApproved()
    }, [])

    const validInput = () => {
        console.log("check valid input", payAmount, receiveAmount)
        if(!isNumeric(String(payAmount)) || !isNumeric(String(receiveAmount))) return showError("Please input correct amount")
        return true
    }

    const checkApproved = () => {
        const tokenContract = new window.web3.eth.Contract(contracts.abis.ERC20, CifiToken.address)
        return tokenContract.methods.allowance(walletAddress, contractAddress[connectedNetwork].SwapCifiMetalands)
        .call()
        .then((res: any) => {
            return setPayApproved(Number(res) >= maxSupply)
        })
        .catch((err: any) => setPayApproved(false))
    }

    const approveTokenPay = () => {
        if(blocked) return showError(blockErr)
        if(doingSwap) return
        if(!validInput()) return
        return approveErc20( CifiToken.address, contractAddress[connectedNetwork].SwapCifiMetalands, walletAddress )
        .then((approveRes: any) => {
            if(!approveRes.events.Approval.returnValues.value) return setPayApproved(false)
            else return setPayApproved(Number(approveRes.events.Approval.returnValues.value) >= maxSupply)
        }).catch((e: any) => {
            console.log(e)
        });
    }

    const clickSwap = () => {
        if(isErr > 0) return
        if(!validInput()) return

        let SwapCifiMetalands: any = new window.web3.eth.Contract(contracts.abis.SwapCifiMetalands, contractAddress[connectedNetwork].SwapCifiMetalands);

        return SwapCifiMetalands.methods
        .swap(Number(payAmount)*(10**18))
        .send({
            from : walletAddress,
            gas: bestGas,
            gasPrice: bestGasPrice
        })
        .then((res: any) => {
            return dispatch(openNotification(res, "Exchange MEND"))
            console.log("swap res", res)
        })        
    }

    const getExchangeBalances = (address: any, setter: any) => {
        return balanceErc20(address, walletAddress)
        .then((payBalRes: any) => {
            setter(Number(Number(payBalRes)/ (10**18)).toFixed(2))
        })
    }

    const enterPayAmount = (str: any) => {
        setPayAmount(str)
        setReceiveAmount(parseFloat(Number(1000*Number(str)).toFixed(5)))
    }

    const enterReceiveAmount = (str: any) => {
        setReceiveAmount(str)
        setPayAmount(parseFloat(Number(0.001*Number(str)).toFixed(5)))
    }

    const clickMaxPay = () => {
        enterPayAmount(payBalance)
    }

    return (
        <div className="swap-part mt-4">
            <div className="flex-col">
                <p className="c-white text-lg bold mb-1">You Pay</p>
                <div className="back-dark7 flex-col rounded-m p-3">
                    <div className="flex">
                        <span className="left fc-dark">{CifiToken.name}</span>
                        <div className="right flex fc-dark">
                            <span className="mr-2 pointer bold fc-green" onClick={() => clickMaxPay()}>MAX</span>
                            {/* ~$1990 */}
                            {payBalance}
                        </div>
                    </div>
                    <div className="flex flex-no-wrap white">
                        <div className="flex mx-2 m-auto-v">
                            <div className="after-none flex flex-no-wrap  m-auto-v pointer">
                                <img src={CifiToken.logoURI} className="size-40px rounded-50" alt="" />
                                <span className="m-auto-v mx-1 pointer">{CifiToken.symbol}</span>
                            </div>
                        </div>

                        <input 
                            type="text" 
                            className="right m-auto-v white blank-box w-fill sp-mx-w-160" 
                            placeholder="0.0" 
                            value={payAmount}
                            onChange={(e) => enterPayAmount(e.target.value)}
                            />
                    </div>
                </div>
            </div>
            <div className="text-center flex mt-2">
                <i className="icofont-arrow-down text-3xl pointer"></i>
            </div>
            <div className="flex-col mb-4">
                <p className=" c-white text-lg bold mb-1">You Receive</p>
                <div className="back-dark7 flex-col rounded-m p-3">
                    <div className="flex">
                        <span className="left fc-dark">{MendToken.name}</span>
                        <span className="right fc-dark">
                            {receiveBalance}
                        </span>
                    </div>
                    <div className="flex flex-no-wrap">
                        <div className="flex mx-2 m-auto-v" id="lang-sel-dropdown">
                            <div className="after-none flex flex-no-wrap  m-auto-v pointer">
                                <img src={MendToken.logoURI} className="size-40px rounded-50" alt="" />
                                <span className="m-auto-v mx-1 pointer">{MendToken.symbol}</span>
                            </div>
                        </div>
                        <input 
                            type="text" 
                            className="right m-auto-v blank-box w-fill white sp-mx-w-160" 
                            placeholder="0.0" 
                            value={receiveAmount}
                            onChange={(e) => enterReceiveAmount(e.target.value)}
                            />
                    </div>
                </div>
            </div>
            <div 
                hidden={payApproved}
                onClick={() => approveTokenPay()}
                className={"flex text-center back-blue1 p-2 my-2 rounded-m pointer " + ((isErr === 0) && !doingSwap ? "c-white" : "fc-dark disabled")}>
                <span className="m-auto-v" >Approve {CifiToken.symbol}</span>
            </div>
            <div 
                hidden={(isErr > 0)}
                className={"flex text-center btn-back-gradient-reverse p-2 my-2 rounded-m pointer " + ((isErr === 0) && !doingSwap && !blocked ? "c-white" : "fc-dark disabled")}>
                <span className="m-auto-v" onClick={() => clickSwap()}>Swap</span>
            </div>
            <div hidden={isErr === 0} className="flex text-center back-blue1 p-2 my-2 rounded-m pointer c-white">
                <span className="m-auto-v">{errMsg}</span>
            </div>
            <div className="flex-col border-dark p-3 rounded-m my-4">
                <div className="flex">
                    <span className=" c-white left">
                        Exchange Rate
                    </span>
                    <div className="fc-dark right">
                        <div>
                            <span className="fc-dark">1 {CifiToken.symbol} = </span>
                            <span className=" c-white">1000</span>
                            <span className="fc-dark">{MendToken.symbol}</span>
                        </div>
                        <div className="right text-sm">
                            <span className="fc-dark">---</span>
                        </div>
                    </div>
                </div>
                <div className="flex">
                    <span className=" c-white left">
                        Exchange Rate
                    </span>
                    <div className="fc-dark right">
                        <div>
                            <span className="fc-dark">1 {MendToken.symbol} = </span>
                            <span className=" c-white">0.001</span>
                            <span className="fc-dark"> {CifiToken.symbol}</span>
                        </div>
                        <div className="right text-sm">
                            <span className="fc-dark">---</span>
                        </div>
                    </div>
                </div>
            </div>
        
        </div>
    )
}

export default Bridge;
