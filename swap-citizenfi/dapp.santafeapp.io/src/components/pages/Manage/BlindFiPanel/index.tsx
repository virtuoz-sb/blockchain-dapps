import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { withTranslation } from 'react-i18next'

import i18n from "../../../../i18n"

import class6Img from "../../../../assets/img/dragons/tinified/Foreverwing_6.jpg"

import { useAppContext } from "../../../common/libs/context";
import { validateWalletAddres, isInteger, isValidHttpUrl, isNumeric } from "../../../common/libs/functions";
import contracts, { contractAddress } from "../../../../contracts";

import { getContractData, addProject2BlindBoxProject } from "./blindfiPanelSlice"
import { addContract2BlindBox } from "../../Oaxaca/BlindFi/blindSlice";

import { classImgArr } from "../../../common/libs/image"
import { useAppSelector, useAppDispatch } from '../../../../app/hook'
import { RootState } from '../../../../app/store'
import { bestGas, bestGasPrice } from "../../../common/libs/constant";
var alertify = require("alertifyjs")
function BlindFiPanel() {
    // const [showChangeWallet, setShowChangeWallet] = useState<boolean>(false)
    const { isConnected, walletAddress, connectedNetwork, appSetting, initSettting, showConnectWallet, setShowConnectWallet, balance, symbol, networkName, chainIcon, isCorrectNet } = useAppContext()
    // const [showSetting, setShowSetting] = useState<boolean>(false)
    // const [showLanguageSelect, setShowLanguageSelect] = useState<boolean>(false)

    // const isConnected = useAppSelector((state: RootState) => state.app.network.isConnected)
    // const walletAddress = useAppSelector((state: RootState) => state.app.account.walletAddress)

    const [newName, setNewName] = useState<string>("")
    const [newSymbol, setNewSymbol] = useState<string>("")
    const [newBaseURI, setNewBaseURI] = useState<string>("")
    const [feeAmount, setFeeAmount] = useState<string>("")
    const [newMaxCount, setNewMaxCount] = useState<string>("")

    const dispatch = useAppDispatch()
    const Projects = useAppSelector((state: RootState) => state.blindfiPanel.Projects)

    const renderNew = [
        {
            label: "Name",
            value: newName,
            setter: setNewName,
            placeHolder: 'BlindFi Project'
        },
        {
            label: "Symbol",
            value: newSymbol,
            setter: setNewSymbol,
            placeHolder: 'sNFTV3'
        },
        {
            label: "Base URI",
            value: newBaseURI,
            setter: setNewBaseURI,
            placeHolder: 'https://api.santafeapp.io/asset'
        },
        {
            label: "Fee Amount",
            value: feeAmount,
            setter: setFeeAmount,
            placeHolder: '2'
        },
        {
            label: "Max NFT count",
            value: newMaxCount,
            setter: setNewMaxCount,
            placeHolder: '10000'
        }
    ]

    useEffect(() => {
        console.log("init")
        dispatch(getContractData(walletAddress, contractAddress[connectedNetwork].BlindBoxFactory))
    }, [dispatch])

    // console.log("i18n.language", i18n.language)

    function validateInput(){
        alertify.dismissAll()
        if(newName.trim().length === 0){
            alertify.error("Please enter correct name")
            return false
        }

        if(newSymbol.trim().length === 0){
            alertify.error("Please enter correct symbol")
            return false
        }

        if(newSymbol !== newSymbol.toUpperCase()){
            alertify.error("Please enter correct symbol")
            return false
        }
        
        if(!isValidHttpUrl(newBaseURI)){
            alertify.error("Please enter correct base uri")
            return false
        }
        
        if(!isNumeric(feeAmount)){
            alertify.error("Please enter correct fee amount value")
            return false
        }

        if(!isInteger(newMaxCount)){
            alertify.error("Please enter correct max NFT count")
            return false
        }

        if(Number(newMaxCount) === 0){
            alertify.error("Please enter correct max NFT count")
            return false
        }

        return true
    }

    function createProject(){
        if(!validateInput()) return
        if (window.web3 && window.web3.eth && (isConnected === true) && (isCorrectNet === true)) {
            alertify.dismissAll()
            let BlindBoxFactory: any = new window.web3.eth.Contract(contracts.abis.BlindBoxFactory, contractAddress[connectedNetwork].BlindBoxFactory)
            BlindBoxFactory.methods.createBlindBox(newName, newSymbol, newBaseURI, feeAmount, newMaxCount)
            .send({from: walletAddress, gas: bestGas, gasPrice: bestGasPrice})
            .then((nftContract: any) => {
                if(validateWalletAddres(nftContract)){
                    alertify.success("New Project has been created successfully")
                    let data: any = {
                        name: newName,
                        feeAmount: feeAmount,
                        maxCount: newMaxCount,
                        nftContract: nftContract,
                        image: classImgArr[(Projects.length + 1) % 5 + 1]
                    }
                    dispatch(addProject2BlindBoxProject(data))
                    dispatch(addContract2BlindBox(data))
                }else{
                    alertify.error("Something went wrong")
                }
            })
            .catch((err: any) => {
                alertify.error("Something went wrong")
            })
        }
    }

    return (
        <>
            <div className="flex p-4 sp-p-2">
                <div className="col-md-4 p-2">
                    <div className="btn-back-dark btn-back-dark rounded p-4 flex-col">
                        <div className=" ff-point-cufon fs-32 text-center flex my-4 py-4 white">
                            CREATE PROJECT
                        </div>
                        <div className="flex-col">
                            {
                                renderNew.map((item: any, index: any) =>
                                    <div 
                                        className="flex my-2"
                                        key={index}
                                        >
                                        <span  className="my-auto mn-w-120px upper text-lg bold fc-orange" >{item.label}</span>
                                        <input className="my-auto white w-fill border-none text-xl blank-box ta-left b-b"  
                                            type="text" 
                                            value={item.value} 
                                            placeholder={item.placeHolder} 
                                            onChange={(e: any) => item.setter(e.target.value)}
                                            />
                                    </div>
                                )
                            }
                        </div>
                        <div className="w-100 my-4">
                            <div className="rounded btn-back-blue mx-auto flex w-fit py-2 px-4 pointer btn-hover" onClick={() => createProject()}>
                                <span className="m-auto text-2xl upper c-white bold px-4">Create</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-8 p-2">
                    <div className="btn-back-dark btn-back-dark rounded">
                        <div className="flex back-blue rounded-top p-3 b-b-blue btn-back-gradient-reverse">
                            <img src={class6Img} className="size-40px rounded mx-2 m-auto-v" alt="" />
                            <div className="flex-col bottom my-auto ff-point-cufon">
                                <p className="mb-0 fs-20 bold c-white">CURRENT PROJECTS</p>
                                {/* <p className="mb-0"><span className="fc-grey">Stake</span><span className="bold"> Kainu NFT </span><span className="fc-grey">to earn</span><span className="bold"> CIFI</span></p> */}
                            </div>
                        </div>
                        <div className="p-4 grid3 mn-h-70vh pc-mx-h-70vh scroll-v-1">
                            {
                                Projects.map((item: any, index: any) =>
                                    <div
                                        className={"bd-shiny on rounded flex h-fit relative pointer p-4 border-gradient active"}
                                        key={index}
                                        // onClick={() => dispatch(clickGallery(index))}
                                        >
                                        <span className="text-base abs white">
                                            {item.name}
                                        </span>
                                        <div className="p-4 h-fit">
                                            <img src={item.image} className="w-mx-100p rounded" alt="" />
                                        </div>
                                        {/* <span className="abs bottom right p-2" >
                                            <i className="icofont-check-circled c-green bold fs-32"></i>
                                        </span> */}
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

export default withTranslation('common')(BlindFiPanel)
