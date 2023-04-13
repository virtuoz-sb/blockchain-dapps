import React, { useState, useEffect } from "react";

import { withTranslation } from 'react-i18next'

import class6Img from "../../../../assets/img/icons/SantaFe2.png"
import { useAppContext } from "../../../common/libs/context";
import { copyText, showError, validateWalletAddres } from "../../../common/libs/functions";

import { getContractData, addToList, removeFromList } from "./famosoBlackListSlice"

import { useAppDispatch, useAppSelector } from '../../../../app/hook'
import { RootState } from '../../../../app/store'
import { contractAddress } from "../../../../contracts";

function FamosoBlackList() {
    const dispatch = useAppDispatch()
    const isProcess = useAppSelector((state: RootState) => state.famosoBlackList.isProcess)
    const blackList = useAppSelector((state: RootState) => state.famosoBlackList.blackList)
    const { isConnected, walletAddress, isCorrectNet, connectedNetwork } = useAppContext()
    const [address, setAddress] = useState<any>("")


    useEffect(() => {
        dispatch(getContractData(walletAddress, contractAddress[connectedNetwork].FBlist))
    }, [dispatch])


    function validateInput(){
        if(!validateWalletAddres(address)){
            return showError("Please enter correct wallet address")
        }
        return true
    }

    function addList(){
        if(!validateInput()) return
        if (window.web3 && window.web3.eth && (isConnected === true) && (isCorrectNet === true)) {
            return dispatch(addToList(address, walletAddress, contractAddress[connectedNetwork].FBlist))
        }
    }

    const removeList = () => {
        if(!validateInput()) return
        if (window.web3 && window.web3.eth && (isConnected === true) && (isCorrectNet === true)) {
            return dispatch(removeFromList(address, walletAddress, contractAddress[connectedNetwork].FBlist))
        }
    }

    return (
        <>
            <div className="flex p-4 sp-p-2">
                <div className="col-md-4 p-2">
                    <div className="btn-back-dark btn-back-dark rounded p-4 flex-col">
                        <div className=" ff-point-cufon fs-32 text-center flex my-4 py-4 white">
                            Famoso Blacklist
                        </div>
                        <div className="flex-col">
                            <div 
                                className="flex my-2"
                                >
                                <span  className="my-auto mn-w-120px upper text-lg bold fc-orange" >Address</span>
                                <input className="my-auto white w-fill border-none text-xl blank-box ta-left b-b"  
                                    type="text" 
                                    value={address} 
                                    placeholder="0xa52c..."
                                    onChange={(e: any) => setAddress(e.target.value)}
                                    />
                            </div>
                        </div>
                        <div className="w-100 my-4 flex">
                            <div className="rounded btn-back-blue btn-hover mx-auto flex w-fit py-2 px-4 mn-w-120px pointer" hidden={isProcess} onClick={() => addList()}>
                                <span className="m-auto text-2xl upper c-white bold px-4">
                                    Add
                                </span>
                            </div>
                            <div className="rounded btn-back-blue btn-hover mx-auto flex w-fit py-2 px-4 mn-w-120px pointer" hidden={isProcess} onClick={() => removeList()}>
                                <span className="m-auto text-2xl upper c-white bold px-4">
                                    Remove
                                </span>
                            </div>
                            <div className="rounded btn-back-blue mx-auto flex w-fit py-2 px-4 mn-w-120px pointer" hidden={!isProcess}>
                                <div className="loader-animation-sm m-auto"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-8 p-2">
                    <div className="btn-back-dark btn-back-dark rounded">
                        <div className="flex back-blue rounded-top p-3 b-b-blue btn-back-gradient-reverse">
                            <img src={class6Img} className="size-40px rounded mx-2 m-auto-v" alt="" />
                            <div className="flex-col bottom my-auto ff-point-cufon">
                                <p className="mb-0 fs-20 bold c-white">CURRENT BLACK LIST</p>
                                {/* <p className="mb-0"><span className="fc-grey">Stake</span><span className="bold"> Kainu NFT </span><span className="fc-grey">to earn</span><span className="bold"> CIFI</span></p> */}
                            </div>
                        </div>
                        <div className="p-4 mn-h-70vh pc-mx-h-70vh scroll-v-1">
                            {
                                blackList.map((item: any, index: any) =>
                                    <div
                                        className={"bd-shiny on rounded flex flex-no-wrap h-fit relative pointer px-4 py-2 border-gradient active"}
                                        key={index}
                                        // onClick={() => dispatch(clickGallery(index))}
                                        >
                                        <span style={{width: "50px"}}>{index+1}</span>
                                        <span className="text-base white">
                                            {item}
                                        </span>
                                        <span className="mx-2 blue pointer" onClick={() => copyText(item, "Address copied")}>
                                            <i className="icofont-ui-copy"></i>
                                        </span>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default withTranslation('common')(FamosoBlackList)
