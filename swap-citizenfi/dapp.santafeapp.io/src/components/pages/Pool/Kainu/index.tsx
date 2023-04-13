import React, { useState, useEffect } from "react";
import loadSvg from "../../../../assets/img/icons/svg/rotate.svg"

import { validateWalletAddres } from "../../../common/libs/functions"
import { useAppContext } from "../../../common/libs/context";
import { setIsHarvest, withdrawAll, stakeNft, withdrawNft, STATE, getMyNfts, getStakeNfts, getStakeData } from './kainuStakingSlice'
import { RootState } from '../../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../../app/hook'

import class6Img from "../../../../assets/img/dragons/tinified/Foreverwing_6.jpg"
import { bestGas, bestGasPrice } from "../../../common/libs/constant";
import Countdown from 'react-countdown';
import { contractAddress } from "../../../../contracts";
import { openNotification } from "../../../../app/reducers/appSlice";

const alertify = require("alertifyjs")

function KainuStaking() {
    const dispatch = useAppDispatch()
    const stakeData = useAppSelector((state: RootState) => state.kainuStaking.stakeData)
    const isLoadedStake = useAppSelector((state: RootState) => state.kainuStaking.isLoadedStake)
    const displayItems = useAppSelector((state: RootState) => state.kainuStaking.displayItems)
    const isLoaded = useAppSelector((state: RootState) => state.kainuStaking.isLoaded)
    const isLoadedMyStakes = useAppSelector((state: RootState) => state.kainuStaking.isLoadedMyStakes)
    const myStakes = useAppSelector((state: RootState) => state.kainuStaking.myStakes)
    const isHarvest = useAppSelector((state: RootState) => state.kainuStaking.isHarvest)

    const { isConnected, walletAddress, isCorrectNet, connectedNetwork } = useAppContext()
    const { contracts } = useAppContext()
    const [activeHarvest, setActiveHarvest] = useState<boolean>(true)

    const url = window.location.pathname;
    useEffect(() => {
        init()
    }, [dispatch, url])

    const Completionist = () => <p className="m-auto flex-item text-center">Ended</p>;

    const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
        if (completed) {
            return <Completionist />;
        } else {
            return (
            <p className="m-auto flex-item text-center">{days + "d " + hours + "h " + minutes + "m " + seconds + "s"}</p>
            )
        }
    };

    const init = () => {
        if (validateWalletAddres(walletAddress)) {
            
            if(isLoadedStake === false)dispatch(getStakeData(walletAddress))

            if (isLoaded === false) dispatch(getMyNfts(walletAddress))

            if (isLoadedMyStakes === false) dispatch(getStakeNfts(walletAddress))
        }
    }

    function toggleActiveHarvest(index: number) {
        if (isHarvest > 0) return
        if (index === 1) setActiveHarvest(true)
        else setActiveHarvest(false)
        // toggleActive(".harvest-withdraw", "btn-back-dark")
        if (myStakes.length === 0) return
        if (window.web3 && window.web3.eth && (isConnected === true) && (isCorrectNet === true)) {
            let NftStaking: any = new window.web3.eth.Contract(contracts.abis.NftStaking, contractAddress[connectedNetwork].NftStaking)
            if (index === 1) {
                dispatch(setIsHarvest(1))
                NftStaking.methods.getReward()
                .send({ from: walletAddress, gas: bestGas, gasPrice: bestGasPrice })
                .then((rewardRes: any) => {
                    dispatch(setIsHarvest(0))
                    console.log("reward", rewardRes)
                    return dispatch(openNotification(rewardRes, "Rewarded"))
                })
                .catch((err: any) => {
                    dispatch(setIsHarvest(0))
                })
            } else {
                dispatch(setIsHarvest(2))
                NftStaking.methods.exit()
                .send({ from: walletAddress, gas: bestGas, gasPrice: bestGasPrice })
                .then((withdrawRes: any) => {
                    console.log("reward", withdrawRes)
                    dispatch(withdrawAll(true))
                    dispatch(setIsHarvest(0))
                    return dispatch(openNotification(withdrawRes, "Withdraw Kainu"))
                })
                .catch((err: any) => {
                    dispatch(setIsHarvest(0))
                })
            }
        }
    }

    function stakeIndex(data: any) {
        if (!data.approve && !displayItems[data.index].isApproved) {
            alertify.dismissAll();
            alertify.error("Please approve before stake")
            return
        }
        if (data.approve && displayItems[data.index].isApproved) {
            alertify.dismissAll();
            alertify.error("You have already approved")
            return
        }
        if (window.web3 && window.web3.eth && isConnected && isCorrectNet) {
            data.type = STATE.START
            dispatch(stakeNft(data))

            let ERC721_Contract: any = new window.web3.eth.Contract(contracts.abis.ERC721, displayItems[data.index].contractAddress)
            if (data.approve) {
                ERC721_Contract.methods.setApprovalForAll(contractAddress[connectedNetwork].NftStaking, true)
                .send({ from: walletAddress, gas: bestGas, gasPrice: bestGasPrice })
                .then((approveRes: any) => {
                    data.type = STATE.SUCC
                    dispatch(stakeNft(data))
                    return dispatch(openNotification(approveRes, "Approve Kainu"))
                })
                .catch((err: any) => {
                    data.type = STATE.ERR
                    dispatch(stakeNft(data))
                })
            } else {
                let NftStaking: any = new window.web3.eth.Contract(contracts.abis.NftStaking, contractAddress[connectedNetwork].NftStaking)
                NftStaking.methods.stakeNFT(displayItems[data.index].id, displayItems[data.index].stake_powa, BigInt(displayItems[data.index].face_value * 10 ** 18)).send({ from: walletAddress, gas: bestGas, gasPrice: bestGasPrice })
                .then((stakeRes: any) => {
                    data.type = STATE.SUCC
                    dispatch(stakeNft(data))
                    return dispatch(openNotification(stakeRes, "Stake Kainu"))
                })
                .catch((err: any) => {
                    data.type = STATE.ERR
                    dispatch(stakeNft(data))
                })
            }
        }
    }

    function withDraw(index: any) {
        if (window.web3 && window.web3.eth && isConnected && isCorrectNet) {
            dispatch(withdrawNft({ index: index, type: STATE.START, account: walletAddress }))
            let NftStaking: any = new window.web3.eth.Contract(contracts.abis.NftStaking, contractAddress[connectedNetwork].NftStaking)
            NftStaking.methods.withdrawNFT(myStakes[index].id).send({ from: walletAddress, gas: bestGas, gasPrice: bestGasPrice })
                .then((res: any) => {
                    // dispatch(addDisplayItems(displayItems[index]))
                    dispatch(withdrawNft({ index: index, type: STATE.SUCC, account: walletAddress }))
                })
                .catch((err: any) => {
                    dispatch(withdrawNft({ index: index, type: STATE.ERR, account: walletAddress }))
                })
        }
    }

    return (
        <div className="swap-page">
            <div className="flex py-8 w-100 page-loading-full text-center" hidden={isLoaded && isLoadedMyStakes}>
                <div className="loader-animation m-auto"></div>
            </div>
            <div className="flex py-4 mb-4">
                <div className="col-md-3 flex-col pb-4 mt-2">
                    <div className="bd-shiny active px-0 rounded btn-back-dark h-100 flex-col py-2">
                        <div className=" ff-point-cufon fs-32 text-center flex my-4 p-4 white">
                            PROJECT DETAILS
                        </div>
                        <div className="p-2">
                            <p className="text-lg p-4 ff-point-cufon white">
                                Earn fungible tokens by staking non-fungible tokens
                            </p>
                            <p className="fc-grey text-lg px-4">
                                Stake related NFTs to earn fungible token. Recover your locked assets after staking ends
                                {/* Stake Kainu NFT to earn CIFI */}
                            </p>
                        </div>
                        {/* <div className="w-100 right flex bottom pc">
                            <img src={borrowImg} className="w-mx-100p right bottom" alt="" />
                        </div> */}
                    </div>
                </div>
                <div className="col-md-6 flex-col pb-4 mt-2">
                    <div className="bd-shiny active px-0 rounded btn-back-dark h-100">
                        <div className="flex back-blue rounded-top p-4 b-b-blue btn-back-gradient-reverse">
                            <img src={class6Img} className="size-40px rounded mx-2 m-auto-v" alt="" />
                            <div className="flex-col m-auto-v c-white ff-point-cufon">
                                <p className="mb-0 fs-20 bold">KAINU CHRONICLES</p>
                                <p className="mb-0"><span className="fc-grey">Stake</span><span className="bold"> Kainu NFT </span><span className="fc-grey">to earn</span><span className="bold"> CIFI</span></p>
                            </div>
                        </div>
                        <div className="flex-col py-4 px-3 white">
                            <div className="flex item-center w-100 bold flex-3 ff-point-cufon">
                                <p className="m-auto fc-grey flex-item text-center">My Powa</p>
                                <p className="m-auto fc-grey flex-item text-center">Earned</p>
                                <p className="m-auto fc-grey flex-item text-center">Halving</p>
                            </div>
                            {/* <div className="flex p-4 w-100 text-center" hidden={isLoadedStake}>
                                <div className="loader-animation-sm m-auto-h w-fit"></div>
                            </div> */}
                            <div className="flex item-center w-100 my-2 py-2 flex-3">
                                <p className="m-auto flex-item text-center">{stakeData.totalPowa}</p>
                                <p className="m-auto flex-item text-center">{stakeData.earned}</p>
                                {
                                    Number(stakeData.time) > 100 ?
                                    <Countdown
                                        date={Number(stakeData.time)}
                                        renderer={renderer} />
                                    :
                                    <></>
                                }
                                {/* <p className="m-auto flex-item text-center">{convertSecond2DateTime(endingTime)}</p> */}
                            </div>
                            <div className="flex w-100 btn-back-gradient rounded p-1 space-center">
                                <div
                                    className={"text-center btn-hover w-50 flex rounded p-2 text-lg pointer fc-grey bold harvest-withdraw active-bd-or " + (activeHarvest ? " btn-back-dark active" : "")}
                                    onClick={() => toggleActiveHarvest(1)}
                                >
                                    <span className="m-auto" hidden={isHarvest === 1} >Harvest</span>
                                    <img hidden={isHarvest !== 1} src={loadSvg} alt="" className="m-auto-h my-1 w-mx-100p" />
                                </div>
                                <div
                                    className={"text-center btn-hover w-50 flex rounded p-2 text-lg pointer fc-grey bold harvest-withdraw active-bd-or " + (activeHarvest ? "" : " btn-back-dark active")}
                                    onClick={() => toggleActiveHarvest(2)}
                                >
                                    <span className="m-auto" hidden={isHarvest === 2}>Withdraw All</span>
                                    <img hidden={isHarvest !== 2} src={loadSvg} alt="" className="m-auto-h my-1 w-mx-100p" />
                                </div>
                            </div>
                            <p className="white fs-20 bold mb-2 pt-4 ff-point-cufon">
                                My Stake
                            </p>
                            <div className="flex py-8 my-4 w-100 text-center" hidden={isLoadedMyStakes}>
                                <div className="loader-animation-sm m-auto-h my-4"></div>
                            </div>
                            <div className="flex-col pc-mx-h-50vh sp-mx-h-80vh scroll-v-1" hidden={!isLoadedMyStakes}>

                                {
                                    myStakes.length > 0 ?
                                        myStakes.map((item: any, index: any) =>
                                            <div key={index} className={"flex flex-no-wrap my-4"}>
                                                <div className="rounded p-2">
                                                    <img src={item.image} className="rounded w-100 mx-size-150" alt="" />
                                                </div>
                                                <div className="flex sp-flex-col w-fill">
                                                    <div className="flex-col mx-2 left">
                                                        <p className="fc-grey fs-20 bold mb-0">
                                                            {item.name}
                                                        </p>
                                                        <p className="bold text-base">
                                                            Powa: {Number(item.mining_powa).toFixed(2) || ""}
                                                        </p>
                                                    </div>
                                                    <div className="right w-fit sp-left">
                                                        <p
                                                            hidden={myStakes[index].isProgress}
                                                            className="bd-shiny btn-hover rounded-btn-x text-center text-lg pointer bold mb-0 text-center back-dark c-white rounded py-2 px-4"
                                                            onClick={() => withDraw(index)}
                                                        >
                                                            Withdraw
                                                        </p>
                                                        <div
                                                            hidden={!myStakes[index].isProgress}
                                                            className="bd-shiny rounded-btn-x text-center text-lg mn-w-120px pointer bold mb-0 text-center back-dark c-white rounded py-1 px-4"
                                                        >
                                                            <img src={loadSvg} alt="" className="m-auto-h my-2 w-mx-100p" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                        :
                                        <p className="fc-grey text-lg m-auto-h my-4 bold">
                                            No data
                                        </p>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 flex-col pb-4 mt-2">
                    <div className="bd-shiny active px-0 rounded btn-back-dark py-4 px-2 flex-col h-100">
                        <div className=" ff-point-cufon fs-32 text-center my-4 py-2 white">
                            AVAILABLE NFT
                        </div>
                        <div className=" pc-mn-h-70vh scroll-v-1 hide-scroll p-2 pc-mx-h-100vh">

                            {
                                isLoaded === false ?
                                    <div className="flex py-8 my-4 w-100 text-center">
                                        <div className="loader-animation m-auto-h my-4 w-fit"></div>
                                    </div>
                                    :
                                    displayItems.length > 0 ?
                                        displayItems.map((item: any, index: any) =>
                                            <div key={index} className="flex-col mb-4">
                                                <div className="flex">
                                                    <img src={item.image} alt="" className="bd-shiny on rounded m-auto-h w-mx-100p mx-size-150 right" />
                                                    <div className="flex-col p-2 left">
                                                        <span className="fc-grey text-lg bold mb-2">{item.name}</span>
                                                        <span className="text-base mb-1">Stakingpowa: {item.stake_powa}</span>
                                                        <span className="text-base mb-1">Class: {item.class}</span>
                                                        <span className="text-base mb-1">Face Value: {item.face_value}</span>
                                                    </div>
                                                </div>
                                                <div className="flex w-100 btn-back-gradient rounded p-1 space-center pointer mt-4 mb-1">
                                                    <div
                                                        className={"text-center btn-hover w-50 rounded p-1 text-lg pointer fc-grey bold harvest-withdraw active-bd-or " + (!item.isApproved ? " btn-back-dark active" : "")}
                                                        hidden={(item.isProgress === true)}
                                                        onClick={() => stakeIndex({ index: index, approve: true, account: walletAddress })}
                                                    >
                                                        <span>APPROVE</span>
                                                    </div>
                                                    <div
                                                        className={"text-center btn-hover w-50 rounded p-1 text-lg pointer fc-grey bold harvest-withdraw active-bd-or " + (!item.isApproved ? "" : " btn-back-dark active")}
                                                        hidden={(item.isProgress === true)}
                                                        onClick={() => stakeIndex({ index: index, approve: false, account: walletAddress })}
                                                    >
                                                        STAKE</div>
                                                    <img hidden={!(item.isProgress === true)} src={loadSvg} alt="" className="m-auto-h my-2 w-mx-100p" />
                                                </div>
                                            </div>
                                        )
                                        :

                                        <p className="fc-grey text-base text-center py-4 flex"><span className="my-4 py-4">No data</span></p>

                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default KainuStaking
