import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import anySwapImg from "../../../assets/img/icons/anyswap.png"
import santaFeImg from "../../../assets/img/icons/SantaFe2.png"
import olympicImg from "../../../assets/img/icons/Olympic_God.jpg"
import class6Img  from "../../../assets/img/dragons/tinified/Foreverwing_6.jpg"

import cn from "classnames"

import {showError, toggleActive } from "../../common/libs/functions"
import { useAppContext } from "../../common/libs/context";

import Claimed from "./Claimed";

import Countdown from 'react-countdown';

import { RootState } from '../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../app/hook'
import { setShowClaimed, setIsLoad, setActivePool, setActiveMenu, setSNFT_V1_data, setSNFT_V2_data, LEFT_MENU } from "./poolSlice"
import { contractAddress, net_state } from "../../../contracts";
import { MENU_LIST, NetworkArray, NETWORK_TYPES, NUM_ARR } from "../../common/libs/constant";

import FamosoStaking from "./FamosoStaking";

import styles from "./Pool.module.sass"

function Pool() {
    const dispatch = useAppDispatch()
    const isProcess = useAppSelector((state: RootState) => state.pool.isProcess)
    const showClaimed = useAppSelector((state: RootState) => state.pool.showClaimed)
    const isLoaded = useAppSelector((state: RootState) => state.pool.isLoaded)
    const sNFT_V1_data = useAppSelector((state: RootState) => state.pool.sNFT_V1_data)
    const sNFT_V2_data = useAppSelector((state: RootState) => state.pool.sNFT_V2_data)
    const activePool = useAppSelector((state: RootState) => state.pool.activePool)
    const activeMenu = useAppSelector((state: RootState) => state.pool.activeMenu)

    const {isConnected, walletAddress, isCorrectNet, connectedNetwork} = useAppContext()
    const {contracts} = useAppContext()

    function toggleActivePool(){
        dispatch(setActivePool(!activePool))
        toggleActive(".gradient-text.active-pool", "fs-32")
    }

    function claimSantaV1(){
        dispatch(setShowClaimed(true))
    }

    const url = window.location.pathname;
    useEffect(() => {
        if(isCorrectNet && isConnected) init()
    }, [walletAddress, isCorrectNet, isConnected, url])

    function init(){
        if(connectedNetwork === NETWORK_TYPES.BSC_MAIN || connectedNetwork === NETWORK_TYPES.BSC_TEST) return
        if(window.web3 && window.web3.eth){
            let NftStaking: any = new window.web3.eth.Contract(contracts.abis.NftStaking , contractAddress[connectedNetwork].NftStaking)
            let NftStakingV2: any = new window.web3.eth.Contract(contracts.abis.NftStakingV2 , contractAddress[connectedNetwork].NftStakingV2)
            
            if(isConnected && isCorrectNet){
                NftStaking.methods.totalPowa().call()
                .then((totalPowa: any) => {
                    console.log("total Powa", totalPowa)
                    NftStaking.methods._rewardRate().call()
                    .then((rewardVal: any) => {
                        NftStaking.methods._powaBalances(walletAddress).call()
                        .then((myPowa: any) => {
                            NftStaking.methods.getRemainTime().call()
                            .then((_remainTime: any) => {
                                let tmpReward: any = 0.00
                                let rewardRes = Number(rewardVal)*86400 / (10**18)
                                if((rewardRes > 0) && Number(totalPowa) > 10){
                                    tmpReward = Number(rewardRes * (Number(myPowa) / Number(totalPowa))).toFixed(4)
                                }
                                let tmp: any = {}
                                tmp.totalPowa = Number(totalPowa/(10**18)).toFixed(2)
                                tmp.reward = tmpReward
                                tmp.time = Number(_remainTime)*1000 + new Date().getTime()
                                console.log("setSNFT_V1_data", tmp)
                                dispatch(setSNFT_V1_data(tmp))
                                dispatch(setIsLoad(true))
                            })
                        })
                    })
                })
                .catch((err: any) => {
                    console.log(err)
                })

                
                NftStakingV2.methods.totalPowa().call()
                .then((totalPowa: any) => {
                    NftStakingV2.methods._rewardRate().call()
                    .then((rewardVal: any) => {
                            NftStakingV2.methods._powaBalances(walletAddress).call()
                            .then((myPowa: any) => {
                                    NftStakingV2.methods.getRemainTime().call()
                                    .then((_remainTime: any) => {
                                        let tmpReward: any = "0.0000"
                                        let rewardRes: any = Number(Number(rewardVal)*86400 / (10**18)).toFixed(4)
                                        if((rewardRes > 0) && Number(totalPowa) > 10){
                                            tmpReward = Number(rewardRes * (Number(myPowa) / Number(totalPowa))).toFixed(4)
                                        }

                                        let tmp: any = {}
                                        tmp.totalPowa = Number(Number(totalPowa)/(10**18)).toFixed(2)
                                        tmp.reward = tmpReward
                                        tmp.time = Number(_remainTime)*1000 + new Date().getTime()
                                        console.log("staking v2 ", tmp)
                                        dispatch(setSNFT_V2_data(tmp))
                            //             dispatch(setIsLoad(true))
                                    })
                            })
                    })
                })
            }
            
        }

        // getLootBoxTokens()
    }

    const getLootBoxTokens = () => {
        let LootBoxContract: any = new window.web3.eth.Contract(contracts.abis.LootBox , contractAddress[connectedNetwork].LootBox)
        let ts: any = 0
        let fs: any = 0;
        return checkId(1, 0, 0, LootBoxContract)
    }

    const checkId = (ts: any, fs: any, id: any, LootBoxContract: any) => {
        if(id > 10000) return
        return LootBoxContract.methods.exists(id)
        .call()
        .then((res: any) => {
            if(res) ts ++
            else fs ++
            console.log(id, res, ts, fs)
            return checkId(ts, fs, id + 1, LootBoxContract)
        })
        .catch((err: any) => {
            return checkId(ts, fs, id, LootBoxContract)
        })
    }
        
    const Completionist = () => <p className="m-auto flex-item text-center">Ended</p>;

    const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
        if (completed) {
            return <Completionist />;
        } else {
            return (
                days > 0 ?
                <p className="m-auto flex-item text-center">{days + "d " + hours + "h " + minutes + "m"}</p>
                :
                <p className="m-auto flex-item text-center">{hours + "h " + minutes + "m " + seconds + "s"}</p>
            )
        }
    };

    const leftMenus = ['All', "NFT Pools", "Farming"]

    const clickLeftMenu = (menu: number) => {
        if((menu === LEFT_MENU.FARM) && (connectedNetwork !== NETWORK_TYPES.MATIC_TEST)) return false
        else return dispatch(setActiveMenu(menu))
    }

    return (
        <div className="swap-page mn-h-80">
            <div className="flex w-100 text-center py-4" hidden={!isProcess}>
                {/* <div 
                    className="bd-shiny active c-white text-center btn-back-gradient bold text-2xl py-3 px-8 mt-4 pointer" 
                    hidden={isProcess || connectedNetwork === NETWORK_TYPES.BSC_MAIN || connectedNetwork === NETWORK_TYPES.BSC_TEST} 
                    onClick={() => claimSantaV1()}>
                    Claim Santa sNFT
                </div> */}
                {/* <div 
                    className="bd-shiny active c-white mn-w-120px text-center back-dark mx-4 rounded bold text-2xl py-3 px-8 mt-4 pointer" 
                    hidden={remaimMilli <= 0} 
                    >
                    {remainTime}
                </div> */}
                <div className="flex">
                    <div className="m-auto">
                        <div className="loader-animation my-4"></div>
                    </div>
                </div>

            </div>
            <div className="flex my-4">
                <div className="flex-col col-md-3 sp-hide">
                    {
                        leftMenus.map((item: any, index: any) => 
                            <div 
                                key={index} 
                                onClick={() => clickLeftMenu(index)}
                                className={cn("bd-shiny btn-hover c-white1 text-center dot w-100 p-4 mx-2 my-2 pointer text-lg bold", {"active": index === activeMenu })}>
                                {item}
                            </div>
                        )
                    }
                </div>
                <div className="flex-col col-md-9 px-3">
                    <div className="flex w-100 relative">
                        <input 
                            type="text" 
                            className="bd-show-hover bd-shiny on rounded w-100 p-3 my-2 border-gradient p-1 btn-back-dark white" 
                            placeholder="Search by name, symbol, address"
                            />
                        <i className="icofont-search search-after mr-4"></i>
                    </div>
                    <div className="dropdown flex right pc-hide w-100" id="lang-sel-dropdown">
                        <div className="dropdown-toggle border-gradient border-show w-100 py-3 px-4 btn-back-dark rounded pointer after-none white flex m-auto-v" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span className="m-auto-v mr-4">{leftMenus[activeMenu]}</span>
                            <span className="m-auto-v right">
                                <i className="icofont-thin-down"></i>
                            </span>
                        </div>
                        <div className="dropdown-menu btn-back-dark border-gradient ff-point-cufon border-show rounded p-3 w-100" aria-labelledby="dropdownMenuButton">
                            {
                                leftMenus.map((item: any, index: any) => 
                                    <div 
                                        key={index} 
                                        onClick={() => clickLeftMenu(index)}
                                        className="dropdown-item pointer rounded p-2 hover-back-dark">
                                        <span className="white">{item}</span>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                    <div>
                        <div className="flex my-4 ff-point-cufon wrap-not fs-20">
                            <span 
                                className={"no-wrap m-auto-v gradient-text fc-grey pointer active-pool fs-32 active"} 
                                onClick={() => toggleActivePool()}
                                >ACTIVE POOLS</span>
                            <span className="mx-4 fc-grey m-auto-v fs-32">|</span>
                            <span 
                                className={"no-wrap m-auto-v gradient-text fc-grey pointer active-pool "}
                                onClick={() => toggleActivePool()}
                                >CLOSED POOLS</span>
                            <div className="w-100 b-b-gradient m-auto-v"></div>
                        </div>
                        <div className="text-base" hidden={activeMenu === LEFT_MENU.FARM}>
                            <div className="flex w-100 py-2 my-3 fc-grey bold flex-4">
                                <div className="flex pointer text-center flex-item m-auto"><span className="m-auto-v">Pools</span><i className="icofont-thin-down m-auto-v sort up"></i></div>
                                <div className="flex pointer text-center flex-item m-auto sp-hide"><span className="m-auto-v">Stakingpowa</span><i className="icofont-thin-down m-auto-v sort"></i></div>
                                <div className="flex pointer text-center flex-item m-auto"><span className="m-auto-v">Reward</span><i className="icofont-thin-down m-auto-v sort"></i></div>
                                <div className="flex pointer text-center flex-item m-auto"><span className="m-auto-v">Time</span><i className="icofont-thin-down m-auto-v sort"></i></div>
                            </div>
                            <div hidden={connectedNetwork === NETWORK_TYPES.BSC_MAIN}>
                                <div className="flex py-8 my-4 w-100 text-center" hidden={isLoaded}>
                                    <div className="loader-animation m-auto-h my-4 w-fit"></div>
                                </div>
                                <div hidden={!activePool || !isLoaded}>
                                    <Link to="/kainu" className="flex w-100 btn-back-dark rounded bd-shiny active p-3 my-3 flex-4">
                                        <div className="flex pointer m-auto flex-item">
                                            <img src={class6Img} className="size-32px br-6 m-auto-v mx-2 sp-hide" alt="" />
                                            <div className="flex-col">
                                                <span className="ff-point-cufon m-auto-v white">Kainu Chronicles</span>
                                                <span className="fc-grey my-1 pc-hide ff-point-cufon">{sNFT_V1_data.totalPowa} POWA</span>
                                            </div>
                                        </div>
                                        <div className="flex fw-light ff-point-cufon pointer flex-item m-auto-v sp-hide m-auto text-center">{sNFT_V1_data.totalPowa}</div>
                                        <div className="flex pointer flex-item m-auto text-center">
                                            <img src={anySwapImg} className="size-32px br-6 m-auto-v mx-2 sp-hide" alt="" />
                                            <span className="fw-light m-auto-v ff-point-cufon">{sNFT_V1_data.reward} CIFI/day</span>
                                        </div>
                                        <div className="flex-item m-auto-v pointer m-auto text-center">
                                            <span className="fw-light ff-point-cufon">
                                                {
                                                    Number(sNFT_V1_data.time) > 100 ?
                                                    <Countdown
                                                        date={Number(sNFT_V1_data.time)}
                                                        renderer={renderer} />
                                                    :
                                                    <></>
                                                }
                                            </span>
                                        </div>
                                    </Link>
                                    <Link to="/olympic" className="flex w-100 btn-back-dark rounded bd-shiny active p-3 my-3 flex-4">
                                        <div className="flex pointer m-auto flex-item">
                                            <img src={olympicImg} className="size-32px br-6 m-auto-v mx-2 sp-hide" alt="" />
                                            <div className="flex-col">
                                                <span className="ff-point-cufon m-auto-v white">Olympics2020</span>
                                                <span className="fc-grey my-1 pc-hide ff-point-cufon">{sNFT_V2_data.totalPowa} POWA</span>
                                            </div>
                                        </div>
                                        <div className="flex pointer fw-light ff-point-cufon m-auto-v flex-item sp-hide m-auto text-center">{sNFT_V2_data.totalPowa}</div>
                                        <div className="flex pointer m-auto flex-item text-center">
                                            <img src={anySwapImg} className="size-32px br-6 m-auto-v mx-2 sp-hide" alt="" />
                                            <span className="fw-light m-auto-v ff-point-cufon"> {sNFT_V2_data.reward} CIFI/day</span>
                                            {/* <i className="icofont-money text-2xl c-white"></i> */}
                                        </div>
                                        <div className="m-auto-v flex-item pointer m-auto text-center">
                                            <span className="fw-light ff-point-cufon">
                                                {
                                                    Number(sNFT_V2_data.time) > 100 ?
                                                    <Countdown
                                                        date={Number(sNFT_V2_data.time)}
                                                        renderer={renderer} />
                                                    :
                                                    <></>
                                                }
                                            </span>
                                        </div>
                                    </Link>
                                    
                                    <div className="flex w-100 btn-back-dark bd-shiny active rounded p-3 my-2 flex-4 white" hidden={activeMenu !== LEFT_MENU.ALL}>
                                        <div className="flex pointer m-auto flex-item">
                                            <img src={santaFeImg} className="size-32px br-6 m-auto-v mx-2 sp-hide" alt="" />
                                            <span className="ff-point-cufon m-auto-v">YOUR PROJECT</span>
                                        </div>
                                        <div className="flex pointer m-auto-v flex-item sp-hide m-auto text-center">??</div>
                                        <div className="flex pointer m-auto flex-item text-center">
                                            ??
                                        </div>
                                        <div className="flex-col m-auto-v flex-item pointer m-auto text-center">
                                            <a href="https://wmvnfss8t3b.typeform.com/to/mSvEZRUT" className="bd-shiny active btn-back-gradient rounded pointer py-2 px-4 w-fit m-auto-h text-lg bold btn-hover">
                                                <span className="px-3 c-white">Apply</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div hidden={activePool}>
                                    <div className="my-8 py-8">
                                        <p className="my-8 py-8 text-center fs-20 fc-grey">
                                            No Pool
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex mb-4 py-8" hidden={connectedNetwork !== NETWORK_TYPES.BSC_MAIN}>
                                <div 
                                    className="bd-shiny mx-auto mt-4 active c-white text-center btn-back-gradient bold text-2xl py-3 px-8 pointer" 
                                    >
                                    <span className="px-8">
                                        Coming Soon
                                    </span>
                                </div>
                            </div>
                        </div>
                        {
                            connectedNetwork === NETWORK_TYPES.MATIC_TEST ?
                            <FamosoStaking />
                            :
                            <></>
                        }
                    </div>
                </div>
            </div>
            <Claimed 
                isModalOpen={showClaimed}
                onHide={() => dispatch(setShowClaimed(false))}
            />
        </div>
    )
}

export default Pool;
