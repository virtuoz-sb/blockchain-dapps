import React, { useEffect, useState } from "react";
// import { withTranslation } from 'react-i18next'
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";

import darkImg from "../../../assets/img/icons/anyswap.png"
import { humanize } from "../../common/libs/functions"
import jQuery from "jquery";
import { useAppContext } from "../../common/libs/context";

import { useAppDispatch } from '../../../app/hook'
import { addDisplayItems } from './Kainu/kainuStakingSlice'
import Mint3D from "../../common/libs/Mint3D";
import SantaApi from "../../common/apiSantaMeta/Santa";
import "./claim.scss"
import { bestGas, bestGasPrice } from "../../common/libs/constant";
import { contractAddress } from "../../../contracts";
import { openNotification } from "../../../app/reducers/appSlice";
const alertify = require("alertifyjs")
const $: any = jQuery

function Claimed(props: any) {
    const dispatch = useAppDispatch()

    const [tokenData, setTokenData] = useState<any>({})
    const [showThis, setShowThis] = useState<boolean>(false)
    const { walletAddress } = useAppContext()
    const [showVrfDesc, setShowVrfDesc] = useState<boolean>(false)
    const { contracts, connectedNetwork } = useAppContext()
    useEffect(() => {
        if (props.isModalOpen === true) init()
    }, [props.isModalOpen, props.tokenId])

    function init() {
        if (props.isModalOpen === true) {
            setShowVrfDesc(false)
            if (window.web3 && window.web3.eth) {
                setShowThis(false)
                alertify.dismissAll();
                // return
                SantaApi.isWhiteList(walletAddress)
                    .then((whiteRes: any) => {
                        if (whiteRes.data && (whiteRes.data.is === true)) {
                            let SantaFactory_Contract: any = new window.web3.eth.Contract(contracts.abis.SantaFactory, contractAddress[connectedNetwork].SantaFactory)
                            SantaFactory_Contract.methods.hasClaim().call({
                                from: walletAddress
                            })
                                .then((hasClaim: any) => {
                                    // let tmp_id: any = getRandomArbitrary(1, 2000)
                                    // showItem(tmp_id)
                                    // return
                                    console.log("hasClaim", hasClaim)
                                    if (hasClaim === true) {
                                        console.log("hasClaim here 1")
                                        alertify.error("You already claimed")

                                        // SantaFactory_Contract.methods.getLastClaimedNFTId().call({from: walletAddress})
                                        // .then((res: any) => {
                                        //     console.log("getLastClaimedNFTIdRes: ", res);
                                        //     showItem(res)
                                        // })
                                        // .catch((err: any) => {
                                        // })
                                        props.onHide()
                                    }
                                    else {
                                        console.log("You have not claimedhasClaim here 1")
                                        SantaFactory_Contract.methods.claim()
                                        .send({
                                            from: walletAddress,
                                            gas: bestGas, 
                                            gasPrice: bestGasPrice
                                        })
                                        .then((claimRes: any) => {
                                            alertify.success("Airdrop claim initiated")
                                            console.log("claimRes", claimRes)
                                            dispatch(openNotification(claimRes, "Claim"))
                                            setShowVrfDesc(true)
                                            setTimeout(() => {
                                                SantaFactory_Contract.methods.getLastClaimedNFTId()
                                                .call({ from: walletAddress })
                                                    .then((res: any) => {
                                                        console.log("getLastClaimedNFTIdRes: ", res);
                                                        showItem(res)
                                                    })
                                                    .catch((err: any) => {
                                                        props.onHide()
                                                    })
                                            }, 40 * 1000);
                                        })
                                        .catch((err: any) => {
                                            props.onHide()
                                        })
                                    }
                                })
                                .catch((err: any) => {
                                    // alertify.error("Sorry, something went wrong")
                                    props.onHide()
                                })
                        } else {
                            alertify.error("You are not on whitelist")
                            props.onHide()
                        }
                    }).catch((err: any) => {
                        alertify.error("You are not on whitelist")
                        props.onHide()
                    })
            }
        }
        $(".modal").each(function (l: any) { $(".modal").on("show.bs.modal", function (l: any) { var o = "shake"; "shake" === o ? $(".modal-dialog").velocity("callout." + o) : "pulse" === o ? $(".modal-dialog").velocity("callout." + o) : "tada" === o ? $(".modal-dialog").velocity("callout." + o) : "flash" === o ? $(".modal-dialog").velocity("callout." + o) : "bounce" === o ? $(".modal-dialog").velocity("callout." + o) : "swing" === o ? $(".modal-dialog").velocity("callout." + o) : $(".modal-dialog").velocity("transition." + o) }) });
    }

    function showItem(tokenId: any) {

        jQuery.get("https://api.santafeapp.io/asset/" + tokenId)
            .then((res: any) => {
                let metaData: any = res
                metaData.isApproved = false
                metaData.isProgress = false
                setTokenData(metaData)
                dispatch(addDisplayItems(metaData))
                setTimeout(() => {
                    setShowThis(true)
                }, 2000);
            })
    }

    const clickClose = () => {
        props.onHide()
        setTokenData({})
        setShowThis(false)
        setShowVrfDesc(false)
    }

    return (
        <>
            <Modal onHide={() => clickClose()} show={props.isModalOpen} centered className="modal-dialog-wallet-connect show-claim-modal p-2" data-easein="whirlIn">
                <div className="text-center flex-col" hidden={showThis}>
                    <div className="m-auto-h flex">
                        <div>
                            <Mint3D />
                        </div>
                        {/* <div hidden={!showVrfDesc}>
                            <MintLoadConnect />
                        </div> */}
                    </div>
                    <div hidden={showVrfDesc} className="text-center bottom flex center text-2xl">
                        <span className="m-auto-h load-dot">Initiating Airdrop claim</span>
                    </div>
                    <div hidden={!showVrfDesc} className="text-center bottom flex center bold text-3xl my-4 py-4">
                        <span className="m-auto-h load-dot">Connecting to Chainlink VRF</span>
                    </div>
                </div>
                <ModalBody hidden={!showThis} className=" btn-back-gradient-reverse rounded p-4">
                    <div className="row flex p-4">
                        <p className="text-4xl text-center m-auto-h bold">
                            {tokenData.name || "Claimed NFT"}
                        </p>
                        <div className="close-window pointer" onClick={() => clickClose()}>
                            <i className="fa remix ri-close-fill fs-32"></i>
                        </div>
                    </div>
                    <div className="flex flex-no-wrap sp-flex-col mb-4 m-auto-h w-fit">
                        <div className="flex mx-4">
                            <img src={tokenData.image ? tokenData.image : darkImg} className="w-13 sp-w-60 m-auto rounded bd-shiny on" alt="" />
                        </div>
                        <div className="flex-col mx-4">
                            {
                                tokenData.attributes ?
                                    Object.keys(tokenData.attributes).map((attr: any, index) =>
                                        <div className="flex my-2" key={index}>
                                            <span className="left pr-2 bold">{humanize(attr)}</span>
                                            <span className="right">{tokenData.attributes[attr]}</span>
                                        </div>
                                    )
                                    :
                                    <></>
                            }
                        </div>
                    </div>
                    <div className="flex my-4">
                        <div
                            onClick={() => props.onHide()}
                            className="btn-back-gradient py-2 px-8 pointer bold text-lg c-white rounded m-auto">
                            Close
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
}

// export default withTranslation('common')(ConnectWallet)
export default Claimed

