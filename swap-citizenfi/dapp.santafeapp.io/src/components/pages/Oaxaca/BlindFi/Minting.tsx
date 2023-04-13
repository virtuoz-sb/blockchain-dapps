import React, { useEffect, useState } from "react";
// import { withTranslation } from 'react-i18next'
import Modal from "react-bootstrap/Modal";
import jQuery from "jquery";
import Mint3D from "../../../common/libs/Mint3D";

import { useAppContext } from "../../../common/libs/context";

import contracts, { contractAddress } from "../../../../contracts";

import { allowanceErc20, approveErc20 } from "../../../common/libs/functions/integrate";
import { bestGas, bestGasPrice, MATIC_API } from "../../../common/libs/constant";

import Countdown from 'react-countdown';
import { isSameAddress, showError } from "../../../common/libs/functions";

import { useAppSelector, useAppDispatch } from '../../../../app/hook'
import { openNotification } from "../../../../app/reducers/appSlice";

const alertify = require("alertifyjs")
const $: any = jQuery
function Minting(props: any) {
    const dispatch = useAppDispatch()
    
    const { walletAddress, connectedNetwork, cifiBalance } = useAppContext()
    const [showTimer, setShowTimer] = useState<boolean>(false)
    const [endTime, setEndTime] = useState<any>(new Date().getTime() + (new Date().getTimezoneOffset()) * 60000 + 10*60*1000)

    useEffect(() => {
        if (props.isModalOpen === true) checkMint()
    }, [props.isModalOpen])

    const [isApproved, setIsApproved] = useState<boolean>(false)

    function init() {
        if (props.isModalOpen === true) {
            if(isApproved) return callMint()
            else{
                allowanceErc20(contractAddress[connectedNetwork].Cifi_Token, contractAddress[connectedNetwork].LootBoxFactory, walletAddress )
                .then((allowanceAmount: any) => {
                    if(Number(allowanceAmount) > 500000){
                        setIsApproved(true)
                        return callMint()
                    }else{
                        return approveErc20(contractAddress[connectedNetwork].Cifi_Token, contractAddress[connectedNetwork].LootBoxFactory, walletAddress)
                        .then((apprRes: any) => {
                            setIsApproved(true)
                            return callMint()
                        }).catch((err: any) => {
                            console.log("err", err)
                            props.onHide()
                        })
                    }
                })
            }
        }
        $(".modal").each(function (l: any) { $(".modal").on("show.bs.modal", function (l: any) { var o = "shake"; "shake" === o ? $(".modal-dialog").velocity("callout." + o) : "pulse" === o ? $(".modal-dialog").velocity("callout." + o) : "tada" === o ? $(".modal-dialog").velocity("callout." + o) : "flash" === o ? $(".modal-dialog").velocity("callout." + o) : "bounce" === o ? $(".modal-dialog").velocity("callout." + o) : "swing" === o ? $(".modal-dialog").velocity("callout." + o) : $(".modal-dialog").velocity("transition." + o) }) });
    }

    const callMint = () => {
        let LootBoxFactoryV1: any = new window.web3.eth.Contract(contracts.abis.LootBoxFactoryV1, contractAddress[connectedNetwork].LootBoxFactoryV1)
        LootBoxFactoryV1.methods.ableClaim()
        .call({
            from: walletAddress
        })
        .then((able: any) => {
            if (able === false) {
                console.log("can't able Claim here 1")
                alertify.error("You already claimed 5 times")
                props.onHide()
            }
            else {
                console.log("You can claim again", able)
                if(Number(cifiBalance < 0.5)) {
                    props.onHide()
                    return showError("Your CIFI balance should be larger than 0.5")
                }
                LootBoxFactoryV1.methods.mint()
                .send({
                    from: walletAddress,
                    gas: bestGas, 
                    gasPrice: bestGasPrice
                })
                .then((claimRes: any) => {
                    alertify.success("Process completed")
                    mintFinished()
                    return dispatch(openNotification(claimRes, "Claim LootBox"))
                })
                .catch((err: any) => {
                    props.onHide()
                })
            }
        })
        .catch((err: any) => {
            props.onHide()
        })
    }

    const checkMint = async () => {
        const currentBlockNumber = await window.web3.eth.getBlockNumber();
        let startBlockNumber = 22286559  //currentBlockNumber - 1000;
        const apiurl = `https://api.polygonscan.com/api?module=account&action=txlist&address=0x78c6B9611A95f8B88B3175D99E7De7603A5A7013&startblock=${startBlockNumber}&endblock=pending&apikey=${MATIC_API}`
        await fetch(apiurl, {})
        .then((res) => res.json())
        .then((result) => {
            let cnt = 0;
            let no = 0;
            let err = 0;
            for(let i = 0 ; i < result.result.length ; i ++){
                no ++;
                if(!isSameAddress(result.result[i].from, walletAddress)) continue
                if(result.result[i].isError === 1) {err ++;  continue;}
                if(result.result[i].isError === "1") {err ++;  continue;}
                console.log(result.result[i])
                cnt ++;
                if(cnt === 5) break
            }
            console.log("cnt = ", cnt, ", no = ", no, "err = ", err)
            if(cnt < 5) return init()
            else {
                return showError("You already have minted 5 times")
            }
        })
    }

    const mintFinished = () => {
        setTimeout(() => {
            window.location.href="/portfolio?tab=wallet"
        }, 1000);

        // let curTime = new Date().getTime() + 180*60*1000
        // setEndTime(curTime)
        // setShowTimer(true)
    }

    const Completionist = () => <p className="m-auto flex-item text-center">Ended</p>;

    const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
        if (completed) {
            return <Completionist />;
        } else {
            if(completed) return window.location.href="/portfolio?tab=wallet"
            else return (
                days > 0 ?
                <div className="m-auto flex-item text-center">{days + " Days " + hours + "h " + minutes + "m " + seconds + "s"}</div>
                :
                <div className="m-auto flex-item text-center">{hours + "H " + minutes + "m " + seconds + "s"}</div>
            )
        }
    };

    return (
        <>
            <Modal show={props.isModalOpen} centered className="modal-dialog-wallet-connect show-claim-modal p-2" data-easein="whirlIn">
                <div className="text-center flex-col">
                    <div className="flex-col" hidden={showTimer}>
                        <div className="m-auto-h flex">
                            <Mint3D />
                        </div>
                        <div hidden={props.isMinted} className="text-center bottom flex center bold text-3xl my-4 py-4">
                            <span className="m-auto-h load-dot">Processing ...</span>
                        </div>
                        <div hidden={!props.isMinted} className="text-center bottom flex center bold text-3xl my-4 py-4">
                            <span className="m-auto-h load-dot">Connecting to Chainlink VRF</span>
                        </div>
                    </div>
                    <div className="flex-col" hidden={true}>
                        <p className="text-4xl my-4 bold c-blue">
                            <Countdown
                                date={Number(endTime)}
                                renderer={renderer} />
                        </p>
                        <div
                            onClick={() => props.onHide()}
                            className="btn-back-gradient py-2 mt-4 px-8 pointer text-lg c-white rounded m-auto">
                            Hide Timer
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

// export default withTranslation('common')(ConnectWallet)
export default Minting

