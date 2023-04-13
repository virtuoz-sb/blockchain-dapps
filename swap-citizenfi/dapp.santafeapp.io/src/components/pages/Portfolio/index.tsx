import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import portfolioImg from "../../../assets/img/icons/portfolio.svg"

import jQuery from "jquery"
import { isSameAddress, shortAddress, showError } from "../../common/libs/functions"
import { useAppContext } from "../../common/libs/context";

import { RootState } from '../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../app/hook'
import { clearDisplayItems, addDisplayItems } from "./portfolioSlice"
import { setActiveMenu, setActiveTab, getTokensFromContract, getSaleTokens, setIsLoaded } from "./portfolioSlice"

import { contractAddress, net_state } from "../../../contracts";
import { NETWORK_TYPES } from "../../common/libs/constant";
import { graphEndPoint } from "../../common/libs/data";

const tabs: any = [
    // MATIC_MAIN
    {
        label: "Kainu",
        network: NETWORK_TYPES.MATIC_MAIN
    },
    {
        label: "Olympic2020",
        network: NETWORK_TYPES.MATIC_MAIN
    },
    {
        label: "MetaNFT",
        network: NETWORK_TYPES.MATIC_MAIN
    },
    //BSC_MAIN
    {
        label: "MetaNFT",
        network: NETWORK_TYPES.BSC_MAIN
    },
    {
        label: "Meta",
        network: NETWORK_TYPES.BSC_MAIN
    },
    // MATIC_TEST
    {
        label: "Kainu",
        network: NETWORK_TYPES.MATIC_TEST
    },
    {
        label: "Olympic2020",
        network: NETWORK_TYPES.MATIC_TEST
    },
    {
        label: "Santa sNFTV3",
        network: NETWORK_TYPES.MATIC_TEST
    },
    {
        label: "MetaNFT",
        network: NETWORK_TYPES.MATIC_TEST
    },
    {
        label: "Meta",
        network: NETWORK_TYPES.MATIC_TEST
    },
]

