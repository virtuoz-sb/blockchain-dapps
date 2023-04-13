import React, { useState, useEffect } from "react";
import santaFeImg from "../../../assets/img/icons/SantaFe2.png";
// import borrowImg from "../../../assets/img/icons/borrowing.png"
import loadSvg from "../../../assets/img/icons/svg/rotate.svg"

import jQuery from "jquery";

import { isSameAddress, toggleActive, tstmp2datetime } from "../../common/libs/functions"
import { useAppContext } from "../../common/libs/context";
import { bestGas, bestGasPrice } from "../../common/libs/constant";
import { contractAddress } from "../../../contracts";

const alertify = require("alertifyjs")

function SantaBa() {

    const { isConnected, walletAddress, isCorrectNet, connectedNetwork } = useAppContext()
    const { contracts } = useAppContext()
    const [activeHarvest, setActiveHarvest] = useState<boolean>(true)
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [isLoadedStake, setIsLoadedStake] = useState<boolean>(false)
    const [displayItems, setDisplayItems] = useState<any>([])
    const [activeToggle, setActiveToggle] = useState<any>([])
    const [isProgress, setIsProgress] = useState<any>([])
    const [myStakes, setMyStakes] = useState<any>([])
    const [stakeProgress, setStakeProgress] = useState<any>([])
    const [isLoadedMyStakes, setIsLoadedMyStakes] = useState<boolean>(false)

    const [setCurTimeStamp] = useState<any>(new Date().getTime()+(new Date().getTimezoneOffset()*60000))
    const [isSyncTime, setIsSyncTime] = useState<boolean>(false)
    const [endingTime, setEndingTime] = useState<any>(0)

    const [stakeData, setStakeData] = useState<any>({
        totalPowa: 0.0,
        earned: "0.00",
        time: "0:00:00:00"
    })

    const SantaV1_BaseUri = 'https://api.santafeapp.io/asset/';

    const url = window.location.pathname;
    useEffect(() => {
        console.log("useEffect", url)
        init()
    }, [walletAddress, isCorrectNet, isConnected, url])

    // init()

    async function init() {
        syncTime()
        if (window.web3 && window.web3.eth && (isConnected === true) && (isCorrectNet === true)) {
            let SantaV1_Contract: any = new window.web3.eth.Contract(contracts.abis.SantaV1, contractAddress[connectedNetwork].SantaV1)

            let NftStaking: any = new window.web3.eth.Contract(contracts.abis.NftStaking, contractAddress[connectedNetwork].NftStaking)
            await NftStaking.methods._powaBalances(walletAddress).call()
                .then((_powaBalancesRes: any) => {

                    NftStaking.methods.earned(walletAddress).call()
                        .then((earnedRes: any) => {

                            NftStaking.methods.getRemainTime().call()
                                .then((_reaminTime: any) => {

                                    // NftStaking.methods._punishTime().call()
                                    //     .then((_punishTimeRes: any) => {
                                            let tmp: any = {}
                                            tmp.totalPowa = _powaBalancesRes / (10 ** 18)
                                            tmp.reward = earnedRes > 0 ? Number(Number(earnedRes) / (10 ** 18)).toFixed(2) : "0.00"
                                            tmp.time = Number(_reaminTime) // + Number(_punishTimeRes)
                                            setEndingTime(Number(_reaminTime))
                                            countDown(Number(_reaminTime))
                                            setStakeData(tmp)
                                            setTimeout(() => {
                                                setIsLoadedStake(true)
                                            }, 20);
                                        })
                                // })
                        })
                })

            const tmpData: any = []
            await SantaV1_Contract.methods.tokensOfOwner(walletAddress).call({
                from: walletAddress
            })
                .then((tokens: any) => {
                    let arr: any = []
                    const pr_arr: any = []
                    for (let i = 0; i < tokens.length; i++) {
                        jQuery.get(SantaV1_BaseUri + tokens[i] + "/")
                            .then((metaData: any) => {
                                // metaData = JSON.parse(metaData)
                                metaData.contractAddress = contractAddress[connectedNetwork].SantaV1
                                tmpData.push(metaData)
                                setDisplayItems([...tmpData])
                            })

                        SantaV1_Contract.methods.getApproved(tokens[i]).call({
                            from: walletAddress
                        })
                            .then((approveRes: any) => {
                                arr.push(isSameAddress(approveRes, contractAddress[connectedNetwork].NftStaking))
                                pr_arr.push(false)
                                setActiveToggle([...arr])
                                setIsProgress([...pr_arr])
                            })
                    }
                    setTimeout(() => {
                        setIsLoaded(true)
                    }, 20);
                })

            await NftStaking.methods.getNftIds(walletAddress).call({
                from: walletAddress
            })
                .then((tokens: any) => {
                    const tmp: any = []
                    const tmp_pr: any = []
                    for (let i = 0; i < tokens.length; i++) {
                        const arr: any = myStakes
                        arr.push(false)
                        setMyStakes(arr)
                        jQuery.get(SantaV1_BaseUri + tokens[i] + "/")
                        .then((metaData: any) => {
                            // metaData = JSON.parse(metaData)
                            metaData.contractAddress = contractAddress[connectedNetwork].SantaV1
                            tmp.push(metaData)
                            setMyStakes([...tmp])
                        })
                        tmp_pr.push(false)
                        setStakeProgress([...tmp_pr])
                    }
                    setTimeout(() => {
                        setIsLoadedMyStakes(true)
                    }, 20);
                })
        }
    }

    function toggleActiveHarvest() {
        window.web3 = null
        setActiveHarvest(!activeHarvest)
        toggleActive(".harvest-withdraw", "btn-back-dark")
    }

    function setActiveToggleIndex(index: any, flag: boolean, tokenData: any) {
        if ((activeToggle[index] === true) && (flag === false)) {
            alertify.dismissAll();
            alertify.error("You already approved")
            return
        }
        if ((activeToggle[index] === false) && (flag === true)) {
            alertify.dismissAll();
            alertify.error("You should approve")
            return
        }

        if (flag === false) {
            toggleActive(".approve-stake-btn-" + index)
            jQuery(".approve-stake-btn-" + index).removeClass("btn-back-dark")
            jQuery(".active.approve-stake-btn-" + index).addClass("btn-back-dark")
            const arr: any = [...activeToggle]
            arr[index] = true
            setActiveToggle(arr)
        }
        console.log(tokenData)
        console.log('index', index)
        if (window.web3 && window.web3.eth && isConnected && isCorrectNet && tokenData && tokenData.attributes) {
            const pr_arr: any = [...isProgress]
            pr_arr[index] = true
            setIsProgress(pr_arr)
            if (flag === false) {
                let SantaV1_Contract: any = new window.web3.eth.Contract(contracts.abis.SantaV1, contractAddress[connectedNetwork].SantaV1)
                SantaV1_Contract.methods.approve(contractAddress[connectedNetwork].NftStaking, tokenData.id).send({ from: walletAddress, gas: bestGas, gasPrice: bestGasPrice })
                    .then(() => {
                        alertify.dismissAll();
                        alertify.success("Successfully approved")
                        pr_arr[index] = false
                        setIsProgress([...pr_arr])
                    })
                    .catch((err: any) => {
                        pr_arr[index] = false
                        setIsProgress([...pr_arr])
                    })
            } else {
                let NftStaking: any = new window.web3.eth.Contract(contracts.abis.NftStaking, contractAddress[connectedNetwork].NftStaking)
                NftStaking.methods.stakeNFT(tokenData.id, tokenData.attributes.stakingpowa, BigInt(tokenData.attributes.face_value * 10 ** 18)).send({ from: walletAddress, gas: bestGas, gasPrice: bestGasPrice })
                    .then((stakeRes: any) => {
                        alertify.dismissAll();
                        alertify.success("Success.")
                        stakeIndex(index)
                    })
                    .catch((err: any) => {
                        alertify.dismissAll();
                        // alertify.error("Sorry, something went wrong.")
                    })
            }
        }
    }

    function stakeIndex(index: any){
        console.log("items", displayItems)
        console.log("stakes", myStakes)
        console.log("isProgress", isProgress)
        console.log("activeToggle", activeToggle)
        const items:any = displayItems
        const stakes: any = myStakes
        const pr_arr = isProgress
        const ar = activeToggle
        let item: any = displayItems[index]

        stakes.push(item)
        setMyStakes([...stakes])
        items.splice(index, 1)
        pr_arr.splice(index, 1)
        ar.splice(index, 1)
        setDisplayItems([...items])
        setIsProgress([...pr_arr])
        setActiveToggle([...ar])

        // console.log("items", displayItems)
        // console.log("stakes", myStakes)
        // console.log("isProgress", isProgress)
        // console.log("ar", ar)
    }

    function countDown(tmstmp: any){
        if(tmstmp >= 0)
        setTimeout(() => {
            setEndingTime(tmstmp - 1)
            countDown(tmstmp - 1)
        }, 1000);
    }

    function withDraw(index: any, item: any){
        const s_pr_arr = [...stakeProgress]
        s_pr_arr[index] = true
        setStakeProgress([...s_pr_arr])
        let NftStaking: any = new window.web3.eth.Contract(contracts.abis.NftStaking, contractAddress[connectedNetwork].NftStaking)
        NftStaking.methods.withdrawNFT(item.id).send({from: walletAddress, gas: bestGas, gasPrice: bestGasPrice})
        .then((res: any) => {
            console.log("withDraw", res.events.WithdrawnNFT.returnValues)
            const items:any = displayItems
            const stakes: any = myStakes
            const pr_arr = isProgress
            const ar = activeToggle
            let item: any = stakes[index]
    
            items.push(item)
            setDisplayItems([...items])
            stakes.splice(index, 1)
            pr_arr.push(false)
            ar.push(false)
            setMyStakes([...stakes])
            setIsProgress([...pr_arr])
            setActiveToggle([...ar])

            
            s_pr_arr.splice(index, 1)
            setStakeProgress([...s_pr_arr])
        })
        .catch((err: any) => {
            s_pr_arr[index] = false
            setStakeProgress([...s_pr_arr])
        })
    }

    function syncTime(){
        if(isSyncTime) return
        setIsSyncTime(true)
        let tt = new Date()
        let n: any = new Date(tt.getTime()+(tt.getTimezoneOffset()*60000))
        setCurTimeStamp(n.getTime())
        // console.log("cur timestamp = ", n.getTime())
        setTimeout(() => {
            syncTime()
        }, 1000);
    }
    return (
        <div className="swap-page">
            <div className="flex py-4 mb-4">
                <div className="col-md-3 flex-col pb-4 mt-2">
                    <div className="rounded btn-back-dark h-100 flex-col py-2">
                        <div className=" ff-point-cufon fs-32 text-center flex my-4 py-4 white">
                            PROJECT DETAILS
                        </div>
                        <div className="p-2">
                            <p className="text-lg p-4 ff-point-cufon white">
                                Earn fungible tokens by staking non-fungible tokens
                            </p>
                            <p className="fc-grey text-lg px-4">
                                Stake related NFTs to earn fungible token. Recover your locked assets after staking ends
                            </p>
                        </div>
                        {/* <div className="w-100 right flex bottom pc">
                            <img src={borrowImg} className="w-mx-100p right bottom" alt="" />
                        </div> */}
                    </div>
                </div>
                <div className="col-md-6 flex-col pb-4 mt-2">
                    <div className="rounded btn-back-dark h-100">
                        <div className="flex back-blue rounded-top p-4 b-b-blue btn-back-gradient-reverse">
                            <img src={santaFeImg} className="size-40px rounded mx-2 m-auto-v" alt="" />
                            <div className="flex-col m-auto-v ff-point-cufon">
                                <p className="mb-0 fs-20 bold">SANTA FE</p>
                                <p className="mb-0"><span className="fc-grey">Stake</span><span className="bold"> Santa Fe NFT </span><span className="fc-grey">Earned</span><span className="bold"> CIFI token</span></p>
                            </div>
                        </div>
                        <div className="flex-col py-4 px-3 white">
                            <div className="flex item-center w-100 bold flex-3 ff-point-cufon">
                                <p className="m-auto fc-grey flex-item text-center">My Powa</p>
                                <p className="m-auto fc-grey flex-item text-center">Earned</p>
                                <p className="m-auto fc-grey flex-item text-center">Ending</p>
                            </div>
                            <div className="flex p-4 w-100 text-center" hidden={isLoadedStake}>
                                <div className="loader-animation-sm m-auto-h w-fit"></div>
                            </div>
                            <div className="flex item-center w-100 my-2 py-2 flex-3" hidden={!isLoadedStake}>
                                <p className="m-auto flex-item text-center">{stakeData.totalPowa}</p>
                                <p className="m-auto flex-item text-center">{stakeData.reward}</p>
                                <p className="m-auto flex-item text-center">{tstmp2datetime(endingTime)}</p>
                            </div>
                            <div className="flex w-100 btn-back-gradient rounded p-1 space-center">
                                <div
                                    className={"text-center w-50 rounded btn-back-dark p-2 text-lg pointer fc-grey bold harvest-withdraw active-bd-or active "}
                                    onClick={() => toggleActiveHarvest()}
                                >
                                    Harvest</div>
                                <div
                                    className={"text-center w-50 rounded p-2 text-lg pointer fc-grey bold harvest-withdraw active-bd-or "}
                                    onClick={() => toggleActiveHarvest()}
                                >
                                    Withdraw</div>
                            </div>
                            <p className="white fs-20 bold my-3 mt-4 pt-4 ff-point-cufon">
                                My Stake
                            </p>
                            <div className="flex py-8 my-4 w-100 text-center" hidden={isLoadedMyStakes}>
                                <div className="loader-animation-sm m-auto-h my-4"></div>
                            </div>
                            <div className="flex-col pc-mx-h-50vh scroll-v-1" hidden={!isLoadedMyStakes}>

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
                                                            Powa: {item.attributes ? item.attributes.stakingpowa : ""}
                                                        </p>
                                                    </div>
                                                    <div className="right px-4">
                                                        <p  
                                                            hidden={stakeProgress[index]}
                                                            className="fs-20 pointer bold mb-0 btn-back-gradient c-white rounded py-2 px-4 min-w-180"
                                                            onClick={() => withDraw(index, item)}
                                                            >
                                                            Withdraw
                                                        </p>
                                                        <div  
                                                            hidden={!stakeProgress[index]}
                                                            className="fs-20 pointer bold mb-0 btn-back-gradient c-white rounded py-2 px-4 text-center min-w-180"
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
                    <div className="rounded btn-back-dark py-4 px-2 flex-col h-100">
                        <div className=" ff-point-cufon fs-32 text-center my-4 py-2 white">
                            AVAILABLE NFT
                        </div>
                        <div className=" pc-mn-h-70vh scroll-v-1 p-2 pc-mx-h-100vh">

                            {
                                isLoaded === false ?
                                    <div className="flex py-8 my-4 w-100 text-center">
                                        <div className="loader-animation m-auto-h my-4 w-fit"></div>
                                    </div>
                                    :
                                    displayItems.length === 0 ?
                                        <p className="fc-grey text-base text-center py-4 flex"><span className="my-4 py-4">No data</span></p>
                                        :
                                        displayItems.map((item: any, index: any) =>
                                            <div key={index} className="flex-col">
                                                <img src={item.image} alt="" className="m-auto-h w-mx-100p mx-size-150" />
                                                <div className="flex w-100 btn-back-gradient rounded p-1 space-center my-4">
                                                    <div hidden={isProgress[index]} className={"text-center w-50 rounded fc-grey p-1 text-lg pointer bold " + (activeToggle[index] === false ? "btn-back-dark active" : "")} onClick={() => setActiveToggleIndex(index, false, item)} >Approve</div>
                                                    <div hidden={isProgress[index]} className={"text-center w-50 rounded fc-grey p-1 text-lg pointer bold " + (activeToggle[index] === true ? "btn-back-dark active" : "")} onClick={() => setActiveToggleIndex(index, true, item)} >Stake</div>
                                                    <img hidden={!isProgress[index]} src={loadSvg} alt="" className="m-auto-h my-2 w-mx-100p" />
                                                </div>
                                            </div>
                                        )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SantaBa;
