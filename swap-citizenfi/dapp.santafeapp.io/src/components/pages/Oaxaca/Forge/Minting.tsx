import React, { useEffect, useState } from "react";
// import { withTranslation } from 'react-i18next'
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";

import darkImg from "../../../../assets/img/icons/anyswap.png"
import { humanize } from "../../../common/libs/functions"
import jQuery from "jquery";
import Mint3D from "../../../common/libs/Mint3D";

import { useAppContext } from "../../../common/libs/context";
import SantaV2Api from "../../../common/apiSantaMeta/SantaV2";

import contracts, { contractAddress } from "../../../../contracts";

const alertify = require("alertifyjs")
const $: any = jQuery
function Minting(props: any) {

    const { walletAddress, connectedNetwork } = useAppContext()
    const [tokenData, setTokenData] = useState<any>({})
    const [showThis, setShowThis] = useState<boolean>(false)
    useEffect(() => {
        if (props.isModalOpen === true) init()
    }, [props.isModalOpen])

    function checkMintStatus(ContractInstance: any){     
        return ContractInstance.methods.getMintingStatus()
        .call()
        .then((mintStatus: boolean) => {
            if(!mintStatus) return checkMintStatus(ContractInstance)
            else return true
        })
    }

    function getMintId(ContractInstance: any){
        let flag: boolean = false
        flag = checkMintStatus(ContractInstance)
        if(flag){
            ContractInstance.methods._lastMintedNFTId(walletAddress).call()
            .then((mintId: any) => {
                console.log("mintID of SantaFactory 2 or 3", mintId)
                showItem(mintId)
            })
        }else{
            setTimeout(() => {
                getMintId(ContractInstance)
            }, 300);
        }
    }

    function init() {
        if (props.isModalOpen === true) {
            let SantaFactory_V2: any = new window.web3.eth.Contract(contracts.abis.SantaFactoryV2, contractAddress[connectedNetwork].SantaFactoryV2)
            // let SantaFactory_V3: any = new window.web3.eth.Contract(contracts.abis.SantaFactoryV3, contractAddress[connectedNetwork].SantaFactoryV3)
            let ContractInstance: any = SantaFactory_V2

            getMintId(ContractInstance)
        }
        $(".modal").each(function (l: any) { $(".modal").on("show.bs.modal", function (l: any) { var o = "shake"; "shake" === o ? $(".modal-dialog").velocity("callout." + o) : "pulse" === o ? $(".modal-dialog").velocity("callout." + o) : "tada" === o ? $(".modal-dialog").velocity("callout." + o) : "flash" === o ? $(".modal-dialog").velocity("callout." + o) : "bounce" === o ? $(".modal-dialog").velocity("callout." + o) : "swing" === o ? $(".modal-dialog").velocity("callout." + o) : $(".modal-dialog").velocity("transition." + o) }) });
    }

    function showItem(tokenId: any) {

        let baseUri = "https://api.santafeapp.io/asset/"
        if (props.selectedV2 === true) {
            baseUri = "https://api.santafeapp.io/santaV2/"
            showAttributeModal(tokenId, baseUri)
        } else {
            showAttributeModal(tokenId, baseUri)
        }
    }

    function showAttributeModal(tokenId: number, baseUri: string) {
        jQuery.get(baseUri + tokenId)
        .then((res: any) => {
            let metaData: any = res
            metaData.isApproved = false
            metaData.isProgress = false
            metaData.attributes.face_value = props.faceValue
            metaData.tokenId = tokenId
            setTokenData(metaData)

            setTimeout(() => {
                setShowThis(true)
            }, 2000);
        })
    }

    const clickClose = () => {
        props.onHide()
        setTokenData({})
        setShowThis(false)
    }

    return (
        <>
            <Modal onHide={() => clickClose()} show={props.isModalOpen} centered className="modal-dialog-wallet-connect show-claim-modal p-2" data-easein="whirlIn">
                <div className="text-center flex-col" hidden={showThis && props.isMinted}>
                    <div className="m-auto-h flex">
                        <Mint3D />
                    </div>
                    <div hidden={!props.isMinted} className="text-center bottom flex center bold text-3xl my-4 py-4">
                        <span className="m-auto-h load-dot">Connecting to Chainlink VRF</span>
                    </div>
                </div>
                <ModalBody hidden={!showThis || !props.isMinted} className=" btn-back-gradient-reverse rounded p-4 mx-h-540px">
                    <div className="row flex p-4">
                        <p className="text-4xl text-center m-auto-h bold">
                            {tokenData.name || "Claimed NFT"} #{tokenData.tokenId || ""} 
                        </p>
                        <div className="close-window pointer" onClick={() => clickClose()}>
                            <i className="fa remix ri-close-fill fs-32"></i>
                        </div>
                    </div>
                    <div className="flex flex-no-wrap sp-flex-col mb-4 m-auto-h w-fit">
                        <div className="flex mx-4">
                            <img src={tokenData.image ? tokenData.image : darkImg} className="w-13 sp-w-60 rounded bd-shiny on m-auto" alt="" />
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
export default Minting

