import React, { useEffect, useState } from "react";

import ethereumImg from "../../../../assets/img/icons/SantaFe2.png";
import { useAppContext } from "../../../common/libs/context";
import { isNumeric } from "../../../common/libs/functions"

import { clickGallery, clickSantaV2 } from "./forgeSlice"
import { getContractData, approveToken, getInitApproveData } from "./forgeSlice"
import { classImgArr } from "../../../common/libs/image"
import itemBackImg from "../../../../assets/img/back/item-back.png";
import olympicImg  from "../../../../assets/img/icons/Olympic_God.jpg"

import Minting from "./Minting";
import { useAppSelector, useAppDispatch } from '../../../../app/hook'
import { RootState } from '../../../../app/store'
import { balanceErc20 } from "../../../common/libs/functions/integrate";
import contracts, { contractAddress } from "../../../../contracts";
import { bestGas, bestGasPrice } from "../../../common/libs/constant";
import { openNotification, setActiveHeaderMenu } from "../../../../app/reducers/appSlice";

const alertify = require("alertifyjs")
function Forge() {
    const dispatch = useAppDispatch()
    const SantaV3Galleries = useAppSelector((state: RootState) => state.forge.SantaV3Galleries)
    const selectedV2 = useAppSelector((state: RootState) => state.forge.selectedV2)
    const selectedV3 = useAppSelector((state: RootState) => state.forge.selectedV3)
    const selectedV3No = useAppSelector((state: RootState) => state.forge.selectedV3No)
    const galleryData2Mint = useAppSelector((state: RootState) => state.forge.galleryData2Mint)

    const { walletAddress, connectedNetwork } = useAppContext()
    const [faceValue, setFaceValue] = useState<any>("0")
    const [isMint, setIsMint] = useState<boolean>(false)
    const [isMinted, setIsMinted] = useState<boolean>(false)

    const [isInit, setIsInit] = useState<boolean>(false)

    useEffect(() => {
        init()
        dispatch(setActiveHeaderMenu(10))
    }, [dispatch, walletAddress])

    function init() {
        if (isInit) return
        if (window.web3 && window.web3.eth) {
            setIsInit(true)
            dispatch(getInitApproveData(walletAddress, contractAddress[connectedNetwork].Cifi_Token, contractAddress[connectedNetwork].AcceptedToken, contractAddress[connectedNetwork].SantaFactoryV2))
            // dispatch(getContractData(walletAddress))
        }
    }
    function clickMint() {
        alertify.dismissAll();
        if (!(selectedV2 || selectedV3)) {
            alertify.error("Please select gallery to mint")
            return
        }
        if ((!isNumeric(faceValue)) || ((Number(faceValue) < 1) || (Number(faceValue) > 500))) {
            alertify.error("Your face value is not valid number")
            return
        }
        if (!galleryData2Mint.approveCifi) {
            alertify.error("You should approve CIFI token to mint")
            return
        } else if (!galleryData2Mint.approveAccept && !selectedV2) {
            alertify.error("You should approve accepted token to mint")
            return
        }

        mint()
    }

    function validateInput(){
        alertify.dismissAll()
        if(!isNumeric(faceValue)){
            alertify.error("Please enter correct face value")
            return false
        }

        let numFace: number = Number(faceValue)
        if((numFace < 5) || (numFace > 300) ){
            alertify.error("Please enter correct face value. Face value should be larger than 5 and smaller than 300")
            return false
        }

        return true
    }

    function clickApprove(flag: number){
        if(!validateInput()) return
        if(flag === 1) {///CIFI
            if (galleryData2Mint.approveCifi === true) {
                alertify.error("You have already approved CIFI")
                return
            } else {
                if (selectedV2 === true) {
                    console.log("here approved")
                    dispatch(approveToken(contractAddress[connectedNetwork].Cifi_Token, contractAddress[connectedNetwork].SantaFactoryV2, walletAddress, contractAddress[connectedNetwork].Cifi_Token, contractAddress[connectedNetwork].AcceptedToken))
                }
                else if (selectedV3 === true) {
                    dispatch(approveToken(contractAddress[connectedNetwork].Cifi_Token, contractAddress[connectedNetwork].SantaFactoryV3, walletAddress, contractAddress[connectedNetwork].Cifi_Token, contractAddress[connectedNetwork].AcceptedToken))
                }
            }
        }else{
            alertify.dismissAll();
            if (galleryData2Mint.approveAccept === true) {
                alertify.error("You have already approved accepted token")
                return
            } else {
                if (selectedV3 === true) dispatch(approveToken(contractAddress[connectedNetwork].AcceptedToken, contractAddress[connectedNetwork].SantaFactoryV3, walletAddress, contractAddress[connectedNetwork].Cifi_Token, contractAddress[connectedNetwork].AcceptedToken))
            }
        }
    }

    function mint() {
        if(!validateInput()) return
        let face_val = Number(faceValue)
        if (window.web3 && window.web3.eth) {
            setIsMint(true)

            if (selectedV2) {
                balanceErc20(contractAddress[connectedNetwork].Cifi_Token, walletAddress)
                .then((balance: any) => {
                    balance = balance / (10 ** 18)
                    if (face_val > balance) {
                        alertify.error("Face value is larger than your CIFI balance")
                        setIsMint(false)
                        return
                    } else {
                        let SantaFactory_V2: any = new window.web3.eth.Contract(contracts.abis.SantaFactoryV2, contractAddress[connectedNetwork].SantaFactoryV2)
                        SantaFactory_V2.methods.mint(BigInt(faceValue * 10 ** 18))
                        .send({ 
                            from: walletAddress, 
                            gas: bestGas, 
                            gasPrice: bestGasPrice 
                        })
                        .then((mintRes: any) => {
                            console.log("mintRes", mintRes)
                            alertify.success("Minting has been initiated.")
                            dispatch(openNotification(mintRes, ""))
                            setTimeout(() => {
                                setIsMinted(true)
                            }, 2000);
                        })
                        .catch((err: any) => {
                            console.log("mintRes err", err)
                            // alertify.error("Error on mint")
                            setIsMint(false)
                        })
                    }
                })
            } else {
                // balanceErc20(SantaV3Galleries[selectedV3No].acceptedToken, walletAddress)
                //     .then((balance: any) => {
                //         balance = balance / (10 ** 18)
                //         if (face_val > balance) {
                //             alertify.error("Your face value is larger than balance")
                //             setIsMint(false)
                //             return
                //         } else {
                //             if (selectedV3) {
                //                 console.log("mint", SantaV3Galleries[selectedV3No].santa, BigInt(faceValue * 10 ** 18))
                //                 let SantaFactory_V3: any = new window.web3.eth.Contract(contracts.abis.SantaFactoryV3, contractAddress[connectedNetwork].SantaFactoryV3)
                //                 SantaFactory_V3.methods.mint(SantaV3Galleries[selectedV3No].santa, BigInt(faceValue * 10 ** 18)).send({ from: walletAddress, gas: bestGas })
                //                     .then((mintRes: any) => {
                //                         console.log("mintRes", mintRes)
                //                         alertify.success("NFT has been minted successfuly.")
                //                         setTimeout(() => {
                //                             setIsMinted(true)
                //                         }, 2000);
                //                     })
                //                     .catch((err: any) => {
                //                         console.log("mintRes err", err)
                //                         // alertify.error("Error on mint")
                //                         setIsMint(false)
                //                     })
                //             }
                //         }
                //     })
            }
        }
    }

    function closeMintModal() {
        setIsMint(false)
        setIsMinted(false)
    }

    return (
        <>
            <div className="swap-page">
                <div className="flex my-4">
                    <div className="col-md-3 flex-col pb-4">
                        <div className="bd-shiny on rounded btn-back-dark p-4 h-100">
                            <p className="fs-32 white bold">OAXACA FORGE</p>
                            <p className="text-lg p-4 white">
                                Mint NFTs from available pools by locking assets as Face Value
                            </p>
                            <p className="fc-grey text-lg px-4">
                                Participate in NFT as a Financial Service staking pool by locking accepted token/LP to mint your own NFTs. Asset locked can be retrieved in full upon end of campaign.
                            </p>
                        </div>
                    </div>
                    <div className="col-md-6 flex-col pb-4">
                        <div className="bd-shiny on rounded btn-back-dark h-100">
                            <div className="flex btn-back-gradient-reverse rounded-top p-4 b-b-blue">
                                <img src={ethereumImg} className="size-40px rounded mx-2 m-auto-v" alt="" />
                                <div className="flex-col m-auto-v ff-point-cufon">
                                    <p className="mb-0 fs-20 c-white">FORGE</p>
                                    <p className="mb-0"><span className="fc-grey">Lock</span> <span className="c-white">tokens</span> <span className="fc-grey">Mint</span> <span className="c-white">NFTs</span></p>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="grid3">
                                    <div className={"bd-shiny on rounded flex relative pointer p-4 border-gradient active"} onClick={() => dispatch(clickSantaV2(true))} >
                                        <span className="text-base abs white">
                                            Olympics2020
                                        </span>
                                        <div className="p-4">
                                            <img src={olympicImg} className="w-mx-100p rounded" alt="" />
                                        </div>
                                        <span className="abs bottom right p-2" hidden={!selectedV2}>
                                            <i className="icofont-check-circled c-green bold fs-32"></i>
                                        </span>
                                    </div>
                                    {
                                        SantaV3Galleries.map((item: any, index: any) =>
                                            <div
                                                className={"bd-shiny on rounded flex relative pointer p-4 border-gradient active"}
                                                key={index}
                                                onClick={() => dispatch(clickGallery(index))}>
                                                <span className="text-base abs white">
                                                    {item.name}
                                                </span>
                                                <div className="p-4">
                                                    <img src={item.image} className="w-mx-100p rounded" alt="" />
                                                </div>
                                                <span className="abs bottom right p-2" hidden={index !== selectedV3No}>
                                                    <i className="icofont-check-circled c-green bold fs-32"></i>
                                                </span>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 flex-col h-fit pb-4">
                        <div className="bd-shiny on rounded btn-back-dark py-4 px-4 flex-col ">
                            <p className="fs-32 bold white">DETAILS</p>
                            <div className="pc-mx-h-70vh pc-mn-h-70vh scroll-v-1 p-2">
                                <div className="mx-2 my-4">
                                    {
                                        (selectedV2 || selectedV3) ?
                                            <div className="bd-shiny on rounded flex relative pointer border-gradient active">
                                                <span className="text-base abs m-4 bold">
                                                    {galleryData2Mint.name}
                                                </span>
                                                <div className="p-4">
                                                    <div className="p-4">
                                                        <img src={galleryData2Mint.image} className="w-mx-100p rounded" alt="" />
                                                    </div>
                                                </div>
                                            </div>
                                            :
                                            <div className="bd-shiny on rounded flex relative pointer border-gradient active">
                                                <span className="text-base abs m-4 bold">
                                                    
                                                </span>
                                                <div className="p-4 w-100">
                                                    <div className="p-4">
                                                        <img src={itemBackImg} className="w-mx-100p w-100 rounded" alt="" />
                                                    </div>
                                                </div>
                                            </div>
                                    }
                                </div>
                                <p className="fc-grey mb-0 text-lg ">Minimum: 5</p>
                                <p className="fc-grey mb-0 text-lg ">Maximum: 300</p>
                                <div className="w-100 flex">
                                    <div className="flex py-4 mx-auto sp-pt-2 w-100">
                                        <div className={"flex btn-back-gradient rounded-btn-x p-1 space-center my-2 w-100"}>
                                            <a  
                                                href="https://exchange.pancakeswap.finance/#/swap?outputCurrency=0x89f2a5463ef4e4176e57eef2b2fdd256bf4bc2bd" 
                                                target="_blank"
                                                rel="noreferrer"
                                                className={"text-center approve-toggle rounded-btn-x p-1 text-lg pointer bold active-bd-or active btn-back-dark white w-50"}>
                                                <span className="m-auto no-wrap px-2">Buy CIFI</span>
                                            </a>
                                            <a  
                                                href="https://anyswap.exchange/bridge?inputCurrency=0x316772cfec9a3e976fde42c3ba21f5a13aaaff12&network=polygon" 
                                                target="_blank"
                                                rel="noreferrer"
                                                className={"text-center approve-toggle w-50 rounded-btn-x p-1 text-lg pointer bold active-bd-or  active btn-back-dark white"}>
                                                <span className="m-auto no-wrap px-2">Bridge CIFI</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="fc-grey flex mb-0 text-lg btn-back-blue1 p-2">
                                    <input type="text" onChange={(e) => setFaceValue(e.target.value)} className="right m-auto-v ta-left blank-box w-fill white" placeholder="Face value" />
                                </div>
                                <div className={"flex btn-back-gradient rounded p-1 space-center my-2 "}>
                                    <div 
                                        onClick={() => clickApprove(1)} 
                                        className={"text-center approve-toggle rounded p-1 text-lg pointer bold active-bd-or " + (galleryData2Mint.approveCifi === false ? "active btn-back-dark white " : "fc-grey ") + (selectedV2 ? "w-100" : "w-50")}>
                                        <span className="m-auto no-wrap px-2" hidden={galleryData2Mint.progressCifi}>Approve CIFI</span>
                                        <div className="loader-animation-sm m-auto" hidden={!galleryData2Mint.progressCifi}></div>
                                    </div>
                                    <div onClick={() => clickApprove(2)} hidden={selectedV2} className={"text-center approve-toggle w-50 rounded p-1 text-lg pointer bold active-bd-or " + (galleryData2Mint.approveAccept === false ? "active btn-back-dark white" : "fc-grey")}>
                                        <span className="m-auto" hidden={galleryData2Mint.progressAccept}>Approve TEST</span>
                                        <div className="loader-animation-sm m-auto" hidden={!galleryData2Mint.progressAccept}></div>
                                    </div>
                                </div>
                                <div onClick={() => clickMint()} className="bd-shiny btn-hover on w-100 m-auto-h text-center rounded p-2 my-4 text-lg pointer fc-whtie btn-back-gradient border border-white bold">
                                    <span hidden={isMint} className="p-2 c-white">Mint</span>
                                    <div className="flex text-center">
                                        <div className="loader-animation-sm m-auto" hidden={!isMint}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Minting
                isModalOpen={isMint}
                isMinted={isMinted}
                selectedV2={selectedV2}
                faceValue={faceValue}
                onHide={() => closeMintModal()}
            />
        </>
    )
}

export default Forge;