function Portfolio() {
    const dispatch = useAppDispatch()
    const {isConnected, walletAddress, isCorrectNet, networkId, balance, symbol, connectedNetwork, cifiBalance} = useAppContext()
    const {contracts} = useAppContext()
    
    const activeMenu = useAppSelector((state: RootState) => state.portfolio.activeMenu)
    const activeTab  = useAppSelector((state: RootState) => state.portfolio.activeTab)
    const displayItems = useAppSelector((state: RootState) => state.portfolio.displayItems)
    const isLoaded = useAppSelector((state: RootState) => state.portfolio.isLoaded)

    const [isInit, setIsInit] = useState<boolean>(false)

    function toggleMenu(id: number){
        if(id === 2) return
        dispatch(setActiveMenu(id))
        getNfts(activeTab, id)
    }

    const url = window.location.pathname;
    useEffect(() => {
        init()
    }, [walletAddress, isCorrectNet, isConnected, url])

    function init(){
        if(connectedNetwork === NETWORK_TYPES.BSC_MAIN) dispatch(setActiveTab(3))
        if(!isInit && isConnected)getNfts(activeTab, activeMenu)
    }

    function getNfts(index: any, menu: any){
        if(tabs[index].network !== connectedNetwork) return
        else if(window.web3 && window.web3.eth ){
            dispatch(clearDisplayItems(true))
            setIsInit(true)
            dispatch(setIsLoaded(false))
            if(tabs[index].label === "Kainu"){
                if(menu === 1) dispatch(getSaleTokens('https://api.santafeapp.io/asset/', contractAddress[connectedNetwork].SantaV1, walletAddress, graphEndPoint[connectedNetwork]))
                else dispatch(getTokensFromContract('https://api.santafeapp.io/asset/', contracts.abis.SantaV1 , contractAddress[connectedNetwork].SantaV1, walletAddress))
            }
            else if(tabs[index].label === "Olympic2020"){
                if(menu === 1) dispatch(getSaleTokens('https://api.santafeapp.io/santaV2/', contractAddress[connectedNetwork].SantaV2, walletAddress, graphEndPoint[connectedNetwork]))
                else dispatch(getTokensFromContract('https://api.santafeapp.io/santaV2/', contracts.abis.SantaV2 , contractAddress[connectedNetwork].SantaV2, walletAddress ))
            }else if((tabs[index].label === "Santa sNFTV3") && (net_state === 1)){
                // getTokens('https://api.santafeapp.io/santaV2/', contracts.abis.SantaV2 , "0x6F871dAB68049f987766533a798A5491751F4256", 3 )
            }else if((tabs[index].label === "MetaNFT")){
                if(menu === 1) dispatch(getSaleTokens('https://api.arvrse.co/assets/metapack/', contractAddress[connectedNetwork].LootBox, walletAddress, graphEndPoint[connectedNetwork]))
                else if(menu === 0) dispatch(getTokensFromContract('https://api.arvrse.co/assets/metapack/', contracts.abis.LootBox , contractAddress[connectedNetwork].LootBox, walletAddress))
            }
            else {
                finishLoad()
                return
            }
        }
    }

    function finishLoad(){
        setTimeout(() => {
            dispatch(setIsLoaded(true))
        }, 1000);
    }

    function selectTab(index: any){
        dispatch(setActiveTab(index))
        getNfts(index, activeMenu)
    }

    return (
        <div className="swap-page mn-h-80 mx-1250 py-4 my-4 px-4">
            <div className="flex">
                <img src={portfolioImg} alt="" className="m-auto-v w-3vw" />
                <div className="fex-col m-auto-v mx-4">
                    <div className="white fs-20 bold">
                        {shortAddress(walletAddress)}
                    </div>
                    <div className="fc-grey">
                        {balance + " " + symbol} in Account
                    </div>
                </div>
            </div>
            <div className="flex my-4 py-4">
                <div className="flex left ff-point-cufon">
                    {/* <div className={"flex flex-no-wrap pointer mr-4 fc-grey portfolio-tab " + (activeMenu === 1 ? "active" : "")} onClick={() => toggleTab(1)}>
                        <svg viewBox="0 0 24 24" className="size-20px" focusable="false"><g fill="currentColor" fillRule="evenodd" clipPath="url(#shopping-clip)" clipRule="evenodd"><path d="M7 21a2 2 0 114 0 2 2 0 01-4 0zM18 21a2 2 0 114 0 2 2 0 01-4 0zM0 1a1 1 0 011-1h4a1 1 0 01.98.804L6.82 5H23a1 1 0 01.982 1.187l-1.601 8.398A3 3 0 0119.39 17H9.69a3 3 0 01-2.99-2.414L5.03 6.239a.994.994 0 01-.017-.084L4.18 2H1a1 1 0 01-1-1zm7.22 6l1.44 7.195a1 1 0 001 .805h9.76a1 1 0 00.998-.802L21.792 7H7.221z"></path></g><defs><clipPath id="shopping-clip"><path fill="#fff" d="M0 0H24V24H0z"></path></clipPath></defs></svg>
                        <span className="mx-2 text-lg bold sm-hide">Offers</span>
                    </div> */}
                    <div className={"flex flex-no-wrap pointer mr-4 fc-grey portfolio-tab " + (activeMenu === 0 ? "active" : "")} onClick={() => toggleMenu(0)}>
                        {/* <svg viewBox="0 0 24 24" focusable="false" className="size-20px"><path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C11.7938 1.5 11.6022 1.56242 11.443 1.66939L1.46904 8.15243C1.39946 8.19598 1.33455 8.2486 1.2762 8.30996C1.21062 8.37876 1.15544 8.4563 1.11207 8.54002C1.03687 8.68473 1.0003 8.84161 1 8.99732L1 9V16L1 16.0027C1.00031 16.1687 1.04185 16.3361 1.12749 16.4886C1.16077 16.548 1.20013 16.6041 1.24504 16.6558C1.31197 16.733 1.38878 16.7978 1.47224 16.8496L11.443 23.3306C11.6022 23.4376 11.7938 23.5 12 23.5C12.2062 23.5 12.3978 23.4376 12.557 23.3306L22.5245 16.8518C22.6375 16.7823 22.7384 16.689 22.8193 16.5735C22.9453 16.3935 23.0038 16.1864 23 15.9823V9.01775C23.0038 8.81369 22.9453 8.60662 22.8193 8.42662C22.739 8.31192 22.639 8.21923 22.5271 8.14992L12.557 1.66939C12.3978 1.56242 12.2062 1.5 12 1.5ZM20.2124 9.03078L13 4.34269V8.47928L17.0001 11.2794L20.2124 9.03078ZM15.2564 12.5L12.0001 10.2207L8.74382 12.5L12.0001 14.7794L15.2564 12.5ZM7.00002 11.2794L11 8.4794V4.34269L3.78764 9.03072L7.00002 11.2794ZM3 10.9207L5.25623 12.5L3 14.0794V10.9207ZM7.00002 13.7207L11 16.5207V20.6573L3.78771 15.9693L7.00002 13.7207ZM13 16.5208L17.0001 13.7207L20.2124 15.9693L13 20.6573V16.5208ZM18.7439 12.5L21 10.9208V14.0793L18.7439 12.5Z" fill="currentColor"></path></svg> */}
                        <i className="icofont-wallet m-auto-v fs-20"></i>
                        <span className="mx-2 m-auto-v text-lg bold bottom">In Wallet</span>
                    </div>
                    <div className={"flex flex-no-wrap pointer mr-4 fc-grey portfolio-tab " + (activeMenu === 1 ? "active" : "")} onClick={() => toggleMenu(1)}>
                        {/* <svg viewBox="0 0 24 24" focusable="false" className="size-20px"><path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C11.7938 1.5 11.6022 1.56242 11.443 1.66939L1.46904 8.15243C1.39946 8.19598 1.33455 8.2486 1.2762 8.30996C1.21062 8.37876 1.15544 8.4563 1.11207 8.54002C1.03687 8.68473 1.0003 8.84161 1 8.99732L1 9V16L1 16.0027C1.00031 16.1687 1.04185 16.3361 1.12749 16.4886C1.16077 16.548 1.20013 16.6041 1.24504 16.6558C1.31197 16.733 1.38878 16.7978 1.47224 16.8496L11.443 23.3306C11.6022 23.4376 11.7938 23.5 12 23.5C12.2062 23.5 12.3978 23.4376 12.557 23.3306L22.5245 16.8518C22.6375 16.7823 22.7384 16.689 22.8193 16.5735C22.9453 16.3935 23.0038 16.1864 23 15.9823V9.01775C23.0038 8.81369 22.9453 8.60662 22.8193 8.42662C22.739 8.31192 22.639 8.21923 22.5271 8.14992L12.557 1.66939C12.3978 1.56242 12.2062 1.5 12 1.5ZM20.2124 9.03078L13 4.34269V8.47928L17.0001 11.2794L20.2124 9.03078ZM15.2564 12.5L12.0001 10.2207L8.74382 12.5L12.0001 14.7794L15.2564 12.5ZM7.00002 11.2794L11 8.4794V4.34269L3.78764 9.03072L7.00002 11.2794ZM3 10.9207L5.25623 12.5L3 14.0794V10.9207ZM7.00002 13.7207L11 16.5207V20.6573L3.78771 15.9693L7.00002 13.7207ZM13 16.5208L17.0001 13.7207L20.2124 15.9693L13 20.6573V16.5208ZM18.7439 12.5L21 10.9208V14.0793L18.7439 12.5Z" fill="currentColor"></path></svg> */}
                        <i className="icofont-shopping-cart m-auto-v fs-20"></i>
                        <span className="mx-2 m-auto-v text-lg bold bottom">On Sale</span>
                    </div>
                    <div className={"flex flex-no-wrap pointer mr-4 fc-grey portfolio-tab " + (activeMenu === 2 ? "active" : "")} onClick={() => toggleMenu(2)}>
                        {/* <svg viewBox="0 0 24 24" focusable="false" className="size-20px"><g fill="currentColor" clipPath="url(#clip-gatchabox)"><path d="M12.5 0a1 1 0 011 1v1a1 1 0 11-2 0V1a1 1 0 011-1zM6.894 2.553a1 1 0 10-1.788.894l.5 1a1 1 0 101.788-.894l-.5-1z"></path><path fillRule="evenodd" d="M10.502 4.403a3 3 0 012.996 0h.002l7 4a3 3 0 01.937.85 1.004 1.004 0 01.249.413A3 3 0 0122 10.999V16a3 3 0 01-1.5 2.595l-.004.002-6.996 3.998-.002.001a3 3 0 01-1.022.363.995.995 0 01-.952 0 3 3 0 01-1.022-.363l-.002-.001-6.996-3.998-.004-.002A3 3 0 012 16v-5.002a3 3 0 01.314-1.333 1.003 1.003 0 01.249-.413 3 3 0 01.937-.85l.004-.001 6.998-4zM13 20.578l6.5-3.714.002-.001a1 1 0 00.498-.864v-4.462l-7 4.05v4.991zm-2-4.991v4.991l-6.5-3.714-.002-.001A1 1 0 014 15.999v-4.462l2.6 1.505v2.278a1 1 0 102 0v-1.122l2.4 1.389zm1.504-9.449l6.457 3.69L12 13.855 5.039 9.828l6.457-3.69.004-.002a1 1 0 011 0l.004.002z" clipRule="evenodd"></path><path d="M.106 6.553a1 1 0 011.341-.447l1 .5a1 1 0 01-.894 1.788l-1-.5a1 1 0 01-.447-1.341zM23.447 7.894a1 1 0 10-.894-1.788l-1 .5a1 1 0 00.894 1.788l1-.5zM19.394 3.447a1 1 0 10-1.788-.894l-.5 1a1 1 0 001.788.894l.5-1z"></path></g><defs><clipPath id="clip-gatchabox"><path fill="#fff" d="M0 0H24V24H0z"></path></clipPath></defs></svg> */}
                        {/* <
                        img src={bankImg} alt="" className="w-24px m-auto-v" /> */}
                        <i className="icofont-bank-alt m-auto-v fs-20"></i>
                        
                        <span className="mx-2 m-auto-v text-lg bold bottom">My Bank</span>
                    </div>
                    {/* <div className={"flex flex-no-wrap pointer mr-4 fc-grey portfolio-tab " + (activeMenu === 4 ? "active" : "")} onClick={() => toggleTab(4)}>
                        <svg viewBox="0 0 24 24" focusable="false" className="size-20px"><path d="M13.4982 14.8205C13.7847 14.5635 14.2508 14.6022 14.5028 14.8945L17.1609 17.951V5.73538C17.1609 5.33394 17.4854 5.00293 17.879 5.00293C18.2725 5.00293 18.597 5.33394 18.597 5.73538V17.951L21.2551 14.8945C21.5416 14.6022 21.9732 14.5635 22.2597 14.8205C22.5462 15.1128 22.5842 15.553 22.3322 15.8453L18.4175 20.3139C18.1241 20.6836 17.6062 20.6273 17.3749 20.3139L13.4257 15.8453C13.1737 15.5565 13.2082 15.0776 13.4982 14.8205Z" fill="currentColor"></path><path d="M2.64091 7.80521L6.52156 3.33167C6.86682 2.97562 7.29839 2.95447 7.59876 3.33167L11.5485 7.80521C11.8005 8.09781 11.7625 8.57372 11.476 8.83106C11.034 9.19063 10.5887 8.94387 10.4713 8.75703L7.81282 5.69711V17.891C7.81282 18.2928 7.48828 18.6242 7.09469 18.6242C6.7011 18.6242 6.37656 18.3316 6.37656 17.9262V5.70064L3.7181 8.76055C3.43154 9.05315 2.99997 9.09193 2.71341 8.83458C2.42685 8.53846 2.38887 8.09781 2.64091 7.80521Z" fill="currentColor"></path></svg>
                        <span className="mx-2 text-lg bold sm-hide">History</span>
                    </div> */}
                </div>
                {/* <div className="right pointer">
                    <svg viewBox="0 0 24 24" focusable="false" className="size-20px white"><path fill="currentColor" fillRule="evenodd" d="M9 6a2 2 0 100 4 2 2 0 000-4zM5 8a4 4 0 118 0 4 4 0 01-8 0zM15 15a2 2 0 100 4 2 2 0 000-4zm-4 2a4 4 0 118 0 4 4 0 01-8 0z" clipRule="evenodd"></path><rect width="9" height="2" x="14" y="7" fill="currentColor" rx="1"></rect><rect width="9" height="2" x="1" y="16" fill="currentColor" rx="1"></rect><rect width="3" height="2" x="1" y="7" fill="currentColor" rx="1"></rect><rect width="3" height="2" x="20" y="16" fill="currentColor" rx="1"></rect></svg>
                </div> */}
            </div>
            
            <div className="flex py-2">
                {
                    tabs.map((item: any, index: any) =>
                        <div 
                            key={index} 
                            hidden={connectedNetwork !== item.network}
                            className={"bd-shiny on rounded-x py-2 px-4 m-2 pointer bold " + (activeTab === index ? "btn-back-gradient c-white" : "btn-back-dark white")}
                            onClick = {() => selectTab(index)}
                            >
                            {item.label}
                        </div>
                    )
                }
            </div>

            <div className="flex py-2">
                <div className="text-center m-auto-h fs-20 fc-grey w-100">
                    {
                        isLoaded === true ?
                            displayItems.length > 0 ?
                            <div className="grid5 mx-1250 m-auto-h p-2">
                                {    
                                    displayItems.map((item: any, index: any) =>
                                        <Link 
                                            to={"/nft/" + item.contractAddress + "/" + item.token_id} 
                                            className="back-dark btn-hover bd-shiny on px-0 rounded m-2 pc-col"
                                            key={index}
                                            >
                                            <div>
                                                <img src={item.image} className="w-mx-100p sp-size-133 rounded-t-pc rounded-l-sp" alt="" />
                                            </div>
                                            <div className="flex-col p-3 w-fill">
                                                <span className="white text-xl bold pc-hide mb-3 left">
                                                    {item.type}
                                                </span>
                                                <div className="flex text-lg">
                                                    <span className="left fc-grey ff-point-cufon my-auto">{item.name}</span>
                                                    <span className="right c-white my-auto">#{item.token_id}</span>
                                                </div>
                                                <div className="flex text-base">
                                                    <span className="left fc-grey ff-point-cufon my-auto">Face Value</span>
                                                    <span className="right c-white my-auto">{item.attributes && item.attributes.face_value ? item.attributes.face_value : ""}</span>
                                                </div>
                                                <div className="flex text-base">
                                                    <span className="left fc-grey ff-point-cufon my-auto">Stakingpowa</span>
                                                    <span className="right c-white my-auto">{item.attributes && item.attributes.stakingpowa ? item.attributes.stakingpowa : ""}</span>
                                                </div>
                                                {/* <div className="flex">
                                                    <span className="left fc-grey">Price</span>
                                                    <span className="right white">50 BNB</span>
                                                </div> */}
                                            </div>
                                        </Link>
                                    )
                                }
                            </div>
                            :
                            <div className="flex text-center w-100 py-8 my-4">
                                <span className="m-auto">No Nfts</span>
                            </div>
                        :
                        <div hidden={isLoaded} className="my-4 py-8 w-100 flex text-center">
                            {/* <img src={loadingSvg} alt="" /> */}
                            <div className="loader-animation my-4 m-auto-h"></div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Portfolio;
